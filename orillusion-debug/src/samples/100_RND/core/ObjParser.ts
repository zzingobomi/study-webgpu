import { MeshRenderer } from "../../../components/renderer/MeshRenderer";
import { Object3D } from "../../../core/entities/Object3D";
import { GeometryBase } from "../../../core/geometry/GeometryBase";
import { VertexAttributeName } from "../../../core/geometry/VertexAttributeName";
import { LitMaterial } from "../../../materials/LitMaterial";
import { Face, GeometryData } from "./GeometryData";
import { applyVector2, applyVector3 } from "./utils";

export class ObjParser {
  public sourceVertices: number[][] = [];
  public sourceNormals: number[][] = [];
  public sourceTextureCoords: number[][] = [];

  public geometries: { [name: string]: GeometryData } = {};
  public activeGeo: GeometryData;

  public async parserObj(text: string) {
    let str = text.split("\n");
    for (let i = 0; i < str.length; i++) {
      const element = str[i];
      this.parserLine(element);
    }
  }

  public async createGeometry() {
    const root = new Object3D();
    for (const key in this.geometries) {
      const geoData = this.geometries[key];

      geoData.vertexArr = [];
      geoData.normalArr = [];
      geoData.uvArr = [];
      geoData.indeiceArr = [];

      let index = 0;
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

        applyVector3(f0, this.sourceVertices, geoData.vertexArr);
        applyVector3(n0, this.sourceNormals, geoData.normalArr);
        applyVector2(u0, this.sourceTextureCoords, geoData.uvArr);
        geoData.indeiceArr[index] = index++;

        applyVector3(f1, this.sourceVertices, geoData.vertexArr);
        applyVector3(n1, this.sourceNormals, geoData.normalArr);
        applyVector2(u1, this.sourceTextureCoords, geoData.uvArr);
        geoData.indeiceArr[index] = index++;

        applyVector3(f2, this.sourceVertices, geoData.vertexArr);
        applyVector3(n2, this.sourceNormals, geoData.normalArr);
        applyVector2(u2, this.sourceTextureCoords, geoData.uvArr);
        geoData.indeiceArr[index] = index++;

        // TODO: 무조건 face 는 정점이 3개만 있도록 통일을 시켜야 하나?
        if (face.indices.length > 3) {
          const f3 = parseInt(face.indices[3]) - 1;
          const n3 = parseInt(face.normal[3]) - 1;
          const u3 = parseInt(face.texture[3]) - 1;
          applyVector3(f0, this.sourceVertices, geoData.vertexArr);
          applyVector3(n0, this.sourceNormals, geoData.normalArr);
          applyVector2(u0, this.sourceTextureCoords, geoData.uvArr);
          geoData.indeiceArr[index] = index++;

          applyVector3(f2, this.sourceVertices, geoData.vertexArr);
          applyVector3(n2, this.sourceNormals, geoData.normalArr);
          applyVector2(u2, this.sourceTextureCoords, geoData.uvArr);
          geoData.indeiceArr[index] = index++;

          applyVector3(f3, this.sourceVertices, geoData.vertexArr);
          applyVector3(n3, this.sourceNormals, geoData.normalArr);
          applyVector2(u3, this.sourceTextureCoords, geoData.uvArr);
          geoData.indeiceArr[index] = index++;
        }

        const geo: GeometryBase = new GeometryBase();
        geo.setIndices(new Uint32Array(geoData.indeiceArr));
        geo.setAttribute(
          VertexAttributeName.position,
          new Float32Array(geoData.vertexArr)
        );
        geo.setAttribute(
          VertexAttributeName.normal,
          new Float32Array(geoData.normalArr)
        );
        geo.setAttribute(
          VertexAttributeName.uv,
          new Float32Array(geoData.uvArr)
        );
        geo.setAttribute(
          VertexAttributeName.TEXCOORD_1,
          new Float32Array(geoData.uvArr)
        );

        geo.addSubGeometry({
          indexStart: 0,
          indexCount: geoData.indeiceArr.length,
          vertexStart: 0,
          vertexCount: 0,
          firstStart: 0,
          index: 0,
          topology: 0,
        });

        // TODO: 메테리얼이 왜 적용이 안되나?
        const mat = new LitMaterial();
        // const matData = this.matLibs[geoData.source_mat];
        // mat.baseMap = Engine3D.res.getTexture(
        //   StringUtil.normalizePath("/" + matData.map_Kd)
        // );

        const obj = new Object3D();
        const mr = obj.addComponent(MeshRenderer);
        mr.geometry = geo;
        mr.material = mat;
        root.addChild(obj);
      }
    }

    return root;
  }

  private parserLine(line: string) {
    if (line === "" || line.startsWith("#")) return;

    const splitedLine = line.trim().split(/\s+/);

    if (splitedLine[0] === "o") {
      const geoName = splitedLine[1];
      this.activeGeo = {
        name: geoName,
        sourceMat: "",
        sourceFaces: [],
      };
      this.geometries[geoName] = this.activeGeo;
    } else if (splitedLine[0] === "v") {
      const vertex = [
        Number(splitedLine[1]),
        Number(splitedLine[2]),
        Number(splitedLine[3]),
        splitedLine[4] ? 1 : Number(splitedLine[4]),
      ];
      this.sourceVertices.push(vertex);
    } else if (splitedLine[0] === "vt") {
      const textureCoord = [
        Number(splitedLine[1]),
        Number(splitedLine[2]),
        splitedLine[3] ? 1 : Number(splitedLine[3]),
      ];
      this.sourceTextureCoords.push(textureCoord);
    } else if (splitedLine[0] === "vn") {
      const normal = [
        Number(splitedLine[1]),
        Number(splitedLine[2]),
        Number(splitedLine[3]),
      ];
      this.sourceNormals.push(normal);
    } else if (splitedLine[0] === "f") {
      const face: Face = {
        indices: [],
        texture: [],
        normal: [],
      };

      for (let i = 1; i < splitedLine.length; ++i) {
        const dIndex = splitedLine[i].indexOf("//");
        const splitedFaceIndices = splitedLine[i].split(/\W+/);

        if (dIndex > 0) {
          /*Vertex Normal Indices Without Texture Coordinate Indices*/
          face.indices.push(splitedFaceIndices[0]);
          face.normal.push(splitedFaceIndices[1]);
        } else {
          if (splitedFaceIndices.length === 1) {
            /*Vertex Indices*/
            face.indices.push(splitedFaceIndices[0]);
          } else if (splitedFaceIndices.length === 2) {
            /*Vertex Texture Coordinate Indices*/
            face.indices.push(splitedFaceIndices[0]);
            face.texture.push(splitedFaceIndices[1]);
          } else if (splitedFaceIndices.length === 3) {
            /*Vertex Normal Indices*/
            face.indices.push(splitedFaceIndices[0]);
            face.texture.push(splitedFaceIndices[1]);
            face.normal.push(splitedFaceIndices[2]);
          }
        }
      }

      this.activeGeo.sourceFaces.push(face);
    } else if (splitedLine[0] === "usemtl") {
      this.activeGeo.sourceMat = splitedLine[1];
    } else if (splitedLine[0] === `mtllib`) {
    }
  }
}
