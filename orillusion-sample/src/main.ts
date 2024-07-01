import {
  Color,
  Engine3D,
  Scene3D,
  Object3D,
  Camera3D,
  View3D,
  LitMaterial,
  BoxGeometry,
  MeshRenderer,
  DirectLight,
  HoverCameraController,
  AtmosphericComponent,
} from "@orillusion/core";

async function demo() {
  await Engine3D.init();
  let scene3D = new Scene3D();
  // Add atmospheric scattering skybox component
  let sky = scene3D.addComponent(AtmosphericComponent);

  // Create a camera object
  let cameraObj = new Object3D();
  let camera = cameraObj.addComponent(Camera3D);
  // Set the camera perspective according to the window size
  camera.perspective(60, window.innerWidth / window.innerHeight, 1, 5000.0);
  // Set camera controller
  let controller = camera.object3D.addComponent(HoverCameraController);
  controller.setCamera(0, 0, 15);
  // Add camera node to sence
  scene3D.addChild(cameraObj);

  // Create a light object
  let light = new Object3D();
  // Add direct light component
  let component = light.addComponent(DirectLight);
  // Adjust light parameters
  light.rotationX = 45;
  light.rotationY = 30;
  component.intensity = 2;
  // Add light node to sence
  scene3D.addChild(light);

  // Create a new object
  const obj = new Object3D();
  // Add MeshRenderer to object(obj)
  let mr = obj.addComponent(MeshRenderer);
  // Set geometry
  mr.geometry = new BoxGeometry(5, 5, 5);
  // Set material
  mr.material = new LitMaterial();

  scene3D.addChild(obj);

  // Create View3D object
  let view = new View3D();
  // Specify the scene to render
  view.scene = scene3D;
  // Specify the camera to use
  view.camera = camera;
  // Start rendering
  Engine3D.startRenderView(view);
}
demo();
