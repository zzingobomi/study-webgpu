import { Parser } from "../util/Global";
import { LoaderBase } from "./LoaderBase";
import { LoaderFunctions } from "./LoaderFunctions";
import { ParserBase } from "./parser/ParserBase";
import { ParserFormat } from "./parser/ParserFormat";

export class FileLoader extends LoaderBase {
  public async load<T extends ParserBase>(
    url: string,
    c: Parser<T>,
    loaderFunctions?: LoaderFunctions,
    userData?: any
  ): Promise<T> {
    switch (c.format) {
      case ParserFormat.BIN: {
      }
      case ParserFormat.JSON: {
      }
      case ParserFormat.TEXT: {
        return new Promise((succ, fail) => {
          this.loadTxt(url, loaderFunctions)
            .then(async (ret) => {
              let parser = new c();
              parser.userData = userData;
              parser.baseUrl = this.baseUrl;
              parser.initUrl = url;
              parser.loaderFunctions = loaderFunctions;
              if (!ret[`data`]) {
                fail(`text load is empty!`);
              } else {
                await parser.parseString(ret[`data`]);
                succ(parser);
              }
            })
            .catch((e) => {
              fail(e);
            });
        });
      }
    }
  }
}
