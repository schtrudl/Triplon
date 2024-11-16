export class Primitive {
    /**
     * @param {Object} [param0={}]
     * @param {import('./Mesh.js').Mesh} param0.mesh
     * @param {import('./Material.js').Material} param0.material
     */
    constructor({ mesh, material } = {}) {
        this.mesh = mesh;
        this.material = material;
    }
}
