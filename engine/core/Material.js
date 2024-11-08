import { Texture } from "./Texture.js";

export class Material {
    /**
     * @param {Object} [param0={}]
     * @param {Texture} param0.baseTexture
     * @param {Texture=} param0.emissionTexture
     * @param {Texture=} param0.normalTexture
     * @param {Texture=} param0.occlusionTexture
     * @param {Texture=} param0.roughnessTexture
     * @param {Texture=} param0.metalnessTexture
     * @param {number[]} [param0.baseFactor=[1, 1, 1, 1]]
     * @param {number[]} [param0.emissionFactor=[0, 0, 0]]
     * @param {number} [param0.normalFactor=1]
     * @param {number} [param0.occlusionFactor=1]
     * @param {number} [param0.roughnessFactor=1]
     * @param {number} [param0.metalnessFactor=1]
     */
    constructor({
        baseTexture,
        emissionTexture,
        normalTexture,
        occlusionTexture,
        roughnessTexture,
        metalnessTexture,

        baseFactor = [1, 1, 1, 1],
        emissionFactor = [0, 0, 0],
        normalFactor = 1,
        occlusionFactor = 1,
        roughnessFactor = 1,
        metalnessFactor = 1,
    } = {}) {
        this.baseTexture = baseTexture;
        this.emissionTexture = emissionTexture;
        this.normalTexture = normalTexture;
        this.occlusionTexture = occlusionTexture;
        this.roughnessTexture = roughnessTexture;
        this.metalnessTexture = metalnessTexture;

        this.baseFactor = baseFactor;
        this.emissionFactor = emissionFactor;
        this.normalFactor = normalFactor;
        this.occlusionFactor = occlusionFactor;
        this.roughnessFactor = roughnessFactor;
        this.metalnessFactor = metalnessFactor;
    }
}
