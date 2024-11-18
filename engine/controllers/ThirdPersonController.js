import { quat, vec3, mat4 } from "../../extern/glm/index.js";

import { Transform } from "../core/Transform.js";

export class ThirdPersonController {
    constructor(node, inputElement) {
        this.node = node;
        this.inputElement = inputElement;
        this.speed = 10;
        this.rotateSpeed = 2;
        this.init();
    }

    init() {
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
        };

        this.inputElement.addEventListener(
            "keydown",
            this.handleKeyDown.bind(this),
        );
        this.inputElement.addEventListener(
            "keyup",
            this.handleKeyUp.bind(this),
        );
    }

    handleKeyDown(event) {
        switch (event.key) {
            case "KeyW":
                this.input.forward = true;
                break;
            case "KeyS":
                this.input.backward = true;
                break;
            case "KeyA":
                this.input.right = true;
                break;
            case "KeyD":
                this.input.left = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.key) {
            case "w":
                this.input.forward = false;
                break;
            case "s":
                this.input.backward = false;
                break;
            case "a":
                this.input.right = false;
                break;
            case "d":
                this.input.left = false;
                break;
        }
    }

    update(time, dt) {
        const transform = this.node.getComponentOfType(Transform);

        // Move the player based on input
        const moveVector = [0, 0, 0];

        if (this.input.forward) {
            vec3.scaleAndAdd([1, 0, 0], this.speed * dt);
        }
        if (this.input.backward) {
            vec3.scaleAndAdd([-1, 0, 0], this.speed * dt);
        }
        if (this.input.left) {
            quat.rotateY(
                transform.rotation,
                transform.rotation,
                this.rotateSpeed * dt,
            );
        }
        if (this.input.right) {
            quat.rotateY(
                transform.rotation,
                transform.rotation,
                -this.rotateSpeed * dt,
            );
        }

        // Normalize the rotation quaternion
        quat.normalize(transform.rotation, transform.rotation);

        // Apply translation
        vec3.transformQuat(moveVector, transform.rotation);
        vec3.add(transform.translation, moveVector);
    }
}
