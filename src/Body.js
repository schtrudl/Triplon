// @ts-check
import { getLocalModelMatrix } from "../engine/core/SceneUtils.js";
import { Model, Transform } from "../engine/core.js";
import { mat4, quat, vec3 } from "../extern/glm/index.js";
import { RAPIER, RigidBody, world } from "./rapier.js";

export class Body {
    /**
     *
     * @param {RigidBody} rigidBody
     * @param {RAPIER.Collider[]} colliders
     */
    constructor(rigidBody, colliders) {
        this.rigidBody = rigidBody;
        this.colliders = colliders;
    }

    /**
     * There are 3 types of body objects:
     * ground that are static and will not kill the player
     * walls that are static and will kill player (are sensors)
     * player that are dynamic and will not kill other players
     * @param {import('../engine/core.js').Node} node
     * @param {'ground'|'wall'|'player'} type
     */
    static from_node(node, type) {
        const t = getLocalModelMatrix(node);
        const rotation = quat.create();
        mat4.getRotation(rotation, t);
        const translation = vec3.create();
        mat4.getTranslation(translation, t);
        // scaling is not supported
        const primitives = node.getComponentOfType(Model).primitives;
        node.removeComponentsOfType(Transform);
        let rigidBodyDesc = new RAPIER.RigidBodyDesc(
            type == "player"
                ? RAPIER.RigidBodyType.Dynamic
                : RAPIER.RigidBodyType.Fixed,
        )
            .setTranslation(translation[0], translation[1], translation[2])
            .setRotation({
                x: rotation[0],
                y: rotation[1],
                z: rotation[2],
                w: rotation[3],
            })
            .setUserData(node);
        //.setCanSleep(true)
        //.setCcdEnabled(false);

        let rigidBody = world.createRigidBody(rigidBodyDesc);
        let colliders = primitives.map((primitive) =>
            world.createCollider(
                RAPIER.ColliderDesc.trimesh(
                    new Float32Array(
                        primitive.mesh.vertices.flatMap(
                            (vertex) => vertex.position,
                        ),
                    ),
                    new Uint32Array(primitive.mesh.indices),
                ).setSensor(type == "wall"),
                rigidBody,
            ),
        );
        return new Body(rigidBody, colliders);
    }

    /**
     * @returns {Readonly<import("../extern/glm/index.js").QuatLike>}
     */
    get rotation() {
        let rotation = this.rigidBody.rotation();
        return [rotation.x, rotation.y, rotation.z, rotation.w];
    }

    /**
     * @returns {Readonly<import("../extern/glm/index.js").Vec3Like>}
     */
    get translation() {
        let translation = this.rigidBody.translation();
        return [translation.x, translation.y, translation.z];
    }

    get matrix() {
        return mat4.fromRotationTranslationScale(
            mat4.create(),
            this.rotation,
            this.translation,
            [1, 1, 1],
        );
    }
}
