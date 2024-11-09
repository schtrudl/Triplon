// @ts-check
import { GUI } from "../extern/dat_gui/index.js";
import { ResizeSystem } from "../engine/systems/ResizeSystem.js";
import { UpdateSystem } from "../engine/systems/UpdateSystem.js";
import { FirstPersonController } from "../engine/controllers/FirstPersonController.js";

import { Camera } from "../engine/core.js";
import { RinzlerRenderer } from "./renderer/RinzlerRenderer.js";
import { canvas } from "./canvas.js";
import { world } from "./scene/world.js";
import { camera } from "./scene/camera.js";

const renderer = new RinzlerRenderer(canvas);
await renderer.initialize();

function update(t, dt) {
    world.traverse((node) => {
        for (const component of node.components) {
            component.update?.(t, dt);
        }
    });
}

function render() {
    renderer.render(world, camera);
}

function resize({ displaySize: { width, height } }) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();

const gui = new GUI();
const controller = camera.getComponentOfType(FirstPersonController);
gui.add(controller, "pointerSensitivity", 0.0001, 0.01);
gui.add(controller, "maxSpeed", 0, 10);
gui.add(controller, "decay", 0, 1);
gui.add(controller, "acceleration", 1, 100);
