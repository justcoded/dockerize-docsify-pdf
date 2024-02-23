FROM ghcr.io/puppeteer/puppeteer:latest

COPY --chown=pptruser:pptruser . .

RUN npm install -f

RUN mv cli.js export.js

CMD ["google-chrome-stable"]