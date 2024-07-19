import { MeshRenderer } from "../components/renderer/MeshRenderer";
import { LitMaterial } from "../materials/LitMaterial";
import { Material } from "../materials/Material";
import { Object3D } from "./entities/Object3D";
import { GeometryBase } from "./geometry/GeometryBase";
import { VertexAttributeName } from "./geometry/VertexAttributeName";

export type GeometryData = {
  name: string;

  vertex_arr?: number[];
  normal_arr?: number[];
  uv_arr?: number[];
  indeice_arr?: number[];
  index?: number;

  source_mat: string;
  source_faces: Face[];
};

export type Face = {
  indices: string[];
  texture: string[];
  normal: string[];
};

// 쉬운길로는 안되는구나....
export class HoriLand {
  private initIndeiceArr: Uint32Array = new Uint32Array(12000);
  private initVertexArr: Float32Array = new Float32Array(12000);
  private initNormalArr: Float32Array = new Float32Array(12000);
  private initUvArr: Float32Array = new Float32Array(8000);
  private initGeometry: GeometryBase;
  private initMaterial: Material;

  public root: Object3D;

  constructor() {
    // 초기 geometry 생성
    this.initGeometry = new GeometryBase();

    this.initGeometry.setIndices(this.initIndeiceArr);
    this.initGeometry.setAttribute(
      VertexAttributeName.position,
      this.initVertexArr
    );
    this.initGeometry.setAttribute(
      VertexAttributeName.normal,
      this.initNormalArr
    );
    this.initGeometry.setAttribute(VertexAttributeName.uv, this.initUvArr);
    this.initGeometry.setAttribute(
      VertexAttributeName.TEXCOORD_1,
      this.initUvArr
    );

    this.initGeometry.addSubGeometry({
      indexStart: 0,
      indexCount: this.initIndeiceArr.length,
      vertexStart: 0,
      vertexCount: 0,
      firstStart: 0,
      index: 0,
      topology: 0,
    });

    // 초기 meterial 생성
    this.initMaterial = new LitMaterial();

    // root 생성
    this.root = new Object3D();
    const mr = this.root.addComponent(MeshRenderer);
    mr.geometry = this.initGeometry;
    mr.material = this.initMaterial;
  }

  public changeGeometry(data: GeometryData) {
    this.initGeometry.setIndices2(new Uint32Array(data.indeice_arr));
    this.initGeometry.setAttribute2(
      VertexAttributeName.position,
      new Float32Array(data.vertex_arr)
    );
    this.initGeometry.setAttribute2(
      VertexAttributeName.normal,
      new Float32Array(data.normal_arr)
    );
    this.initGeometry.setAttribute2(
      VertexAttributeName.uv,
      new Float32Array(data.uv_arr)
    );
    this.initGeometry.setAttribute2(
      VertexAttributeName.TEXCOORD_1,
      new Float32Array(data.uv_arr)
    );
  }
}
