// @ts-check
import { Node, Camera, Transform } from "../../engine/core.js";
import { DebugController } from "../../engine/controllers/DebugController.js";

export const camera = new Node();
camera.addComponent(
    new Transform({
        translation: [5, 10, 10],
        rotation: [0, 0, 0, 0],
    }),
);
camera.addComponent(new Camera());
camera.addComponent(new DebugController(camera, document.body));
