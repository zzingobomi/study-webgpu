import { QdrantClient } from "@qdrant/js-client-rest";
import { Vector3 } from "../../../math/Vector3";
import { QdrantData, QdrantPayload, QdrantVector } from "./QdrantData";
import { GeometryData } from "./GeometryData";
import { applyVector2, applyVector3 } from "./utils";

export class QdrantManager {
  readonly QdrantHost = "localhost";
  readonly QdrantPort = 6333;

  public qdrantCollection = "";
  public client: QdrantClient;

  public qdrantDataPool: Map<string, QdrantData> = new Map();
  public indexPool: Map<string, number> = new Map();

  constructor() {
    this.client = new QdrantClient({
      host: this.QdrantHost,
      port: this.QdrantPort,
    });
  }

  public async createCollection(name: string) {
    this.qdrantCollection = name;
    const exist = await this.client.collectionExists(name);
    if (exist.exists) {
      console.log(`${name} already exist`);
      return;
    }

    const result = await this.client.createCollection(name, {
      vectors: { size: 3, distance: "Euclid" },
    });

    if (result) {
      console.log(`${name} create success`);
    } else {
      console.log(`${name} create fail`);
    }
  }

  public async getQdrantData(position: Vector3, sight: number) {
    const results = (await this.runQuery(
      position,
      sight
    )) as unknown as QdrantVector[];

    this.qdrantDataPool.clear();
    this.indexPool.clear();

    // geometry 이름을 기준으로 하는게 맞는건가..?
    for (let i = 0; i < results.length; i++) {
      const geoName = results[i].payload.geometry;
      const qdrantData = this.loadQdrantData(geoName);

      if (!this.indexPool.has(geoName)) {
        this.indexPool.set(geoName, 0);
      }

      let index = this.indexPool.get(geoName);

      qdrantData.vertexArr.push(...results[i].payload.vertex1);
      qdrantData.vertexArr.push(...results[i].payload.vertex2);
      qdrantData.vertexArr.push(...results[i].payload.vertex3);

      qdrantData.normalArr.push(...results[i].payload.normal1);
      qdrantData.normalArr.push(...results[i].payload.normal2);
      qdrantData.normalArr.push(...results[i].payload.normal3);

      qdrantData.uvArr.push(...results[i].payload.uv1);
      qdrantData.uvArr.push(...results[i].payload.uv2);
      qdrantData.uvArr.push(...results[i].payload.uv3);

      qdrantData.indeiceArr.push(index, index + 1, index + 2);
      index += 3;

      qdrantData.geometryName = results[i].payload.geometry;
      qdrantData.matName = results[i].payload.mat;

      this.indexPool.set(geoName, index);
    }

    return this.qdrantDataPool;
  }

  public loadQdrantData(name: string) {
    if (this.qdrantDataPool.has(name)) {
      return this.qdrantDataPool.get(name);
    }
    const qdrantData = new QdrantData();
    this.qdrantDataPool.set(name, qdrantData);
    return qdrantData;
  }

  public async upsertQdrantData(
    sourceVertices: number[][],
    sourceNormals: number[][],
    sourceTextureCoords: number[][],
    data: { [name: string]: GeometryData }
  ) {
    let qdrantId = 0;

    for (const key in data) {
      const geoData = data[key];

      geoData.vertexArr = [];
      geoData.normalArr = [];
      geoData.uvArr = [];
      geoData.indeiceArr = [];

      const qdrantVectors: QdrantVector[] = [];
      for (let i = 0; i < geoData.sourceFaces.length; i++) {
        const face = geoData.sourceFaces[i];

        const f0 = parseInt(face.indices[0]) - 1;
        const f1 = parseInt(face.indices[1]) - 1;
        const f2 = parseInt(face.indices[2]) - 1;

        const n0 = parseInt(face.normal[0]) - 1;
        const n1 = parseInt(face.normal[1]) - 1;
        const n2 = parseInt(face.normal[2]) - 1;

        const u0 = parseInt(face.texture[0]) - 1;
        const u1 = parseInt(face.texture[1]) - 1;
        const u2 = parseInt(face.texture[2]) - 1;

        // 정점 정보 구하기
        const vertex1 = {
          x: sourceVertices[f0][0],
          y: sourceVertices[f0][1],
          z: sourceVertices[f0][2],
        };
        const vertex2 = {
          x: sourceVertices[f1][0],
          y: sourceVertices[f1][1],
          z: sourceVertices[f1][2],
        };
        const vertex3 = {
          x: sourceVertices[f2][0],
          y: sourceVertices[f2][1],
          z: sourceVertices[f2][2],
        };

        // 무게중심 구하기
        const centroid = {
          x: (vertex1.x + vertex2.x + vertex3.x) / 3,
          y: (vertex1.y + vertex2.y + vertex3.y) / 3,
          z: (vertex1.z + vertex2.z + vertex3.z) / 3,
        };

        // normal 정보 구하기
        const normal1 = {
          x: sourceNormals[n0][0],
          y: sourceNormals[n0][1],
          z: sourceNormals[n0][2],
        };
        const normal2 = {
          x: sourceNormals[n1][0],
          y: sourceNormals[n1][1],
          z: sourceNormals[n1][2],
        };
        const normal3 = {
          x: sourceNormals[n2][0],
          y: sourceNormals[n2][1],
          z: sourceNormals[n2][2],
        };

        // uv 정보 구하기
        const uv1 = {
          x: sourceTextureCoords[u0][0],
          y: sourceTextureCoords[u0][1],
        };
        const uv2 = {
          x: sourceTextureCoords[u1][0],
          y: sourceTextureCoords[u1][1],
        };
        const uv3 = {
          x: sourceTextureCoords[u2][0],
          y: sourceTextureCoords[u2][1],
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

          geometry: geoData.name,
          mat: geoData.sourceMat,
        };

        // QdrantVector 생성
        const qVector: QdrantVector = {
          id: qdrantId++,
          vector: [centroid.x, centroid.y, centroid.z],
          payload: qPayload,
        };

        qdrantVectors.push(qVector);

        console.log(`${qdrantId}...`);
      }

      const operationInfo = await this.client.upsert(this.qdrantCollection, {
        wait: true,
        points: qdrantVectors,
      });

      console.log(operationInfo.status);
    }
  }

  private async runQuery(position: Vector3, sight: number) {
    const searchVector = [position.x, position.y, position.z];

    const searchResults = await this.client.search(this.qdrantCollection, {
      vector: searchVector,
      score_threshold: sight,
      with_vector: true,
      with_payload: true,
      limit: Number.MAX_SAFE_INTEGER,
    });

    return searchResults;
  }
}
