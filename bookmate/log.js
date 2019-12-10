"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logSymbols = require("log-symbols");
var chalk_1 = __importDefault(require("chalk"));
function log(text, type) {
    if (type === void 0) { type = 'info'; }
    var color = chalk_1.default.green;
    switch (type) {
        case 'error':
            color = chalk_1.default.red;
            break;
        case 'info':
            break;
        case 'warning':
            color = chalk_1.default.yellow;
            break;
    }
    console.log(logSymbols[type], color(text));
}
exports.log = log;
