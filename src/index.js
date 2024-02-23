const path = require("path");
const { merge } = require("lodash");
const logger = require("./logger.js");
const getFreePorts = require("./free-port.js");
const fs = require("fs");

const defaultConfig = {
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
};

const run = async incomingConfig => {
  const preBuildedConfig = merge(defaultConfig, incomingConfig);
  preBuildedConfig.contents = [];
  preBuildedConfig.pathToStatic = `${preBuildedConfig.pathToDocsifyEntryPoint}/docs/static`;
  preBuildedConfig.routeToStatic = 'static';
  preBuildedConfig.mainMdFilename = 'main.md';

  fs.readdirSync(`${preBuildedConfig.pathToDocsifyEntryPoint}/docs`).forEach(file => {
    if (new RegExp(/([^\/]+\.md)$/).test(file) && !(new RegExp(/(_sidebar.md)$/).test(file))) {
      return;
    }

    if (new RegExp(/(_sidebar.md)$/).test(file)) {
      preBuildedConfig.contents.push(`${preBuildedConfig.pathToDocsifyEntryPoint}/docs/${file}`);
    } else {
      fs.readdirSync(`${preBuildedConfig.pathToDocsifyEntryPoint}/docs/${file}`).forEach(file1 => {
        if (new RegExp(/(_sidebar.md)$/).test(file1)) {
          preBuildedConfig.contents.push(`${preBuildedConfig.pathToDocsifyEntryPoint}/docs/${file}/${file1}`);
        }
      })
    }
  });

  for (const document of preBuildedConfig.contents) {
    const [docsifyRendererPort, docsifyLiveReloadPort] = await getFreePorts();

    const config = {
      ...preBuildedConfig,
      docsifyRendererPort,
      docsifyLiveReloadPort,
      contents: [document]
    };

    const finalName = path.resolve(config.contents[0]).match(/.*\/([^\/]+)\/.*/m)[1];

    config.pathToPublic += `/${finalName}.pdf`;
    config.pathToPublicHtml += `/${finalName}.html`;
    config.finalName = finalName;

    logger.info("Build with settings:");
    console.log(JSON.stringify(config, null, 2));
    console.log("\n");

    const { combineMarkdowns } = require("./markdown-combine.js")(config);
    const { closeProcess, prepareEnv, cleanUp } = require("./utils.js")(config);
    const { createRoadMap } = require("./contents-builder.js")(config);
    const { runDocsifyRenderer } = require("./docsify-server.js")(config);
    const { htmlToPdf } = require("./render.js")(config);

    try {
      await cleanUp();
      await prepareEnv();
      const { roadMap, resume } = await createRoadMap();
      await combineMarkdowns(roadMap, resume);

      runDocsifyRenderer();
      await htmlToPdf();

      logger.success(path.resolve(config.pathToPublic));
    } catch (error) {
      logger.err("run error", error);
    } finally {
      await closeProcess();
    }
  }

  return process.exit(0);
};

module.exports = run;
