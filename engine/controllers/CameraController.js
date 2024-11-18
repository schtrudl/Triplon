import { quat, vec3, mat4 } from "../../extern/glm/index.js";
import { Transform } from "../core/Transform.js";

export class CameraController {
    constructor(
        node,
        targetNode,
        domElement,
        {
            pitch = 0,
            yaw = 0,
            distance = 5,
            heightOffset = 7,
            moveSensitivity = 0.004,
            zoomSensitivity = 0.002,
        } = {},
    ) {
        this.node = node;
        this.targetNode = targetNode;
        this.domElement = domElement;

        this.pitch = pitch;
        this.yaw = yaw;
        this.distance = distance;
        this.heightOffset = heightOffset;

        this.moveSensitivity = moveSensitivity;
        this.zoomSensitivity = zoomSensitivity;

        this.initHandlers();
    }

    controlsActive = true;
    toggleControls(active) {
        this.controlsActive = active;

        if (this.controlsActive) {
            this.domElement.addEventListener(
                "pointerdown",
                this.pointerdownHandler,
            );
            this.domElement.addEventListener("wheel", this.wheelHandler);
        } else {
            this.domElement.removeEventListener(
                "pointerdown",
                this.pointerdownHandler,
            );
            this.domElement.removeEventListener("wheel", this.wheelHandler);
        }
    }

    initHandlers() {
        this.pointerdownHandler = this.pointerdownHandler.bind(this);
        this.pointerupHandler = this.pointerupHandler.bind(this);
        this.pointermoveHandler = this.pointermoveHandler.bind(this);

        this.domElement.addEventListener(
            "pointerdown",
            this.pointerdownHandler,
        );
    }

    pointerdownHandler(e) {
        this.domElement.setPointerCapture(e.pointerId);
        this.domElement.requestPointerLock();
        this.domElement.removeEventListener(
            "pointerdown",
            this.pointerdownHandler,
        );
        this.domElement.addEventListener("pointerup", this.pointerupHandler);
        this.domElement.addEventListener(
            "pointermove",
            this.pointermoveHandler,
        );
    }

    pointerupHandler(e) {
        this.domElement.releasePointerCapture(e.pointerId);
        this.domElement.ownerDocument.exitPointerLock();
        this.domElement.addEventListener(
            "pointerdown",
            this.pointerdownHandler,
        );
        this.domElement.removeEventListener("pointerup", this.pointerupHandler);
        this.domElement.removeEventListener(
            "pointermove",
            this.pointermoveHandler,
        );
    }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;

        this.pitch -= dy * this.moveSensitivity;
        this.yaw -= dx * this.moveSensitivity;

        const halfpi = Math.PI / 2;
        this.pitch = Math.min(Math.max(this.pitch, -halfpi / 1.3), halfpi / 5);
    }

    wheelHandler(e) {
        this.distance *= Math.exp(this.zoomSensitivity * e.deltaY);
    }

    update() {
        const transform = this.node.getComponentOfType(Transform);
        const targetTransform = this.targetNode.getComponentOfType(Transform);

        if (!transform || !targetTransform) {
            return;
        }

        // Control camera movement speed (higher = faster)
        // const lerpFactor = 0.1;

        // Calculate the target's forward direction based on its rotation
        const targetRotation = targetTransform.rotation;
        const forward = vec3.transformQuat(
            vec3.create(),
            [0, 0, 1],
            targetRotation,
        );

        // Position the camera behind the target
        const cameraOffset = vec3.create();
        vec3.scale(cameraOffset, forward, -this.distance); // Move backward from target
        vec3.add(cameraOffset, cameraOffset, [0, this.heightOffset, 0]); // Add height offset
        const cameraPosition = vec3.create();
        vec3.add(cameraPosition, targetTransform.translation, cameraOffset);

        // Update camera's translation
        transform.translation = cameraPosition;

        // Orient the camera to look at the target
        const lookAtMatrix = mat4.create();
        mat4.targetTo(
            lookAtMatrix,
            transform.translation, // Camera position
            targetTransform.translation, // Target position
            [0, 1, 0], // Up vector
        );

        // Extract rotation from the look-at matrix
        const rotation = quat.create();
        mat4.getRotation(rotation, lookAtMatrix);
        transform.rotation = rotation;
    }
}
