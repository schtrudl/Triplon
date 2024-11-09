// @ts-check
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
await loader.load("../../assets/arena.gltf");

export const arena = loader.loadScene(0);
