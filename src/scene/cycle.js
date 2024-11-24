// @ts-check
import { Transform } from "../../engine/core.js";
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";
import { FirstPersonController } from "../../engine/controllers/FirstPersonController.js";
import { canvas } from "../canvas.js";
import { Body } from "../Body.js";
import { PlayerController } from "../PlayerController.js";
const loader = new GLTFLoader();
// src https://blendswap.com/blend/4098
await loader.load(new URL("../../assets/cycle.gltf", import.meta.url));
export const cycle = loader.loadScene(0);
cycle.children[0].addComponent(
    new Transform({
        translation: [0, 10, 10],
    }),
);
// make disc be a child of player
cycle.children[0].addChild(cycle.children.pop());
// TODO: make camera child too

// connect it with physics
export const cycle_body = Body.from_node(cycle.children[0], "player");
cycle.children[0].addComponent(cycle_body);
// unfortunately we must lock rotations to prevent cycle to fly
cycle_body.rigidBody.setEnabledRotations(false, true, false, true);
cycle.addComponent(new PlayerController(cycle_body));
cycle.addComponent({
    update: () => console.log(cycle_body.translation),
});
//cycle.addComponent(new FirstPersonController(cycle, canvas));
