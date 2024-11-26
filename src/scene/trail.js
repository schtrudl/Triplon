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
trail.name="trail";
const mesh = new Mesh();
mesh.name="trail";
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
let ix = 0;
let prevT = 0;
let x1 = new Vertex({position : [0.01,3.5,-4]});
let x2 = new Vertex({position : [0.01,1,-4]});
let x3 = new Vertex({position : [-0.01,3.5,-4]});
let x4 = new Vertex({position : [-0.01,1,-4]}); 


// dodaj sled za userjem 
// izracuna premik tock jih doda ter indexira
trail.addComponent({
    update(t) {
        if(t-prevT <= 0.5){
            return;
        }
        prevT=t;

        //izracunaj premik tock 
        console.log(trail.parent)
        //let matrika = trail.parent.children[2].components[0].matrix;
        ix = ix + 2;
        let a = [0,0,0];
        let b = [0,0,0];
        let c = [0,0,0];
        let d = [0,0,0];
        //vec3.transformMat4(a, x1.position, matrika);
        //vec3.transformMat4(b, x2.position, matrika);
        //vec3.transformMat4(c, x3.position, matrika);
        //vec3.transformMat4(d, x4.position, matrika);
        
        //dodaj točki
        mesh.vertices.push(new Vertex({ position: a }));
        mesh.vertices.push(new Vertex({ position: b }));
        //mesh.vertices.push(new Vertex({ position: c }));
        //mesh.vertices.push(new Vertex({ position: d }));
        
        
        // dodaj trikotnika
        // delete this when you figure out biger buffer
        if(ix >= 4)
            mesh.indices.push(ix-4, ix-3, ix-2, ix-3, ix-2, ix-1);
        
        /*
            first four:
                connect 0,1,2, 1,2,3    back side ix=4
                every new 4 we connect by outside edges ix=8
                0,1,4 1,4,5
                0,2,4 2,4,6
                2,3,6 3,6,7
                1,3,5 3,5,7
                we dont need to  connect the new front efge since this edge is inside the cycle
                
                if(ix == 4)
                    mesh.indices.push(ix-4, ix-3, ix-2, ix-3, ix-2, ix-1);
                else
                    mesh.indices.push(ix-8, ix-7, ix-4, ix-7, ix-4, ix-3);
                    mesh.indices.push(ix-8, ix-6, ix-4, ix-6, ix-4, ix-2);
                    mesh.indices.push(ix-6, ix-5, ix-2, ix-5, ix-2, ix-1);
                    mesh.indices.push(ix-7, ix-5, ix-3, ix-5, ix-3, ix-1);
            
        */

        console.log(mesh.vertices,mesh.indices);
    },
});


//TO DO: make it 4 point based so it can be seen if in the same plane.