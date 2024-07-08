import { View3D } from "../../../core/View3D";
import { RendererMap } from "./RenderMap";

export class RendererJob {
  public rendererMap: RendererMap;

  public pauseRender: boolean = false;
  public renderState: boolean = false;
  protected _view: View3D;

  constructor(view: View3D) {
    this._view = view;
  }

  public get view(): View3D {
    return this._view;
  }
  public set view(view: View3D) {
    this._view = view;
  }

  public start() {
    this.renderState = true;
  }

  public stop() {}

  public pause() {
    this.pauseRender = true;
  }

  public resume() {
    this.pauseRender = false;
  }

  public renderFrame() {
    let view = this._view;

    // if (this.shadowMapPassRenderer) {
    // }

    // if (this.pointLightShadowRenderer) {
    // }

    // if (this.depthPassRenderer) {
    // }

    // if (Engine3D.setting.gi.enable && this.ddgiProbeRenderer) {
    // }

    let passList = this.rendererMap.getAllPassRenderer();
    for (let i = 0; i < passList.length; i++) {
      const renderer = passList[i];
      // renderer.compute(view, this.occlusionSystem);
      // renderer.render(
      //   view,
      //   this.occlusionSystem,
      //   this.clusterLightingRender.clusterLightingBuffer
      // );
    }
  }
}
