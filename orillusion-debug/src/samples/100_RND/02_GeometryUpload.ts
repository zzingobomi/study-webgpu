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

type GeometryData = {
  name: string;

  vertex_arr?: number[];
  normal_arr?: number[];
  uv_arr?: number[];
  indeice_arr?: number[];
  index?: number;

  source_mat: string;
  source_faces: Face[];
};

type Face = {
  indices: string[];
  texture: string[];
  normal: string[];
};

class GeometryUpload {
  view: View3D;

  firstObj: ObjParser = new ObjParser();
  secondObj: ObjParser = new ObjParser();

  firstGeometry: GeometryBase;
  secondGeometry: GeometryBase;

  landObject3D: Object3D;

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

    Engine3D.startRenderView(this.view);
    await this.initFirstObj();
    await this.initSecondObj();

    const gui = new dat.GUI();
    const horiFolder = gui.addFolder("Hori");
    horiFolder.add(this, "showMeshFirst");
    //horiFolder.add(this, "showMeshSecond");
    horiFolder.add(this, "changeGeometrySecond");
    horiFolder.open();
  }

  private async initFirstObj() {
    // parse OBJ
    const firstHref = "/first.obj";
    const firstResponse = await fetch(firstHref);
    const firstText = await firstResponse.text();

    this.firstObj.parserOBJ(firstText);
  }

  private async initSecondObj() {
    // parse OBJ
    const secondHref = "/second.obj";
    const secondResponse = await fetch(secondHref);
    const secondText = await secondResponse.text();

    this.secondObj.parserOBJ(secondText);
  }

  public async showMeshFirst() {
    const root = new Object3D();
    for (const key in this.firstObj.geometries) {
      const geoData = this.firstObj.geometries[key];

      this.firstGeometry = new GeometryBase();

      this.firstGeometry.setIndices(new Uint32Array(geoData.indeice_arr));
      this.firstGeometry.setAttribute(
        VertexAttributeName.position,
        new Float32Array(geoData.vertex_arr)
      );
      this.firstGeometry.setAttribute(
        VertexAttributeName.normal,
        new Float32Array(geoData.normal_arr)
      );
      this.firstGeometry.setAttribute(
        VertexAttributeName.uv,
        new Float32Array(geoData.uv_arr)
      );
      this.firstGeometry.setAttribute(
        VertexAttributeName.TEXCOORD_1,
        new Float32Array(geoData.uv_arr)
      );

      this.firstGeometry.addSubGeometry({
        indexStart: 0,
        indexCount: geoData.indeice_arr.length,
        vertexStart: 0,
        vertexCount: 0,
        firstStart: 0,
        index: 0,
        topology: 0,
      });

      const mat = new LitMaterial();

      this.landObject3D = new Object3D();
      const mr = this.landObject3D.addComponent(MeshRenderer);
      mr.geometry = this.firstGeometry;
      mr.material = mat;
      root.addChild(this.landObject3D);
    }
    this.view.scene.addChild(root);
  }

  public async showMeshSecond() {
    const root = new Object3D();
    for (const key in this.secondObj.geometries) {
      const geoData = this.secondObj.geometries[key];

      this.firstGeometry = new GeometryBase();

      this.firstGeometry.setIndices(new Uint32Array(geoData.indeice_arr));
      this.firstGeometry.setAttribute(
        VertexAttributeName.position,
        new Float32Array(geoData.vertex_arr)
      );
      this.firstGeometry.setAttribute(
        VertexAttributeName.normal,
        new Float32Array(geoData.normal_arr)
      );
      this.firstGeometry.setAttribute(
        VertexAttributeName.uv,
        new Float32Array(geoData.uv_arr)
      );
      this.firstGeometry.setAttribute(
        VertexAttributeName.TEXCOORD_1,
        new Float32Array(geoData.uv_arr)
      );

      this.firstGeometry.addSubGeometry({
        indexStart: 0,
        indexCount: geoData.indeice_arr.length,
        vertexStart: 0,
        vertexCount: 0,
        firstStart: 0,
        index: 0,
        topology: 0,
      });

      const mat = new LitMaterial();

      this.landObject3D = new Object3D();
      const mr = this.landObject3D.addComponent(MeshRenderer);
      mr.geometry = this.firstGeometry;
      mr.material = mat;
      root.addChild(this.landObject3D);
    }
    this.view.scene.addChild(root);
  }

  // TODO: upload 로 변경..
  // 밑에것들을 잘 조합해서 새로운 컴포넌트 제작?
  public async changeGeometrySecond() {
    const geoData = this.secondObj.geometries["land"];

    this.firstGeometry.setIndices2(new Uint32Array(geoData.indeice_arr));

    this.firstGeometry.setAttribute2(
      VertexAttributeName.position,
      new Float32Array(geoData.vertex_arr)
    );
    this.firstGeometry.setAttribute2(
      VertexAttributeName.normal,
      new Float32Array(geoData.normal_arr)
    );
    this.firstGeometry.setAttribute2(
      VertexAttributeName.uv,
      new Float32Array(geoData.uv_arr)
    );
    this.firstGeometry.setAttribute2(
      VertexAttributeName.TEXCOORD_1,
      new Float32Array(geoData.uv_arr)
    );

    this.firstGeometry.addSubGeometry2({
      indexStart: 0,
      indexCount: geoData.indeice_arr.length,
      vertexStart: 0,
      vertexCount: 0,
      firstStart: 0,
      index: 0,
      topology: 0,
    });

    this.firstGeometry.updateBounds();

    const mr = this.landObject3D.getComponent(MeshRenderer);
    mr.updateGeometry(this.firstGeometry);
  }
}

class ObjParser {
  public source_vertices: number[][] = [];
  public source_normals: number[][] = [];
  public source_textureCoords: number[][] = [];

  public geometries: { [name: string]: GeometryData } = {};
  public activeGeo: GeometryData;

  public async parserOBJ(text: string) {
    let str = text.split("\n");
    for (let i = 0; i < str.length; i++) {
      const element = str[i];
      this.parserLine(element);
    }

    this.readyGeometry();
  }

  private parserLine(line: string) {
    if (line === "" || line.startsWith("#")) return;

    const splitedLine = line.trim().split(/\s+/);

    if (splitedLine[0] === "o") {
      const geoName = splitedLine[1];
      this.activeGeo = {
        name: geoName,
        source_mat: ``,
        source_faces: [],
      };
      this.geometries[geoName] = this.activeGeo;
    } else if (splitedLine[0] === "v") {
      const vertex = [
        Number(splitedLine[1]),
        Number(splitedLine[2]),
        Number(splitedLine[3]),
        splitedLine[4] ? 1 : Number(splitedLine[4]),
      ];
      this.source_vertices.push(vertex);
    } else if (splitedLine[0] === "vt") {
      const textureCoord = [
        Number(splitedLine[1]),
        Number(splitedLine[2]),
        splitedLine[3] ? 1 : Number(splitedLine[3]),
      ];
      this.source_textureCoords.push(textureCoord);
    } else if (splitedLine[0] === "vn") {
      const normal = [
        Number(splitedLine[1]),
        Number(splitedLine[2]),
        Number(splitedLine[3]),
      ];
      this.source_normals.push(normal);
    } else if (splitedLine[0] === "f") {
      const face: Face = {
        indices: [],
        texture: [],
        normal: [],
      };

      for (let i = 1; i < splitedLine.length; ++i) {
        const dIndex = splitedLine[i].indexOf("//");
        const splitedFaceIndices = splitedLine[i].split(/\W+/);

        if (dIndex > 0) {
          /*Vertex Normal Indices Without Texture Coordinate Indices*/
          face.indices.push(splitedFaceIndices[0]);
          face.normal.push(splitedFaceIndices[1]);
        } else {
          if (splitedFaceIndices.length === 1) {
            /*Vertex Indices*/
            face.indices.push(splitedFaceIndices[0]);
          } else if (splitedFaceIndices.length === 2) {
            /*Vertex Texture Coordinate Indices*/
            face.indices.push(splitedFaceIndices[0]);
            face.texture.push(splitedFaceIndices[1]);
          } else if (splitedFaceIndices.length === 3) {
            /*Vertex Normal Indices*/
            face.indices.push(splitedFaceIndices[0]);
            face.texture.push(splitedFaceIndices[1]);
            face.normal.push(splitedFaceIndices[2]);
          }
        }
      }

      this.activeGeo.source_faces.push(face);
    } else if (splitedLine[0] === "usemtl") {
      this.activeGeo.source_mat = splitedLine[1];
    } else if (splitedLine[0] === `mtllib`) {
    }
  }

  private readyGeometry() {
    for (const key in this.geometries) {
      const geoData = this.geometries[key];

      geoData.vertex_arr = [];
      geoData.normal_arr = [];
      geoData.uv_arr = [];
      geoData.indeice_arr = [];

      let index = 0;
      for (let i = 0; i < geoData.source_faces.length; i++) {
        const face = geoData.source_faces[i];

        const f0 = parseInt(face.indices[0]) - 1;
        const f1 = parseInt(face.indices[1]) - 1;
        const f2 = parseInt(face.indices[2]) - 1;

        const n0 = parseInt(face.normal[0]) - 1;
        const n1 = parseInt(face.normal[1]) - 1;
        const n2 = parseInt(face.normal[2]) - 1;

        const u0 = parseInt(face.texture[0]) - 1;
        const u1 = parseInt(face.texture[1]) - 1;
        const u2 = parseInt(face.texture[2]) - 1;

        this.applyVector3(f0, this.source_vertices, geoData.vertex_arr);
        this.applyVector3(n0, this.source_normals, geoData.normal_arr);
        this.applyVector2(u0, this.source_textureCoords, geoData.uv_arr);
        geoData.indeice_arr[index] = index++;

        this.applyVector3(f1, this.source_vertices, geoData.vertex_arr);
        this.applyVector3(n1, this.source_normals, geoData.normal_arr);
        this.applyVector2(u1, this.source_textureCoords, geoData.uv_arr);
        geoData.indeice_arr[index] = index++;

        this.applyVector3(f2, this.source_vertices, geoData.vertex_arr);
        this.applyVector3(n2, this.source_normals, geoData.normal_arr);
        this.applyVector2(u2, this.source_textureCoords, geoData.uv_arr);
        geoData.indeice_arr[index] = index++;
      }
    }
  }

  private applyVector2(fi: number, sourceData: number[][], destData: number[]) {
    if (sourceData[fi] && sourceData[fi].length > 0) {
      destData.push(sourceData[fi][0]);
      destData.push(sourceData[fi][1]);
    } else {
      destData.push(0);
      destData.push(0);
    }
  }

  private applyVector3(fi: number, sourceData: number[][], destData: number[]) {
    destData.push(sourceData[fi][0]);
    destData.push(sourceData[fi][1]);
    destData.push(sourceData[fi][2]);
  }
}

new GeometryUpload().run();
