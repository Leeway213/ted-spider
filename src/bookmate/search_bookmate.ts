
import { Browser, launch, Page, Response, ElementHandle } from 'puppeteer';
import path from 'path';

const CHROME_DATA_DIR = path.resolve(__dirname, './browser_data');

const SEARCH_BASE_URL = 'https://bookmate.com/search';
const INFO_BASE_URL = 'https://bookmate.com/books/';
const READER_BASE_URL = 'https://reader.bookmate.com/';

const USERNAME = 'wangxiaolin@futve.com';
const PASSWORD = 'zhangliwei007';

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
  browser = await launch({
    headless: false,
    userDataDir: CHROME_DATA_DIR,
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
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
    res = await page.goto(SEARCH_BASE_URL);
    if (res && res.status() === 404) {
      process.exit();
    }
  } while (!res || !res.ok());

  const header = await page.$('.header__avatar');
  if (header) {
    return;
  }

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
  } else {
    process.exit();
  }

  await getElement(page, '.header__avatar');
}

(async() => {
  const browser = await launch({
    headless: false
  });

  const pages = await browser.pages();
  let page: Page;
  if (pages.length > 0) {
    page = pages[0];
  } else {
    page = await browser.newPage();
  }
  page.setDefaultTimeout(999999);

  await page.goto(SEARCH_BASE_URL);
  const search = await getElement(page, '#search-input');
  if (search) {
    search.type('а');
  }
})()
