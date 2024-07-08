import { Object3D } from "../core/entities/Object3D";
import { CEventListener } from "./CEventListener";

export class CEvent {
  public target: Object3D;
  public currentTarget: CEventListener;
  public type: string;
  public data: any;
  public param: any;
  public time: number = 0;
  public delay: number = 0;
  public mouseCode: number = 0;
  public ctrlKey: boolean;
  public altKey: boolean;
  public shiftKey: boolean;

  constructor(eventType: string = null, data: any = null) {
    this.type = eventType;
    this.data = data;
  }
}
