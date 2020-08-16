const core = require('@actions/core');
const glob = require('@actions/glob');

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
    const patterns = core.getInput('files').split(',') || ["*.html"];
    // const patterns = ["*.js"];

    const files = await getFiles(patterns);

    core.debug(files);
  } catch (e) {
    core.setFailed(e.message);
  }
};

run();
