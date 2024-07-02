import triangleVert from "./shaders/triangle.vert.wgsl?raw";
import redFrag from "./shaders/red.frag.wgsl?raw";

// @ts-ignore
// initialize webgpu & config canvas context
async function initWebGPU(canvas: HTMLCanvasElement) {
  if (!navigator.gpu) {
    throw new Error("Not support WebGPU");
  }
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });
  if (!adapter) {
    throw new Error("No adapter found");
  }
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  const size = { width: canvas.width, height: canvas.height };
  context.configure({
    device,
    format,
    alphaMode: "opaque",
  });

  return { device, context, format, size };
}

// create simple pipeline
async function initPipeline(
  device: GPUDevice,
  format: GPUTextureFormat
): Promise<GPURenderPipeline> {
  const descriptor: GPURenderPipelineDescriptor = {
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: triangleVert,
      }),
      entryPoint: "main",
    },
    primitive: {
      topology: "triangle-list",
    },
    fragment: {
      module: device.createShaderModule({
        code: redFrag,
      }),
      entryPoint: "main",
      targets: [{ format: format }],
    },
  };

  return await device.createRenderPipelineAsync(descriptor);
}

// create & submit device commands
function draw(
  device: GPUDevice,
  context: GPUCanvasContext,
  pipeline: GPURenderPipeline
) {
  const commandEncoder = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();
  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: view,
        clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };
  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
  passEncoder.setPipeline(pipeline);
  // 3 vertex form a triangle
  passEncoder.draw(3);
  passEncoder.end();
  // webgpu run in a separate process, all the commands will be executed after submit
  device.queue.submit([commandEncoder.finish()]);
}

async function run() {
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("No Canvas");
  }
  const { device, context, format } = await initWebGPU(canvas);
  const pipeline = await initPipeline(device, format);
  // start draw
  draw(device, context, pipeline);

  // re-configure context on resize
  window.addEventListener("resize", () => {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    // don't need to recall context.configure() after v104
    draw(device, context, pipeline);
  });
}

run();
