import { StandShader } from "../loader/parser/prefab/mats/shader/StandShader";
import { Material } from "./Material";

export class LitMaterial extends Material {
  constructor() {
    super();

    let shader = new StandShader();
    this.shader = shader;
  }
}
