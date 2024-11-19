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
        
        this.allVertices = [];
        this.allIndices = [];
        this.allColors = [];
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.colorBuffer = null;
        this.indexOffset = 0; // Keep track of the offset for indices
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

    /**
 * Add a rectangle to be rendered using 3D corner coordinates
 * @param {number[]} corner1 - [x1, y1, z1] top point
 * @param {number[]} corner2 - [x2, y2, z2] bottom point
 * @param {number[]} color - RGBA color (optional, defaults to white)
 */
addPair(corner1, corner2, color = [1.0, 0, 0, 1.0]) {
    console.log(1);

    // Add vertex positions (without color)
    const vertices = [
        corner1[0], corner1[1], corner1[2],  // Vertex 1
        corner2[0], corner2[1], corner2[2],  // Vertex 2
    ];

    for (let i = 0; i < vertices.length; i++) {
        this.allVertices.push(vertices[i]);
    }

    // Add the color separately for both vertices
    this.allColors.push(...color);
    this.allColors.push(...color);

    // Calculate the current vertex count
    const currentVertexCount = this.allVertices.length / 3; // 3 floats per vertex (x, y, z)

    // Skip creating indices if not enough vertices
    if (currentVertexCount <= 2) {
        return;
    } else {
        // Connect the last two vertices to the two before them (two triangles)
        this.allIndices.push(currentVertexCount - 4);  
        this.allIndices.push(currentVertexCount - 3);
        this.allIndices.push(currentVertexCount - 2);
    }

    console.log(this.allVertices);
    console.log(this.allIndices);
    console.log(this.allColors);

    // Only create or update the buffers once (if they haven't been created)
    if (!this.vertexBuffer) {
        this.vertexBuffer = this.device.createBuffer({
            size: 10000 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.colorBuffer = this.device.createBuffer({
            size: 10000 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.indexBuffer = this.device.createBuffer({
            size: 30000 * Uint32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
    }

    // Write the updated vertex data to the vertex buffer
    this.device.queue.writeBuffer(this.vertexBuffer, 0, new Float32Array(this.allVertices));

    // Write the updated color data to the color buffer
    this.device.queue.writeBuffer(this.colorBuffer, 0, new Float32Array(this.allColors));

    // Write the updated index data to the index buffer
    this.device.queue.writeBuffer(this.indexBuffer, 0, new Uint32Array(this.allIndices));
}



    /**
    * Render the rectangles with the index buffer
    */
    renderRectangles() {
    if (!this.vertexBuffer || !this.indexBuffer || !this.colorBuffer) return;

    const fixedModelMatrix = mat4.create();
    const modelUniformBuffer = this.device.createBuffer({
        size: 128,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.device.queue.writeBuffer(modelUniformBuffer, 0, fixedModelMatrix);

    const modelBindGroup = this.device.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(1),
        entries: [{ binding: 0, resource: { buffer: modelUniformBuffer } }],
    });

    this.renderPass.setPipeline(this.pipeline);
    this.renderPass.setVertexBuffer(0, this.vertexBuffer); // Vertex positions
    this.renderPass.setVertexBuffer(1, this.colorBuffer);  // Colors
    this.renderPass.setIndexBuffer(this.indexBuffer, 'uint32');
    this.renderPass.setBindGroup(1, modelBindGroup);

    // Draw the rectangles using the updated buffer data
    this.renderPass.drawIndexed(this.allIndices.length);
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

        // Update and render rectangles
        this.renderRectangles();

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
