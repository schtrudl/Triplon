// @ts-check

import { mat4 } from "../../extern/glm/index.js";

import * as WebGPU from "../../engine/WebGPU.js";

import {
    Node,
    Camera,
    Texture,
    Material,
    Sampler,
    Primitive,
    Model,
} from "../../engine/core.js";

import {
    getLocalModelMatrix,
    getGlobalViewMatrix,
    getProjectionMatrix,
    getModels,
} from "../../engine/core/SceneUtils.js";

import { BaseRenderer } from "../../engine/renderers/BaseRenderer.js";
import {
    generateMipmaps2D,
    mipLevelCount,
} from "../../engine/WebGPUMipmaps.js";

/**
 * @type {GPUVertexBufferLayout}
 */
const vertexBufferLayout = {
    arrayStride: 20,
    attributes: [
        {
            // @ts-ignore
            name: "position",
            shaderLocation: 0,
            offset: 0,
            format: "float32x3",
        },
        {
            name: "texcoords",
            shaderLocation: 1,
            offset: 12,
            format: "float32x2",
        },
    ],
};

export class RinzlerRenderer extends BaseRenderer {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        super(canvas);
    }

    async initialize() {
        await super.initialize();

        const code = await fetch(
            new URL("RinzlerRenderer.wgsl", import.meta.url),
        ).then((response) => response.text());
        const module = this.device.createShaderModule({ code });

        this.pipeline = await this.device.createRenderPipelineAsync({
            layout: "auto",
            vertex: {
                module,
                buffers: [vertexBufferLayout],
            },
            fragment: {
                module,
                targets: [{ format: this.format }],
            },
            depthStencil: {
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less",
            },
        });

        this.recreateDepthTexture();
        // dummy texture used for textureless meshes
        // https://github.com/gpuweb/gpuweb/issues/851
        this.dummy_tex = this.prepareDummyTexture();
    }

    recreateDepthTexture() {
        this.depthTexture?.destroy();
        this.depthTexture = this.device.createTexture({
            format: "depth24plus",
            size: [this.canvas.width, this.canvas.height],
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }

    /**
     * @param {Node} node
     */
    prepareNode(node) {
        if (this.gpuObjects.has(node)) {
            return this.gpuObjects.get(node);
        }

        const modelUniformBuffer = this.device.createBuffer({
            size: 128,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const modelBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(1),
            entries: [{ binding: 0, resource: { buffer: modelUniformBuffer } }],
        });

        const gpuObjects = { modelUniformBuffer, modelBindGroup };
        this.gpuObjects.set(node, gpuObjects);
        return gpuObjects;
    }

    /**
     * @param {Camera} camera
     */
    prepareCamera(camera) {
        if (this.gpuObjects.has(camera)) {
            return this.gpuObjects.get(camera);
        }

        const cameraUniformBuffer = this.device.createBuffer({
            size: 128,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const cameraBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: cameraUniformBuffer } },
            ],
        });

        const gpuObjects = { cameraUniformBuffer, cameraBindGroup };
        this.gpuObjects.set(camera, gpuObjects);
        return gpuObjects;
    }

    prepareDummyTexture() {
        let dummy_data = new Uint8Array([255, 255, 255, 255]);
        const gpuTexture = WebGPU.createTextureFromData(this.device, {
            data: dummy_data.buffer,
            size: [1, 1, 1],
            bytesPerRow: dummy_data.byteLength,
            rowsPerImage: 1,
            usage: GPUTextureUsage.TEXTURE_BINDING,
        });
        const { gpuSampler } = this.prepareSampler(new Sampler());
        return { gpuTexture, gpuSampler };
    }

    prepareImage(image, isSRGB = false, mipmap = true) {
        if (!mipmap) {
            return super.prepareImage(image, isSRGB);
        }
        if (this.gpuObjects.has(image)) {
            return this.gpuObjects.get(image);
        }

        const size = [image.width, image.height];

        const gpuTexture = WebGPU.createTexture(this.device, {
            source: image,
            mipLevelCount: mipLevelCount(size),
            format: isSRGB ? "rgba8unorm-srgb" : "rgba8unorm",
        });

        generateMipmaps2D(this.device, gpuTexture);

        const gpuObjects = { gpuTexture };
        this.gpuObjects.set(image, gpuObjects);
        return gpuObjects;
    }

    /**
     * @param {Texture} texture
     */
    prepareTexture(texture) {
        if (this.gpuObjects.has(texture)) {
            return this.gpuObjects.get(texture);
        }

        const { gpuTexture } = this.prepareImage(
            texture.image,
            false,
            texture.mipmap,
        );
        const { gpuSampler } = this.prepareSampler(texture.sampler);

        const gpuObjects = { gpuTexture, gpuSampler };
        this.gpuObjects.set(texture, gpuObjects);
        return gpuObjects;
    }

    /**
     * @param {Material} material
     */
    prepareMaterial(material) {
        if (this.gpuObjects.has(material)) {
            return this.gpuObjects.get(material);
        }

        let baseTexture;
        if (material.baseTexture) {
            baseTexture = this.prepareTexture(material.baseTexture);
        } else {
            baseTexture = this.dummy_tex;
        }

        const materialUniformBuffer = this.device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const materialBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(2),
            entries: [
                { binding: 0, resource: { buffer: materialUniformBuffer } },
                { binding: 1, resource: baseTexture.gpuTexture.createView() },
                { binding: 2, resource: baseTexture.gpuSampler },
            ],
        });

        const gpuObjects = { materialUniformBuffer, materialBindGroup };
        this.gpuObjects.set(material, gpuObjects);
        return gpuObjects;
    }

    /**
     * @param {Node} scene
     * @param {Node} camera
     */
    render(scene, camera) {
        if (
            this.depthTexture.width !== this.canvas.width ||
            this.depthTexture.height !== this.canvas.height
        ) {
            this.recreateDepthTexture();
        }

        const encoder = this.device.createCommandEncoder();
        this.renderPass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.context.getCurrentTexture().createView(),
                    //clearValue: [1, 1, 1, 1],
                    loadOp: "clear",
                    storeOp: "store",
                },
            ],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1,
                depthLoadOp: "clear",
                depthStoreOp: "discard",
            },
        });
        this.renderPass.setPipeline(this.pipeline);

        const cameraComponent = camera.getComponentOfType(Camera);
        const viewMatrix = getGlobalViewMatrix(camera);
        const projectionMatrix = getProjectionMatrix(camera);
        const { cameraUniformBuffer, cameraBindGroup } =
            this.prepareCamera(cameraComponent);
        this.device.queue.writeBuffer(cameraUniformBuffer, 0, viewMatrix);
        this.device.queue.writeBuffer(
            cameraUniformBuffer,
            64,
            projectionMatrix,
        );
        this.renderPass.setBindGroup(0, cameraBindGroup);

        this.renderNode(scene);

        this.renderPass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    /**
     * @param {Node} node
     * @param {import("extern/glm/mat4.js").Mat4Like} modelMatrix
     */
    renderNode(node, modelMatrix = mat4.create()) {
        const localMatrix = getLocalModelMatrix(node);
        modelMatrix = mat4.multiply(mat4.create(), modelMatrix, localMatrix);
        const normalMatrix = mat4.normalFromMat4(mat4.create(), modelMatrix);

        const { modelUniformBuffer, modelBindGroup } = this.prepareNode(node);
        // @ts-ignore
        this.device.queue.writeBuffer(modelUniformBuffer, 0, modelMatrix);
        // @ts-ignore
        this.device.queue.writeBuffer(modelUniformBuffer, 64, normalMatrix);
        this.renderPass.setBindGroup(1, modelBindGroup);

        for (const model of getModels(node)) {
            this.renderModel(model);
        }

        for (const child of node.children) {
            this.renderNode(child, modelMatrix);
        }
    }

    /**
     * @param {Model} model
     */
    renderModel(model) {
        for (const primitive of model.primitives) {
            this.renderPrimitive(primitive);
        }
    }

    /**
     * @param {Primitive} primitive
     */
    renderPrimitive(primitive) {
        const { materialUniformBuffer, materialBindGroup } =
            this.prepareMaterial(primitive.material);
        this.device.queue.writeBuffer(
            materialUniformBuffer,
            0,
            new Float32Array(primitive.material.baseFactor),
        );
        this.renderPass.setBindGroup(2, materialBindGroup);

        const { vertexBuffer, indexBuffer } = this.prepareMesh(
            primitive.mesh,
            vertexBufferLayout,
        );
        this.renderPass.setVertexBuffer(0, vertexBuffer);
        this.renderPass.setIndexBuffer(indexBuffer, "uint32");

        this.renderPass.drawIndexed(primitive.mesh.indices.length);
    }
}
