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
var puppeteer_1 = __importDefault(require("puppeteer"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var sentences_break_1 = require("./utils/sentences-break");
var INFO_BASE_URL = 'https://bookmate.com/books/';
var READER_BASE_URL = 'https://reader.bookmate.com/';
var USERNAME = 'wangxiaolin@futve.com';
var PASSWORD = 'zhangliwei007';
if (!process.argv[2]) {
    console.log('Usage: bookmate-spider [book_id]');
    process.exit();
}
var id = process.argv[2];
var infoUrl = "" + INFO_BASE_URL + id;
var readerUrl = "" + READER_BASE_URL + id;
var browser;
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function getElement(page, selector, timeout) {
    if (timeout === void 0) { timeout = Infinity; }
    return __awaiter(this, void 0, void 0, function () {
        var result, duration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = null;
                    duration = 0;
                    _a.label = 1;
                case 1:
                    if (!!result) return [3 /*break*/, 4];
                    return [4 /*yield*/, page.$(selector)];
                case 2:
                    result = _a.sent();
                    if (result) {
                        return [3 /*break*/, 4];
                    }
                    return [4 /*yield*/, sleep(10)];
                case 3:
                    _a.sent();
                    duration += 10;
                    if (duration >= timeout) {
                        throw new Error("get element by " + selector + " timeout");
                    }
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
function getElements(page, selector, timeout) {
    if (timeout === void 0) { timeout = Infinity; }
    return __awaiter(this, void 0, void 0, function () {
        var result, duration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = [];
                    duration = 0;
                    _a.label = 1;
                case 1:
                    if (!!result) return [3 /*break*/, 4];
                    return [4 /*yield*/, page.$$(selector)];
                case 2:
                    result = _a.sent();
                    if (result && result.length > 0) {
                        return [3 /*break*/, 4];
                    }
                    return [4 /*yield*/, sleep(10)];
                case 3:
                    _a.sent();
                    duration += 10;
                    if (duration >= timeout) {
                        throw new Error("get element by " + selector + " timeout");
                    }
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
function navigate(page, url) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.goto(url)];
                case 1:
                    res = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!res || !res.ok()) return [3 /*break*/, 0];
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function mouseMove(page, x, y) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            page.mouse.move(x, y, { steps: 9 });
            return [2 /*return*/];
        });
    });
}
function clickElement(page, ele) {
    return __awaiter(this, void 0, void 0, function () {
        var bbox;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ele.boundingBox()];
                case 1:
                    bbox = _a.sent();
                    if (!bbox) return [3 /*break*/, 6];
                    return [4 /*yield*/, page.mouse.move(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, { steps: 50 })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, page.mouse.down({ button: 'left' })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, sleep(50)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, page.mouse.up({ button: 'left' })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function login() {
    return __awaiter(this, void 0, void 0, function () {
        var pages, page, res, loginBtn, loginWithEmail, loginForm, forms, userNameInput, passwordInput, submit;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer_1.default.launch({
                        headless: false
                    })];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.pages()];
                case 2:
                    pages = _a.sent();
                    if (!(pages.length > 0)) return [3 /*break*/, 3];
                    page = pages[0];
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, browser.newPage()];
                case 4:
                    page = _a.sent();
                    _a.label = 5;
                case 5:
                    page.setDefaultTimeout(99999);
                    _a.label = 6;
                case 6: return [4 /*yield*/, page.goto(infoUrl)];
                case 7:
                    res = _a.sent();
                    _a.label = 8;
                case 8:
                    if (!res || !res.ok()) return [3 /*break*/, 6];
                    _a.label = 9;
                case 9: return [4 /*yield*/, page.$('#login-button')];
                case 10:
                    loginBtn = _a.sent();
                    if (!loginBtn) return [3 /*break*/, 24];
                    return [4 /*yield*/, clickElement(page, loginBtn)];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, getElement(page, '#auth-with-email')];
                case 12:
                    loginWithEmail = _a.sent();
                    if (!loginWithEmail) return [3 /*break*/, 24];
                    return [4 /*yield*/, loginWithEmail.click()];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, getElement(page, '.login-form')];
                case 14:
                    loginForm = _a.sent();
                    return [4 /*yield*/, loginForm.$$('.input')];
                case 15:
                    forms = _a.sent();
                    userNameInput = forms[0];
                    if (!userNameInput) return [3 /*break*/, 17];
                    return [4 /*yield*/, userNameInput.type(USERNAME)];
                case 16:
                    _a.sent();
                    _a.label = 17;
                case 17: return [4 /*yield*/, sleep(1000)];
                case 18:
                    _a.sent();
                    passwordInput = forms[1];
                    if (!passwordInput) return [3 /*break*/, 20];
                    return [4 /*yield*/, passwordInput.type(PASSWORD)];
                case 19:
                    _a.sent();
                    _a.label = 20;
                case 20: return [4 /*yield*/, sleep(1000)];
                case 21:
                    _a.sent();
                    return [4 /*yield*/, getElement(page, '.button.button_submit')];
                case 22:
                    submit = _a.sent();
                    if (!submit) return [3 /*break*/, 24];
                    return [4 /*yield*/, clickElement(page, submit)];
                case 23:
                    _a.sent();
                    _a.label = 24;
                case 24: return [4 /*yield*/, getElement(page, '.header__avatar')];
                case 25:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function loadReader() {
    return __awaiter(this, void 0, void 0, function () {
        var pages, page, width, height, header, btns, list, first;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, browser.pages()];
                case 1:
                    pages = _a.sent();
                    if (!(pages.length > 0)) return [3 /*break*/, 19];
                    page = pages[0];
                    page.setDefaultTimeout(99999);
                    return [4 /*yield*/, navigate(page, readerUrl)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, page.$('.reader.reader_loading')];
                case 4:
                    if (!((_a.sent()) !== null)) return [3 /*break*/, 6];
                    return [4 /*yield*/, sleep(100)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 6:
                    width = page.viewport().width;
                    height = page.viewport().height;
                    return [4 /*yield*/, page.mouse.move(width / 2, height / 2, { steps: 20 })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, page.mouse.down()];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, sleep(100)];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, page.mouse.up()];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, getElement(page, '.header.header_active')];
                case 11:
                    header = _a.sent();
                    if (!header) return [3 /*break*/, 18];
                    return [4 /*yield*/, header.$$('.icon-button')];
                case 12:
                    btns = _a.sent();
                    if (!btns[0]) return [3 /*break*/, 18];
                    return [4 /*yield*/, clickElement(page, btns[0])];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, getElement(page, '.table-of-contents__chapters')];
                case 14:
                    list = _a.sent();
                    if (!list) return [3 /*break*/, 18];
                    return [4 /*yield*/, getElement(list, '.table-of-contents__chapter')];
                case 15:
                    first = _a.sent();
                    if (!first) return [3 /*break*/, 18];
                    return [4 /*yield*/, page.evaluate(function (ele) {
                            ele.scrollIntoViewIfNeeded({ behavior: "smooth", block: "end", inline: "nearest" });
                        }, first)];
                case 16:
                    _a.sent();
                    return [4 /*yield*/, clickElement(page, first)];
                case 17:
                    _a.sent();
                    _a.label = 18;
                case 18: return [2 /*return*/, page];
                case 19: return [2 /*return*/];
            }
        });
    });
}
function readPage(page) {
    return __awaiter(this, void 0, void 0, function () {
        var result, content, elements, _i, elements_1, p, bbox, left, right, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = '';
                    _a.label = 1;
                case 1: return [4 /*yield*/, page.$('.reader.reader_loading')];
                case 2:
                    if (!((_a.sent()) !== null)) return [3 /*break*/, 4];
                    return [4 /*yield*/, sleep(100)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, page.$('.paginated-content')];
                case 5:
                    content = _a.sent();
                    if (!content) return [3 /*break*/, 11];
                    return [4 /*yield*/, content.$$('p')];
                case 6:
                    elements = _a.sent();
                    _i = 0, elements_1 = elements;
                    _a.label = 7;
                case 7:
                    if (!(_i < elements_1.length)) return [3 /*break*/, 11];
                    p = elements_1[_i];
                    return [4 /*yield*/, p.boundingBox()];
                case 8:
                    bbox = _a.sent();
                    if (!bbox) return [3 /*break*/, 10];
                    left = bbox.x;
                    right = bbox.x + bbox.width;
                    if (!(left >= 0 && right <= page.viewport().width)) return [3 /*break*/, 10];
                    return [4 /*yield*/, p.evaluate(function (el) { return el.innerText; }, p)];
                case 9:
                    text = _a.sent();
                    result += text.split('\n').filter(function (v) { return v.split(' ').length >= 9; }).join('\n') + '\n';
                    _a.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 7];
                case 11:
                    result = sentences_break_1.breakSentence(result.split('\n').filter(function (v) { return Boolean(v); }).map(function (v) { console.log(v); console.log('****************'); return v; }).join('\n'));
                    return [2 /*return*/, result];
            }
        });
    });
}
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var page, finished, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, login()];
            case 1:
                _a.sent();
                return [4 /*yield*/, loadReader()];
            case 2:
                page = _a.sent();
                if (!page) return [3 /*break*/, 11];
                finished = false;
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, readPage(page)];
            case 4:
                result = _a.sent();
                fs_extra_1.default.appendFile(id + ".txt", result, { encoding: 'utf-8' });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                if (error_1.message === 'Execution context was destroyed, most likely because of a navigation.') {
                    finished = true;
                }
                else {
                    throw error_1;
                }
                return [3 /*break*/, 6];
            case 6: return [4 /*yield*/, page.keyboard.down('ArrowRight')];
            case 7:
                _a.sent();
                return [4 /*yield*/, sleep(50)];
            case 8:
                _a.sent();
                return [4 /*yield*/, page.keyboard.down('ArrowRight')];
            case 9:
                _a.sent();
                if (page.url() !== readerUrl) {
                    finished = true;
                }
                ;
                _a.label = 10;
            case 10:
                if (!finished) return [3 /*break*/, 3];
                _a.label = 11;
            case 11:
                console.log('finish');
                return [2 /*return*/];
        }
    });
}); })().then(function () { return browser.close(); });
