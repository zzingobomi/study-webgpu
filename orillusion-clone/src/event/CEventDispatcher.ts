import { CEvent } from "./CEvent";

export class CEventDispatcher {
  protected listeners: any = {};
  public data: any;

  public dispatchEvent(event: CEvent) {}
}
