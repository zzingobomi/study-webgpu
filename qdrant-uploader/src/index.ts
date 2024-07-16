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
  StringUtil,
  VertexAttribute,
  VertexAttributeName,
  View3D,
} from "@orillusion/core";
import { Stats } from "@orillusion/stats";
import { QdrantClient } from "@qdrant/js-client-rest";
import dat from "dat.gui";

interface QdrantPayload extends Record<string, unknown> {
  vertex1: number[];
  vertex2: number[];
  vertex3: number[];

  normal1: number[];
  normal2: number[];
  normal3: number[];

  uv1: number[];
  uv2: number[];
  uv3: number[];
}

interface QdrantVector {
  id: number;
  vector: number[];
  payload: QdrantPayload;
}

type MatData = {
  name?: string;
  Kd?: string[];
  Ks?: string[];
  Tr?: string;
  d?: string[];
  Tf?: string[];
  Pr?: string;
  Pm?: string;
  Pc?: string;
  Pcr?: string;
  Ni?: string;
  Kr?: string[];
  illum?: string;
  map_Kd?: string;
  textures?: string[];
};

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

  public matLibs: { [name: string]: MatData } = {};

  public qdrantVectors: QdrantVector[] = [];
  private tempId = 1;

  private client: QdrantClient = new QdrantClient({
    host: "localhost",
    port: 6333,
  });

  private searchResults: any[] = [];

  public playerX = 0;
  public playerY = 0;
  public playerZ = 0;

  public playerSight = 1;

  private landGeometry: GeometryBase = new GeometryBase();

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

    const create_collection = {
      Create_Collection: async () => {
        await this.client.createCollection("test_collection", {
          vectors: { size: 3, distance: "Euclid" },
        });
      },
    };

    const upsert_vectors = {
      Upsert_Vectors: async () => {
        await this.client.upsert("test_collection", {
          wait: true,
          points: this.qdrantVectors,
        });
      },
    };

    const gui = new dat.GUI();
    const qdrantFolder = gui.addFolder("Qdrant");
    qdrantFolder.add(create_collection, "Create_Collection");
    qdrantFolder.add(upsert_vectors, "Upsert_Vectors");
    qdrantFolder.open();

    const transformFolder = gui.addFolder("Transform");
    transformFolder.add(this, "playerX", -100.0, 100.0, 0.01);
    transformFolder.add(this, "playerY", -100.0, 100.0, 0.01);
    transformFolder.add(this, "playerZ", -100.0, 100.0, 0.01);
    transformFolder.open();

    const sightFoler = gui.addFolder("Sight");
    sightFoler.add(this, "playerSight", -100.0, 100.0, 0.01);
    sightFoler.open();
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

    // parse OBJ
    const objHref = "/test.obj";
    const objResponse = await fetch(objHref);
    const objText = await objResponse.text();
    await this.parserOBJ(objText);

    // parse MTL
    //const mltHref = "/Low_Poly_Forest.mtl";
    //const mtlResponse = await fetch(mltHref);
    //const mtlText = await mtlResponse.text();
    //await this.parserMTL(mtlText);

    // obj to Object3D
    await this.parserMesh();

    await this.runQuery();
    this.qdrantMesh();
  }

  private async update() {
    // TODO: GUIGeometry 참고?
    await this.runQuery();

    let index = 0;
    const vertex_arr = [];
    const normal_arr = [];
    const uv_arr = [];
    const indeice_arr = [];
    for (let i = 0; i < this.searchResults.length; i++) {
      vertex_arr.push(...this.searchResults[i].payload.vertex1);
      vertex_arr.push(...this.searchResults[i].payload.vertex2);
      vertex_arr.push(...this.searchResults[i].payload.vertex3);
      indeice_arr.push(index, index + 1, index + 2);
      index += 3;
    }
    for (let i = 0; i < this.searchResults.length; i++) {
      normal_arr.push(...this.searchResults[i].payload.normal1);
      normal_arr.push(...this.searchResults[i].payload.normal2);
      normal_arr.push(...this.searchResults[i].payload.normal3);
    }
    for (let i = 0; i < this.searchResults.length; i++) {
      uv_arr.push(...this.searchResults[i].payload.uv1);
      uv_arr.push(...this.searchResults[i].payload.uv2);
      uv_arr.push(...this.searchResults[i].payload.uv3);
    }

    // 위에서까지는 제대로 데이터를 가져오는듯..
    // GUIGeometry 참고?
    // TODO: update 에서 계속 만들었다 지웠다 하는게 아닌 기존 geometry 를 업데이트 해야할텐데..
    // this.landGeometry.subGeometries[0].lodLevels[0].indexCount =
    //   indeice_arr.length;

    const posAttrData = this.landGeometry.getAttribute(
      VertexAttributeName.position
    );
    posAttrData.data = new Float32Array(vertex_arr);
    this.landGeometry.vertexBuffer.upload(
      VertexAttributeName.position,
      posAttrData
    );
    const normalAttrData = this.landGeometry.getAttribute(
      VertexAttributeName.normal
    );
    normalAttrData.data = new Float32Array(normal_arr);
    this.landGeometry.vertexBuffer.upload(
      VertexAttributeName.normal,
      normalAttrData
    );
    const uvAttrData = this.landGeometry.getAttribute(VertexAttributeName.uv);
    uvAttrData.data = new Float32Array(uv_arr);
    this.landGeometry.vertexBuffer.upload(VertexAttributeName.uv, uvAttrData);
  }

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

        // 정점 정보 구하기
        const vertex1 = {
          x: this.source_vertices[f0][0],
          y: this.source_vertices[f0][1],
          z: this.source_vertices[f0][2],
        };
        const vertex2 = {
          x: this.source_vertices[f1][0],
          y: this.source_vertices[f1][1],
          z: this.source_vertices[f1][2],
        };
        const vertex3 = {
          x: this.source_vertices[f2][0],
          y: this.source_vertices[f2][1],
          z: this.source_vertices[f2][2],
        };

        // 무게중심 구하기
        const centroid = {
          x: (vertex1.x + vertex2.x + vertex3.x) / 3,
          y: (vertex1.y + vertex2.y + vertex3.y) / 3,
          z: (vertex1.z + vertex2.z + vertex3.z) / 3,
        };

        // normal 정보 구하기
        const normal1 = {
          x: this.source_normals[n0][0],
          y: this.source_normals[n0][1],
          z: this.source_normals[n0][2],
        };
        const normal2 = {
          x: this.source_normals[n1][0],
          y: this.source_normals[n1][1],
          z: this.source_normals[n1][2],
        };
        const normal3 = {
          x: this.source_normals[n2][0],
          y: this.source_normals[n2][1],
          z: this.source_normals[n2][2],
        };

        // uv 정보 구하기
        const uv1 = {
          x: this.source_textureCoords[u0][0],
          y: this.source_textureCoords[u0][1],
        };
        const uv2 = {
          x: this.source_textureCoords[u1][0],
          y: this.source_textureCoords[u1][1],
        };
        const uv3 = {
          x: this.source_textureCoords[u2][0],
          y: this.source_textureCoords[u2][1],
        };

        // QdrandPayload 생성
        const qPayload: QdrantPayload = {
          vertex1: [vertex1.x, vertex1.y, vertex1.z],
          vertex2: [vertex2.x, vertex2.y, vertex2.z],
          vertex3: [vertex3.x, vertex3.y, vertex3.z],

          normal1: [normal1.x, normal1.y, normal1.z],
          normal2: [normal2.x, normal2.y, normal2.z],
          normal3: [normal3.x, normal3.y, normal3.z],

          uv1: [uv1.x, uv1.y],
          uv2: [uv2.x, uv2.y],
          uv3: [uv3.x, uv3.y],
        };

        // QdrantVector 생성
        const qVector: QdrantVector = {
          id: this.tempId++,
          vector: [centroid.x, centroid.y, centroid.z],
          payload: qPayload,
        };
        this.qdrantVectors.push(qVector);

        // TODO: obj 파일에서 면이 다각형인 경우 어떻게 처리할 것인가?
        // if (face.indices.length > 3) {
        //   let f3 = parseInt(face.indices[3]) - 1;
        //   let n3 = parseInt(face.normal[3]) - 1;
        //   let u3 = parseInt(face.texture[3]) - 1;

        //   this.applyVector3(f0, this.source_vertices, geoData.vertex_arr);
        //   this.applyVector3(n0, this.source_normals, geoData.normal_arr);
        //   this.applyVector2(u0, this.source_textureCoords, geoData.uv_arr);
        //   geoData.indeice_arr[index] = index++;

        //   this.applyVector3(f2, this.source_vertices, geoData.vertex_arr);
        //   this.applyVector3(n2, this.source_normals, geoData.normal_arr);
        //   this.applyVector2(u2, this.source_textureCoords, geoData.uv_arr);
        //   geoData.indeice_arr[index] = index++;

        //   this.applyVector3(f3, this.source_vertices, geoData.vertex_arr);
        //   this.applyVector3(n3, this.source_normals, geoData.normal_arr);
        //   this.applyVector2(u3, this.source_textureCoords, geoData.uv_arr);
        //   geoData.indeice_arr[index] = index++;
        // }
      }

      // let geo: GeometryBase = new GeometryBase();

      // geo.setIndices(new Uint32Array(geoData.indeice_arr));
      // geo.setAttribute(
      //   VertexAttributeName.position,
      //   new Float32Array(geoData.vertex_arr)
      // );
      // geo.setAttribute(
      //   VertexAttributeName.normal,
      //   new Float32Array(geoData.normal_arr)
      // );
      // geo.setAttribute(
      //   VertexAttributeName.uv,
      //   new Float32Array(geoData.uv_arr)
      // );
      // geo.setAttribute(
      //   VertexAttributeName.TEXCOORD_1,
      //   new Float32Array(geoData.uv_arr)
      // );

      // geo.addSubGeometry({
      //   indexStart: 0,
      //   indexCount: geoData.indeice_arr.length,
      //   vertexStart: 0,
      //   vertexCount: 0,
      //   firstStart: 0,
      //   index: 0,
      //   topology: 0,
      // });

      // // TODO: 메테리얼이 왜 적용이 안되나?
      // const mat = new LitMaterial();
      // // const matData = this.matLibs[geoData.source_mat];
      // // mat.baseMap = Engine3D.res.getTexture(
      // //   StringUtil.normalizePath("/" + matData.map_Kd)
      // // );

      // const obj = new Object3D();
      // const mr = obj.addComponent(MeshRenderer);
      // mr.geometry = geo;
      // mr.material = mat;
      // root.addChild(obj);
    }

    //this.scene.addChild(root);
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

  private async parserMTL(text: string) {
    let mat: MatData;

    let str = text.split("\n");
    for (let i = 0; i < str.length; i++) {
      let line = str[i];
      var commentStart = line.indexOf("#");
      if (commentStart != -1) {
        line = line.substring(0, commentStart);
      }
      line = line.trim();
      var splitedLine = line.split(/\s+/);
      if (splitedLine[0] === "newmtl") {
        mat = { name: splitedLine[1] };
        this.matLibs[splitedLine[1]] = mat;
      } else {
        if (splitedLine[0].indexOf(`map_`) != -1) {
          mat[splitedLine[0]] = splitedLine[1];
          if (!mat.textures) {
            mat.textures = [splitedLine[splitedLine.length - 1]];
          }
          mat.textures.push(splitedLine[splitedLine.length - 1]);
        } else if (splitedLine.length == 2) {
          mat[splitedLine[0]] = Number(splitedLine[1]);
        } else if (splitedLine.length == 3) {
          mat[splitedLine[0]] = [
            Number(splitedLine[1]),
            Number(splitedLine[2]),
          ];
        } else if (splitedLine.length == 4) {
          mat[splitedLine[0]] = [
            Number(splitedLine[1]),
            Number(splitedLine[2]),
            Number(splitedLine[3]),
          ];
        }
      }
    }

    // for (const key in this.matLibs) {
    //   const mat = this.matLibs[key];
    //   if (mat.textures && mat.textures.length > 0) {
    //     for (let i = 0; i < mat.textures.length; i++) {
    //       const texUrl = StringUtil.normalizePath(
    //         this.baseUrl + mat.textures[i]
    //       );
    //       await Engine3D.res.loadTexture(texUrl);
    //     }
    //   }
    // }
  }

  private async createCollection() {
    await this.client.createCollection("test_collection", {
      vectors: { size: 3, distance: "Euclid" },
    });
  }

  private async upsertVectors() {
    const operationInfo = await this.client.upsert("test_collection", {
      wait: true,
      points: this.qdrantVectors,
    });
  }

  private async runQuery() {
    const searchVector = [this.playerX, this.playerY, this.playerZ];
    const distanceThreshold = this.playerSight;

    const searchResults = await this.client.search("test_collection", {
      vector: searchVector,
      score_threshold: distanceThreshold,
      with_vector: true,
      with_payload: true,
      limit: Number.MAX_SAFE_INTEGER,
    });

    this.searchResults = searchResults;
  }

  private async qdrantMesh() {
    let index = 0;
    const vertex_arr = [];
    const normal_arr = [];
    const uv_arr = [];
    const indeice_arr = [];

    for (let i = 0; i < this.searchResults.length; i++) {
      vertex_arr.push(...this.searchResults[i].payload.vertex1);
      vertex_arr.push(...this.searchResults[i].payload.vertex2);
      vertex_arr.push(...this.searchResults[i].payload.vertex3);

      indeice_arr.push(index, index + 1, index + 2);
      index += 3;
    }

    for (let i = 0; i < this.searchResults.length; i++) {
      normal_arr.push(...this.searchResults[i].payload.normal1);
      normal_arr.push(...this.searchResults[i].payload.normal2);
      normal_arr.push(...this.searchResults[i].payload.normal3);
    }

    for (let i = 0; i < this.searchResults.length; i++) {
      uv_arr.push(...this.searchResults[i].payload.uv1);
      uv_arr.push(...this.searchResults[i].payload.uv2);
      uv_arr.push(...this.searchResults[i].payload.uv3);
    }

    this.landGeometry.setIndices(new Uint32Array(indeice_arr));
    this.landGeometry.setAttribute(
      VertexAttributeName.position,
      new Float32Array(vertex_arr)
    );
    this.landGeometry.setAttribute(
      VertexAttributeName.normal,
      new Float32Array(normal_arr)
    );
    this.landGeometry.setAttribute(
      VertexAttributeName.uv,
      new Float32Array(uv_arr)
    );
    this.landGeometry.setAttribute(
      VertexAttributeName.TEXCOORD_1,
      new Float32Array(uv_arr)
    );

    this.landGeometry.addSubGeometry({
      indexStart: 0,
      indexCount: indeice_arr.length,
      vertexStart: 0,
      vertexCount: 0,
      firstStart: 0,
      index: 0,
      topology: 0,
    });

    // TODO: 메테리얼이 왜 적용이 안되나?
    const mat = new LitMaterial();
    // const matData = this.matLibs[geoData.source_mat];
    // mat.baseMap = Engine3D.res.getTexture(
    //   StringUtil.normalizePath("/" + matData.map_Kd)
    // );

    const obj = new Object3D();
    const mr = obj.addComponent(MeshRenderer);
    mr.geometry = this.landGeometry;
    mr.material = mat;

    this.scene.addChild(obj);
  }
}

new QdrantUploader().run();
