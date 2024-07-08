import { StringUtil } from "../util/StringUtil";
import { LoaderFunctions } from "./LoaderFunctions";

export class LoaderBase {
  public baseUrl: string = "";
  public initUrl: string;
  private _progress: number = 0;

  constructor() {}

  public async loadTxt(
    url: string,
    loaderFunctions?: LoaderFunctions
  ): Promise<object> {
    this.baseUrl = StringUtil.getPath(url);
    return new Promise(async (succ, fail) => {
      fetch(url)
        .then(async (response) => {
          if (response.ok) {
            let chunks = await LoaderBase.read(url, response, loaderFunctions);
            let utf8decoder = new TextDecoder("utf-8");
            const textString = utf8decoder.decode(chunks);
            succ({ data: textString });
          } else {
            throw Error("request rejected with status" + response.status);
          }
        })
        .catch((e) => {
          if (loaderFunctions?.onError) {
            loaderFunctions.onError(e);
          }
          fail(e);
        });
    });
  }

  public static async read(
    url: string,
    response: any,
    loaderFunctions?: LoaderFunctions
  ): Promise<Uint8Array> {
    const reader = response.body.getReader();
    const contentLength = +response.headers.get("Content-Length");
    let receivedLength = 0;
    let chunks: any[] = [];
    let receivedArr: any[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (contentLength > 0) {
          if (loaderFunctions && loaderFunctions.onComplete) {
            loaderFunctions.onComplete.call(this, url);
          }
        }
        break;
      }
      chunks.push(value);
      receivedLength += value.length;

      if (contentLength > 0) {
        if (loaderFunctions && loaderFunctions.onProgress) {
          loaderFunctions.onProgress.call(
            this,
            receivedLength,
            contentLength,
            url
          );
        }
      } else {
        receivedArr.push(value.length);
      }
    }
    if (receivedArr.length > 0) {
      for (let i = 0; i < chunks.length; i++) {
        console.log(receivedArr[i]);
        if (loaderFunctions && loaderFunctions.onProgress) {
          loaderFunctions.onProgress.call(
            this,
            receivedArr[i],
            receivedLength,
            url
          );
        }

        if (receivedArr[i] == receivedLength) {
          if (loaderFunctions && loaderFunctions.onComplete) {
            loaderFunctions.onComplete.call(this, url);
          }
        }
      }
    }

    let chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }
    return chunksAll;
  }
}
