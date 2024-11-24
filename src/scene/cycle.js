// @ts-check
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";
const loader = new GLTFLoader();
// src https://blendswap.com/blend/4098
await loader.load(new URL("../../assets/cycle.gltf", import.meta.url));
export const cycle = loader.loadScene(0);
// make disc be a child of player
cycle.children[0].addChild(cycle.children.pop());
export const disc = cycle.children[0].children[0];
