import { LoaderFunctions } from "../LoaderFunctions";
import { ParserFormat } from "./ParserFormat";

export class ParserBase {
  static format: ParserFormat = ParserFormat.BIN;
  public baseUrl: string;
  public initUrl: string;
  public loaderFunctions?: LoaderFunctions;
  public userData?: any;
  public data: any;

  public parseString(str: string) {}

  public parseJson(obj: object) {}

  public parseBuffer(buffer: ArrayBuffer) {}
}
