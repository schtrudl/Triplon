@group(0) @binding(0) var<uniform> camera: CameraUniforms;

@group(1) @binding(0) var<uniform> model: ModelUniforms;

@group(2) @binding(0) var<uniform> material: MaterialUniforms;
@group(2) @binding(1) var baseTexture: texture_2d<f32>;
@group(2) @binding(2) var baseSampler: sampler;

@group(3) @binding(0) var<uniform> layer: f32;

struct VertexInput {
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
}

/// This is both VertexOutput and FragmentInput
struct Middle {
    @builtin(position) position: vec4f,
    @location(1) texcoords: vec2f,
}

struct FragmentOutput {
    @location(0) color: vec4f,
}

struct CameraUniforms {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
}

struct ModelUniforms {
    modelMatrix: mat4x4f,
    normalMatrix: mat3x3f,
}

struct MaterialUniforms {
    baseFactor: vec4f,
}

@vertex
fn vertex(input: VertexInput) -> Middle {
    var output: Middle;

    output.position = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4(input.position, 1);
    output.texcoords = input.texcoords;

    return output;
}

@fragment
fn fragment(input: Middle) -> FragmentOutput {
    if (input.position.z < layer) {
        discard;
    }
    var output: FragmentOutput;

    output.color = textureSample(baseTexture, baseSampler, input.texcoords) * material.baseFactor;

    /*if (output.color.a < ALPHA_TRESH) {
      discard;
    }*/

    return output;
}
