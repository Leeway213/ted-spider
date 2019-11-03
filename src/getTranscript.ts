import Axios from "axios";
import cheerio from 'cheerio';
import ora from 'ora';
import { log } from "./log";
import puppeteer from 'puppeteer';

function parseLanguage(url: string) {
  const tmp = url.split('?');
  const queryStr = tmp[1];
  const queries = queryStr.split('&');
  for (const query of queries) {
    const [key, value] = query.split('=');
    if (key === 'language') {
      return value;
    }
  }
}

export async function getTranscript(url: string) {
  const language = parseLanguage(url) || '';
  log(`正在爬取${url}`, 'info');
  const browser = await puppeteer.launch({
    timeout: 0,
    // headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });
  const page = await browser.newPage();
  page.on('error', () => {});
  page.setDefaultTimeout(0);
  page.goto(url);
  // const html = await page.evaluate(() => {
  //   document.getElementsByClassName(' l-h:n m-b:1 ');
  //   return document.body.outerHTML;
  // });
  // const $ = cheerio.load(html);
  let description = '';
  await new Promise(resolve => {
    page.once('domcontentloaded', async () => {
      while (!description) {
        description = await page.evaluate(() => {
          const p = document.getElementsByClassName(' l-h:n m-b:1 ')[0];
          if (p instanceof HTMLElement) {
            return p.innerText;
          }
          return '';
        });
      }
      resolve();
    });
  })
  // page.once('domcontentloaded', async () => {
  //   while (!description) {
  //     await new Promise(async resolve => {
  //       description = await page.evaluate(() => {
  //         const p = document.getElementsByClassName(' l-h:n m-b:1 ')[0];
  //         if (p instanceof HTMLElement) {
  //           return p.innerText;
  //         }
  //         return '';
  //       });
  //       resolve();
  //     })
  //   }
  // })
  const title = (await page.title()).replace(' | TED Talk', '');
  // try {
  //   description = $('#content').find('.l-h\\:n.m-b\\:1').text();
  // } catch (error) {
  //   log(error, 'error');
  // }

  let transcripts: string[] = [];
  let id = '';
  const html = await page.evaluate(() => {
    return document.body.innerHTML;
  })
  const filters = /__ga\('set', 'dimension2', '[1-9]\d*/.exec(html);
  if (filters) {
    if (filters[0]) {
      id = filters[0].replace(`__ga('set', 'dimension2', '`, '');

      const transUrl = `https://www.ted.com/talks/${id}/transcript.json${language ? `?language=${language}` : ''}`;
      const result: { paragraphs: { cues: { text: string }[] }[] } = (await Axios.get(transUrl, { responseType: 'json' })).data;
      for (const p of result.paragraphs) {
        transcripts = transcripts.concat(...p.cues.map(v => v.text));
      }
    } else {
      log('没找到talk id', 'error');
    }
  } else {
    log('没找到talk id', 'error');
  }
  await page.evaluate(() => {
    window.stop();
  });
  await page.close();
  await browser.close();
  log(`爬取完成${url}`, 'info');
  log(`talk id: ${id}`, 'info');
  log(`talk title: ${title}`, 'info');
  return {
    id,
    title,
    description,
    transcripts,
  };
}
