import { Engine3D } from "../../Engine3D";
import { StringUtil } from "../../util/StringUtil";
import { FileLoader } from "../FileLoader";
import { ParserBase } from "./ParserBase";
import { ParserFormat } from "./ParserFormat";

type MatData = {
  name?: string;
  Kd?: string[];
  Ks?: string[];
  Tr?: string;
  d?: string[];
  Tf?: string[];
  Pr?: string;
  Pm?: string;
  Pc?: string;
  Pcr?: string;
  Ni?: string;
  Kr?: string[];
  illum?: string;
  map_Kd?: string;
  textures?: string[];
};

type GeometryData = {
  name: string;
  type: string;

  vertex_arr?: number[];
  normal_arr?: number[];
  uv_arr?: number[];
  indeice_arr?: number[];
  index?: number;

  source_mat: string;
  source_faces: Face[];
};

type Face = {
  indices: string[];
  texture: string[];
  normal: string[];
};

export class OBJParser extends ParserBase {
  static format: ParserFormat = ParserFormat.TEXT;
  private textData: string = "";

  private source_vertices: number[][];
  private source_normals: number[][];
  private source_tangents: number[][];
  private source_textureCoords: number[][];

  public matLibs: { [name: string]: MatData };

  public geometrys: { [name: string]: GeometryData };
  private activeGeo: GeometryData;

  public facesMaterialsIndex: {
    materialName: string;
    materialStartIndex: number;
  }[];

  public mtl: string;
  mtlUrl: string;

  async parseString(obj: string) {
    this.source_vertices = [];
    this.source_normals = [];
    this.source_tangents = [];
    this.source_textureCoords = [];

    this.matLibs = {};
    this.geometrys = {};

    this.textData = obj;
    // load bin & texture together
    await Promise.all([this.parserOBJ(), this.loadMTL()]);
    this.parser_mesh();
    return `null`;
  }

  private async parserOBJ() {
    let str = this.textData.split("\r\n");
    for (let i = 0; i < str.length; i++) {
      const element = str[i];
      this.parserLine(element);
    }
    this.textData = ``;
    return true;
  }

  private async loadMTL() {
    let fileLoad = new FileLoader();
    let sourceData = await fileLoad.loadTxt(this.baseUrl + this.mtlUrl);
    let sourceStr: string = sourceData[`data`];

    let mat: MatData;

    let str = sourceStr.split("\r\n");
    for (let i = 0; i < str.length; i++) {
      let line = str[i];
      var commentStart = line.indexOf("#");
      if (commentStart != -1) {
        line = line.substring(0, commentStart);
      }
      line = line.trim();
      var splitedLine = line.split(/\s+/);
      if (splitedLine[0] === "newmtl") {
        mat = { name: splitedLine[1] };
        this.matLibs[splitedLine[1]] = mat;
      } else {
        if (splitedLine[0].indexOf(`map_`) != -1) {
          mat[splitedLine[0]] = splitedLine[1];
          if (!mat.textures) {
            mat.textures = [splitedLine[splitedLine.length - 1]];
          }
          mat.textures.push(splitedLine[splitedLine.length - 1]);
        } else if (splitedLine.length == 2) {
          mat[splitedLine[0]] = Number(splitedLine[1]);
        } else if (splitedLine.length == 3) {
          mat[splitedLine[0]] = [
            Number(splitedLine[1]),
            Number(splitedLine[2]),
          ];
        } else if (splitedLine.length == 4) {
          mat[splitedLine[0]] = [
            Number(splitedLine[1]),
            Number(splitedLine[2]),
            Number(splitedLine[3]),
          ];
        }
      }
    }

    // TODO:
    // for (const key in this.matLibs) {
    //   const mat = this.matLibs[key];
    //   if (mat.textures && mat.textures.length > 0) {
    //     for (let i = 0; i < mat.textures.length; i++) {
    //       const texUrl = StringUtil.normalizePath(
    //         this.baseUrl + mat.textures[i]
    //       );
    //       await Engine3D.res.loadTexture(texUrl);
    //     }
    //   }
    // }

    sourceData = null;
    return true;
  }

  private parserLine(line: string) {
    var commentStart = line.indexOf("#");
    if (commentStart != -1) {
      // TODO: object 로 시작 안하고 o로 시작하거나 없는 경우도 처리해야 할듯..
      if (line.indexOf(`# object`) != -1) {
        var splitedLine = line.split(/\s+/);
        let type = splitedLine[1];
        let geoName = splitedLine[2];
        this.activeGeo = {
          type: type,
          name: geoName[1],
          source_mat: ``,
          source_faces: [],
        };
        this.geometrys[geoName] = this.activeGeo;
      }
      line = line.substring(0, commentStart);
    }
    line = line.trim();
    var splitedLine = line.split(/\s+/);

    if (splitedLine[0] === "v") {
      var vertex = [
        Number(splitedLine[1]),
        Number(splitedLine[2]),
        Number(splitedLine[3]),
        splitedLine[4] ? 1 : Number(splitedLine[4]),
      ];
      this.source_vertices.push(vertex);
    } else if (splitedLine[0] === "vt") {
      var textureCoord = [
        Number(splitedLine[1]),
        Number(splitedLine[2]),
        splitedLine[3] ? 1 : Number(splitedLine[3]),
      ];
      this.source_textureCoords.push(textureCoord);
    } else if (splitedLine[0] === "vn") {
      var normal = [
        Number(splitedLine[1]),
        Number(splitedLine[2]),
        Number(splitedLine[3]),
      ];
      this.source_normals.push(normal);
    } else if (splitedLine[0] === "f") {
      var face: Face = {
        indices: [],
        texture: [],
        normal: [],
      };

      for (var i = 1; i < splitedLine.length; ++i) {
        var dIndex = splitedLine[i].indexOf("//");
        var splitedFaceIndices = splitedLine[i].split(/\W+/);

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

      this.activeGeo.source_faces.push(face);
    } else if (splitedLine[0] === "usemtl") {
      this.activeGeo.source_mat = splitedLine[1];
    } else if (splitedLine[0] === `mtllib`) {
      this.mtlUrl = splitedLine[1];
    }
  }

  private async parser_mesh() {}
}
