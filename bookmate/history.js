"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var History = /** @class */ (function () {
    function History(root) {
        this.root = root;
        this.history = {};
        this.FILENAME = 'history.json';
        if (!fs_extra_1.default.existsSync(root)) {
            fs_extra_1.default.mkdirpSync(root);
        }
        if (fs_extra_1.default.existsSync(this.filePath)) {
            this.history = JSON.parse(fs_extra_1.default.readFileSync(this.filePath, { encoding: 'utf-8' })) || {};
        }
    }
    Object.defineProperty(History.prototype, "filePath", {
        get: function () {
            return this.root + "/" + this.FILENAME;
        },
        enumerable: true,
        configurable: true
    });
    History.prototype.save = function () {
        fs_extra_1.default.writeFileSync(this.filePath, JSON.stringify(this.history, null, 2), { encoding: 'utf-8' });
    };
    History.prototype.push = function (lan, url) {
        this.history[lan] = (this.history[lan] || []);
        this.history[lan].push(url);
    };
    History.prototype.hasHistory = function (url, lan) {
        return (this.history[lan] || []).includes(url);
    };
    History.prototype.getLanguage = function (lan) {
        this.history[lan] = this.history[lan] || [];
        return this.history[lan];
    };
    return History;
}());
exports.History = History;
