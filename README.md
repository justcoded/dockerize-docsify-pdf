# Docsify-pdf-export

## Install

```sh
npm install
```

## Using custom configuration:

Example `.docsifytopdfrc.js` content:

```js
 module.exports = {
  addResumeFor: ['docs', 'code-guides'], // split documentation file with `_sidebar.md`
  pathToPublic: 'output/pdf', // path where pdf will stored
  pathToPublicHtml: 'output/html', // path where html will stored
  pathToDocsifyStyles: 'input/assets/css/docsify4-themes-vue.css', // path where docsify styles file is stored
  pathToCustomStyles: 'styles.css', // path where docsify styles file is stored
  removeTemp: true, // remove temporary generated .md and .html in `docs` folder or not
  emulateMedia: 'screen', // mediaType, emulating by puppeteer for rendering pdf (reference: https://pptr.dev/api/puppeteer.page.emulatemediatype)
  pathToDocsifyEntryPoint: 'input', // path where docsify `index.html` file is stored
  pdfOptions: { // options for rendering pdf (reference: https://pptr.dev/api/puppeteer.pdfoptions)
    format: 'A2',
    margin: {
      bottom: 120,
      left: 0,
      right: 0,
      top: 70,
    }
  },
}
```

## Usage

Move files from your docsify folder to `input` and run:
```sh
node cli.js
```
This command will initiate the conversion process. Wait for the conversion to complete.

After the conversion process finishes, you will find two folders, `html` and `pdf`, generated in the `output` folder.
These folders will contain the converted files in their respective formats.
