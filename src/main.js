// @ts-check
import { ResizeSystem } from "../engine/systems/ResizeSystem.js";
import { UpdateSystem } from "../engine/systems/UpdateSystem.js";
import { RinzlerRenderer } from "./renderer/RinzlerRenderer.js";
import { canvas } from "./canvas.js";
import { scene } from "./scene/scene.js";
import { Camera } from "../engine/core.js";
import { Player } from "./scene/player.js";

const renderer = new RinzlerRenderer(canvas);
await renderer.initialize();

let p1 = new Player();

scene.addChild(p1);

function update(t, dt) {
    scene.traverse((node) => {
        for (const component of node.components) {
            component.update?.(t, dt);
        }
    });
}

function render() {
    renderer.render(scene, p1.camera);
}

function resize({ displaySize: { width, height } }) {
    p1.camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
