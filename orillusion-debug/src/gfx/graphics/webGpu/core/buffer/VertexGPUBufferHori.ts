import { MemoryDO } from "../../../../../core/pool/memory/MemoryDO";
import { MemoryInfo } from "../../../../../core/pool/memory/MemoryInfo";
import { webGPUContext } from "../../Context3D";
import { GPUBufferBase } from "./GPUBufferBase";
import { GPUBufferType } from "./GPUBufferType";

/**
 * The buffer use at geometry indices
 * written in the computer shader or CPU Coder
 * usage GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX
 * @group GFX
 */
export class VertexGPUBufferHori extends GPUBufferBase {
  public node: MemoryInfo;
  constructor() {
    super();
    this.bufferType = GPUBufferType.VertexGPUBuffer;
    this.createVertexBuffer(
      GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX
    );
  }

  protected createVertexBuffer(usage: GPUBufferUsageFlags) {
    let device = webGPUContext.device;
    this.byteSize = 12000;
    this.usage = usage;
    if (this.buffer) {
      this.destroy();
    }
    this.buffer = device.createBuffer({
      label: "VertexGPUBuffer",
      size: this.byteSize,
      usage: usage,
      mappedAtCreation: false,
    });

    this.memory = new MemoryDO();
    this.memoryNodes = new Map<string | number, MemoryInfo>();
    this.memory.allocation(this.byteSize);
    this.node = this.memory.allocation_node(this.byteSize);
    // this.outFloat32Array = new Float32Array(size);
  }
}
