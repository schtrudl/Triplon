import { quat, vec3 } from "../../extern/glm/index.js";

import { Transform } from "../core/Transform.js";

export class CameraController {

    constructor(node, targetNode, domElement, {
        pitch = 0,
        yaw = 0,
        distance = 1,
        moveSensitivity = 0.004,
        zoomSensitivity = 0.002,
    } = {}) {
        this.node = node;
        this.targetNode = targetNode;
        this.domElement = domElement;

        this.pitch = pitch;
        this.yaw = yaw;
        this.distance = distance;

        this.moveSensitivity = moveSensitivity;
        this.zoomSensitivity = zoomSensitivity;

        this.initHandlers();
    }
    

    controlsActive = true;
    toggleControls(active) {

        this.controlsActive = active;

        if (this.controlsActive) {
            this.domElement.addEventListener('pointerdown', this.pointerdownHandler);
            this.domElement.addEventListener('wheel', this.wheelHandler);
        } else {
            this.domElement.removeEventListener('pointerdown', this.pointerdownHandler);
            this.domElement.removeEventListener('wheel', this.wheelHandler);
        }
    }

    initHandlers() {
        this.pointerdownHandler = this.pointerdownHandler.bind(this);
        this.pointerupHandler = this.pointerupHandler.bind(this);
        this.pointermoveHandler = this.pointermoveHandler.bind(this);

        this.domElement.addEventListener('pointerdown', this.pointerdownHandler);
    }

    pointerdownHandler(e) {
        this.domElement.setPointerCapture(e.pointerId);
        this.domElement.requestPointerLock();
        this.domElement.removeEventListener('pointerdown', this.pointerdownHandler);
        this.domElement.addEventListener('pointerup', this.pointerupHandler);
        this.domElement.addEventListener('pointermove', this.pointermoveHandler);
    }

    pointerupHandler(e) {
        this.domElement.releasePointerCapture(e.pointerId);
        this.domElement.ownerDocument.exitPointerLock();
        this.domElement.addEventListener('pointerdown', this.pointerdownHandler);
        this.domElement.removeEventListener('pointerup', this.pointerupHandler);
        this.domElement.removeEventListener('pointermove', this.pointermoveHandler);
    }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;

        this.pitch -= dy * this.moveSensitivity;
        this.yaw -= dx * this.moveSensitivity;

        const twopi = Math.PI * 2;
        const halfpi = Math.PI / 2;

        this.pitch = Math.min(Math.max(this.pitch, -halfpi/1.3), halfpi/5);     
        this.yaw = ((this.yaw % twopi) + twopi) % twopi;                    
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

        const rotation = quat.create();
        quat.rotateY(rotation, rotation, this.yaw);
        quat.rotateX(rotation, rotation, this.pitch);
        transform.rotation = rotation;

        const translation = vec3.clone(targetTransform.translation);
        vec3.add(translation, translation, [0, 0, this.distance]);
        vec3.rotateX(translation, translation, targetTransform.translation, this.pitch);
        vec3.rotateY(translation, translation, targetTransform.translation, this.yaw);
        transform.translation = translation;
    }

}

