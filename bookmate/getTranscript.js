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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var log_1 = require("./log");
var puppeteer_1 = __importDefault(require("puppeteer"));
function parseLanguage(url) {
    var tmp = url.split('?');
    var queryStr = tmp[1];
    var queries = queryStr.split('&');
    for (var _i = 0, queries_1 = queries; _i < queries_1.length; _i++) {
        var query = queries_1[_i];
        var _a = query.split('='), key = _a[0], value = _a[1];
        if (key === 'language') {
            return value;
        }
    }
}
function getTranscript(url) {
    return __awaiter(this, void 0, void 0, function () {
        var language, browser, page, description, title, transcripts, id, html, filters, transUrl, result, _i, _a, p;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    language = parseLanguage(url) || '';
                    log_1.log("\u6B63\u5728\u722C\u53D6" + url, 'info');
                    return [4 /*yield*/, puppeteer_1.default.launch({
                            timeout: 0,
                            // headless: false,
                            defaultViewport: {
                                width: 1920,
                                height: 1080,
                            },
                        })];
                case 1:
                    browser = _b.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _b.sent();
                    page.on('error', function () { });
                    page.setDefaultTimeout(0);
                    page.goto(url);
                    description = '';
                    return [4 /*yield*/, new Promise(function (resolve) {
                            page.once('domcontentloaded', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!!description) return [3 /*break*/, 2];
                                            return [4 /*yield*/, page.evaluate(function () {
                                                    var p = document.getElementsByClassName(' l-h:n m-b:1 ')[0];
                                                    if (p instanceof HTMLElement) {
                                                        return p.innerText;
                                                    }
                                                    return '';
                                                })];
                                        case 1:
                                            description = _a.sent();
                                            return [3 /*break*/, 0];
                                        case 2:
                                            resolve();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        })
                        // page.once('domcontentloaded', async () => {
                        //   while (!description) {
                        //     await new Promise(async resolve => {
                        //       description = await page.evaluate(() => {
                        //         const p = document.getElementsByClassName(' l-h:n m-b:1 ')[0];
                        //         if (p instanceof HTMLElement) {
                        //           return p.innerText;
                        //         }
                        //         return '';
                        //       });
                        //       resolve();
                        //     })
                        //   }
                        // })
                    ];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, page.title()];
                case 4:
                    title = (_b.sent()).replace(' | TED Talk', '');
                    transcripts = [];
                    id = '';
                    return [4 /*yield*/, page.evaluate(function () {
                            return document.body.innerHTML;
                        })];
                case 5:
                    html = _b.sent();
                    filters = /__ga\('set', 'dimension2', '[1-9]\d*/.exec(html);
                    if (!filters) return [3 /*break*/, 9];
                    if (!filters[0]) return [3 /*break*/, 7];
                    id = filters[0].replace("__ga('set', 'dimension2', '", '');
                    transUrl = "https://www.ted.com/talks/" + id + "/transcript.json" + (language ? "?language=" + language : '');
                    return [4 /*yield*/, axios_1.default.get(transUrl, { responseType: 'json' })];
                case 6:
                    result = (_b.sent()).data;
                    for (_i = 0, _a = result.paragraphs; _i < _a.length; _i++) {
                        p = _a[_i];
                        transcripts = transcripts.concat.apply(transcripts, p.cues.map(function (v) { return v.text; }));
                    }
                    return [3 /*break*/, 8];
                case 7:
                    log_1.log('没找到talk id', 'error');
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    log_1.log('没找到talk id', 'error');
                    _b.label = 10;
                case 10: return [4 /*yield*/, page.evaluate(function () {
                        window.stop();
                    })];
                case 11:
                    _b.sent();
                    return [4 /*yield*/, page.close()];
                case 12:
                    _b.sent();
                    return [4 /*yield*/, browser.close()];
                case 13:
                    _b.sent();
                    log_1.log("\u722C\u53D6\u5B8C\u6210" + url, 'info');
                    log_1.log("talk id: " + id, 'info');
                    log_1.log("talk title: " + title, 'info');
                    return [2 /*return*/, {
                            id: id,
                            title: title,
                            description: description,
                            transcripts: transcripts,
                        }];
            }
        });
    });
}
exports.getTranscript = getTranscript;
