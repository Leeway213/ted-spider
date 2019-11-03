import { TaskBase } from './task-base';

export abstract class TaskQueue<T> extends TaskBase {

  private _concurrency: number = 3;

  get concurrency(): number {
    return this._concurrency;
  }

  set concurrency(value: number) {
    if (this._concurrency !== value) {
      this._concurrency = value;
    }
  }

  private _loopingCount = 0;

  private _looping: boolean = false;
  get looping() {
    return this._looping;
  }
  set looping(value: boolean) {
    if (this._looping !== value) {
      this._looping = value;
      // this.statusChanged(this._looping);
      this.emit('statuschange', this._looping ? 'running' : 'stopped');
    }
  }

  queue: Array<T>;

  // errorHandler: (source, reason) => any;
  // resultHandler: (result) => any;
  // statusChanged: (looping: boolean) => any;

  constructor(concurrency?: number) {
    super();
    this.queue = [];
    this.concurrency = concurrency ? concurrency : 3;
  }

  subscribe(task: T) {
    if (!this.queue) {
      this.queue = [];
    }
    this.queue.push(task);
  }

  publish() {

    if (!this.queue || this.queue.length === 0) {
      if (this._loopingCount === 0) {
        this.looping = false;
        this.emit('finished', this);
      }
      return;
    }

    for (let i = 0; i < this.concurrency - this._loopingCount; i++) {
      if (this.queue.length > 0) {
        this.looping = true;
        const task = this.queue.shift();
        if (task) {
          this.loopTask(task).then(
            result => {
              this._loopingCount--;
              // TODO: 报告任务执行结果
              this.emit('complete', this);

              // 继续发布循环
              this.publish();
            },
            reason => {
              this._loopingCount--;
              // 继续发布循环
              this.publish();
              // 发生错误后，处理错误
              this.emit('error', reason);
            }
          );
        }

        // .catch(
        //     reason => {
        //         this._loopingCount--;
        //         // 继续发布循环
        //         this.publish();
        //         // 发生错误后，处理错误
        //         if (this.errorHandler)
        //             this.errorHandler(task, reason);
        //     }
        // );
        this._loopingCount++;
      }
    }

  }

  async loopTask(task: T) {
    let result = this.execTask(task);
    if (result instanceof Promise) {
      try {
        result = await result;
      } catch (error) {
        throw error;
      }
    }

    return result;
  }

  abstract execTask(task: T): any;

}
