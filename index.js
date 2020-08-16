const core = require('@actions/core');
const glob = require('@actions/glob');
const exec = require('@actions/exec');


const getFiles = async patterns => {
  const globber = await glob.create(patterns.join('\n'));
  const files = await globber.glob();

  if (files.length > 0) {
    return files;
  } else {
    throw new Error('No files matching the pattern found. :(');
  }

  // return files.length > 0 ? files : throw new Error('BAD_ROUTE');
};

// most @actions toolkit packages have async methods
const run = async () => {
  try {    
    const patterns = core.getInput('files') || '*.html';
    core.info("hey " + patterns)
    exec.exec('ls')

    const files = await getFiles(patterns.split(','));

    core.info(files);
  } catch (e) {
    core.setFailed(e.message);
  }
};

run();
