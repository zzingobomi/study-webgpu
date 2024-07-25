import { MeshRenderer } from "../../../components/renderer/MeshRenderer";
import { Object3D } from "../../../core/entities/Object3D";
import { GeometryBase } from "../../../core/geometry/GeometryBase";
import { VertexAttributeName } from "../../../core/geometry/VertexAttributeName";
import { LitMaterial } from "../../../materials/LitMaterial";
import { Material } from "../../../materials/Material";
import { QdrantData } from "./QdrantData";

// TODO: 단순한 수치가 아닌.. 실제 용량으로 구해야 할거 같은데
// FPS 가 떨어지진 않는거 같은데.. 왜 바로바로 geometry 가 업데이트가 안되고 한참후에 업데이트 되지?

export class HoriLand extends Object3D {
  public subObjectPool: Map<string, Object3D> = new Map();

  constructor() {
    super();
  }

  public updateQdrantData(qdrantDataMap: Map<string, QdrantData>) {
    for (const key of qdrantDataMap.keys()) {
      const qdrantData = qdrantDataMap.get(key);
      const subObject = this.loadSubObject(key);

      const geometry = subObject.getComponent(MeshRenderer).geometry;

      geometry.indicesBuffer.upload(new Uint32Array(qdrantData.indeiceArr));

      const vertexBuffer = geometry.vertexBuffer;

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
      geometry.subGeometries[0].lodLevels[0].indexCount =
        qdrantData.indeiceArr.length;
    }
  }

  public loadSubObject(name: string) {
    if (this.subObjectPool.has(name)) {
      return this.subObjectPool.get(name);
    }

    // create geometry
    const geometry = new GeometryBase();
    geometry.initIndices();
    geometry.setAttribute(
      VertexAttributeName.position,
      new Float32Array(48000)
    );
    geometry.setAttribute(VertexAttributeName.normal, new Float32Array(48000));
    geometry.setAttribute(VertexAttributeName.uv, new Float32Array(8000));
    geometry.setAttribute(
      VertexAttributeName.TEXCOORD_1,
      new Float32Array(32000)
    );
    geometry.addSubGeometry({
      indexStart: 0,
      indexCount: 48000,
      vertexStart: 0,
      vertexCount: 0,
      firstStart: 0,
      index: 0,
      topology: 0,
    });

    // create material
    const mat = new LitMaterial();

    // create object3d
    const object3d = new Object3D();
    const mr = object3d.addComponent(MeshRenderer);
    mr.geometry = geometry;
    mr.material = mat;

    this.subObjectPool.set(name, object3d);
    this.addChild(object3d);
    return object3d;
  }
}
