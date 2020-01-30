
export class TaskBase {

    private _eventStack: { [key: string]: Array<(...args: any[]) => any> };

    constructor() {
        this._eventStack = {};
    }

    on(evt: string, fn: (...args: any[]) => any) {
        if (!this._eventStack[evt]) {
            this._eventStack[evt] = [];
        }

        this._eventStack[evt].push(fn);
        return this;
    }

    off(evt: string, fn: (...args: any[]) => any) {
        if (this._eventStack[evt]) {
            const arr = this._eventStack[evt];
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === fn) {
                    arr.splice(i, 1);
                    break;
                }
            }
        }

        return this;
    }

    emit(evt: string, ...argv: any[]) {
        if (this._eventStack[evt]) {
            for (const fn of this._eventStack[evt]) {
                if (false === fn.apply(this, argv)) {
                    break;
                }
            }
        }
        return this;
    }

}
