// @ts-check
import { Node, Camera, Transform } from "../../engine/core.js";
import { CameraController } from "../../engine/controllers/CameraController.js";
import { cycle } from "./cycle.js";
import { GUI } from "../../extern/dat_gui/index.js";
import { DebugController } from "../../engine/controllers/DebugController.js";

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

camera.addComponent(new DebugController(camera, document.body));
const gui = new GUI();
const controller = camera.getComponentOfType(DebugController);
gui.add(controller, "pointerSensitivity", 0.0001, 0.01);
gui.add(controller, "maxSpeed", 0, 10);
gui.add(controller, "decay", 0, 1);
gui.add(controller, "acceleration", 1, 100);
