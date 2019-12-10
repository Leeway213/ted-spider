"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BREAK_CHAR = [
    '.',
    '!',
    '?',
];
function breakSentence(text) {
    var result = '';
    for (var _i = 0, _a = text.replace(/\r/g, ''); _i < _a.length; _i++) {
        var char = _a[_i];
        result += char;
        if (BREAK_CHAR.includes(char)) {
            result += '\n';
        }
    }
    return result.split('\n').map(function (v) { return v.trim(); }).join('\n');
}
exports.breakSentence = breakSentence;
