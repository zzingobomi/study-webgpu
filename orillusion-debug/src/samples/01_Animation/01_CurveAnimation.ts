import {
  AnimationCurve,
  AtmosphericComponent,
  CameraUtil,
  Color,
  DirectLight,
  Engine3D,
  HoverCameraController,
  KelvinUtil,
  Keyframe,
  Object3D,
  Object3DUtil,
  Scene3D,
  Time,
  Transform,
  View3D,
} from "../..";
import { Stats } from "@orillusion/stats";
import dat from "dat.gui";

class Sample_AnimCurve {
  lightObj3D: Object3D;
  scene: Scene3D;
  Duck: Object3D;
  curve1: AnimationCurve;
  curve2: AnimationCurve;
  curve3: AnimationCurve;
  curve4: AnimationCurve;

  async run() {
    Engine3D.setting.shadow.autoUpdate = true;
    Engine3D.setting.shadow.updateFrameRate = 1;
    Engine3D.setting.shadow.type = "HARD";

    await Engine3D.init({ beforeRender: () => this.renderUpdate() });

    this.scene = new Scene3D();
    this.scene.addComponent(Stats);
    let sky = this.scene.addComponent(AtmosphericComponent);

    let camera = CameraUtil.createCamera3DObject(this.scene);
    camera.enableCSM = true;
    camera.perspective(60, Engine3D.aspect, 0.01, 5000.0);

    camera.object3D
      .addComponent(HoverCameraController)
      .setCamera(-30, -45, 200);

    let view = new View3D();
    view.scene = this.scene;
    view.camera = camera;

    Engine3D.startRenderView(view);

    await this.initScene();
    sky.relativeTransform = this.lightObj3D.transform;
  }

  async initScene() {
    {
      this.lightObj3D = new Object3D();
      this.lightObj3D.rotationX = 35;
      this.lightObj3D.rotationY = 110;
      this.lightObj3D.rotationZ = 0;
      let directLight = this.lightObj3D.addComponent(DirectLight);
      directLight.lightColor = KelvinUtil.color_temperature_to_rgb(5355);
      directLight.castShadow = true;
      directLight.intensity = 30;
      this.scene.addChild(this.lightObj3D);

      // create animation curve 1
      this.curve1 = new AnimationCurve();
      this.curve1.addKeyFrame(new Keyframe(0, 1));
      this.curve1.addKeyFrame(new Keyframe(0.5, 2));
      this.curve1.addKeyFrame(new Keyframe(0.7, 2));
      this.curve1.addKeyFrame(new Keyframe(1.0, 1));

      //create animation curve 2
      this.curve2 = new AnimationCurve();
      this.curve2.addKeyFrame(new Keyframe(0, 0));
      this.curve2.addKeyFrame(new Keyframe(1, 360));

      //create animation curve 3
      this.curve3 = new AnimationCurve();
      this.curve3.addKeyFrame(new Keyframe(0, -5));
      this.curve3.addKeyFrame(new Keyframe(0.3, 3));
      this.curve3.addKeyFrame(new Keyframe(0.6, 8));
      this.curve3.addKeyFrame(new Keyframe(0.9, -2));
      this.curve3.addKeyFrame(new Keyframe(1.0, -5));

      //create animation curve 4
      this.curve4 = new AnimationCurve();
      this.curve4.addKeyFrame(new Keyframe(0, 1));
      this.curve4.addKeyFrame(new Keyframe(0.3, -9));
      this.curve4.addKeyFrame(new Keyframe(0.6, -2));
      this.curve4.addKeyFrame(new Keyframe(0.9, 2));
      this.curve4.addKeyFrame(new Keyframe(1.0, 1));
    }

    this.scene.addChild(Object3DUtil.GetSingleCube(300, 5, 300, 1, 1, 1));

    // load a gltf model
    this.Duck = (await Engine3D.res.loadGltf(
      "https://cdn.orillusion.com/PBR/Duck/Duck.gltf"
    )) as Object3D;
    this.Duck.scaleX = this.Duck.scaleY = this.Duck.scaleZ = 0.3;
    this.Duck.name = "Duck";
    this.scene.addChild(this.Duck);
  }

  renderUpdate() {
    // modify animation attribute values to the model
    if (this.Duck) {
      let time = ((Time.time * 0.4) % 1000) / 1000;
      this.Duck.y = this.curve1.getValue(time) * 5;
      this.Duck.x = this.curve3.getValue(time) * 5 - 2.5;
      this.Duck.z = this.curve4.getValue(time) * 5 - 2.5;
      this.Duck.rotationY = this.curve2.getValue(time);
    }
  }
}

new Sample_AnimCurve().run();
