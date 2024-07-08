import { View3D } from "../../../core/View3D";
import { RendererJob } from "./RenderJob";

export class ForwardRenderJob extends RendererJob {
  constructor(view: View3D) {
    super(view);
  }

  public start(): void {
    super.start();
  }
}
