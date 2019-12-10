"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var sentences_break_1 = require("./utils/sentences-break");
function saveToFile(obj, language) {
    if (!fs_1.default.existsSync('./result')) {
        fs_1.default.mkdirSync('./result');
    }
    if (!fs_1.default.existsSync("./result/" + language)) {
        fs_1.default.mkdirSync("./result/" + language);
    }
    if (obj.id) {
        var data = obj.description + "\n\r\n\r" + obj.transcripts.join('\n');
        fs_1.default.writeFileSync("./result/" + language + "/" + obj.id + ".txt", sentences_break_1.breakSentence(data), { encoding: 'utf-8' });
    }
}
exports.saveToFile = saveToFile;
