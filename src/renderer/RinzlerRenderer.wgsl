struct VertexInput {
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
}

/// VertexOutput --interpolation--> FragmentInput
/// but structure is the same
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
    baseColorFactor: vec4f,
    // although there are only 3 coordinates we need this for alignment
    // (last coordinate will be ignored)
    emissionFactor: vec4f,
}

/// It's good practise to
/// Grouping resources based on frequency of change/change
/// IIRC Vulkan and DX12 have special optimization for this
@group(0) @binding(0) var<uniform> camera: CameraUniforms;

@group(1) @binding(0) var<uniform> model: ModelUniforms;

@group(2) @binding(0) var<uniform> material: MaterialUniforms;
@group(2) @binding(1) var baseTexture: texture_2d<f32>;
@group(2) @binding(2) var baseSampler: sampler;
@group(2) @binding(3) var emissiveTexture: texture_2d<f32>;
@group(2) @binding(4) var emissiveSampler: sampler;

const ALPHA_TRESH: f32 = 0.01;

@vertex
fn vertex(input: VertexInput) -> Middle {
    var output: Middle;

    output.position = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4(input.position, 1);
    output.texcoords = input.texcoords;

    return output;
}

@fragment
fn fragment(input: Middle) -> FragmentOutput {
    var output: FragmentOutput;

    let emission = material.emissionFactor * vec4f(textureSample(emissiveTexture, emissiveSampler, input.texcoords).rgb, 0);
    output.color = textureSample(baseTexture, baseSampler, input.texcoords) * material.baseColorFactor + emission;

    /*if (output.color.a < ALPHA_TRESH) {
      discard;
    }*/

    return output;
}
