// @ts-check
import { GUI } from "./extern/dat_gui/index.js";
import { mat4 } from "./extern/glm/index.js";

import * as WebGPU from "./engine/WebGPU.js";
import { ResizeSystem } from "./engine/systems/ResizeSystem.js";
import { UpdateSystem } from "./engine/systems/UpdateSystem.js";
import { UnlitRenderer } from "./engine/renderers/UnlitRenderer.js";
import { FirstPersonController } from "./engine/controllers/FirstPersonController.js";

import {
    Camera,
    Material,
    Model,
    Node,
    Primitive,
    Sampler,
    Texture,
    Transform,
} from "./engine/core.js";

import { loadResources } from "./engine/loaders/resources.js";
import { GLTFLoader } from "./engine/loaders/GLTFLoader.js";

const resources = await loadResources({
    "mesh": new URL("./extern/models/floor/floor.json", import.meta.url),
    "image": new URL("./extern/models/floor/grass.png", import.meta.url),
});

const loader = new GLTFLoader();
//await loader.load("./assets/Trong_legacy_bike[All].gltf");
//await loader.load("./extern/models/monkey/monkey.gltf");
await loader.load("./assets/Arena_V1_Baked.gltf");
//console.log(loader);
const cube = loader.loadScene(0);
const canvas = document.getElementsByTagName("canvas")[0];
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

// the world
const scene = new Node();

const camera = new Node();
camera.addComponent(
    new Transform({
        translation: [0, 1, 0],
    }),
);
camera.addComponent(new Camera());
camera.addComponent(new FirstPersonController(camera, canvas));
scene.addChild(camera);

const floor = new Node();
floor.addComponent(
    new Transform({
        scale: [10, 1, 10],
    }),
);
floor.addComponent(
    new Model({
        primitives: [
            new Primitive({
                mesh: resources.mesh,
                material: new Material({
                    baseTexture: new Texture({
                        image: resources.image,
                        sampler: new Sampler({
                            minFilter: "nearest",
                            magFilter: "nearest",
                            addressModeU: "repeat",
                            addressModeV: "repeat",
                        }),
                    }),
                }),
            }),
        ],
    }),
);
//scene.addChild(floor);

scene.addChild(cube);
console.log(cube);
//debugger;

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

const gui = new GUI();
const controller = camera.getComponentOfType(FirstPersonController);
gui.add(controller, "pointerSensitivity", 0.0001, 0.01);
gui.add(controller, "maxSpeed", 0, 10);
gui.add(controller, "decay", 0, 1);
gui.add(controller, "acceleration", 1, 100);
