import { TaskQueue } from "../task-scheduler/base";
import { TaskBase } from "../task-scheduler/task-base";
import Axios from "axios";
import cheerio from 'cheerio';
import { from, defer } from 'rxjs';
import { retryWhen, delay, take, tap, filter } from 'rxjs/operators';

export class KunTask extends TaskBase {
  private cancelToken = Axios.CancelToken.source();
  private startTime = 0;
  private aborted = false;
  constructor(
    public url: string
  ) {
    super();
  }

  private readArticle(html: string) {
    const $ = cheerio.load(html);
    const content = $('div.single-content');
    const result = content.children('p').text();
    return result;
  }

  private start() {

  }

  abort() {
    if (this.cancelToken) {
      this.cancelToken.cancel();
      this.aborted = true;
    }
  }

  async run() {
    this.startTime = Date.now();
    const html = await defer(() => Axios.get(this.url, { cancelToken: this.cancelToken.token, timeout: 20000 }).then(res => res.data)).pipe(
      filter(() => !this.aborted),
      retryWhen(errors => errors.pipe(tap(() => console.log('retry: ' + this.url)), delay(1000), take(50)))
    ).toPromise();
    // const html = await Axios.get(this.url, { cancelToken: this.cancelToken.token }).then(res => res.data);
    const article = this.readArticle(html);
    this.emit('finish', article);
    return article;
  }
}

export class KunTaskQueue extends TaskQueue<KunTask> {
  execTask(task: KunTask) {
    return task.run();
  }
}
