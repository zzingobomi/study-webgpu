import { CanvasConfig } from "./gfx/graphics/webGpu/CanvasConfig";
import { webGPUContext } from "./gfx/graphics/webGpu/Context3D";

export class Engine3D {
  public static async init(
    descriptor: {
      canvasConfig?: CanvasConfig;
      beforeRender?: Function;
      renderLoop?: Function;
      lateRender?: Function;
    } = {}
  ) {
    await webGPUContext.init(descriptor.canvasConfig);
  }
}
