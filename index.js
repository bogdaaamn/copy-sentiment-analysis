const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('gh_token');

const octo = new github.GitHub(token);
const repo = github.context.repo;

// most @actions toolkit packages have async methods
async function run() {
  try {    
    const heads = await octo.git.listRefs({ ...repo, namespace: 'heads/' });
    core.info(heads);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
