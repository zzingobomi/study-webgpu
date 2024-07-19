import { QdrantClient } from "@qdrant/js-client-rest";
import { Vector3 } from "../../../math/Vector3";

interface QdrantPayload {
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

export class QdrantGeoData {
  vertexArr: number[] = [];
  normalArr: number[] = [];
  uvArr: number[] = [];
  indeiceArr: number[] = [];
}

export class QdrantParser {
  readonly QdrantHost = "localhost";
  readonly QdrantPort = 6333;
  readonly QdrantCollection = "test_collection";

  private client: QdrantClient = new QdrantClient({
    host: this.QdrantHost,
    port: this.QdrantPort,
  });

  public async getQdrantGeoData(position: Vector3, sight: number) {
    const results = (await this.runQuery(
      position,
      sight
    )) as unknown as QdrantVector[];

    let index = 0;
    const qdrantGeoData = new QdrantGeoData();
    for (let i = 0; i < results.length; i++) {
      qdrantGeoData.vertexArr.push(...results[i].payload.vertex1);
      qdrantGeoData.vertexArr.push(...results[i].payload.vertex2);
      qdrantGeoData.vertexArr.push(...results[i].payload.vertex3);

      qdrantGeoData.normalArr.push(...results[i].payload.normal1);
      qdrantGeoData.normalArr.push(...results[i].payload.normal2);
      qdrantGeoData.normalArr.push(...results[i].payload.normal3);

      qdrantGeoData.uvArr.push(...results[i].payload.uv1);
      qdrantGeoData.uvArr.push(...results[i].payload.uv2);
      qdrantGeoData.uvArr.push(...results[i].payload.uv3);

      qdrantGeoData.indeiceArr.push(index, index + 1, index + 2);
      index += 3;
    }

    return qdrantGeoData;
  }

  private async runQuery(position: Vector3, sight: number) {
    const searchVector = [position.x, position.y, position.z];

    const searchResults = await this.client.search(this.QdrantCollection, {
      vector: searchVector,
      score_threshold: sight,
      with_vector: true,
      with_payload: true,
      limit: Number.MAX_SAFE_INTEGER,
    });

    return searchResults;
  }
}
