// @ts-check
export class Mesh {
    /**
     * @param {Object} [param0={}]
     * @param {import('./Vertex.js').Vertex[]} [param0.vertices=[]]
     * @param {[number, number, number][]} [param0.indices=[]]
     */
    constructor({ vertices = [], indices = [] } = {}) {
        this.vertices = vertices;
        this.indices = indices;
    }
}
