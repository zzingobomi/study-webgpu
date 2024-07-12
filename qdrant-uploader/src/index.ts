import {
  AtmosphericComponent,
  Camera3D,
  CameraUtil,
  DirectLight,
  Engine3D,
  HoverCameraController,
  KelvinUtil,
  Object3D,
  Scene3D,
  View3D,
} from "@orillusion/core";
import { Stats } from "@orillusion/stats";
import { QdrantClient } from "@qdrant/js-client-rest";

class QdrantUploader {
  scene: Scene3D;
  lightObj: Object3D;

  async run() {
    await Engine3D.init({ beforeRender: () => this.update() });

    let view = new View3D();

    view.scene = new Scene3D();
    let sky = view.scene.addComponent(AtmosphericComponent);
    view.scene.addComponent(Stats);

    this.scene = view.scene;

    view.camera = CameraUtil.createCamera3DObject(view.scene, "camera");
    view.camera.perspective(60, Engine3D.aspect, 1, 2000);
    view.camera.object3D
      .addComponent(HoverCameraController)
      .setCamera(35, -20, 150);

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
    const objHref = "/chair.obj";
    const response = await fetch(objHref);
    const text = await response.text();
    const obj = this.parseObj(text);
    console.log(obj);
  }

  private update() {}

  public parseObj(text: string) {
    // 인덱스는 기본값이 1이므로 0번째 데이터만 입력하겠습니다.
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];
    const objColors = [[0, 0, 0]];

    const objVertexData = [objPositions, objTexcoords, objNormals, objColors];

    let vertexData: [number[], number[], number[], number[]] = [
      [], // positions
      [], // texcoords
      [], // normals
      [], // colors
    ];

    const materialLibs = [];
    const geometries = [];
    let geometry;
    let groups = ["default"];
    let material = "default";
    let object = "default";

    const noop = () => {};

    function newGeometry() {
      // 기존 지오메트리가 있고 비어 있지 않은 경우 새 지오메트리를 시작합니다.
      if (geometry && geometry.data.position.length) {
        geometry = undefined;
      }
    }

    function setGeometry() {
      if (!geometry) {
        const position = [];
        const texcoord = [];
        const normal = [];
        const color = [];
        vertexData = [position, texcoord, normal, color];
        geometry = {
          object,
          groups,
          material,
          data: {
            position,
            texcoord,
            normal,
            color,
          },
        };
        geometries.push(geometry);
      }
    }

    function addVertex(vert: string) {
      const ptn = vert.split("/");
      ptn.forEach((objIndexStr, i) => {
        if (!objIndexStr) {
          return;
        }
        const objIndex = parseInt(objIndexStr);
        const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
        vertexData[i].push(...objVertexData[i][index]);
        // 이것이 위치 인덱스(인덱스 0)이고 정점 색상을 파싱한 경우 정점 색상을 정점 색상 데이터에 복사합니다.
        if (i === 0 && objColors.length > 1) {
          geometry.data.color.push(...objColors[index]);
        }
      });
    }

    const keywords = {
      v: function (parts: string[]) {
        // 여기에 값이 3개 이상이면 버텍스 색입니다.
        if (parts.length > 3) {
          objPositions.push(parts.slice(0, 3).map(parseFloat));
          objColors.push(parts.slice(3).map(parseFloat));
        } else {
          objPositions.push(parts.map(parseFloat));
        }
      },
      vn: function (parts: string[]) {
        objNormals.push(parts.map(parseFloat));
      },
      vt: function (parts: string[]) {
        objTexcoords.push(parts.map(parseFloat));
      },
      f: function (parts: string[]) {
        setGeometry();
        const numTriangles = parts.length - 2;
        for (let tri = 0; tri < numTriangles; ++tri) {
          addVertex(parts[0]);
          addVertex(parts[tri + 1]);
          addVertex(parts[tri + 2]);
        }
      },
      s: noop,
      mtllib: function (parts: string[], unparsedArgs: string) {
        // 사양에 따르면 여기에 여러 파일 이름이 있을 수 있지만 단일 파일 이름에 공백이 있는 경우가 많습니다.
        materialLibs.push(unparsedArgs);
      },
      usemtl: function (parts: string[], unparsedArgs: string) {
        material = unparsedArgs;
        newGeometry();
      },
      g: function (parts: string[]) {
        groups = parts;
        newGeometry();
      },
      o: function (parts: string[], unparsedArgs: string) {
        object = unparsedArgs;
        newGeometry();
      },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split("\n");
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();
      if (line === "" || line.startsWith("#")) {
        continue;
      }
      const m = keywordRE.exec(line);
      if (!m) {
        continue;
      }
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      if (!handler) {
        console.warn(`unhandled keyword: ${keyword}`);
        continue;
      }
      handler(parts, unparsedArgs);
    }

    // remove any arrays that have no entries.
    for (const geometry of geometries) {
      geometry.data = Object.fromEntries(
        Object.entries(geometry.data).filter(
          ([, array]) => (array as any).length > 0
        )
      );
    }

    return {
      geometries,
      materialLibs,
    };
  }

  public parseMTL(text: string) {
    const materials = {};
    let material;

    const keywords = {
      newmtl: function (parts: string[], unparsedArgs: string) {
        material = {};
        materials[unparsedArgs] = material;
      },
      Ns: function (parts: string[]) {
        material.shininess = parseFloat(parts[0]);
      },
      Ka: function (parts: string[]) {
        material.ambient = parts.map(parseFloat);
      },
      Kd: function (parts: string[]) {
        material.diffuse = parts.map(parseFloat);
      },
      Ks: function (parts: string[]) {
        material.specular = parts.map(parseFloat);
      },
      Ke: function (parts: string[]) {
        material.emissive = parts.map(parseFloat);
      },
      Ni: function (parts: string[]) {
        material.opticalDensity = parseFloat(parts[0]);
      },
      d: function (parts: string[]) {
        material.opacity = parseFloat(parts[0]);
      },
      illum: function (parts: string[]) {
        material.illum = parseInt(parts[0]);
      },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split("\n");
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();
      if (line === "" || line.startsWith("#")) {
        continue;
      }
      const m = keywordRE.exec(line);
      if (!m) {
        continue;
      }
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      if (!handler) {
        console.warn("unhandled keyword:", keyword);
        continue;
      }
      handler(parts, unparsedArgs);
    }

    return materials;
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
