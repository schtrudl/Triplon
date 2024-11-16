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
                targets: [
                    {
                        format: this.format,
                        blend: {
                            color: {
                                operation: "add",
                                srcFactor: "one",
                                dstFactor: "one-minus-src-alpha",
                            },
                            alpha: {
                                operation: "add",
                                srcFactor: "one",
                                dstFactor: "one-minus-src-alpha",
                            },
                        },
                    },
                ],
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

        this.layerUniformBuffer = this.device.createBuffer({
            size: Float32Array.BYTES_PER_ELEMENT, // f32
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.layerBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(3),
            entries: [
                { binding: 0, resource: { buffer: this.layerUniformBuffer } },
            ],
        });
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
            size: 2 * 4 * 4 * Float32Array.BYTES_PER_ELEMENT, // 2*mat4x4f
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
            size: 2 * 4 * 4 * Float32Array.BYTES_PER_ELEMENT, // 2*mat4x4f
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

    /**
     * @param {Texture} texture
     */
    prepareTexture(texture) {
        if (this.gpuObjects.has(texture)) {
            return this.gpuObjects.get(texture);
        }

        const { gpuTexture } = this.prepareImage(texture.image); // ignore sRGB
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
            size: 4 * Float32Array.BYTES_PER_ELEMENT, // vec4f
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
        const layers = 10;
        for (let layer = 0; layer < layers + 1; layer++) {
            let depth = 1.0 - layer / layers;
            const encoder = this.device.createCommandEncoder();
            this.renderPass = encoder.beginRenderPass({
                colorAttachments: [
                    {
                        view: this.context.getCurrentTexture().createView(),
                        //clearValue: [1, 1, 1, 1],
                        loadOp: layer == 0 ? "clear" : "load",
                        storeOp: "store",
                    },
                ],
                depthStencilAttachment: {
                    view: this.depthTexture.createView(),
                    depthClearValue: 1,
                    depthLoadOp: layer == 0 ? "clear" : "load",
                    depthStoreOp: "store",
                },
            });
            this.renderPass.setPipeline(this.pipeline);
            this.device.queue.writeBuffer(
                this.layerUniformBuffer,
                0,
                new Float32Array([depth]),
            );

            const cameraComponent = camera.getComponentOfType(Camera);
            const viewMatrix = getGlobalViewMatrix(camera);
            const projectionMatrix = getProjectionMatrix(camera);
            const { cameraUniformBuffer, cameraBindGroup } =
                this.prepareCamera(cameraComponent);
            this.device.queue.writeBuffer(cameraUniformBuffer, 0, viewMatrix);
            this.device.queue.writeBuffer(
                cameraUniformBuffer,
                viewMatrix.byteLength,
                projectionMatrix,
            );
            this.renderPass.setBindGroup(0, cameraBindGroup);
            this.renderPass.setBindGroup(3, this.layerBindGroup);

            this.renderNode(scene);

            this.renderPass.end();
            this.device.queue.submit([encoder.finish()]);
        }
    }

    /**
     * @param {Node} node
     * @param {import("extern/glm/mat4.js").mat4} modelMatrix
     */
    renderNode(node, modelMatrix = mat4.create()) {
        const localMatrix = getLocalModelMatrix(node);
        // @ts-ignore
        modelMatrix = mat4.multiply(mat4.create(), modelMatrix, localMatrix);
        /** @type {import("extern/glm/mat4.js").mat4} */
        // @ts-ignore
        const normalMatrix = mat4.normalFromMat4(mat4.create(), modelMatrix);

        const { modelUniformBuffer, modelBindGroup } = this.prepareNode(node);
        this.device.queue.writeBuffer(modelUniformBuffer, 0, modelMatrix);
        this.device.queue.writeBuffer(
            modelUniformBuffer,
            modelMatrix.byteLength,
            normalMatrix,
        );
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
