// @ts-check
import { Node, Model, Transform } from "../../engine/core.js";
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";
const loader = new GLTFLoader();
// src https://blendswap.com/blend/4098
await loader.load(new URL("../../assets/disc.gltf", import.meta.url));
const disc_model = loader.loadScene(0);
/**
 * Creates new disc (model is still shared)
 * @param {string} name
 * @param {import("../../extern/glm/index.js").Vec3Like} position
 */
export function disc(name, position) {
    let d = new Node();
    d.name = name;
    d.addComponent(
        new Transform({
            translation: position,
        }),
    );
    // TODO: animator rotating and up down
    // TODO: handle collision (set boost_available to player and remove disc from scene)
    d.addComponent(disc_model.getComponentOfType(Model));
}
