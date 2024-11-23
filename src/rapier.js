// @ts-check
import RAPIER from "../extern/rapier3d-compat/rapier.js";
await RAPIER.init().then(() => console.log("rapier loaded"));
export { RAPIER };
export * from "../extern/rapier3d-compat/rapier.js";

export const gravity = { x: 0.0, y: -10, z: 0.0 };
export const world = new RAPIER.World(gravity);

/**
 * Makes a step in Physical world for dt
 * @param {number} dt
 */
export function step(dt) {
    //console.log(dt);
    world.timestep = dt;
    world.step();
}
