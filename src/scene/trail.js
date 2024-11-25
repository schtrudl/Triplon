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
mesh.vertices.push(new Vertex({ position: [0, 4, -20] }));
mesh.vertices.push(new Vertex({ position: [0, 1, -20] }));
mesh.vertices.push(new Vertex({ position: [0, 4, 10] }));
mesh.vertices.push(new Vertex({ position: [0, 1, 10] }));

mesh.indices.push(0, 1, 2);
mesh.indices.push(1, 2, 3);

// dodaj sled za userjem
trail.addComponent({
    update(t) {
        console.log(trail.parent.children[2].components[0]);
        //dodaj točki
        //mesh.vertices.push(new Vertex({ position: [7, 6, 10] }));
        //mesh.vertices.push(new Vertex({ position: [1, 6, 10] }));
        // dodaj trikotnika
        //mesh.indices.push([0, 1, 2]);
        //mesh.indices.push([1, 2, 3]);
    },
});
