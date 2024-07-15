import {
  AtmosphericComponent,
  BoxGeometry,
  Camera3D,
  CameraUtil,
  Color,
  DirectLight,
  Engine3D,
  HoverCameraController,
  KelvinUtil,
  LitMaterial,
  MeshRenderer,
  Object3D,
  Object3DUtil,
  Scene3D,
  Transform,
  View3D,
} from "../..";
import { Stats } from "@orillusion/stats";
import dat from "dat.gui";

class Test_Obj {
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
    const obj = await Engine3D.res.loadObj("/obj.obj");
    this.view.scene.addChild(obj);
  }
}

new Test_Obj().run();
