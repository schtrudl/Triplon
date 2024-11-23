// @ts-check
import { Model, Transform } from "../engine/core.js";
import { mat4 } from "../extern/glm/index.js";
import { RAPIER, RigidBody, world } from "./rapier.js";

export class Body {
    /**
     *
     * @param {RigidBody} rigidBody
     * @param {RAPIER.Collider} collider
     */
    constructor(rigidBody, collider) {
        this.rigidBody = rigidBody;
        this.collider = collider;
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
        const t = node.getComponentOfType(Transform) ?? new Transform();
        const mesh = node.getComponentOfType(Model).primitives[0].mesh;
        node.removeComponentsOfType(Transform);
        // Builder for a body with a status specified by an enum.
        let rigidBodyDesc = new RAPIER.RigidBodyDesc(
            type == "player"
                ? RAPIER.RigidBodyType.Dynamic
                : RAPIER.RigidBodyType.Fixed,
        )
            .setTranslation(
                t.translation[0],
                t.translation[1],
                t.translation[2],
            )
            .setRotation({
                x: t.rotation[0],
                y: t.rotation[1],
                z: t.rotation[2],
                w: t.rotation[3],
            });
        //.setCanSleep(true)
        //.setCcdEnabled(false);

        if (type == "player") {
            rigidBodyDesc = rigidBodyDesc.setAdditionalMass(100);
        }

        // All done, actually build the rigid-body.
        let rigidBody = world.createRigidBody(rigidBodyDesc);
        let colliderDesc = RAPIER.ColliderDesc.trimesh(
            new Float32Array(
                mesh.vertices.flatMap((vertex) => vertex.position),
            ),
            new Uint32Array(mesh.indices),
        ); //.setSensor(type == "wall");
        let collider = world.createCollider(colliderDesc, rigidBody);
        return new Body(rigidBody, collider);
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
