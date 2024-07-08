import { Scene3D } from "./core/Scene3D";
import { View3D } from "./core/View3D";
import { Engine3D } from "./Engine3D";
import objUrl from "/obj.obj?url";

class Sample_Orillusion {
  view: View3D;

  async run() {
    await Engine3D.init();
    let scene = new Scene3D();

    this.view = new View3D();
    this.view.scene = scene;

    Engine3D.startRenderView(this.view);
    await this.initScene();
  }

  private async initScene() {
    const model = await Engine3D.res.loadObj(objUrl);
    this.view.scene.addChild(model);
  }
}

new Sample_Orillusion().run();
