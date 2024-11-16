export class Texture {
    /**
     * @param {Object} [param0={}]
     * @param {any=} param0.image
     * @param {import("./Sampler.js").Sampler} param0.sampler
     * @param {boolean} [param0.isSRGB=false]
     * @param {boolean} [param0.mipmap=true]
     */
    constructor({ image, sampler, isSRGB = false, mipmap = true } = {}) {
        this.image = image;
        this.sampler = sampler;
        this.isSRGB = isSRGB;
        this.mipmap = mipmap;
    }

    get width() {
        return this.image.width;
    }

    get height() {
        return this.image.height;
    }
}
