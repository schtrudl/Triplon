// @ts-check
import { Node, Model, Transform } from "../../engine/core.js";
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";
const loader = new GLTFLoader();
// src https://blendswap.com/blend/4098
await loader.load(new URL("../../assets/cycle.gltf", import.meta.url));
const cycle_model = loader.loadScene(0);
// TODO: clone
export const cycle = cycle_model.removeChild(cycle_model.children[0]);
// make disc be a child of cycle
cycle.addChild(cycle_model.removeChild(cycle_model.children[0]));
