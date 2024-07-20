export interface QdrantPayload extends Record<string, unknown> {
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

export interface QdrantVector {
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
