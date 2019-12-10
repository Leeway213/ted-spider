#!/usr/bin/env node
"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var inquirer_1 = __importDefault(require("inquirer"));
var ora_1 = __importDefault(require("ora"));
var cheerio_1 = __importDefault(require("cheerio"));
var log_symbols_1 = __importDefault(require("log-symbols"));
var chalk_1 = __importDefault(require("chalk"));
var getTranscript_1 = require("./getTranscript");
var TranscriptTaskQueue_1 = require("./TranscriptTaskQueue");
var log_1 = require("./log");
var history_1 = require("./history");
var taskQueue = new TranscriptTaskQueue_1.TranscriptQueue(10);
var subscribing = false;
taskQueue.on('finished', function () { return subscribing ? undefined : process.exit(); });
var history = new history_1.History('./result');
process.on('SIGINT', function () { return history.save(); });
process.on('exit', function () { return history.save(); });
process.on('disconnect', function () { return history.save(); });
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var spinner, res, selected, language, run, _i, res_1, lan;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                spinner = ora_1.default('获取语言列表...');
                spinner.start();
                return [4 /*yield*/, axios_1.default.get('https://www.ted.com/languages/combo.json?per_page=1000', {
                        responseType: 'json',
                    }).then(function (res) { return res.data; })];
            case 1:
                res = _a.sent();
                spinner.stop();
                return [4 /*yield*/, inquirer_1.default.prompt([
                        {
                            type: 'list',
                            name: 'language',
                            message: '请选择语言',
                            choices: __spreadArrays(['all'], res.map(function (v) { return v.label; })),
                        }
                    ])];
            case 2:
                selected = _a.sent();
                language = {};
                run = function (language) { return __awaiter(void 0, void 0, void 0, function () {
                    var url, html, $_1, pagination, pages, pageItems, items, hrefs, i, tasks, _loop_1, _i, tasks_1, task;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                subscribing = true;
                                if (!language) return [3 /*break*/, 8];
                                url = "https://www.ted.com/talks?language=" + language.value + "&sort=newest";
                                spinner.start('loading...');
                                return [4 /*yield*/, axios_1.default.get(url, {
                                        responseType: 'text'
                                    }).then(function (res) { return res.data; })];
                            case 1:
                                html = _a.sent();
                                spinner.stop();
                                $_1 = cheerio_1.default.load(html);
                                pagination = $_1('.pagination')[0];
                                pages = 1;
                                if (pagination) {
                                    pageItems = $_1('.pagination__item');
                                    if (pageItems.length > 0) {
                                        try {
                                            pages = parseInt(pageItems.last().text());
                                        }
                                        catch (error) {
                                            console.log(error);
                                        }
                                    }
                                }
                                items = $_1('#browse-results').children('.row').children('.col');
                                if (!(items && items.length > 0)) return [3 /*break*/, 7];
                                console.log(log_symbols_1.default.info, chalk_1.default.green("\u5F53\u524D\u9875\u6709" + items.length + "\u6761\u6570\u636E, \u5171" + pages + "\u9875."));
                                hrefs = Array.from(new Set(items.find('a.ga-link').toArray().map(function (e) { return "https://www.ted.com" + $_1(e).attr('href'); })));
                                i = 1;
                                _a.label = 2;
                            case 2:
                                if (!(i <= pages)) return [3 /*break*/, 6];
                                log_1.log("\u8BA2\u9605\u7B2C" + i + "\u9875\u722C\u53D6\u4EFB\u52A1...", 'info');
                                if (!(i !== 1)) return [3 /*break*/, 4];
                                return [4 /*yield*/, axios_1.default.get("https://www.ted.com/talks?language=" + language.value + "&sort=newest&page=" + i).then(function (res) { return res.data; })];
                            case 3:
                                html = _a.sent();
                                $_1 = cheerio_1.default.load(html);
                                items = $_1('#browse-results').children('.row').children('.col');
                                hrefs = Array.from(new Set(items.find('a.ga-link').toArray().map(function (e) { return "https://www.ted.com" + $_1(e).attr('href'); })));
                                _a.label = 4;
                            case 4:
                                tasks = hrefs.filter(function (v) { return !history.hasHistory(v, language.value); }).map(function (v) { return new TranscriptTaskQueue_1.TranscriptTask(getTranscript_1.getTranscript, [v, language.label]); });
                                _loop_1 = function (task) {
                                    task.on('finished', function () { return history.push(language.value, task.url); });
                                    taskQueue.subscribe(task);
                                    taskQueue.publish();
                                };
                                for (_i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
                                    task = tasks_1[_i];
                                    _loop_1(task);
                                }
                                _a.label = 5;
                            case 5:
                                i++;
                                return [3 /*break*/, 2];
                            case 6: return [3 /*break*/, 8];
                            case 7:
                                console.log(log_symbols_1.default.error, chalk_1.default.red("\u6CA1\u6709" + language.label + "\u8BED\u8A00\u7684\u6570\u636E"));
                                _a.label = 8;
                            case 8:
                                ;
                                subscribing = false;
                                return [2 /*return*/];
                        }
                    });
                }); };
                if (!(selected.language === 'all')) return [3 /*break*/, 7];
                _i = 0, res_1 = res;
                _a.label = 3;
            case 3:
                if (!(_i < res_1.length)) return [3 /*break*/, 6];
                lan = res_1[_i];
                return [4 /*yield*/, run(lan)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 9];
            case 7:
                language = res.find(function (v) { return v.label === selected.language; });
                return [4 /*yield*/, run(language)];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9: return [2 /*return*/];
        }
    });
}); })();
