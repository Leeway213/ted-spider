"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TaskBase = /** @class */ (function () {
    function TaskBase() {
        this._eventStack = {};
    }
    TaskBase.prototype.on = function (evt, fn) {
        if (!this._eventStack[evt]) {
            this._eventStack[evt] = [];
        }
        this._eventStack[evt].push(fn);
        return this;
    };
    TaskBase.prototype.off = function (evt, fn) {
        if (this._eventStack[evt]) {
            var arr = this._eventStack[evt];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === fn) {
                    arr.splice(i, 1);
                    break;
                }
            }
        }
        return this;
    };
    TaskBase.prototype.emit = function (evt) {
        var argv = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            argv[_i - 1] = arguments[_i];
        }
        if (this._eventStack[evt]) {
            for (var _a = 0, _b = this._eventStack[evt]; _a < _b.length; _a++) {
                var fn = _b[_a];
                if (false === fn.apply(this, argv))
                    break;
            }
        }
        return this;
    };
    return TaskBase;
}());
exports.TaskBase = TaskBase;
