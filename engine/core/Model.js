// @ts-check
export class Model {
    /**
     * @param {Object} [param0={}]
     * @param {import('./Primitive.js').Primitive[]} [param0.primitives=[]]
     */
    constructor({ primitives = [] } = {}) {
        this.primitives = primitives;
    }
}
