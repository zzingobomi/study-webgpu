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

  geometry: string;
  mat: string;
}

export interface QdrantVector {
  id: number;
  vector: number[];
  payload: QdrantPayload;
}

// geometry 와 mat 은 따로따로인데 meshrender 만들때는 둘다 있어야 하니....
// qdrant 에 geometry name 이런것도 막 집어넣으려고 했던게 문제인가..?
export class QdrantData {
  vertexArr: number[] = [];
  normalArr: number[] = [];
  uvArr: number[] = [];
  indeiceArr: number[] = [];

  geometryName: string;
  matName: string;
}
