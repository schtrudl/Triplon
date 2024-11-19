// @ts-check
import {
    Node,
    Model,
    Primitive,
    Material,
    Mesh,
    Vertex,
} from "../../engine/core.js";

export const trail = new Node();

const mesh = new Mesh();

trail.addComponent(
    new Model({
        primitives: [
            new Primitive({
                mesh,
                material: new Material({
                    // barva sledi
                    baseFactor: [1, 0.5, 0.5, 1],
                }),
            }),
        ],
    }),
);
// init začetni točki za sled
mesh.vertices.push(new Vertex({ position: [0, 0, 0] }));
mesh.vertices.push(new Vertex({ position: [0, 0, 0] }));

// dodaj sled za userjem
trail.addComponent({
    update(t) {
        // dodaj točki
        mesh.vertices.push(new Vertex({ position: [0, 0, 0] }));
        mesh.vertices.push(new Vertex({ position: [0, 0, 0] }));
        // dodaj trikotnika
        mesh.indices.push([0, 1, 2]);
        mesh.indices.push([1, 2, 3]);
    },
});
