import { ArrayBufferData } from "../../gfx/graphics/webGpu/core/buffer/ArrayBufferData";
import { IndicesGPUBufferHori } from "../../gfx/graphics/webGpu/core/buffer/IndicesGPUBufferHori";

export class GeometryIndicesBufferHori {
  public uuid: string = "";
  public name: string;
  public indicesGPUBuffer: IndicesGPUBufferHori;
  public indicesFormat: GPUIndexFormat = "uint32";
  public indicesCount: number = 0;
  constructor() {}

  public createIndicesBuffer() {
    this.indicesGPUBuffer = new IndicesGPUBufferHori();
  }

  public upload(data: ArrayBufferData) {
    this.indicesGPUBuffer.indicesNode.setArrayBuffer(0, data as ArrayBuffer);
    this.indicesGPUBuffer.apply();
  }

  public compute() {}

  destroy() {
    this.uuid = null;
    this.name = null;
    this.indicesFormat = null;
    this.indicesCount = null;
    this.indicesGPUBuffer.destroy();
    this.indicesGPUBuffer = null;
  }

  /**
   * Get indices from geometry data
   * Get position attribute from geometry data
   * Get normal attribute from geometry data
   * Get tangent attribute from geometry data
   * Get uv0 attribute from geometry data
   * Get uv1 attribute from geometry data
   * Get uv2 attribute from geometry data
   *
   * Change position data to GPUBuffer and apply
   * Change normal data to GPUBuffer and apply
   * Change tangent data to GPUBuffer and apply
   * Change uv0 data to GPUBuffer and apply
   * Change uv1 data to GPUBuffer and apply
   * Change uv2 data to GPUBuffer and apply
   */
}
