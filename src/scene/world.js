// @ts-check
import { step } from "../rapier.js";
import { Node } from "../../engine/core.js";
import { arena } from "./arena.js";
import { floor } from "./floor.js";
import { camera } from "./camera.js";
import { cycle } from "./cycle.js";

export const world = new Node();

/*world.addComponent({
    update(_t, dt) {
        // Update worlds Physics
        step(dt);
    },
});*/

world.addChild(arena);
world.addChild(camera);
//world.addChild(floor);
world.addChild(cycle);
