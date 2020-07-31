import iconv from "iconv-lite";

export interface Book {
  name: string;
  url: string;
  author: string;
  summary?: string;
}

export interface SiteResult {
  site: string;
  success: boolean;
  time: number;
  message: string;
  books: Book[];
}

export interface SiteRule {
  site: string;
  gbk?: boolean;
  json?: boolean;
  bookLink: (text: string) => string;
  searchLink: (text: string) => string;
  originalSearchLink?: (text: string) => string;
  booksSelector: string;
  nameSelector: string;
  urlSelector: string;
  authorSelector?: string;
  coverSelector?: string;
  summarySelector?: string;
}

export const siteRules: SiteRule[] = [
  {
    site: "晋江文学城",
    gbk: true,
    searchLink: (text) =>
      `http://www.jjwxc.net/bookbase.php?searchkeywords=${text}`,
    bookLink: (text) => "http://www.jjwxc.net/" + text,
    booksSelector: "body > table > tbody > tr",
    nameSelector: "td:nth-child(2) > a",
    urlSelector: "td:nth-child(2) > a",
    authorSelector: "td:nth-child(1) > a",
    summarySelector: "td:nth-child(3)",
  },
  {
    site: "长佩",
    json: true,
    searchLink: (text) =>
      `https://m.gongzicp.com/novel/searchNovelOnlyByName?keyword=${text}&searchType=1&finishType=0&novelType=0&sortType=1&page=1`,
    bookLink: (text) => `https://www.gongzicp.com/novel-${text}.html`,
    booksSelector: "data > list",
    nameSelector: "novel_name",
    urlSelector: "novel_id",
    authorSelector: "novel_author",
    summarySelector: "novel_desc",
  },
  {
    site: "海棠",
    searchLink: (text) =>
      `https://jp.myhtlmebook.com/searchlist.php?fixlangsnd=FsedAjjT6&fixlangact=edit&searchkeyword=${text}&searchmode=book&selbooktype=all&selbooktypeb=all&selsexytype=all&selages=all&selstylesa=all&selstylesb=all&selbookpoststats=all`,
    bookLink: (text) => `https://jp.myhtlmebook.com${text}`,
    booksSelector: "body > table > tbody > tr",
    nameSelector: "td > a:nth-child(1) > font > b",
    urlSelector: "td > a:nth-child(1)",
    authorSelector: "td > a:nth-child(6) > font",
    summarySelector: "td",
  },
  {
    site: "废文网 - DuckDuckGo",
    searchLink: (text) =>
      `https://duckduckgo.com/html/?q=${
        text + encodeURIComponent(" site:sosad.fun")
      }`,
    originalSearchLink: (text) => `https://sosad.fun/search?search=${text}`,
    bookLink: (text) => text,
    booksSelector: "#links > div",
    nameSelector: "div > h2 > a > b",
    urlSelector: "div > h2 > a",
    summarySelector: "a.result__snippet",
  },
  {
    site: "爱奇艺文学",
    searchLink: (text) => `http://wenxue.iqiyi.com/book/search-${text}-1.html`,
    bookLink: (text) => text,
    booksSelector: "li.stacksBook",
    nameSelector: "div > div.stacksBook-info > h3 > a > span",
    urlSelector: "div > div.stacksBook-info > h3 > a",
    authorSelector:
      "div > div.stacksBook-info > p.stacksBook-about > em.writerName",
    summarySelector: " div > div.stacksBook-info > p.stacksBook-details",
  },
  {
    site: "豆腐",
    searchLink: (text) => `https://www.doufu.la/search?kd=${text}`,
    bookLink: (text) => text,
    booksSelector: "div.category_bd > div",
    nameSelector: "div.book_mn > h3 > a",
    urlSelector: "div.book_mn > h3 > a",
    authorSelector: "div.book_sd > div",
    summarySelector: "div.book_mn > div.book_ct",
  },
  {
    site: "Lofter - DuckDuckGo",
    searchLink: (text) =>
      `https://duckduckgo.com/html/?q=${
        text + encodeURIComponent(" site:lofter.com")
      }`,
    bookLink: (text) => text,
    booksSelector: "#links > div",
    nameSelector: "div > h2 > a > b",
    urlSelector: "div > h2 > a",
    summarySelector: "a.result__snippet",
  },
  {
    site: "Ao3",
    searchLink: (text) =>
      `https://archiveofourown.org/works/search?utf8=%E2%9C%93&commit=Search&work_search%5Bquery%5D=&work_search%5Btitle%5D=${text}&work_search%5Bcreators%5D=&work_search%5Brevised_at%5D=&work_search%5Bcomplete%5D=&work_search%5Bcrossover%5D=&work_search%5Bsingle_chapter%5D=0&work_search%5Bword_count%5D=&work_search%5Blanguage_id%5D=&work_search%5Bfandom_names%5D=&work_search%5Brating_ids%5D=&work_search%5Bcharacter_names%5D=&work_search%5Brelationship_names%5D=&work_search%5Bfreeform_names%5D=&work_search%5Bhits%5D=&work_search%5Bkudos_count%5D=&work_search%5Bcomments_count%5D=&work_search%5Bbookmarks_count%5D=&work_search%5Bsort_column%5D=_score&work_search%5Bsort_direction%5D=desc`,
    bookLink: (text) => `https://archiveofourown.org/${text}`,
    booksSelector: "#main > ol > li",
    nameSelector: "div > h4 > a:nth-child(1)",
    urlSelector: "div > h4 > a:nth-child(1)",
    authorSelector: "div > h4 > a:nth-child(2)",
    summarySelector: "blockquote",
  },
];

export function encodeURIGbk(text: string): string {
  let arr = iconv.encode(text, "gbk");
  return arr.reduce(
    (prev, cur) => prev + "%" + cur.toString(16).toUpperCase(),
    ""
  );
}
