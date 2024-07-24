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
import { QdrantManager } from "./core/QdrantManager";
import { Player } from "./core/Player";
import dat from "dat.gui";
import { HoriLand } from "./core/HoriLand";
import Worker from "web-worker";

class UpdateGeometry {
  view: View3D;
  qdrantManager: QdrantManager = new QdrantManager();
  player: Player;
  horiLand: HoriLand;
  updateWorker: Worker;

  constructor() {
    this.updateWorker = new Worker(
      new URL("./core/updateWorker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    this.updateWorker.onmessage = (event: MessageEvent) => {
      const { qdrantData, error } = event.data;

      if (error) {
        console.error(error);
      } else {
        this.horiLand?.updateQdrantData(qdrantData);
      }
    };
  }

  async run() {
    await Engine3D.init({ beforeRender: () => this.update() });
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

    this.player = new Player();
    this.player.transform.worldPosition.set(0, 0, 0);
    this.player.sight = 5;

    this.horiLand = new HoriLand();
    this.view.scene.addChild(this.horiLand);

    Engine3D.startRenderView(this.view);

    const gui = new dat.GUI();
    const horiFolder = gui.addFolder("Hori");
    horiFolder.add(this.player, "sight", 0, 20, 0.1);
    horiFolder.add(this.player.transform, "x", -10, 10, 0.1);
    horiFolder.add(this.player.transform, "y", -10, 10, 0.1);
    horiFolder.add(this.player.transform, "z", -10, 10, 0.1);
    horiFolder.open();
  }

  async update() {
    const playerPosition = this.player.transform.worldPosition;
    this.updateWorker.postMessage({ playerPosition, sight: this.player.sight });
  }
}

new UpdateGeometry().run();
