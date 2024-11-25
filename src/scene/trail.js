// @ts-check
import {vec3} from "../../extern/glm/index.js"
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
// init začetni točki za sled TO DO: fix inital positions to be single line of starting position
mesh.vertices.push(new Vertex({ position: [0, 4, 0] }));
mesh.vertices.push(new Vertex({ position: [0, 1, 0] }));
mesh.vertices.push(new Vertex({ position: [0, 4, 0] }));
mesh.vertices.push(new Vertex({ position: [0, 1, 0] }));

let ix = 3;

mesh.indices.push(0, 1, 2);
mesh.indices.push(1, 2, 3);

// dodaj sled za userjem
trail.addComponent({
    update(t) {
        let matrika = trail.parent.children[2].components[0].matrix;
        let a = [0,0,0]; 
        let b = [0,0,0];
        ix = ix + 2;
        vec3.transformMat4(a, mesh.vertices[0].position, matrika);
        vec3.transformMat4(b, mesh.vertices[1].position, matrika);
        
        //dodaj točki
        mesh.vertices.push(new Vertex({ position: a }));
        mesh.vertices.push(new Vertex({ position: b }));
        
        // dodaj trikotnika
        mesh.indices.push(ix-3, ix-2, ix-1, ix-2, ix-1, ix);
    },
});


//TO DO: make it 4 point based so it can be seen if in the same plane.