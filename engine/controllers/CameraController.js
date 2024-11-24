import { quat, vec3, mat4 } from "../../extern/glm/index.js";
import { Transform, Node } from "../core.js";
import { Body } from "../../src/Body.js";

export class CameraController {
    /**
     *
     * @param {Node} node
     * @param {Node} targetNode
     * @param {*} param3
     */
    constructor(
        node,
        targetNode,
        { pitch = 0, yaw = 0, distance = 5, heightOffset = 7 } = {},
    ) {
        this.node = node;
        this.targetNode = targetNode;

        this.pitch = pitch;
        this.yaw = yaw;
        this.distance = distance;
        this.heightOffset = heightOffset;
    }

    update() {
        const transform = this.node.getComponentOfType(Transform);
        const targetTransform = this.targetNode.getComponentOfType(Body);

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
