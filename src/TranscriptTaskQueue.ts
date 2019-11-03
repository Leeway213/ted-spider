import { TaskQueue } from "./task-scheduler/base";
import { TaskBase } from "./task-scheduler/task-base";
import { getTranscript } from "./getTranscript";
import { saveToFile } from "./saveToFile";

export class TranscriptTask extends TaskBase {
  get url() {
    return this.args[0];
  }
  constructor(
    private func: (...args: any[]) => any,
    private args: [string, string],
  ) {
    super();
  }
  async exec() {
    const result = await this.func(this.args[0]);
    saveToFile(result, this.args[1]);
    this.emit('finished');
  }
}

export class TranscriptQueue extends TaskQueue<TranscriptTask> {
  execTask(task: TranscriptTask) {
    return task.exec();
  }
}
