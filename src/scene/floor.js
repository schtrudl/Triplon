// @ts-check
import { Body } from "../Body.js";
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
        translation: [0, 0, 0],
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
                            maxAnisotropy: 1,
                        }),
                    }),
                }),
            }),
        ],
    }),
);
floor.addComponent(Body.from_node(floor, "ground"));
