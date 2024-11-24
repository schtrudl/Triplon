// @ts-check
import { Transform, Node, Camera } from "../../engine/core.js";
import { quat } from "../../extern/glm/index.js";
import { Body } from "../Body.js";
import { PlayerController } from "../PlayerController.js";
import { cycle as c } from "./cycle.js";

export class Player extends Node {
    /**
     *
     * @param {string} name
     * @param {import("../../extern/glm/index.js").Vec3Like} pos
     */
    constructor(name = "p1", pos = [0, 10, 10]) {
        super();
        this.addChild(c);
        this.cycle = this.children[0];
        this.cycle.name = name;
        console.log(this.cycle.children);
        // inital position
        this.cycle.children[0].addComponent(
            new Transform({
                translation: pos,
                rotation: quat.create(), //.rotateY(Math.PI / 2),
            }),
        );
        this.camera = new Node();
        this.camera.addComponent(new Camera());
        // location of camera with respect of cycle
        this.camera.addComponent(
            new Transform({
                translation: [20, 10, 0],
                rotation: quat.create().rotateY(Math.PI / 2),
            }),
        );
        this.cycle.children[0].addChild(this.camera);
        this.body = Body.from_node(this.cycle.children[0], "player");
        this.cycle.children[0].addComponent(this.body);
        // unfortunately we must lock rotations to prevent cycle to fly
        this.body.rigidBody.setEnabledRotations(false, true, false, true);
        this.cycle.addComponent(new PlayerController(this.body));
        /*cycle.addComponent({
            update: () => console.log(cycle_body.translation),
        });*/
        //cycle.addComponent(new FirstPersonController(cycle, canvas));
    }
}
