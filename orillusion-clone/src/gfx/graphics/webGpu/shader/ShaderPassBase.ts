import { ShaderReflection } from "./value/ShaderReflectionInfo";

export class ShaderPassBase {
  /**
   * Shader Unique instance id
   */
  public readonly instanceID: string;

  /**
   * Shader variant value
   */
  public shaderVariant: string;

  /**
   * Vertex stage entry point name
   */
  public vsEntryPoint: string = `main`;

  /**
   * Fragment stage entry point name
   */
  public fsEntryPoint: string = `main`;

  /**
   * BindGroup collection
   */
  public bindGroups: GPUBindGroup[];

  /**
   * Shader reflection info
   */
  public shaderReflection: ShaderReflection;
}
