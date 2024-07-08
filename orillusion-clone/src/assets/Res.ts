import { Object3D } from "../core/entities/Object3D";
import { FileLoader } from "../loader/FileLoader";
import { LoaderFunctions } from "../loader/LoaderFunctions";
import { OBJParser } from "../loader/parser/OBJParser";

export class Res {
  //private _texturePool: Map<string, Texture>;
  private _prefabPool: Map<string, Object3D>;

  constructor() {
    this._prefabPool = new Map<string, Object3D>();
  }

  public async loadObj(
    url: string,
    loaderFunctions?: LoaderFunctions
  ): Promise<Object3D> {
    if (this._prefabPool.has(url)) {
      return this._prefabPool.get(url) as Object3D;
    }

    let parser;
    let ext = url.substring(url.lastIndexOf(".")).toLowerCase();
    let loader = new FileLoader();
    if (ext == ".obj") {
      parser = await loader.load(url, OBJParser, loaderFunctions);
    }
    let obj = parser?.data as Object3D;
    this._prefabPool.set(url, obj);
    return obj;
  }

  // public async loadTexture(
  //   url: string,
  //   loaderFunctions?: LoaderFunctions,
  //   flipY?: boolean
  // ) {
  //   if (this._texturePool.has(url)) {
  //     return this._texturePool.get(url);
  //   }
  //   let texture = new BitmapTexture2D();
  //   texture.flipY = flipY;
  //   await texture.load(url, loaderFunctions);
  //   this._texturePool.set(url, texture);
  //   return texture;
  // }
}
