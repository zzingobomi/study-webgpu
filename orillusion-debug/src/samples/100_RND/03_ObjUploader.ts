import {
  AtmosphericComponent,
  BoxGeometry,
  Camera3D,
  CameraUtil,
  Color,
  DirectLight,
  Engine3D,
  GeometryBase,
  HoverCameraController,
  KelvinUtil,
  LitMaterial,
  MeshRenderer,
  Object3D,
  Object3DUtil,
  Scene3D,
  Transform,
  VertexAttributeName,
  View3D,
} from "../..";
import { Stats } from "@orillusion/stats";
import dat from "dat.gui";
import { ObjParser } from "./core/ObjParser";
import { QdrantManager } from "./core/QdrantManager";

class ObjUploader {
  view: View3D;
  objParser: ObjParser = new ObjParser();
  qdrantManager: QdrantManager = new QdrantManager();

  async run() {
    await Engine3D.init();
    let scene = new Scene3D();
    scene.addComponent(Stats);

    let sky = scene.addComponent(AtmosphericComponent);
    sky.sunY = 0.6;

    let cameraObj = new Object3D();
    let mainCamera = cameraObj.addComponent(Camera3D);
    mainCamera.perspective(60, Engine3D.aspect, 0.1, 1000.0);

    scene.addChild(cameraObj);

    let controller = cameraObj.addComponent(HoverCameraController);
    controller.setCamera(35, -20, 10);

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

    this.qdrantManager.createCollection("hori");

    Engine3D.startRenderView(this.view);

    await this.initScene();

    const gui = new dat.GUI();
    const horiFolder = gui.addFolder("Hori");
    horiFolder.add(this, "upsertQdrant");
    horiFolder.open();
  }

  async initScene() {
    const objHref = "/windmill.obj";
    const objResponse = await fetch(objHref);
    const objText = await objResponse.text();
    await this.objParser.parserObj(objText);

    const mtlHref = "/windmill.mtl";
    const mtlResponse = await fetch(mtlHref);
    const mtlText = await mtlResponse.text();
    await this.objParser.loadMTL(mtlText);

    // TODO: 이미지 파일은 스트리밍이 아닌 vertex 에 어떤 mtl 인지 저장되어 있다가 다운로드...?
    const obj = await this.objParser.createMesh();

    this.view.scene.addChild(obj);
  }

  async upsertQdrant() {
    this.qdrantManager.upsertQdrantData(
      this.objParser.sourceVertices,
      this.objParser.sourceNormals,
      this.objParser.sourceTextureCoords,
      this.objParser.geometries
    );
  }
}

new ObjUploader().run();
