// @ts-check
import { Transform } from "../../engine/core.js";
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
// src https://blendswap.com/blend/4098
await loader.load("../../assets/cycle.gltf");

export const cycle = loader.loadScene(0);

cycle.addComponent(
    new Transform({
        translation: [0, 0, -10],
    }),
);
