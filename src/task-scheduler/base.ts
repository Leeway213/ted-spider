import { TaskBase } from './task-base';

export abstract class TaskQueue<T> extends TaskBase {

    get concurrency(): number {
        return this._concurrency;
    }

    set concurrency(value: number) {
        if (this._concurrency !== value) {
            this._concurrency = value;
        }
    }
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

    priorityQueue: T[];
    commonQueue: T[];

    runningTasks: T[] = [];

    private _concurrency: number = 3;

    private _loopingCount = 0;

    private _looping = false;

    private _pause = false;
    private _priorityOver = true;

    // errorHandler: (source, reason) => any;
    // resultHandler: (result) => any;
    // statusChanged: (looping: boolean) => any;

    constructor(concurrency?: number) {
        super();
        this.priorityQueue = [];
        this.commonQueue = [];
        this.concurrency = concurrency ? concurrency : 6;
    }
    clear(sceneId?: string) {
        if (!this.priorityQueue || !sceneId) {
            this.priorityQueue = [];
        }
        this.priorityQueue = this.priorityQueue.filter((q) => { return (q as any).sceneId === sceneId; });

        this.commonQueue = [];
    }

    subscribe(task: T, prior: boolean = false) {
        if (prior) {
            if (!this.priorityQueue) {
                this.priorityQueue = [];
            }
            this._priorityOver = false;
            this.priorityQueue.push(task);
        } else {
            if (!this.commonQueue) {
                this.commonQueue = [];
            }
            this.commonQueue.push(task);
        }
    }
    pause() {
        this._pause = true;
    }
    continue() {
        this._pause = false;
        this.publish();
    }
    publishPriorityQueue() {
        if (!this.priorityQueue || this.priorityQueue.length === 0) {
            if (this._loopingCount === 0) {
                this.looping = false;
                this._priorityOver = true;
                this.emit('finished', this);
            }
            return;
        }
        const addCount = this.concurrency - this._loopingCount;
        // for (let i = 0; i < this.concurrency - this._loopingCount; i++) {
        for (let i = 0; i < addCount; i++) {
            if (this.priorityQueue.length > 0) {

                this.looping = true;
                const task = this.priorityQueue.shift()!;
                this.runningTasks.push(task);
                this.loopTask(task).then(
                    (result) => {
                        this._loopingCount--;
                        // TODO: 报告任务执行结果
                        this.emit('complete', this);
                        this.publish();
                    },
                    (reason) => {
                        this._loopingCount--;
                        // 继续发布循环
                        this.publish();

                        // 发生错误后，处理错误
                        this.emit('error', reason);
                    },
                ).finally(() => {
                    const index = this.runningTasks.indexOf(task);
                    if (index >= 0 && index <= this.runningTasks.length) {
                        this.runningTasks.splice(index, 1);
                    }
                });
                this._loopingCount++;
            }
        }
    }
    publishCommonQueue() {
        if (!this.commonQueue || this.commonQueue.length === 0) {
            this.looping = false;
            return;
        }

        const addCount = this.concurrency - this._loopingCount;
        // for (let i = 0; i < this.concurrency - this._loopingCount; i++) {
        for (let i = 0; i <= addCount; i++) {
            if (this.commonQueue.length > 0) {

                this.looping = true;
                const task = this.commonQueue.shift()!;
                this.runningTasks.push(task);
                this.loopTask(task).then(
                    // TODO: 报告任务执行结果
                    () => this.emit('complete', this),
                    // 发生错误后，处理错误
                    (reason) => this.emit('error', reason),
                ).finally(() => {
                    const index = this.runningTasks.indexOf(task);
                    if (index >= 0 && index <= this.runningTasks.length) {
                        this.runningTasks.splice(index, 1);
                    }
                    this._loopingCount--;
                    this.publish();
                });
                this._loopingCount++;
            }
        }
    }


    publish() {
        // if (this._loopingCount !== 0) {
        //     return;
        // }

        this.publishPriorityQueue();
        if (this._pause) {
            return;
        }
        if (this._priorityOver) {
            this.publishCommonQueue();
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

    abstract execTask(task: T): Promise<any>;

}
