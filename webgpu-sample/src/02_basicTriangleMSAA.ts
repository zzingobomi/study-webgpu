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

// create a simple pipeline with multiSample
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
    multisample: {
      count: 4,
    },
  };

  return await device.createRenderPipelineAsync(descriptor);
}

// create & submit device commands
function draw(
  device: GPUDevice,
  context: GPUCanvasContext,
  pipeline: GPURenderPipeline,
  MSAAView: GPUTextureView
) {
  const commandEncoder = device.createCommandEncoder();
  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: MSAAView,
        resolveTarget: context.getCurrentTexture().createView(),
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
  const { device, context, format, size } = await initWebGPU(canvas);
  const pipeline = await initPipeline(device, format);
  // create 4x samplecount texture
  let MSAATexture = device.createTexture({
    size,
    format,
    sampleCount: 4,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  let MSAAView = MSAATexture.createView();
  // start draw
  draw(device, context, pipeline, MSAAView);

  // re-configure context on resize
  window.addEventListener("resize", () => {
    size.width = canvas.width = canvas.clientWidth * devicePixelRatio;
    size.height = canvas.height = canvas.clientHeight * devicePixelRatio;
    // don't need to recall context.configure() after v104
    MSAATexture.destroy();
    MSAATexture = device.createTexture({
      size,
      format,
      sampleCount: 4,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    MSAAView = MSAATexture.createView();
    draw(device, context, pipeline, MSAAView);
  });
}

run();
