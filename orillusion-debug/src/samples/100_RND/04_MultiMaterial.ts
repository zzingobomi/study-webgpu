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
  UnLitMaterial,
  VertexAttributeName,
  View3D,
} from "../..";
import { Stats } from "@orillusion/stats";
import dat from "dat.gui";
import { ObjParser } from "./core/ObjParser";
import { QdrantManager } from "./core/QdrantManager";

class MultiMaterial {
  view: View3D;

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

    const geometry = new GeometryBase();
    ///
    /// Vertex
    ///
    // prettier-ignore
    const vertices = new Float32Array([      
      // 첫 번째 삼각형
      -1.0, -1.0, 1.0,
       1.0, -1.0, 1.0,
       1.0,  1.0, 1.0,       
       // 두 번째 삼각형
      -1.0, -1.0, 1.0,
       1.0,  1.0, 1.0,
      -1.0,  1.0, 1.0
    ]);
    geometry.setAttribute(VertexAttributeName.position, vertices);

    ///
    /// Index
    ///
    // prettier-ignore
    const indices = new Uint16Array([
      0, 1, 2,
      3, 4, 5
    ]);
    geometry.setIndices(indices);

    ///
    /// UV
    ///
    // prettier-ignore
    const uvs = new Float32Array([
      // 첫 번째 삼각형
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      // 두 번째 삼각형
      0.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    ]);
    geometry.setAttribute(VertexAttributeName.uv, uvs);

    geometry.addSubGeometry({
      indexStart: 0,
      indexCount: indices.length / 2,
      vertexStart: 0,
      vertexCount: vertices.length / 2,
      firstStart: 0,
      index: 0,
      topology: 0,
    });
    geometry.addSubGeometry({
      indexStart: indices.length / 2,
      indexCount: indices.length,
      vertexStart: vertices.length / 2,
      vertexCount: vertices.length,
      firstStart: 0,
      index: 0,
      topology: 0,
    });

    // 첫 번째 재질
    const material1 = new UnLitMaterial();
    material1.baseColor = new Color(1, 0, 0, 1); // 빨간색

    // 두 번째 재질
    const material2 = new UnLitMaterial();
    material2.baseColor = new Color(0, 1, 0, 1); // 초록색

    const mesh = new Object3D();
    const mr = mesh.addComponent(MeshRenderer);
    mr.geometry = geometry;
    mr.materials = [material1, material2];

    this.view.scene.addChild(mesh);

    Engine3D.startRenderView(this.view);
  }
}

new MultiMaterial().run();
