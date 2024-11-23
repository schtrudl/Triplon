// @ts-check
import { Node, Camera, Transform } from "../../engine/core.js";
import { CameraController } from "../../engine/controllers/CameraController.js";
import { cycle } from "./cycle.js";

export const camera = new Node();

camera.addComponent(
    new Transform({
        translation: [5, 10, 10],
        rotation: [0, 0, 0, 0],
    }),
);
camera.addComponent(new Camera());
/*camera.addComponent(
    new CameraController(camera, cycle.children[0], {
        pitch: 12,
        yaw: 3,
        distance: 15,
    }),
);*/
