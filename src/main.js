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

let camera = p1.camera;

// uncomment to enable dbg camera
/*
import { dbgcamera } from "./scene/dbgcamera.js";
camera = dbgcamera;
*/

scene.addChild(p1);

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

let resizeSystem, updateSystem;
export function startRendering() {
    if (!resizeSystem) resizeSystem = new ResizeSystem({ canvas, resize });
    if (!updateSystem)
        updateSystem = new UpdateSystem({ update, render });
    resizeSystem.start();
    updateSystem.start();
}

