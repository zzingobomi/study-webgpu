import { Common_vert } from "./core/base/Common_vert";

// TODO: wgsl 파일을 직접 import 도 가능할텐데..
export class ShaderLib {
  public static init() {
    ShaderLib.register("Common_vert", Common_vert);
  }

  public static register(keyName: string, code: string) {
    if (!ShaderLib[keyName.toLowerCase()]) {
      ShaderLib[keyName.toLowerCase()] = code;
    }
  }

  public static getShader(keyName: string): string {
    if (ShaderLib[keyName.toLowerCase()]) {
      return ShaderLib[keyName.toLowerCase()];
    }
    return ShaderLib[keyName.toLowerCase()];
  }
}
