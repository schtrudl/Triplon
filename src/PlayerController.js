// @ts-check

import { quat, vec3, mat4 } from "../extern/glm/index.js";

import { Body } from "./Body.js";
import { Quaternion, Vector3, world } from "./rapier.js";

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
        const suspension_stiff = 4;
        const maxSuspensionTravel = 2;
        const suspension = 2;
        const r = 0.1;
        const rr = 0.1;
        const axis = 1;
        /*console.log(this.body.rigidBody.collider(0).vertices());
        console.log(
            this.body.rigidBody.collider(0).containsPoint(new Vector3(5, 2, 0)),
        );*/
        // spredno kolo
        this.controller.addWheel(
            new Vector3(0, rr, -axis),
            suspension_direction,
            axel_dir,
            suspension,
            r,
        );
        this.controller.addWheel(
            new Vector3(0, rr, axis),
            suspension_direction,
            axel_dir,
            suspension,
            r,
        );
        // zadno kolo
        this.controller.addWheel(
            new Vector3(7, rr, -axis),
            suspension_direction,
            axel_dir,
            suspension,
            r,
        );
        this.controller.addWheel(
            new Vector3(7, rr, axis),
            suspension_direction,
            axel_dir,
            suspension,
            r,
        );

        for (let wheel = 0; wheel < this.controller.numWheels(); wheel++) {
            this.controller.setWheelSuspensionStiffness(
                wheel,
                suspension_stiff,
            );
            this.controller.setWheelMaxSuspensionTravel(
                wheel,
                maxSuspensionTravel,
            );
        }

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
        document.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });
    }

    update(_t, dt) {
        const engine_power = 200;
        const steer_power = Math.PI / 12;
        // TODO: no stopping
        let forward =
            (this.keys[this.up] ? 1 : 0) - (this.keys[this.down] ? 1 : 0);
        let force = engine_power * forward;
        this.controller.setWheelEngineForce(0, force);
        this.controller.setWheelEngineForce(1, force);
        this.controller.setWheelEngineForce(2, force);
        this.controller.setWheelEngineForce(3, force);

        let steer =
            (this.keys[this.left] ? 1 : 0) - (this.keys[this.right] ? 1 : 0);
        let steering = steer_power * steer;
        this.controller.setWheelSteering(0, steering);
        this.controller.setWheelSteering(1, steering);

        //this.controller.setWheelSteering(2, steering);
        //this.controller.setWheelSteering(3, steering);
        this.controller.updateVehicle(dt);
        //this.body.rigidBody.setAngvel(new Vector3(0, 20, 0), true);
        //this.body.rigidBody.setRotation(new Quaternion(0, 1, 0, 1), true);
        /*console.log(
            this.controller.currentVehicleSpeed(),
            this.controller.wheelIsInContact(0),
            this.controller.wheelIsInContact(1),
        );*/
    }
}
