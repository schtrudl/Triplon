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
        // levo desno;
        const axel_dir = new Vector3(0, 0, -1);
        const suspension_direction = new Vector3(0, -1, 0);
        const suspension_stiff = 3;
        const suspension = 1;
        const r = 2;
        const rr = 1.5;
        // spredno kolo
        this.controller.addWheel(
            new Vector3(0, 0, rr),
            suspension_direction,
            axel_dir,
            suspension,
            r,
        );
        // zadno kolo
        this.controller.addWheel(
            new Vector3(7, 0, rr),
            suspension_direction,
            axel_dir,
            suspension,
            r,
        );

        this.controller.setWheelSuspensionStiffness(0, suspension_stiff);
        this.controller.setWheelSuspensionStiffness(1, suspension_stiff);

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
        let force = 200;
        this.controller.setWheelEngineForce(0, force);
        this.controller.setWheelEngineForce(1, force);

        /*let steering = Math.PI / 6;
        this.controller.setWheelSteering(1, steering);
        this.controller.setWheelSteering(1, steering / 2);
*/
        this.controller.updateVehicle(dt);
        /*console.log(
            this.controller.currentVehicleSpeed(),
            this.controller.wheelIsInContact(0),
            this.controller.wheelIsInContact(1),
        );*/
    }
}
