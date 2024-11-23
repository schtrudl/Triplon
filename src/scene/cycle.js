// @ts-check
import { Transform } from "../../engine/core.js";
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";
import { FirstPersonController } from "../../engine/controllers/FirstPersonController.js";
import { canvas } from "../canvas.js";
import { Body } from "../Body.js";
const loader = new GLTFLoader();
// src https://blendswap.com/blend/4098
await loader.load(new URL("../../assets/cycle.gltf", import.meta.url));
export const cycle = loader.loadScene(0);
let t = cycle.children[0].getComponentOfType(Transform);
t.translation = new Float32Array([0, 30, 10]);
export const cycle_body = Body.from_node(cycle.children[0], "player");
cycle.children[0].addComponent(cycle_body);
cycle_body.rigidBody.setAdditionalMass(100, true);
console.log(cycle_body.translation);
//cycle.addComponent(new FirstPersonController(cycle, canvas));
