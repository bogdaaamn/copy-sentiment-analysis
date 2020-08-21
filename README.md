# Copy Sentiment Analysis

<p align="center">
  <a href="https://github.com/BogDAAAMN/copy-sentiment-analysis/actions"><img alt="javscript-action status" src="https://github.com/BogDAAAMN/copy-sentiment-analysis/workflows/sentiment-analysis/badge.svg"></a> <a href="https://snyk.io/test/github/BogDAAAMN/copy-sentiment-analysis?targetFile=package.json"><img src="https://snyk.io/test/github/BogDAAAMN/copy-sentiment-analysis/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/BogDAAAMN/copy-sentiment-analysis?targetFile=package.json" style="max-width:100%;"></a>
</p>

This GitHub Action runs Sentiment Analysis over the **built** text of your GitHub project. It uses Google's [analyzeSentiment API](https://cloud.google.com/natural-language/docs/analyzing-sentiment#language-sentiment-string-protocol), evaluating the overall emotion score (from positive to negative) of a page. The Action provides an overview of the scores of all the pages from your project (more on [interpreting the scores](https://cloud.google.com/natural-language/docs/basics#interpreting_sentiment_analysis_values)).

## 🚀 Usage 

![Usage example](https://github.com/BogDAAAMN/copy-sentiment-analysis/blob/v0.6.1/_static/gif/usage.gif)

This is a workflow example of using the Action on plain `.html` files from the `public` folder (by default).

```yaml
name: Sentiment analysis on public

on: push

jobs:
  analysis:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2 #Be sure you checkout the files beforehand
    - name: Run sentiment analysis on HTML files
      uses: bogdaaamn/copy-sentiment-analysis@v0.6.1
      with: 
        gcp_key: ${{ secrets.GCP_KEY }} #Google Cloud Platform API key. Read the README for instructions 
```

Although, if you project needs to be built beforehand, be sure you place the Action after the building step. Here is an example for React.

```yaml
name: Sentiment analysis on React

on: push

jobs:
  analysis:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2 #Be sure you checkout the files beforehand
    - name: Build and test #Build the HTML files beforehand.
      run: |
        npm ci
        npm run build
        npm test
    - name: Run sentiment analysis on HTML files
      uses: bogdaaamn/copy-sentiment-analysis@v0.6.1
      with: 
        gcp_key: ${{ secrets.GCP_KEY }} #Google Cloud Platform API key. Read the README for instructions
        files: "build/**/*.html" #Glob patterns from files to be analayzed. Read the README for instructions
```

## 🏹 Inputs

### `gcp_key`: Get your GCP API Key

The examples above use **required** input `gcp_key`. Because the Actions uses the Google API you need generate a key on your own as it follows:

- Log into [Google Cloud Platform Console](https://console.cloud.google.com/);
- Navigate to the menu and click on **[API&Services](https://console.cloud.google.com/apis/dashboard)** > **[Credentials](https://console.cloud.google.com/apis/credentials)**;
- Click on **CREATE CREDENTIALS** > **API Key**;
- When *API key created* modal is promted, copy the freshly created key.

Read more about [Creating API Keys](https://cloud.google.com/docs/authentication/api-keys#creating_an_api_key).

![GCP Visual Instructions](https://github.com/BogDAAAMN/copy-sentiment-analysis/blob/v0.6.1/_static/gif/gcp.gif)

⚠️ Be **very** sure you don't share the key or paste it in plain code! It is enough to add it to the GitHub Project's Secrets as it follows:

- On your project's page click on the **Settings** button;
- Navigate to **Secrets** panel;
- Click on **New secret**;
- Name it *GCP_KEY* and paste the key there.

🚀 Now you can use the key in your project's Actions as `${{ secrets.GCP_KEY }}`. Read more about [GitHub Secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets).

![GitHub Visual Instructions](https://github.com/BogDAAAMN/copy-sentiment-analysis/blob/v0.6.1/_static/gif/github.gif)

### `files`: Understanding glob

The `files` input is the glob pattern of paths for the files that the Action should analyze. **By default** it is set to `public/**/*.html`, meaning that will check for all the files with `.html` extension in all the directories in the `public` directory. 

Read more, and understand glob patterns and their limitations on [`@actions/glob`](https://github.com/actions/toolkit/tree/main/packages/glob#patterns).

## 🔧 Known issues and limitations

This an early release of the Action. The roadmap of known issues and features will be updated here.

- **Parse and merge more content tags**: ⚠️ For now, this Action takes into account only `<p>` HTML tags. As more use cases will be tested, more tags will be included, along with the possibility of customization.  
- **Custom score threshold**: The overview table printed as a result of the Action highlights with color the very negative and very positive documents. At the moment, the threshold of the emotion score is predefined at `±0.5`. The next release will allow the user to define the threshold so they can get a custom color-coded table.
- **Split the base directory of the path**: At this moment, the overview table prints only the name of the file, creating confusion between files with the same name in different directories. In the next release, the table will print the relative path of the file.
