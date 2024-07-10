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
  Matrix4,
  MorphTargetBlender,
  Object3D,
  Object3DUtil,
  Quaternion,
  Scene3D,
  SkinnedMeshRenderer2,
  Time,
  Transform,
  View3D,
  webGPUContext,
} from "../..";
import { Stats } from "@orillusion/stats";
import dat from "dat.gui";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

class Sample_MorphTarget {
  lightObj3D: Object3D;
  scene: Scene3D;
  influenceData: { [key: string]: number } = {};
  htmlVideo: HTMLVideoElement;
  blendShapeComponent: MorphTargetBlender;
  targetRenderers: { [p: string]: SkinnedMeshRenderer2[] };
  faceLandmarker: FaceLandmarker;
  filesetResolver: FilesetResolver;
  gui: dat.GUI;
  model: Object3D;
  // temp values
  _mat: Matrix4;
  _quat: Quaternion;
  _quat2: Quaternion;

  async run() {
    Engine3D.setting.shadow.shadowBound = 100;
    Engine3D.setting.shadow.autoUpdate = true;
    Engine3D.setting.shadow.updateFrameRate = 1;

    await Engine3D.init({ renderLoop: () => this.detectFace() });

    this.scene = new Scene3D();
    this.scene.addComponent(Stats);
    let sky = this.scene.addComponent(AtmosphericComponent);

    let camera = CameraUtil.createCamera3DObject(this.scene);
    camera.perspective(60, webGPUContext.aspect, 1, 5000.0);
    camera.object3D.addComponent(HoverCameraController).setCamera(0, 0, 150);

    this.initDirectLight();
    sky.relativeTransform = this.lightObj3D.transform;

    let view = new View3D();
    view.scene = this.scene;
    view.camera = camera;

    await this.initMorphModel();
    Engine3D.startRenderView(view);
  }

  initDirectLight() {
    this.lightObj3D = new Object3D();
    this.lightObj3D.rotationX = 21;
    this.lightObj3D.rotationY = 108;
    this.lightObj3D.rotationZ = 10;

    let directLight = this.lightObj3D.addComponent(DirectLight);
    directLight.lightColor = KelvinUtil.color_temperature_to_rgb(5355);
    directLight.castShadow = true;
    directLight.intensity = 25;
    this.scene.addChild(this.lightObj3D);
  }

  private async initMorphModel() {
    const gui = new dat.GUI();

    // load lion model
    let model = (this.model = await Engine3D.res.loadGltf(
      "https://cdn.orillusion.com/gltfs/glb/lion.glb"
    ));
    model.y = -80.0;
    model.x = -30.0;
    this.scene.addChild(model);

    let folder = (this.gui = gui.addFolder("morph controller"));
    // register MorphTargetBlender component
    this.blendShapeComponent = model.addComponent(MorphTargetBlender);
    this.targetRenderers = this.blendShapeComponent.cloneMorphRenderers();

    // bind influenceData to gui
  }

  // create a video stream from camera
  async setupCapture() {}

  // load mediapipe model
  async setupPredict() {}

  // detect face
  async detectFace() {}

  // morph target
  async face2Morph(faceBlendshapes: any[]) {}

  // apply transform
  async face2Transform(
    facialTransformationMatrixes: [{ data: Float32Array }]
  ) {}
}

new Sample_MorphTarget().run();
