// @ts-check
import { Transform, Node, Camera } from "../../engine/core.js";
import { quat } from "../../extern/glm/index.js";
import { Body } from "../Body.js";
import { KeyControls, PlayerController } from "../PlayerController.js";
import { cycle as c } from "./cycle.js";
import { Vector3, Quaternion, world, RAPIER } from "../rapier.js";

export class Player extends Node {
    /**
     *
     * @param {string} [name=p1]
     * @param {import("../../extern/glm/index.js").Vec3Like} pos
     * @param {KeyControls} [key_controls=KeyControls.ARROWS()]
     */
    constructor(
        name = "p1",
        pos = [0, 10, -50],
        key_controls = KeyControls.ARROWS(),
    ) {
        super(name);
        this.addChild(c);
        this.cycle = this.children[0];
        // apply inital position
        this.cycle.addComponent(
            new Transform({
                translation: pos,
                rotation: quat.create().rotateY(Math.PI / 2),
            }),
        );

        // add camera
        this.camera = new Node();
        this.camera.addComponent(new Camera());
        // location of camera with respect of cycle
        this.camera.addComponent(
            new Transform({
                translation: [20, 10, 0],
                rotation: quat.create().rotateY(Math.PI / 2),
            }),
        );
        this.cycle.addChild(this.camera);
        // add physique
        this.body = Body.from_node(this.cycle, "player");
        this.cycle.addComponent(this.body);
        // add controller
        this.cycle.addComponent(new PlayerController(this.body, key_controls));

        // HACK physique to make it work like we want

        // if locked rotations then transform rotation used for curving only in rendering
        // this.body.rigidBody.setEnabledRotations(false, true, false, true);
        for (let i = 0; i < this.body.rigidBody.numColliders(); i++) {
            const collider = this.body.rigidBody.collider(i);
            /*collider.setMassProperties(
                100,
                new Vector3(0, 0, 0),
                new Vector3(0, 0, 0),
                new Quaternion(0, 0, 0, 1),
            );*/

            //collider.setDensity(0.5);
        }

        // make cycle more stable by adding wights at the bottom
        world.createCollider(
            RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1).setMass(100),
            this.body.rigidBody,
        );
        world.createCollider(
            RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1)
                .setTranslation(7, 0, 0)
                .setMass(100),
            this.body.rigidBody,
        );
    }
}
