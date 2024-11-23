import { Body } from "../../src/Body.js";
import { mat4 } from "../../extern/glm/index.js";

import { Camera } from "./Camera.js";
import { Model } from "./Model.js";
import { Transform } from "./Transform.js";

export function getLocalModelMatrix(node) {
    const matrix = mat4.create();
    for (const body of node.getComponentsOfType(Body)) {
        matrix.multiply(body.matrix);
    }
    for (const transform of node.getComponentsOfType(Transform)) {
        matrix.multiply(transform.matrix);
    }
    return matrix;
}

export function getGlobalModelMatrix(node) {
    if (node.parent && false) {
        const parentMatrix = getGlobalModelMatrix(node.parent);
        const modelMatrix = getLocalModelMatrix(node);
        return parentMatrix.multiply(modelMatrix);
    } else {
        return getLocalModelMatrix(node);
    }
}

export function getLocalViewMatrix(node) {
    return getLocalModelMatrix(node).invert();
}

export function getGlobalViewMatrix(node) {
    return getGlobalModelMatrix(node).invert();
}

export function getProjectionMatrix(node) {
    return node.getComponentOfType(Camera)?.projectionMatrix ?? mat4.create();
}

export function getModels(node) {
    return node.getComponentsOfType(Model);
}
