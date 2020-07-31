import React from "react";
import "semantic-ui-css/semantic.min.css";
import {
  Input,
  Button,
  Accordion,
  List,
  Loader,
  Popup,
  Icon,
  Card,
} from "semantic-ui-react";
import { SiteResult, siteRules, encodeURIGbk } from "./common";
import "./App.css";

interface State {
  text: string;
  searching: boolean;
  sites: { [index: number]: SiteResult };
  activeIndex?: number | string;
}

export default class App extends React.Component<{}, State> {
  state: State = {
    text: "",
    searching: false,
    sites: [],
    activeIndex: -1,
  };

  search = async () => {
    const { text } = this.state;
    this.setState({ searching: true, sites: {} });
    await Promise.all(
      siteRules.map(async (site, index) => {
        let siteResult: SiteResult = {
          site: site.site,
          success: false,
          books: [],
          message: "",
          time: 0,
        };
        try {
          let resp = await fetch(
            `/api/search?src=${index}&name=${encodeURIComponent(text)}`
          );
          if (!resp.ok) {
            throw new Error(await resp.text());
          }
          siteResult = await resp.json();
        } catch (error) {
          siteResult.message = error.toString();
        }
        this.setState({
          sites: {
            ...this.state.sites,
            [index]: siteResult,
          },
        });
      })
    );
    this.setState({ searching: false });
  };

  render() {
    const { activeIndex } = this.state;
    return (
      <div className="App">
        <Input
          fluid
          icon="search"
          iconPosition="left"
          placeholder="输入名称..."
          loading={this.state.searching}
          onChange={(e) => this.setState({ text: e.target.value.trim() })}
          action={
            <Button
              disabled={this.state.text.length === 0 || this.state.searching}
              onClick={this.search}
            >
              搜索
            </Button>
          }
          size="large"
        />
        <div style={{ height: "20px" }} />
        <Accordion fluid styled>
          {siteRules.map((site, index) => {
            const result = this.state.sites[index];
            return (
              <>
                <Accordion.Title
                  index={index}
                  active={activeIndex === index}
                  onClick={(e, titleProps) => {
                    const { index } = titleProps;
                    const { activeIndex } = this.state;
                    const newIndex = activeIndex === index ? -1 : index;

                    this.setState({ activeIndex: newIndex });
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <div>
                      {site.site} {result && ` (${result.books.length})`}
                    </div>
                    <div
                      style={{
                        color: result?.success ? "green" : "red",
                        flex: 1,
                        textAlign: "end",
                      }}
                    >
                      {result
                        ? `${result.time} ms`
                        : this.state.searching && (
                            <Loader active inline size="tiny" />
                          )}
                    </div>
                  </div>
                </Accordion.Title>
                <Accordion.Content active={activeIndex === index}>
                  {(() => {
                    if (result) {
                      if (result.success) {
                        return result.books.length === 0 ? (
                          "无结果"
                        ) : (
                          <List divided>
                            {result.books.map((book) => (
                              <List.Item>
                                <List.Content>
                                  <List.Header as="a" href={book.url}>
                                    {book.name} - {book.author || "未知作者"}
                                  </List.Header>
                                  {book.summary && (
                                    <List.Description>
                                      {book.summary}
                                    </List.Description>
                                  )}
                                </List.Content>
                              </List.Item>
                            ))}
                          </List>
                        );
                      } else {
                        return (
                          <>
                            访问该网站出错&nbsp;
                            <Popup
                              content={result.message}
                              trigger={<Icon name="info circle" />}
                            />
                          </>
                        );
                      }
                    } else {
                      if (this.state.searching) {
                        return "搜索中";
                      } else {
                        return "请输入关键字开始搜索";
                      }
                    }
                  })()}
                </Accordion.Content>
              </>
            );
          })}
        </Accordion>
        <Card fluid>
          <Card.Content header="TIPS" textAlign="left" />
          <Card.Content textAlign="left">
            只对书名进行搜索，搜索词可以少字但不能多字。
            <br />
            <br />
            部分站点只能登陆后进行搜索，因此使用第三方搜索引擎（例如DuckDuckGo）,会有实际上有但是显示无结果的可能，也可以点击下方搜索直达链接直接跳转到站内搜索结果页面。
            <br />
            {siteRules.map((site) => {
              return (
                <>
                  <a
                    href={
                      site.originalSearchLink
                        ? site.originalSearchLink(
                            site.gbk
                              ? encodeURIGbk(this.state.text)
                              : this.state.text
                          )
                        : site.searchLink(
                            site.gbk
                              ? encodeURIGbk(this.state.text)
                              : this.state.text
                          )
                    }
                  >
                    {site.site.split(" - ")[0]}
                  </a>
                  &nbsp; &nbsp;
                </>
              );
            })}
            <br />
            <br />
            反馈请在豆瓣内点击下方用户链接。
          </Card.Content>
          <Card.Content extra textAlign="right">
            <Icon name="user" />{" "}
            <a
              style={{
                textDecorationLine: "underline",
              }}
              href="https://www.douban.com/people/205966774/
"
            >
              一起吃百香果吗
            </a>
          </Card.Content>
        </Card>
      </div>
    );
  }
}
