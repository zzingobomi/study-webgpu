import { MeshRenderer } from "../../../components/renderer/MeshRenderer";
import { Object3D } from "../../../core/entities/Object3D";
import { GeometryBase } from "../../../core/geometry/GeometryBase";
import { VertexAttributeName } from "../../../core/geometry/VertexAttributeName";
import { LitMaterial } from "../../../materials/LitMaterial";
import { QdrantData } from "./QdrantData";

// TODO: 단순한 수치가 아닌.. 실제 용량으로 구해야 할거 같은데
export class HoriLand extends Object3D {
  public geometry: GeometryBase;

  constructor() {
    super();
    this.geometry = new GeometryBase();

    this.geometry.initIndices();
    this.geometry.setAttribute(
      VertexAttributeName.position,
      new Float32Array(48000)
    );
    this.geometry.setAttribute(
      VertexAttributeName.normal,
      new Float32Array(48000)
    );
    this.geometry.setAttribute(VertexAttributeName.uv, new Float32Array(8000));
    this.geometry.setAttribute(
      VertexAttributeName.TEXCOORD_1,
      new Float32Array(32000)
    );
    this.geometry.addSubGeometry({
      indexStart: 0,
      indexCount: 48000,
      vertexStart: 0,
      vertexCount: 0,
      firstStart: 0,
      index: 0,
      topology: 0,
    });

    const mat = new LitMaterial();

    const mr = this.addComponent(MeshRenderer);
    mr.geometry = this.geometry;
    mr.material = mat;
  }

  public updateQdrantData(qdrantData: QdrantData) {
    // TODO: payload 에서 geometry 와 material 을 이용해서 만들어줘야 할거 같은데...
    // geometry pool 을 이용해야 하나..?

    // Geometry Update
    this.geometry.indicesBuffer.upload(new Uint32Array(qdrantData.indeiceArr));

    const vertexBuffer = this.geometry.vertexBuffer;
    vertexBuffer.vertexCount = qdrantData.indeiceArr.length;
    vertexBuffer.upload(VertexAttributeName.position, {
      attribute: VertexAttributeName.position,
      data: new Float32Array(qdrantData.vertexArr),
    });
    vertexBuffer.upload(VertexAttributeName.normal, {
      attribute: VertexAttributeName.normal,
      data: new Float32Array(qdrantData.normalArr),
    });
    vertexBuffer.upload(VertexAttributeName.uv, {
      attribute: VertexAttributeName.uv,
      data: new Float32Array(qdrantData.uvArr),
    });
    vertexBuffer.upload(VertexAttributeName.TEXCOORD_1, {
      attribute: VertexAttributeName.TEXCOORD_1,
      data: new Float32Array(qdrantData.uvArr),
    });

    this.geometry.subGeometries[0].lodLevels[0].indexCount =
      qdrantData.indeiceArr.length;
  }
}
