const path = require('path');
const puppeteer = require('puppeteer');
const logger = require('./logger.js');
const runSandboxScript = require('./run-sandbox-script.js');
const fs = require('fs');
const processPageStyles = require('./process-page-styles.js');

const logoBase64 = 'data:image/png;base64,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';
const footerTemplate = `
    <div style="display: flex; justify-content: space-between;width: 100%;padding: 0 70px 40px;">
        <img height="20" src="${logoBase64}"  alt=""/>
        <span class="pageNumber" style="font-size: 14px"></span>
    </div>
`;
const renderPdf = async ({
                           mainMdFilename,
                           routeToStatic,
                           pathToDocsifyStyles,
                           pathToCustomStyles,
                           pathToPublic,
                           pathToPublicHtml,
                           pdfOptions,
                           docsifyRendererPort,
                           finalName,
                           emulateMedia,
                         }) => {

  const browser = await puppeteer.launch({ headless: 'new' });

  try {
    const mainMdFilenameWithoutExt = path.parse(mainMdFilename).name;
    const docsifyUrl = `http://localhost:${docsifyRendererPort}/#/${routeToStatic}/${mainMdFilenameWithoutExt}`;
    const page = await browser.newPage();

    await page.goto(docsifyUrl, { waitUntil: 'networkidle0' });

    const renderProcessingErrors = await runSandboxScript(page, {
      mainMdFilenameWithoutExt,
      routeToStatic,
    });

    if (renderProcessingErrors.length)
      logger.warn('anchors processing errors', renderProcessingErrors);

    /**
     * Adding Docsify and custom styles to page
     */
    const styles = await processPageStyles(pathToDocsifyStyles);
    const customStyles = await processPageStyles(pathToCustomStyles);
    await page.addStyleTag({ content: styles });
    await page.addStyleTag({ content: customStyles });

    /**
     * PDF generation
     */
    await page.emulateMediaType(emulateMedia);
    await page.pdf({
      ...pdfOptions,
      displayHeaderFooter: true,
      headerTemplate: ` `,
      footerTemplate,
      printBackground: true,
      path: path.resolve(pathToPublic),
    });

    /**
     * HTML generation
     */
    const html = await page.content();
    const htmlTitle = (finalName.charAt(0).toUpperCase() + finalName.substring(1)).replaceAll('-', ' ');

    fs.writeFileSync(path.resolve(pathToPublicHtml), html.replace(/<title[^>]*>(.*?)<\/title>/, `<title>${htmlTitle}</title>`));

    return await browser.close();
  } catch (e) {
    await browser.close();
    throw e;
  }
};

const htmlToPdf = ({
                     mainMdFilename,
                     routeToStatic,
                     pathToDocsifyStyles,
                     pathToCustomStyles,
                     pathToStatic,
                     pathToPublic,
                     pdfOptions,
                     removeTemp,
                     finalName,
                     docsifyRendererPort,
                     pathToPublicHtml,
                     emulateMedia,
                   }) => async () => {
  const { closeProcess } = require('./utils.js')({ pathToStatic, removeTemp });
  try {
    return await renderPdf({
      mainMdFilename,
      routeToStatic,
      pathToDocsifyStyles,
      pathToCustomStyles,
      pathToPublic,
      pdfOptions,
      docsifyRendererPort,
      finalName,
      pathToPublicHtml,
      emulateMedia,
    });
  } catch (err) {
    logger.err('puppeteer renderer error:', err);
    await closeProcess();
  }
};

module.exports = config => ({
  htmlToPdf: htmlToPdf(config),
});
