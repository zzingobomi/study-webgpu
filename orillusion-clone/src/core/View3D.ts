import { CEventListener } from "../event/CEventListener";
import { Vector4 } from "../math/Vector4";
import { Scene3D } from "./Scene3D";

export class View3D extends CEventListener {
  private _scene: Scene3D;
  private _viewPort: Vector4;
  private _enablePick: boolean = false;
  private _enable: boolean = true;

  constructor(
    x: number = 0,
    y: number = 0,
    width: number = 0,
    height: number = 0
  ) {
    super();
    this._viewPort = new Vector4(x, y, width, height);
  }

  public get enable(): boolean {
    return this._enable;
  }
  public set enable(value: boolean) {
    this._enable = value;
  }

  public get scene(): Scene3D {
    return this._scene;
  }
  public set scene(value: Scene3D) {
    this._scene = value;
    value.view = this;
  }
}
