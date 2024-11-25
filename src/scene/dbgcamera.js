// @ts-check
import { Node, Camera, Transform } from "../../engine/core.js";
import { DebugController } from "../../engine/controllers/DebugController.js";

export const dbgcamera = new Node("dbgcamera");
dbgcamera.addComponent(
    new Transform({
        translation: [5, 10, 50],
        rotation: [0, 0, 0, 1],
    }),
);
dbgcamera.addComponent(new Camera());
dbgcamera.addComponent(new DebugController(dbgcamera, document.body));
