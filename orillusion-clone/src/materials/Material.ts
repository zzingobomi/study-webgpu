import { RenderShaderPass } from "../gfx/graphics/webGpu/shader/RenderShaderPass";
import { Shader } from "../gfx/graphics/webGpu/shader/Shader";

export class Material {
  private _defaultSubShader: RenderShaderPass;

  protected _shader: Shader;

  public set shader(shader: Shader) {
    this._shader = shader;
  }

  public get shader(): Shader {
    return this._shader;
  }
}
