import {
  AtmosphericComponent,
  Camera3D,
  CameraUtil,
  DirectLight,
  Engine3D,
  GeometryBase,
  HoverCameraController,
  KelvinUtil,
  LitMaterial,
  MeshRenderer,
  Object3D,
  Scene3D,
  VertexAttribute,
  VertexAttributeName,
  View3D,
} from "@orillusion/core";
import { Stats } from "@orillusion/stats";
import { QdrantClient } from "@qdrant/js-client-rest";

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

class QdrantUploader {
  scene: Scene3D;
  lightObj: Object3D;

  private source_vertices: number[][] = [];
  private source_normals: number[][] = [];
  private source_textureCoords: number[][] = [];

  private geometries: { [name: string]: GeometryData } = {};
  private activeGeo: GeometryData;

  private mtlUrl: string;

  async run() {
    await Engine3D.init({ beforeRender: () => this.update() });

    let view = new View3D();

    view.scene = new Scene3D();
    let sky = view.scene.addComponent(AtmosphericComponent);
    view.scene.addComponent(Stats);

    this.scene = view.scene;

    view.camera = CameraUtil.createCamera3DObject(view.scene, "camera");
    view.camera.perspective(60, Engine3D.aspect, 0.1, 1000);
    view.camera.object3D
      .addComponent(HoverCameraController)
      .setCamera(35, -20, 10);

    Engine3D.startRenderView(view);

    await this.createScene();
    sky.relativeTransform = this.lightObj.transform;
  }

  private async createScene() {
    // add light
    let lightObj3D = (this.lightObj = new Object3D());
    let directLight = lightObj3D.addComponent(DirectLight);
    directLight.intensity = 25;
    directLight.lightColor = KelvinUtil.color_temperature_to_rgb(5355);
    directLight.castShadow = true;
    lightObj3D.rotationX = 53.2;
    lightObj3D.rotationY = 220;
    lightObj3D.rotationZ = 5.58;
    this.scene.addChild(lightObj3D);

    // add OBJ
    const objHref = "/Low_Poly_Forest.obj";
    const response = await fetch(objHref);
    const text = await response.text();
    await this.parserOBJ(text);

    await this.parserMesh();
  }

  private update() {}

  private async parserOBJ(text: string) {
    let str = text.split("\n");
    for (let i = 0; i < str.length; i++) {
      const element = str[i];
      this.parserLine(element);
    }
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
      this.mtlUrl = splitedLine[1];
    }
  }

  private async parserMesh() {
    const root = new Object3D();
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

        if (face.indices.length > 3) {
          let f3 = parseInt(face.indices[3]) - 1;
          let n3 = parseInt(face.normal[3]) - 1;
          let u3 = parseInt(face.texture[3]) - 1;
          this.applyVector3(f0, this.source_vertices, geoData.vertex_arr);
          this.applyVector3(n0, this.source_normals, geoData.normal_arr);
          this.applyVector2(u0, this.source_textureCoords, geoData.uv_arr);
          geoData.indeice_arr[index] = index++;

          this.applyVector3(f2, this.source_vertices, geoData.vertex_arr);
          this.applyVector3(n2, this.source_normals, geoData.normal_arr);
          this.applyVector2(u2, this.source_textureCoords, geoData.uv_arr);
          geoData.indeice_arr[index] = index++;

          this.applyVector3(f3, this.source_vertices, geoData.vertex_arr);
          this.applyVector3(n3, this.source_normals, geoData.normal_arr);
          this.applyVector2(u3, this.source_textureCoords, geoData.uv_arr);
          geoData.indeice_arr[index] = index++;
        }
      }

      let geo: GeometryBase = new GeometryBase();

      geo.setIndices(new Uint32Array(geoData.indeice_arr));
      geo.setAttribute(
        VertexAttributeName.position,
        new Float32Array(geoData.vertex_arr)
      );
      geo.setAttribute(
        VertexAttributeName.normal,
        new Float32Array(geoData.normal_arr)
      );
      geo.setAttribute(
        VertexAttributeName.uv,
        new Float32Array(geoData.uv_arr)
      );
      geo.setAttribute(
        VertexAttributeName.TEXCOORD_1,
        new Float32Array(geoData.uv_arr)
      );

      geo.addSubGeometry({
        indexStart: 0,
        indexCount: geoData.indeice_arr.length,
        vertexStart: 0,
        vertexCount: 0,
        firstStart: 0,
        index: 0,
        topology: 0,
      });

      const mat = new LitMaterial();

      const obj = new Object3D();
      const mr = obj.addComponent(MeshRenderer);
      mr.geometry = geo;
      mr.material = mat;
      root.addChild(obj);
    }

    this.scene.addChild(root);
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

new QdrantUploader().run();

// const client = new QdrantClient({ host: "localhost", port: 6333 });

// const createCollection = async () => {
//   await client.createCollection("test_collection", {
//     vectors: { size: 3, distance: "Euclid" },
//   });
// };

// const upsertVectors = async () => {
//   const operationInfo = await client.upsert("test_collection", {
//     wait: true,
//     points: [
//       { id: 1, vector: [0.0, 0.0, 0.0] },
//       { id: 2, vector: [1.0, 0.0, 0.0] },
//       { id: 3, vector: [2.0, 0.0, 0.0] },
//       { id: 4, vector: [3.0, 0.0, 0.0] },
//       { id: 5, vector: [4.0, 0.0, 0.0] },
//       { id: 6, vector: [5.0, 0.0, 0.0] },
//     ],
//   });

//   console.log(operationInfo);
// };

// const runQuery = async () => {
//   const searchVector = [2.5, 0, 0];
//   const distanceThreshold = 2;

//   let searchResult = await client.search("test_collection", {
//     vector: searchVector,
//     score_threshold: distanceThreshold,
//     with_vector: true,
//     with_payload: true,
//   });

//   console.log(searchResult);
// };

// //createCollection();
// //upsertVectors();
// runQuery();
