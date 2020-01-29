const list = [
  "nxNRWV92",
  "D1atfLRZ",
  "TIWbcJS0",
  "IKGsjgv7",
  "IbGL0kxZ",
  "IgpnoEsY",
  "bAVxbvOd",
]

import path from 'path';
const script = path.resolve(__dirname, 'bookmate.ts');

import child_process from 'child_process';

for (const item of list) {
  try {
    child_process.execSync('npx ts-node ' + script + ' ' + item, { stdio: 'inherit' });
  } catch (error) {

  }
}
