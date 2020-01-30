import { TaskQueue } from "../task-scheduler/base";
import { TaskBase } from "../task-scheduler/task-base";
import Axios from "axios";
import cheerio from 'cheerio';

export class KunTask extends TaskBase {
  private cancelToken = Axios.CancelToken.source();
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

  abort() {
    if (this.cancelToken) {
      this.cancelToken.cancel();
    }
  }

  async run() {
    const html = await Axios.get(this.url, { cancelToken: this.cancelToken.token }).then(res => res.data);
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
