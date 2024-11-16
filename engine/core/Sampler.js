// @ts-check
export class Sampler {
    /**
     * @param {Object} [param0={}]
     * @param {GPUFilterMode} [param0.minFilter="linear"]
     * @param {GPUFilterMode} [param0.magFilter="linear"]
     * @param {GPUFilterMode} [param0.mipmapFilter="linear"]
     * @param {GPUAddressMode} [param0.addressModeU="clamp-to-edge"]
     * @param {GPUAddressMode} [param0.addressModeV="clamp-to-edge"]
     * @param {GPUAddressMode} [param0.addressModeW="clamp-to-edge"]
     * @param {number} [param0.maxAnisotropy=16]
     */
    constructor({
        minFilter = "linear",
        magFilter = "linear",
        mipmapFilter = "linear",
        addressModeU = "clamp-to-edge",
        addressModeV = "clamp-to-edge",
        addressModeW = "clamp-to-edge",
        maxAnisotropy = 16,
    } = {}) {
        /**
         * @type {GPUFilterMode}
         * @public
         */
        this.minFilter = minFilter;
        /**
         * @type {GPUFilterMode}
         * @public
         */
        this.magFilter = magFilter;
        /**
         * @type {GPUFilterMode}
         * @public
         */
        this.mipmapFilter = mipmapFilter;
        /**
         * @type {GPUAddressMode}
         * @public
         */
        this.addressModeU = addressModeU;
        /**
         * @type {GPUAddressMode}
         * @public
         */
        this.addressModeV = addressModeV;
        /**
         * @type {GPUAddressMode}
         * @public
         */
        this.addressModeW = addressModeW;
        this.maxAnisotropy = maxAnisotropy;
    }
}
