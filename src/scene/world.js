// @ts-check
import { Node } from "../../engine/core.js";
import { camera } from "./camera.js";
import { floor } from "./floor.js";

export const world = new Node();

world.addChild(camera);
world.addChild(floor);
