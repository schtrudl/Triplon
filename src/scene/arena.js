// @ts-check
import { Body } from "../Body.js";
import { Model } from "../../engine/core.js";
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
await loader.load(new URL("../../assets/arena.gltf", import.meta.url));

export const arena = loader.loadScene(0);

// disable mipmaps of hills due to phantom arrows
arena
    .filter((node) => node.name.includes("hill"))
    .forEach(
        (node) =>
            (node.getComponentOfType(
                Model,
            ).primitives[0].material.baseTexture.mipmap = false),
    );

// connect physics with arena

arena
    .filter((node) => node.name.includes("hill"))
    .forEach((node) => {
        node.addComponent(Body.from_node(node, "ground"));
    });
arena
    .filter((node) => node.name.includes("grid"))
    .forEach((node) => {
        console.log(node);
        node.addComponent(Body.from_node(node, "ground"));
    });
/*
arena
    .filter((node) => node.name.includes("wall"))
    .forEach((node) => {
        node.addComponent(Body.from_node(node, "wall"));
    });
arena
    .filter((node) => node.name.includes("edition"))
    .forEach((node) => {
        node.addComponent(Body.from_node(node, "wall"));
    });
*/
