import { PassType } from "../../../renderJob/passRenderer/state/RendererType";
import { RenderShaderPass } from "./RenderShaderPass";

export class Shader {
  public passShader: Map<PassType, RenderShaderPass[]>;

  constructor() {
    this.passShader = new Map<PassType, RenderShaderPass[]>();
  }
}
