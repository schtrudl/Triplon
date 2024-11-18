// @ts-check
import { Model, Primitive, Texture } from "../../engine/core.js";
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
await loader.load(new URL("../../assets/arena.gltf", import.meta.url));

export const arena = loader.loadScene(0);
// disable mipmaps of hills due to phantom arrows
arena
    .filter((node) => node.name.includes("hill"))
    .map(
        (node) =>
            (node.getComponentOfType(
                Model,
            ).primitives[0].material.baseTexture.mipmap = false),
    );
