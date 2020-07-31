import { NowRequest, NowResponse } from "@vercel/node";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import iconv from "iconv-lite";
import { toXML } from "jstoxml";
import { Book, SiteResult, siteRules, encodeURIGbk } from "../src/common";

const ua =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36 Edg/84.0.522.44";

function replaceBlank(text: string): string {
  return text.replace(/(\s)/g, "").replace(/<\/?.*?>/g,"");
}

const getText = (ele?: Element, selector?: string, href?: boolean) => {
  if (!selector || !ele) {
    return "";
  }
  const e = ele.querySelector(selector);
  if (!e) {
    return "";
  }
  return replaceBlank((href ? e.getAttribute("href") : e.textContent) || "");
};

async function bookSearch(text: string, srcIndex: number): Promise<SiteResult> {
  const site = siteRules[srcIndex];
  let siteResult: SiteResult = {
    site: site.site,
    success: true,
    message: "",
    books: [],
    time: 0,
  };
  const startTime = Date.now();
  try {
    const response = await fetch(
      site.searchLink(site.gbk ? encodeURIGbk(text) : encodeURIComponent(text)),
      {
        headers: {
          "User-Agent": ua,
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const body = site.gbk
      ? iconv.decode(await response.buffer(), "GB18030")
      : await response.text();
    const dom = new JSDOM(site.json ? toXML(JSON.parse(body)) : body);
    const bookElements = dom.window.document.querySelectorAll(
      site.booksSelector
    );
    for (let index = 0; index < bookElements.length; index++) {
      const bookElement = bookElements[index];
      const book: Book = {
        name: getText(bookElement, site.nameSelector),
        url: site.bookLink(getText(bookElement, site.urlSelector, !site.json)),
        author: getText(bookElement, site.authorSelector),
        summary: getText(bookElement, site.summarySelector),
      };
      if (
        book.name.length !== 0 &&
        book.name.toLowerCase().indexOf(text) >= 0
      ) {
        siteResult.books.push(book);
      }
    }
  } catch (error) {
    siteResult.success = false;
    siteResult.message = siteResult.message + "\n" + error.toString();
  }
  siteResult.time = Date.now() - startTime;
  return siteResult;
}

export default async (request: NowRequest, response: NowResponse) => {
  let { name, src } = request.query;
  let srcIndex = 0;
  if (
    typeof name !== "string" ||
    (name = replaceBlank(name).toLowerCase()).length === 0 ||
    typeof src !== "string" ||
    (srcIndex = parseInt(src)) >= siteRules.length ||
    srcIndex < 0
  ) {
    response.status(400).json({
      message: "param 'name' and 'src' should be string and not empty",
    });
    return;
  }
  response.setHeader("Cache-Control", "max-age=0, s-maxage=172800");
  try {
    response.status(200).json(await bookSearch(name, srcIndex));
  } catch (error) {
    response.status(500).json({
      message: error,
    });
  }
};
