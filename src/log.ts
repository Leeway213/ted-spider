import logSymbols = require("log-symbols");
import chalk from "chalk";

export function log(text: string, type: 'info' | 'warning' | 'error' = 'info') {
  let color = chalk.green;
  switch (type) {
    case 'error':
      color = chalk.red;
      break;
    case 'info':
      break;
    case 'warning':
      color = chalk.yellow;
      break;
  }
  console.log(logSymbols[type], color(text));
}
