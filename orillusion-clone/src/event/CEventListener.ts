export class CEventListener {
  public static event_id_count = 0;
  public id: number = 0;
  public current: any;

  constructor(
    public type: string | number = null,
    public thisObject: any = null,
    public handler: Function = null,
    public param: any = null,
    public priority: number = 0
  ) {}
}
