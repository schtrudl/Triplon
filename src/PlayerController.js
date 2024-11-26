// @ts-check

import { quat, vec3, mat4 } from "../extern/glm/index.js";

import { Player } from "./scene/player.js";
import { Quaternion, Vector3, world } from "./rapier.js";

export class KeyControls {
    /**
     * @param {string} up
     * @param {string} down
     * @param {string} left
     * @param {string} right
     * @param {string} boost
     */
    constructor(up, down, left, right, boost) {
        this.up = up;
        this.down = down;
        this.left = left;
        this.right = right;
        this.boost = boost;
    }

    static WASD() {
        return new KeyControls("KeyW", "KeyS", "KeyA", "KeyD", "Space");
    }

    static ARROWS() {
        return new KeyControls(
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "ShiftRight",
        );
    }

    static NUM() {
        return new KeyControls(
            "Numpad8",
            "Numpad5",
            "Numpad4",
            "Numpad6",
            "Numpad0",
        );
    }
}

export class PlayerController {
    /**
     * @param {Player} player
     * @param {KeyControls} key_controls
     */
    constructor(player, key_controls) {
        // TODO: show/hide disc on player based on this
        this.boost_available = false;
        this.player = player;
        this.controller = world.createVehicleController(player.body.rigidBody);
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

        this.key_controls = key_controls;

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

    /**
     * @param {number} dt
     */
    update(_t, dt) {
        // TODO: boost
        const engine_power = 200;
        const steer_power = Math.PI / 12;
        // TODO: no stopping
        let forward =
            (this.keys[this.key_controls.up] ? 1 : 0) -
            (this.keys[this.key_controls.down] ? 1 : 0);
        let force = engine_power * forward;
        this.controller.setWheelEngineForce(0, force);
        this.controller.setWheelEngineForce(1, force);
        this.controller.setWheelEngineForce(2, force);
        this.controller.setWheelEngineForce(3, force);

        let steer =
            (this.keys[this.key_controls.left] ? 1 : 0) -
            (this.keys[this.key_controls.right] ? 1 : 0);
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
