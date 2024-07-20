import { MeshRenderer } from "../../../components/renderer/MeshRenderer";
import { Object3D } from "../../../core/entities/Object3D";
import { GeometryBase } from "../../../core/geometry/GeometryBase";
import { VertexAttributeName } from "../../../core/geometry/VertexAttributeName";
import { LitMaterial } from "../../../materials/LitMaterial";
import { QdrantGeoData } from "./QdrantData";
export class HoriLand extends Object3D {
  public geometry: GeometryBase;

  constructor() {
    super();
    this.geometry = new GeometryBase();

    this.geometry.initIndices();
    this.geometry.setAttribute(
      VertexAttributeName.position,
      new Float32Array(12000)
    );
    this.geometry.setAttribute(
      VertexAttributeName.normal,
      new Float32Array(12000)
    );
    this.geometry.setAttribute(VertexAttributeName.uv, new Float32Array(8000));
    this.geometry.setAttribute(
      VertexAttributeName.TEXCOORD_1,
      new Float32Array(8000)
    );
    this.geometry.addSubGeometry({
      indexStart: 0,
      indexCount: 12000,
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

  public updateGeometry(geoData: QdrantGeoData) {
    this.geometry.indicesBuffer.upload(new Uint32Array(geoData.indeiceArr));

    const vertexBuffer = this.geometry.vertexBuffer;
    vertexBuffer.vertexCount = geoData.indeiceArr.length;
    vertexBuffer.upload(VertexAttributeName.position, {
      attribute: VertexAttributeName.position,
      data: new Float32Array(geoData.vertexArr),
    });
    vertexBuffer.upload(VertexAttributeName.normal, {
      attribute: VertexAttributeName.normal,
      data: new Float32Array(geoData.normalArr),
    });
    vertexBuffer.upload(VertexAttributeName.uv, {
      attribute: VertexAttributeName.uv,
      data: new Float32Array(geoData.uvArr),
    });
    vertexBuffer.upload(VertexAttributeName.TEXCOORD_1, {
      attribute: VertexAttributeName.TEXCOORD_1,
      data: new Float32Array(geoData.uvArr),
    });

    this.geometry.subGeometries[0].lodLevels[0].indexCount =
      geoData.indeiceArr.length;
  }
}
