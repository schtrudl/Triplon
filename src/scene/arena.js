// @ts-check
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
await loader.load("../../assets/Trong_legacy_bike[All].gltf");
//await loader.load("../../assets/Arena_V1_Baked.gltf");

export const arena = loader.loadScene(0);
