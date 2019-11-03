import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { breakSentence } from './utils/sentences-break';

(async () => {
  const rootDir = (await inquirer.prompt([
    {
      type: 'input',
      name: 'rootDir',
      message: '输入文件根目录',
    }
  ])).rootDir;

  const traverse = (root: string) => {
    const res = fs.statSync(root);
    if (res.isDirectory()) {
      const items = fs.readdirSync(root);
      for (const item of items) {
        traverse(path.resolve(root, item));
      }
    } else {
      const src = fs.readFileSync(root, { encoding: 'utf-8' });
      const dst = breakSentence(src);
      fs.writeFileSync(`${root.replace('.txt', '-new.txt')}`, dst, { encoding: 'utf-8' });
    }
  };
  traverse(rootDir);
})();
