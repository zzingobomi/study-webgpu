import {
  AtmosphericComponent,
  Camera3D,
  DirectLight,
  Engine3D,
  HoverCameraController,
  KelvinUtil,
  Object3D,
  Scene3D,
  View3D,
} from ".";
import { Stats } from "@orillusion/stats";
import dat from "dat.gui";

class Main {
  view: View3D;

  async run() {
    await Engine3D.init();
    let scene = new Scene3D();
    scene.addComponent(Stats);

    let sky = scene.addComponent(AtmosphericComponent);
    sky.sunY = 0.6;

    let cameraObj = new Object3D();
    let mainCamera = cameraObj.addComponent(Camera3D);
    mainCamera.perspective(60, Engine3D.aspect, 0.1, 5000.0);

    scene.addChild(cameraObj);

    let controller = cameraObj.addComponent(HoverCameraController);
    controller.setCamera(15, -30, 300);

    let lightObj = new Object3D();
    lightObj.rotationX = 45;
    lightObj.rotationY = 60;
    lightObj.rotationZ = 150;
    let dirLight = lightObj.addComponent(DirectLight);
    dirLight.lightColor = KelvinUtil.color_temperature_to_rgb(5355);
    dirLight.intensity = 40;
    scene.addChild(lightObj);
    sky.relativeTransform = dirLight.transform;

    this.view = new View3D();
    this.view.scene = scene;
    this.view.camera = mainCamera;

    Engine3D.startRenderView(this.view);
    await this.initScene();
  }

  private async initScene() {
    let list: Object3D[] = [];
    let player = await Engine3D.res.loadGltf(
      "https://cdn.orillusion.com/PBR/Duck/Duck.gltf"
    );
    let buttons = {
      add: async () => {
        let clone = player.clone();
        clone.transform.x = Math.random() * 200 - 100;
        clone.transform.y = Math.random() * 200 - 100;
        clone.transform.z = Math.random() * 200 - 100;
        clone.scaleX = clone.scaleY = clone.scaleZ = 0.25;

        this.view.scene.addChild(clone);
        list.push(clone);
      },
      remove: async () => {
        let index = Math.floor(list.length * Math.random());
        let obj = list[index];
        if (obj) {
          list.splice(index, 1);
          this.view.scene.removeChild(obj);
          obj.destroy(true);
        }
      },
    };

    // add first one
    await buttons.add();

    // gui
    const gui = new dat.GUI();
    let folder = gui.addFolder("zzingo");
    folder.add(buttons, "add");
    folder.add(buttons, "remove");
    folder.open();
  }
}

new Main().run();
