import {
  AtmosphericComponent,
  AttributeAnimCurve,
  BitmapTexture2D,
  BlendMode,
  BoxGeometry,
  CameraUtil,
  Color,
  ComponentBase,
  CylinderGeometry,
  DirectLight,
  Engine3D,
  ExtrudeGeometry,
  GeometryBase,
  HoverCameraController,
  KelvinUtil,
  LitMaterial,
  Material,
  MeshRenderer,
  Object3D,
  Object3DUtil,
  PlaneGeometry,
  PropertyAnimation,
  PropertyAnimClip,
  Scene3D,
  SphereGeometry,
  Time,
  TorusGeometry,
  Transform,
  Vector3,
  Vector4,
  VertexAttributeName,
  View3D,
  webGPUContext,
  WrapMode,
} from "../..";
import { Stats } from "@orillusion/stats";
import dat from "dat.gui";

class Sample_InternalGeometry {
  lightObj: Object3D;

  async run() {
    Engine3D.setting.shadow.autoUpdate = true;
    Engine3D.setting.shadow.shadowBound = 200;

    await Engine3D.init();
    let view = new View3D();
    view.scene = new Scene3D();
    view.scene.addComponent(Stats);

    let sky = view.scene.addComponent(AtmosphericComponent);

    view.camera = CameraUtil.createCamera3DObject(view.scene);
    view.camera.perspective(60, webGPUContext.aspect, 1, 5000.0);
    view.camera.object3D.z = -15;
    view.camera.object3D
      .addComponent(HoverCameraController)
      .setCamera(35, -20, 150);

    Engine3D.startRenderView(view);

    await this.createScene(view.scene);
    sky.relativeTransform = this.lightObj.transform;
  }

  private async createScene(scene: Scene3D) {
    // add a direction light
    let lightObj3D = (this.lightObj = new Object3D());
    let sunLight = lightObj3D.addComponent(DirectLight);
    sunLight.intensity = 15;
    sunLight.lightColor = KelvinUtil.color_temperature_to_rgb(6553);
    sunLight.castShadow = true;
    lightObj3D.rotationX = 53.2;
    lightObj3D.rotationY = 220;
    lightObj3D.rotationZ = 5.58;
    scene.addChild(lightObj3D);

    let material = new LitMaterial();

    // add a plane
    {
      let plane = new Object3D();
      let meshRenderer = plane.addComponent(MeshRenderer);
      meshRenderer.geometry = new PlaneGeometry(200, 200, 80, 80);
      meshRenderer.material = material;
      scene.addChild(plane);
    }

    // add a box
    {
      let box = new Object3D();
      let meshRenderer = box.addComponent(MeshRenderer);
      meshRenderer.geometry = new BoxGeometry(50, 10, 20);
      meshRenderer.material = material;
      box.y = 10;
      scene.addChild(box);
    }

    // add a sphere
    {
      let box = new Object3D();
      let meshRenderer = box.addComponent(MeshRenderer);
      meshRenderer.geometry = new SphereGeometry(10, 20, 20);
      meshRenderer.material = material;
      box.y = 10;
      box.x = -50;
      scene.addChild(box);
    }

    // add a cylinder opened
    {
      let box = new Object3D();
      let meshRenderer = box.addComponent(MeshRenderer);
      meshRenderer.geometry = new CylinderGeometry(5, 10, 20, 50, 20, true);
      meshRenderer.material = material;
      material.cullMode = "none";
      box.y = 20;
      box.x = 50;
      scene.addChild(box);
    }

    // add a cylinder closed
    {
      let box = new Object3D();
      let meshRenderer = box.addComponent(MeshRenderer);
      meshRenderer.geometry = new CylinderGeometry(5, 10, 20, 50, 20);
      let topMaterial = new LitMaterial();
      topMaterial.baseColor = new Color(1, 0, 0, 1);
      meshRenderer.materials = [material, material, material];

      box.y = 20;
      box.x = 50;
      box.z = 50;
      scene.addChild(box);
    }

    // add a torus
    {
      let box = new Object3D();
      let meshRenderer = box.addComponent(MeshRenderer);
      meshRenderer.geometry = new TorusGeometry(10, 4, 20, 50);
      meshRenderer.material = material;
      box.y = 20;
      box.x = 50;
      box.z = -50;
      scene.addChild(box);
    }
  }
}

new Sample_InternalGeometry().run();
