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
  PropertyAnimation,
  PropertyAnimClip,
  Scene3D,
  SkeletonAnimationComponent,
  Time,
  Transform,
  View3D,
  webGPUContext,
  WrapMode,
} from "../..";
import { Stats } from "@orillusion/stats";
import dat from "dat.gui";

class Sample_Skeleton2 {
  lightObj3D: Object3D;
  scene: Scene3D;

  async run() {
    Engine3D.setting.shadow.autoUpdate = true;
    Engine3D.setting.shadow.updateFrameRate = 1;
    Engine3D.setting.shadow.shadowSize = 2048;

    await Engine3D.init();

    this.scene = new Scene3D();
    this.scene.addComponent(Stats);
    let sky = this.scene.addComponent(AtmosphericComponent);
    this.scene.exposure = 1;

    let mainCamera = CameraUtil.createCamera3DObject(this.scene);
    mainCamera.enableCSM = true;
    mainCamera.perspective(60, webGPUContext.aspect, 1, 3000.0);

    let hoverCameraController = mainCamera.object3D.addComponent(
      HoverCameraController
    );
    hoverCameraController.setCamera(45, -30, 300);
    hoverCameraController.maxDistance = 500.0;

    let view = new View3D();
    view.scene = this.scene;
    view.camera = mainCamera;

    Engine3D.startRenderView(view);

    await this.initScene(this.scene);
    sky.relativeTransform = this.lightObj3D.transform;
  }

  async initScene(scene: Scene3D) {
    /******** floor *******/
    this.scene.addChild(
      Object3DUtil.GetSingleCube(3000, 1, 3000, 0.5, 0.5, 0.5)
    );

    /******** light *******/
    {
      this.lightObj3D = new Object3D();
      this.lightObj3D.x = 0;
      this.lightObj3D.y = 30;
      this.lightObj3D.z = -40;
      this.lightObj3D.rotationX = 144;
      this.lightObj3D.rotationY = 0;
      this.lightObj3D.rotationZ = 0;
      let directLight = this.lightObj3D.addComponent(DirectLight);
      directLight.lightColor = KelvinUtil.color_temperature_to_rgb(5355);
      directLight.castShadow = true;
      directLight.intensity = 40;
      scene.addChild(this.lightObj3D);
    }

    {
      // load model with skeletion animation
      let rootNode = await Engine3D.res.loadGltf(
        "https://cdn.orillusion.com/gltfs/glb/Soldier.glb"
      );
      let character = rootNode.getObjectByName("Character") as Object3D;
      character.scaleX = 0.3;
      character.scaleY = 0.3;
      character.scaleZ = 0.3;
      character.rotationY = 180;

      // enum animation names
      var animName = ["Idel", "Walk", "Run", "TPose"];
      let maxCount = 100;
      let maxCol = 10;
      let maxRow = Math.floor(maxCount / maxCol);
      // Clone 100 players to play different animations
      for (var i = 0; i < maxCount; i++) {
        let cloneObj = character.clone();

        let row = Math.floor(i / maxCol);
        let col = Math.floor(i % maxCol);

        cloneObj.x = (maxCol * -0.5 + col) * 30;
        cloneObj.z = (maxRow * -0.5 + row) * 30;
        scene.addChild(cloneObj);

        let animation = cloneObj.getComponentsInChild(
          SkeletonAnimationComponent
        )[0];

        if (i < animName.length) {
          animation.play(animName[i]);
        } else {
          let animIndex = Math.floor((Math.random() * 100) % 3);
          animation.play(animName[animIndex], -5 + Math.random() * 10);
        }
        await this.sleep(10);
      }
    }
    return true;
  }

  sleep(time: number) {
    return new Promise((res) => {
      setTimeout(res, time || 200);
    });
  }
}

new Sample_Skeleton2().run();
