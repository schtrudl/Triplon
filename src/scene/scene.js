// @ts-check
import { step } from "../rapier.js";
import { Node } from "../../engine/core.js";
import { arena } from "./arena.js";
//import { floor } from "./floor.js";
import { camera } from "./dbgcamera.js";

export const scene = new Node();

scene.addComponent({
    update(_t, dt) {
        // Update worlds Physics
        step(dt);
    },
});

scene.addChild(arena);
scene.addChild(camera);
//scene.addChild(floor);
