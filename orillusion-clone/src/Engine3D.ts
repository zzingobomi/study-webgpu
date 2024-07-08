import { CanvasConfig } from "./gfx/graphics/webGpu/CanvasConfig";
import { version } from "../package.json";
import { Res } from "./assets/Res";
import { webGPUContext } from "./gfx/graphics/webGpu/Context3D";
import { ShaderLib } from "./assets/shader/ShaderLib";
import { View3D } from "./core/View3D";
import { RendererJob } from "./gfx/renderJob/jobs/RenderJob";
import { ForwardRenderJob } from "./gfx/renderJob/jobs/ForwardRenderJob";
import { Time } from "./util/Time";

export class Engine3D {
  /**
   * resource manager in engine3d
   */
  public static res: Res;

  /**
   * more view in engine3d
   */
  public static views: View3D[];
  private static _frameRateValue: number = 0;
  private static _frameRate: number = 360;
  private static _frameTimeCount: number = 0;
  private static _deltaTime: number = 0;
  private static _time: number = 0;
  private static _beforeRender: Function;
  private static _renderLoop: Function;
  private static _lateRender: Function;
  private static _requestAnimationFrameID: number = 0;

  static divB: HTMLDivElement;

  public static renderJobs: Map<View3D, RendererJob>;

  public static async init(
    descriptor: {
      canvasConfig?: CanvasConfig;
      beforeRender?: Function;
      renderLoop?: Function;
      lateRender?: Function;
      //engineSetting?: EngineSetting
    } = {}
  ) {
    console.log("Engine Version", version);

    // TODO: 이게 뭐해주는 거지?
    // for dev debug
    if (import.meta.env.DEV) {
      this.divB = document.createElement("div");
      this.divB.style.position = "absolute";
      this.divB.style.zIndex = "999";
      this.divB.style.color = "#FFFFFF";
      this.divB.style.top = "150px";
      document.body.appendChild(this.divB);
    }

    await webGPUContext.init(descriptor.canvasConfig);

    ShaderLib.init();

    // TODO: Scene 만들면서 좀더 study
    // ShaderUtil init...

    // BindingGroup init...

    // RTResourceMap init...

    this.res = new Res();

    return;
  }

  public static startRenderView(view: View3D) {
    this.renderJobs ||= new Map<View3D, RendererJob>();
    this.views = [view];
    let renderJob = new ForwardRenderJob(view);
    this.renderJobs.set(view, renderJob);

    this.resume();
    return renderJob;
  }

  public static resume() {
    this._requestAnimationFrameID = requestAnimationFrame((t) =>
      this.render(t)
    );
  }

  private static render(time: number) {
    this._deltaTime = time - this._time;
    this._time = time;

    if (this._frameRateValue > 0) {
      this._frameTimeCount += this._deltaTime * 0.001;
      if (this._frameTimeCount >= this._frameRateValue * 0.95) {
        this._frameTimeCount = 0;
        this.updateFrame(time);
      }
    } else {
      this.updateFrame(time);
    }
    this.resume();
  }

  private static updateFrame(time: number) {
    Time.delta = time - Time.time;
    Time.time = time;
    Time.frame += 1;
    //Interpolator.tick(Time.delta);  // TODO: what is timeinterpolator?

    /* update all transform */
    // .....

    if (this._beforeRender) this._beforeRender();

    /****** auto before update with component list *****/
    // for (const iterator of ComponentCollect.componentsBeforeUpdateList) {
    // }

    // for (const iterator of ComponentCollect.componentsComputeList) {
    // }

    // command submit..

    /****** auto update with component list *****/
    // for (const iterator of ComponentCollect.componentsUpdateList) {
    // }

    // for (const iterator of ComponentCollect.graphicComponent) {
    // }

    if (this._renderLoop) {
      this._renderLoop();
    }

    // updateAllContinueTransform

    /****** auto update global matrix share buffer write to gpu *****/
    // ....

    this.renderJobs.forEach((v, k) => {
      if (!v.renderState) {
        v.start();
      }
      v.renderFrame();
    });

    /****** auto late update with component list *****/
    // for (const iterator of ComponentCollect.componentsLateUpdateList) {
    // }

    if (this._lateRender) this._lateRender();
  }
}
