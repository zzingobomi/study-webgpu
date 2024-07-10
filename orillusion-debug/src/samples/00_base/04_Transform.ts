import {
  AtmosphericComponent,
  BoxGeometry,
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

class Sample_Transform {
  async run() {
    await Engine3D.init({});

    let scene = new Scene3D();
    scene.addComponent(Stats);

    // init sky
    let sky = scene.addComponent(AtmosphericComponent);
    sky.sunY = 0.6;

    // init Camera3D
    let mainCamera = CameraUtil.createCamera3D(null, scene);
    mainCamera.perspective(60, Engine3D.aspect, 1, 2000.0);

    // init Camera Controller
    let hoverCameraController = mainCamera.object3D.addComponent(
      HoverCameraController
    );
    hoverCameraController.setCamera(15, -15, 10);

    // create a basic cube
    let cubeObj = new Object3D();
    let mr = cubeObj.addComponent(MeshRenderer);
    mr.geometry = new BoxGeometry();
    let mat = new LitMaterial();
    mr.material = mat;
    scene.addChild(cubeObj);

    // create direction Light
    let lightObj = new Object3D();
    lightObj.rotationX = 45;
    lightObj.rotationY = 60;
    lightObj.rotationZ = 150;
    let dirLight = lightObj.addComponent(DirectLight);
    dirLight.lightColor = KelvinUtil.color_temperature_to_rgb(5355);
    dirLight.intensity = 10;
    scene.addChild(lightObj);

    sky.relativeTransform = dirLight.transform;

    // create a view with target scene and camera
    let view = new View3D();
    view.scene = scene;
    view.camera = mainCamera;

    Engine3D.startRenderView(view);

    let transform = cubeObj.transform;
    // debug GUI
    let gui = new dat.GUI();
    let Trans = gui.addFolder("Transform");
    Trans.add(transform, "x", -100.0, 100.0, 0.01);
    Trans.add(transform, "y", -100.0, 100.0, 0.01);
    Trans.add(transform, "z", -100.0, 100.0, 0.01);
    Trans.add(transform, "rotationX", 0.0, 360.0, 0.01);
    Trans.add(transform, "rotationY", 0.0, 360.0, 0.01);
    Trans.add(transform, "rotationZ", 0.0, 360.0, 0.01);
    Trans.add(transform, "scaleX", 0.0, 2.0, 0.01);
    Trans.add(transform, "scaleY", 0.0, 2.0, 0.01);
    Trans.add(transform, "scaleZ", 0.0, 2.0, 0.01);
    Trans.open();
  }
}

new Sample_Transform().run();
