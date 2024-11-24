// @ts-check

import { quat, vec3, mat4 } from "../extern/glm/index.js";

import { Body } from "./Body.js";
import { Vector3, world } from "./rapier.js";

// TODO: transform rotation used for curving only in rendering
export class PlayerController {
    /**
     * @param {Body} body
     */
    constructor(
        body,
        up = "KeyW",
        down = "KeyS",
        left = "KeyA",
        right = "KeyD",
        boost = "Space",
    ) {
        this.body = body;
        this.controller = world.createVehicleController(body.rigidBody);
        const axel_dir = new Vector3(0, 1, 0);
        const suspension_direction = new Vector3(0, 0, -1);
        const suspension = 0.1;
        const r = 1.5;
        // spredno kolo
        this.controller.addWheel(
            new Vector3(0, 0, r),
            suspension_direction,
            axel_dir,
            suspension,
            r,
        );
        // zadno kolo
        this.controller.addWheel(
            new Vector3(7, 0, r),
            suspension_direction,
            axel_dir,
            suspension,
            r,
        );

        this.keys = [];

        this.up = up;
        this.down = down;
        this.left = left;
        this.right = right;
        this.boost = boost;

        this.initHandlers();
    }

    initHandlers() {
        document.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
        });
        document.addEventListener("keydown", (e) => {
            this.keys[e.code] = false;
        });
    }

    update(_t, dt) {
        // this.keys[this.down]
        let force = 20000;
        this.controller.setWheelEngineForce(0, force);
        this.controller.setWheelEngineForce(0, force);

        //let steering = Math.PI / 4;
        //this.controller.setWheelSteering(0, steering);
        //this.controller.setWheelSteering(1, steering);

        this.controller.updateVehicle(dt);
        console.log(this.controller.currentVehicleSpeed());
    }
}
