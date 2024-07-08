import { CEventDispatcher } from "../../../event/CEventDispatcher";
import { PassType } from "./state/RenderType";

export class RendererBase extends CEventDispatcher {
  //public debugViewQuads: ViewQuad[];
  //public debugTextures: Texture[];

  protected _rendererType: PassType;

  public get passType(): PassType {
    return this._rendererType;
  }

  public set passType(value: PassType) {
    this._rendererType = value;
  }

  constructor() {
    super();
    //this.debugTextures = [];
    //this.debugViewQuads = [];
  }
}
