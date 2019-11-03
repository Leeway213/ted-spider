import fs from 'fs-extra';

export class History {

  get filePath() {
    return `${this.root}/${this.FILENAME}`;
  }

  history: { [lan: string]: string[] } = {};

  private readonly FILENAME = 'history.json';

  constructor(public root: string) {
    if (!fs.existsSync(root)) {
      fs.mkdirpSync(root);
    }

    if (fs.existsSync(this.filePath)) {
      this.history = JSON.parse(fs.readFileSync(this.filePath, { encoding: 'utf-8' })) || {};
    }
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.history, null, 2), { encoding: 'utf-8' });
  }

  push(lan: string, url: string) {
    this.history[lan] = (this.history[lan] || []);
    this.history[lan].push(url);
  }

  hasHistory(url: string, lan: string) {
    return this.history[lan].includes(url);
  }

  getLanguage(lan: string) {
    this.history[lan] = this.history[lan] || [];
    return this.history[lan];
  }
}
