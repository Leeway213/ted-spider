
import axios from 'axios';
import inquirer from 'inquirer';
import ora from 'ora';
import cheerio from 'cheerio';
import logSymbols from 'log-symbols';
import chalk from 'chalk';
import { getTranscript } from './getTranscript';
import { saveToFile } from './saveToFile';
import { TranscriptTask, TranscriptQueue } from './TranscriptTaskQueue';
import { log } from './log';
import { History } from './history';

const taskQueue = new TranscriptQueue(8);

const history = new History('./result');

process.on('SIGINT', () => history.save());
process.on('exit', () => history.save());
process.on('disconnect', () => history.save());

(async () => {
  const spinner = ora('获取语言列表...');
  spinner.start();
  const res: { value: string; label: string }[] = await axios.get('https://www.ted.com/languages/combo.json?per_page=1000', {
    responseType: 'json',
  }).then(res => res.data);
  spinner.stop();

  const selected = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: '请选择语言',
      choices: res.map(v => v.label),
    }
  ]);
  const language = res.find(v => v.label === selected.language);

  if (language) {
    const lanHistory = history.getLanguage(language.value);
    const url = `https://www.ted.com/talks?language=${language.value}&sort=newest`;

    spinner.start('loading...');
    let html = await axios.get(url, {
      responseType: 'text'
    }).then(res => res.data);
    spinner.stop();
    let $ = cheerio.load(html);
    const pagination = $('.pagination')[0];
    let pages = 1;
    if (pagination) {
      const pageItems = $('.pagination__item');
      if (pageItems.length > 0) {
        try {
          pages = parseInt(pageItems.last().text());
        } catch (error) {
          console.log(error);
        }
      }
    }

    let items = $('#browse-results').children('.row').children('.col');
    if (items && items.length > 0) {
      console.log(logSymbols.info, chalk.green(`当前页有${items.length}条数据, 共${pages}页.`));
      let hrefs = Array.from(new Set(items.find('a.ga-link').toArray().map(e => `https://www.ted.com${$(e).attr('href')}`)));
      
      for (let i = 1; i <= pages; i++) {
        log(`订阅第${i}页爬取任务...`, 'info');
        if (i !== 1) {
          html = await axios.get(`https://www.ted.com/talks?language=${language.value}&sort=newest&page=${i}`).then(res => res.data);
          $ = cheerio.load(html);
          items = $('#browse-results').children('.row').children('.col');
          hrefs = Array.from(new Set(items.find('a.ga-link').toArray().map(e => `https://www.ted.com${$(e).attr('href')}`)));
        }
        const tasks = hrefs.filter(v => !history.hasHistory(v, language.value)).map(v => new TranscriptTask(getTranscript, [v, language.label]));
        for (const task of tasks) {
          task.on('finished', () => history.push(language.value, task.url));
          taskQueue.subscribe(task);
          taskQueue.publish();
        }
      }
      debugger
    } else {
      console.log(logSymbols.error, chalk.red(`没有${language.label}语言的数据`));
    }
    debugger
  }
})();
