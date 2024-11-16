// @ts-check
import { Transform, Model, Node } from "../../engine/core.js";
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";
import { ThirdPersonController } from "../../engine/controllers/ThirdPersonController.js";
import { FirstPersonController } from "../../engine/controllers/FirstPersonController.js";
import { canvas } from "../canvas.js";
import {arena } from "./arena.js";
const loader = new GLTFLoader();
// src https://blendswap.com/blend/4098
await loader.load("../../assets/cycle.gltf");

export const cycle = loader.loadScene(0);

cycle.addComponent(
    new Transform({
        translation: [0, 0, -10],
        rotation: [0, 0, 0, 1],
    }),
);
cycle.addComponent(new FirstPersonController(cycle, canvas));