// @ts-check
import {
    Node,
    Model,
    Transform,
    Primitive,
    Material,
    Texture,
    Sampler,
} from "../../engine/core.js";
import { resources } from "../resources.js";

export const floor = new Node();

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
