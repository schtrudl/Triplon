// @ts-check
import { Body } from "../Body.js";
import { Model } from "../../engine/core.js";
import { GLTFLoader } from "../../engine/loaders/GLTFLoader.js";
import { world } from "../rapier.js";

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
        node.addComponent(Body.from_node(node, "ground"));
    });

const walls = arena
    .filter((node) => node.name.includes("wall"))
    .concat(arena.filter((node) => node.name.includes("edition")));

walls.forEach((node) => {
    node.addComponent(Body.from_node(node, "wall"));
});

arena.addComponent({
    update: () => {
        walls.forEach((node) => {
            world.intersectionPairsWith(
                node.getComponentOfType(Body).rigidBody.collider(0),
                (otherCollider) => {
                    // TODO: use otherCollider.parent().userData to obtain which user collided
                    console.log("player died!");
                },
            );
        });
    },
});
