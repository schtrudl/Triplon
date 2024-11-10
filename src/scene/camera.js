// @ts-check
import { Node, Camera, Transform } from "../../engine/core.js";
import { FirstPersonController } from "../../engine/controllers/FirstPersonController.js";
import { canvas } from "../canvas.js";

export const camera = new Node();

camera.addComponent(
    new Transform({
        translation: [0, 2, 0],
    }),
);
camera.addComponent(new Camera());
camera.addComponent(new FirstPersonController(camera, canvas));
