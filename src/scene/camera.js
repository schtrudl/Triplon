// @ts-check
import { Node, Camera, Transform } from "../../engine/core.js";
import { CameraController } from "../../engine/controllers/CameraController.js";
import { canvas } from "../canvas.js";
import { cycle } from "./cycle.js"

export const camera = new Node();

camera.addComponent(
    new Transform({
        translation: [5, 10, -3],
    })
);

camera.addComponent(new Camera());
camera.addComponent(new CameraController(camera, cycle, document.body, { pitch:12, yaw: 3, distance: 15}));
