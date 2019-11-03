import fs from 'fs';
import { breakSentence } from './utils/sentences-break';

export function saveToFile(obj: {
  id: string,
  title: string,
  description: string,
  transcripts: string[],
}, language: string) {
  if (!fs.existsSync('./result')) {
    fs.mkdirSync('./result');
  }
  if (!fs.existsSync(`./result/${language}`)) {
    fs.mkdirSync(`./result/${language}`);
  }
  if (obj.id) {
    const data = `${obj.description}\n\r\n\r${obj.transcripts.join('\n')}`;
    fs.writeFileSync(`./result/${language}/${obj.id}.txt`, breakSentence(data), { encoding: 'utf-8' });
  }
}
