export interface Face {
  indices: string[];
  texture: string[];
  normal: string[];
}

export interface GeometryData {
  name: string;

  vertexArr?: number[];
  normalArr?: number[];
  uvArr?: number[];
  indeiceArr?: number[];
  index?: number;

  sourceMat: string;
  sourceFaces: Face[];
}
