import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
import { KunTaskQueue, KunTask } from './SpiderTask';
import { History } from '../history';
import { breakSentence } from '../utils/sentences-break';
import fs from 'fs-extra';
import { defer } from 'rxjs';
import { tap, retryWhen, delay, take, map, filter } from 'rxjs/operators';

const LAN = 'uz';

const TIMEZONE = '+0500';

const BASE_URL = 'https://kun.uz';

const RESULT_DIR = './kun_uz_result';

const appId = Date.now();

const queue = new KunTaskQueue(20);

const history = new History(RESULT_DIR);

const cancelToken = axios.CancelToken.source();
let aborted = false;
function exit() {
  aborted = true;
  cancelToken.cancel();
  queue.clear();
  queue.runningTasks.forEach(v => v.abort());
  history.save();
}
process.on('SIGINT', () => exit());
process.on('exit', () => exit());
process.on('disconnect', () => exit());

function parse(html: string) {
  const urls: string[] = [];
  const $ = cheerio.load(html);
  let items = $('a.daily-block.l-item');
  const last = items.last();
  const time = last.find('p.news-date').text();
  const date = last.attr('href').split('/').slice(3, 6).join('-');
  const next = moment(`${date}T${time}:01${TIMEZONE}`).unix().toFixed(0);
  console.log('next---' + next);
  const len = items.length;
  for (let i = 0; i < len; i++) {
    const url = items.attr('href');
    if (url) {
      urls.push(`${BASE_URL}${url}`);
    }
    items = items.next();
  }
  return {
    urls,
    next
  };
}

function saveToFile(text: string) {
  // text = breakSentence(text);
  const filename = `${RESULT_DIR}/${appId}.txt`;
  if (!fs.existsSync(filename)) {
    fs.createFileSync(filename);
  }
  fs.appendFileSync(filename, text, { encoding: 'utf-8' });
}

async function run(url: string) {
  const doc = await defer(() => axios.get(url, { cancelToken: cancelToken.token, timeout: 20000 })).pipe(
    filter(() => !aborted),
    retryWhen(errors => errors.pipe(tap(() => console.log('retry: ' + url)), delay(1000), take(50)))
  ).toPromise()
  let result = parse(doc.data);
  while (result.urls.length > 0) {
    const url = result.urls.shift()!;
    if (!history.hasHistory(url, LAN)) {
      console.log('subscribe ' + url);
      console.log('队列总数: ' + queue.commonQueue.length);
      console.log('正在运行: ' + queue.runningTasks.length);
      const task = new KunTask(url);
      task.on('finish', (article: string) => {
        saveToFile(article);
        console.log('finish ' + url);
        console.log('队列总数: ' + queue.commonQueue.length);
        console.log('正在运行: ' + queue.runningTasks.length);
        history.push(LAN, task.url);
      });
      queue.subscribe(task);
      queue.publish();
    }
  }
  return result.next;
}

(async () => {
  let next = '';
  do {
    const q = next ? `?f=latest&next=${next}` : '';
    next = await run(`https://kun.uz/${LAN}/news/list${q}`);
  } while (next);
})();
