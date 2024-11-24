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
// clone of disc (model is still shared)
export function disc() {
    let d = new Node();
    d.name = "discx";
    d.addComponent(cycle.children[0].children[0].getComponentOfType(Model));
}
