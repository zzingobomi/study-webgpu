import { CEventDispatcher } from "../../event/CEventDispatcher";

export class Entity extends CEventDispatcher {
  public name: string = "";

  protected readonly _instanceID: string = "";
  public get instanceID(): string {
    return this._instanceID;
  }

  private _numChildren: number;

  public entityChildren: Entity[];

  public addChild(child: Entity): Entity {
    if (child == null) {
      throw new Error("child is null!");
    }
    if (child === this) {
      throw new Error("child is self!");
    }

    let index = this.entityChildren.indexOf(child);
    if (index == -1) {
      //child.removeFromParent();
      //child.transform.parent = this.transform;
      this.entityChildren.push(child);
      this._numChildren = this.entityChildren.length;
      return child;
    }
    return null;
  }
}
