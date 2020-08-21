const core = require('@actions/core');
const glob = require('@actions/glob');

const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const cheerio = require('cheerio'); 
const dotenv = require('dotenv').config();

const { Table } = require('console-table-printer');


const getFiles = async patterns => {
  // Create glob patterns. See https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns
  const globber = await glob.create(patterns.join('\n'));
  const files = await globber.glob();

  // Break action if no files were found
  if (files.length > 0) {
    return files;
  } else {
    throw new Error('No files matching the pattern found. :(');
  }

  // return files.length > 0 ? files : throw new Error();
};

const getText = async path => {
  // Read files' content and parse them with cheerio. https://github.com/cheeriojs/cheerio#loading
  const data = await fs.readFile(path, "utf8");
  const root = await cheerio.load(data);

  // Get all the p tags in the file and join them with spaces
  // Workaround: shorthand is root('p').text(), but cheerio joins the text 
  // across tags without spaces, messing up API's sentence parser
  return root('p').map((i, el) => {
    return root(el).text();
  }).get().join(' ');
}

const getSentiment = async (key, text) => {
  const config = {
    // Config POST https://language.googleapis.com/v1/documents:analyzeSentiment?key=key
    method: 'post',
    url: `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${key}`,
    headers: { 
      'Content-Type': 'application/json; charset=utf-8'
    },

    // See doc https://cloud.google.com/natural-language/docs/reference/rest/v1/documents#Document
    data: { 
      "encodingType": "UTF8", 
      "document": {
        "type": "PLAIN_TEXT",
        "content": text
      }
    }
  };

  // Explicitly break action and print Wrong API key on 400
  const res = await axios(config).catch(e => {
    throw new Error(e.response.status == 400 ? "Wrong API key!" : e.message);
  });
  return await res.data;
}

const run = async () => {
  try {    
    // Using Table from console-table-printer instead of plain arrays
    // YET, will find workaround to access the arrays independently 
    const sentimentTable = new Table({
      sort: (row1, row2) => row2.score - row1.score
    });

    // Actions input helper
    const patterns = core.getInput('files') || 'public/**/*.html';
    const key = core.getInput('gcp_key') || process.env.key;

    // Messy row counter
    let insertedTable = false;

    // Go trough the files
    const files = await getFiles(patterns.split(','));
    for (let file of files) {
      core.debug(`Checking ${file}`);

      // Parse the html files and get the text content
      let text = await getText(file);
      core.debug(text);

      // Skip API calls for empty pages
      if (text){
        // Get the sentiment for each document (html page)
        const sentiment = await getSentiment(key, text);
        const score = await sentiment.documentSentiment.score;
        
        core.debug(sentiment);

        // Add row to printed table and color code it based on emotion
        // https://cloud.google.com/natural-language/docs/basics#interpreting_sentiment_analysis_values
        sentimentTable.addRow({
          file: path.basename(file),
          score: score
        },{
          color: score < -0.5 ? 'red': score > 0.5 ? 'green' : 'white'
        })

        insertedTable = true;
      }
    }

    // Same messy row counter
    insertedTable ? sentimentTable.printTable() : core.info("No content was found in the files. :(");
  } catch (e) {
    core.setFailed(e.message);
  }
};

run();

module.exports = {getFiles, getText, getSentiment};