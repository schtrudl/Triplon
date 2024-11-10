export class Texture {
    /**
     * @param {Object} [param0={}]
     * @param {any=} param0.image
     * @param {import("./Sampler.js").Sampler} param0.sampler
     * @param {boolean} [param0.isSRGB=false]
     */
    constructor({ image, sampler, isSRGB = false } = {}) {
        this.image = image;
        this.sampler = sampler;
        this.isSRGB = isSRGB;
    }

    get width() {
        return this.image.width;
    }

    get height() {
        return this.image.height;
    }
}
