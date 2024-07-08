import { ParserFormat } from "../loader/parser/ParserFormat";

/**
 * Constructor
 */
export type Parser<T> = {
  new (any?: any): T;
  prototype: any;
  format: ParserFormat;
};
