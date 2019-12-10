"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var task_base_1 = require("./task-base");
var TaskQueue = /** @class */ (function (_super) {
    __extends(TaskQueue, _super);
    // errorHandler: (source, reason) => any;
    // resultHandler: (result) => any;
    // statusChanged: (looping: boolean) => any;
    function TaskQueue(concurrency) {
        var _this = _super.call(this) || this;
        _this._concurrency = 3;
        _this._loopingCount = 0;
        _this._looping = false;
        _this.queue = [];
        _this.concurrency = concurrency ? concurrency : 3;
        return _this;
    }
    Object.defineProperty(TaskQueue.prototype, "concurrency", {
        get: function () {
            return this._concurrency;
        },
        set: function (value) {
            if (this._concurrency !== value) {
                this._concurrency = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskQueue.prototype, "looping", {
        get: function () {
            return this._looping;
        },
        set: function (value) {
            if (this._looping !== value) {
                this._looping = value;
                // this.statusChanged(this._looping);
                this.emit('statuschange', this._looping ? 'running' : 'stopped');
            }
        },
        enumerable: true,
        configurable: true
    });
    TaskQueue.prototype.subscribe = function (task) {
        if (!this.queue) {
            this.queue = [];
        }
        this.queue.push(task);
    };
    TaskQueue.prototype.publish = function () {
        var _this = this;
        if (!this.queue || this.queue.length === 0) {
            if (this._loopingCount === 0) {
                this.looping = false;
                this.emit('finished', this);
            }
            return;
        }
        for (var i = 0; i < this.concurrency - this._loopingCount; i++) {
            if (this.queue.length > 0) {
                this.looping = true;
                var task = this.queue.shift();
                if (task) {
                    this.loopTask(task).then(function (result) {
                        _this._loopingCount--;
                        // TODO: 报告任务执行结果
                        _this.emit('complete', _this);
                        // 继续发布循环
                        _this.publish();
                    }, function (reason) {
                        _this._loopingCount--;
                        // 继续发布循环
                        _this.publish();
                        // 发生错误后，处理错误
                        _this.emit('error', reason);
                    });
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
    };
    TaskQueue.prototype.loopTask = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = this.execTask(task);
                        if (!(result instanceof Promise)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, result];
                    case 2:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        throw error_1;
                    case 4: return [2 /*return*/, result];
                }
            });
        });
    };
    return TaskQueue;
}(task_base_1.TaskBase));
exports.TaskQueue = TaskQueue;
