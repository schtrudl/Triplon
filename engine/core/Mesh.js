// @ts-check
export class Mesh {
    /**
     * @param {Object} [param0={}]
     * @param {import('./Vertex.js').Vertex[]} [param0.vertices=[]]
     * @param {number[]} [param0.indices=[]] must be in pairs of 3 vertices, but TS hates this typified
     */
    constructor({ vertices = [], indices = [] } = {}) {
        this.vertices = vertices;
        this.indices = indices;
    }
}
