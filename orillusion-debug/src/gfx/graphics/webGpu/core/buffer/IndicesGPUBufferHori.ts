import { MemoryDO } from "../../../../../core/pool/memory/MemoryDO";
import { MemoryInfo } from "../../../../../core/pool/memory/MemoryInfo";
import { webGPUContext } from "../../Context3D";
import { ArrayBufferData } from "./ArrayBufferData";
import { GPUBufferBase } from "./GPUBufferBase";
import { GPUBufferType } from "./GPUBufferType";

/**
 * The buffer use at geometry indices
 * written in the computer shader or CPU Coder
 * usage GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.INDEX | GPUBufferUsage.INDIRECT
 * @group GFX
 */
export class IndicesGPUBufferHori extends GPUBufferBase {
  public indicesNode: MemoryInfo;
  constructor() {
    super();
    this.bufferType = GPUBufferType.IndicesGPUBuffer;
    this.createIndicesBuffer(
      GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.INDEX |
        GPUBufferUsage.INDIRECT
    );
  }

  protected createIndicesBuffer(usage: GPUBufferUsageFlags) {
    let device = webGPUContext.device;
    this.byteSize = 12000;
    this.usage = usage;
    if (this.buffer) {
      this.destroy();
    }
    this.buffer = device.createBuffer({
      label: "IndicesGPUBuffer",
      size: this.byteSize,
      usage: usage,
      mappedAtCreation: false,
    });

    this.memory = new MemoryDO();
    this.memoryNodes = new Map<string | number, MemoryInfo>();
    this.memory.allocation(this.byteSize);
    this.indicesNode = this.memory.allocation_node(12000);
  }
}
