// @ts-check
import { mat4 } from "../../extern/glm/index.js";

export class Transform {
    /**
     * @param {Object} [param0={}]
     * @param {import("../../extern/glm/index.js").QuatLike} [param0.rotation=[0, 0, 0, 1]]
     * @param {import("../../extern/glm/index.js").Vec3Like} [param0.translation=[0, 0, 0]]
     * @param {import("../../extern/glm/index.js").Vec3Like} [param0.scale=[1, 1, 1]]
     * @param {import("../../extern/glm/mat4.js").Mat4Like=} param0.matrix
     */
    constructor({
        rotation = [0, 0, 0, 1],
        translation = [0, 0, 0],
        scale = [1, 1, 1],
        matrix,
    } = {}) {
        this.rotation = rotation;
        this.translation = translation;
        this.scale = scale;
        if (matrix) {
            this.matrix = matrix;
        }
    }

    get matrix() {
        return mat4.fromRotationTranslationScale(
            mat4.create(),
            this.rotation,
            this.translation,
            this.scale,
        );
    }

    set matrix(matrix) {
        mat4.getRotation(this.rotation, matrix);
        mat4.getTranslation(this.translation, matrix);
        mat4.getScaling(this.scale, matrix);
    }
}
