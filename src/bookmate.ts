import puppeteer, { Page, Response, Browser, ElementHandle } from 'puppeteer';
import fs from 'fs-extra';
import { breakSentence } from './utils/sentences-break';

const INFO_BASE_URL = 'https://bookmate.com/books/';
const READER_BASE_URL = 'https://reader.bookmate.com/';

const USERNAME = 'wangxiaolin@futve.com';
const PASSWORD = 'zhangliwei007';

if (!process.argv[2]) {
  console.log('Usage: bookmate-spider [book_id]');
  process.exit();
}

const id = process.argv[2];

const infoUrl = `${INFO_BASE_URL}${id}`;
const readerUrl = `${READER_BASE_URL}${id}`;


let browser: Browser;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getElement(page: ElementHandle<Element> | Page, selector: string, timeout: number = Infinity) {
  let result: ElementHandle<Element> | null = null;
  let duration = 0;
  while (!result) {
    result = await page.$(selector);
    if (result) {
      break;
    }
    await sleep(10);
    duration += 10;
    if (duration >= timeout) {
      throw new Error(`get element by ${selector} timeout`);
    }
  }
  return result;
}

async function getElements(page: Page | ElementHandle<Element>, selector: string, timeout: number = Infinity) {
  let result: ElementHandle<Element>[] = [];
  let duration = 0;
  while (!result) {
    result = await page.$$(selector);
    if (result && result.length > 0) {
      break;
    }
    await sleep(10);
    duration += 10;
    if (duration >= timeout) {
      throw new Error(`get element by ${selector} timeout`);
    }
  }
  return result;
}

async function navigate(page: Page, url: string) {
  let res: Response | null;
  do {
    res = await page.goto(url);
  } while (!res || !res.ok());
}

async function mouseMove(page: Page, x: number, y: number) {
  page.mouse.move(x, y, { steps: 9 });
}

async function clickElement(page: Page, ele: ElementHandle<Element>) {
  const bbox = await ele.boundingBox();
  if (bbox) {
    await page.mouse.move(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, { steps: 50 });
    await page.mouse.down({ button: 'left' });
    await sleep(50);
    await page.mouse.up({ button: 'left' });
  }
}

async function login() {
  browser = await puppeteer.launch({
    headless: false
  });

  const pages = await browser.pages();
  let page: Page;
  if (pages.length > 0) {
    page = pages[0];
  } else {
    page = await browser.newPage();
  }
  page.setDefaultTimeout(99999);

  let res: Response | null;
  do {
    res = await page.goto(infoUrl);
  } while (!res || !res.ok());

  const loginBtn = await page.$('#login-button');
  if (loginBtn) {
    await clickElement(page, loginBtn);
    // await loginBtn.click();

    const loginWithEmail = await getElement(page, '#auth-with-email');
    if (loginWithEmail) {
      await loginWithEmail.click();

      const loginForm = await getElement(page, '.login-form');
      const forms = await loginForm.$$('.input');
      const userNameInput = forms[0];
      if (userNameInput) {
        await userNameInput.type(USERNAME);
      }

      await sleep(1000);
      const passwordInput = forms[1];
      if (passwordInput) {
        await passwordInput.type(PASSWORD);
      }
      await sleep(1000);

      const submit = await getElement(page, '.button.button_submit');
      if (submit) {
        await clickElement(page, submit);
      }
    }
  }

  await getElement(page, '.header__avatar');
}

async function loadReader() {
  const pages = await browser.pages();
  if (pages.length > 0) {
    const page = pages[0];
    page.setDefaultTimeout(99999);

    await navigate(page, readerUrl);

    while ((await page.$('.reader.reader_loading')) !== null) {
      await sleep(100);
    }
    const width = page.viewport().width;
    const height = page.viewport().height;
    await page.mouse.move(width / 2, height / 2, { steps: 20 });
    await page.mouse.down();
    await sleep(100);
    await page.mouse.up();

    const header = await getElement(page, '.header.header_active');
    if (header) {
      const btns = await header.$$('.icon-button');
      if (btns[0]) {
        await clickElement(page, btns[0]);
        const list = await getElement(page, '.table-of-contents__chapters');
        if (list) {
          const first = await getElement(list, '.table-of-contents__chapter');
          if (first) {
            await page.evaluate((ele) => {
              ele.scrollIntoViewIfNeeded({ behavior: "smooth", block: "end", inline: "nearest" });
            }, first);
            await clickElement(page, first);
          }
        }
      }
    }
    return page;
  }
}

async function readPage(page: Page) {
  let result = '';
  while ((await page.$('.reader.reader_loading')) !== null) {
    await sleep(100);
  }
  const content = await page.$('.paginated-content');
  if (content) {
    const elements = await content.$$('p');
    for (const p of elements) {
      const bbox = await p.boundingBox();
      if (bbox) {
        const left = bbox.x;
        const right = bbox.x + bbox.width;
        if (left >= 0 && right <= page.viewport().width) {
          const text: string = await p.evaluate((el: any) => el.innerText, p);
          result += text.split('\n').filter(v => v.split(' ').length >= 9).join('\n') + '\n';
        }
      }
    }
  }
  result = breakSentence(result.split('\n').filter(v => Boolean(v)).map(v => {console.log(v); console.log('****************'); return v;}).join('\n'));
  return result;
}

(async () => {
  await login();
  const page = await loadReader();
  if (page) {
    let finished = false;
    do {
      try {
        const result = await readPage(page);
        fs.appendFile(`${id}.txt`, result, { encoding: 'utf-8' })
      } catch (error) {
        if (error.message === 'Execution context was destroyed, most likely because of a navigation.') {
          finished = true;
        } else {
          throw error;
        }
      }
      await page.keyboard.down('ArrowRight');
      await sleep(50);
      await page.keyboard.down('ArrowRight');
      if (page.url() !== readerUrl) {
        finished = true;
      };
    } while (!finished);
  }
  console.log('finish');
})().then(() => browser.close());
