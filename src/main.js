// @ts-check
import { GUI } from "../extern/dat_gui/index.js";
import { ResizeSystem } from "../engine/systems/ResizeSystem.js";
import { UpdateSystem } from "../engine/systems/UpdateSystem.js";
import { FirstPersonController } from "../engine/controllers/FirstPersonController.js";
import { RinzlerRenderer } from "./renderer/RinzlerRenderer.js";
import { canvas } from "./canvas.js";
import { scene } from "./scene/scene.js";
import { camera } from "./scene/camera.js";
import { Camera } from "../engine/core.js";
import "./rapier.js";

const renderer = new RinzlerRenderer(canvas);
await renderer.initialize();

function update(t, dt) {
    scene.traverse((node) => {
        for (const component of node.components) {
            component.update?.(t, dt);
        }
    });
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height } }) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
