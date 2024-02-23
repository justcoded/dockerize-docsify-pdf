const path = require("path");
const markdownLinkExtractor = require("markdown-link-extractor");
const isUrl = require("is-url");
const fs = require('fs');
const util = require('util');

const [readFile, exists] = [fs.readFile, fs.exists].map(fn =>
  util.promisify(fn),
);

module.exports = async (pathToDocsifyStyles) => {
  const getFile = async (filename) => {
    const fileExist = await exists(filename);

    if (fileExist) {
      const content = await readFile(filename, {
        encoding: "utf8",
      });

      return {
        content,
        name: filename,
      };
    }
  }

  const { content } = await getFile(path.resolve(pathToDocsifyStyles));

  return content.toString();
};
