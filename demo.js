// @ts-check
import { createBuffer } from "./engine/WebGPU.js";
import { mat4 } from "./extern/glm/index.js";
import { GUI } from "./extern/dat_gui/index.js";

let id = mat4.create();

/** @type {GPUDevice} */
let device = 5; // should have error
let data;
let usage;

createBuffer(device, { data, usage });

// prettier-ignore
let arr = [
    1, 2, 3, 4,   5, 6, 7, 8
];

let arr2 = [1, 2, 3, 4, 5, 6, 7, 8];
