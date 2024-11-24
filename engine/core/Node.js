// @ts-check
export class Node {
    constructor() {
        this.name = "";
        /**
         * @type{Node}
         */
        this.parent = null;
        /**
         * @type{Node[]}
         */
        this.children = [];
        this.components = [];
    }

    /**
     * @param {Node} node
     */
    addChild(node) {
        node.parent?.removeChild(node);
        this.children.push(node);
        node.parent = this;
    }

    /**
     * @param {Node} node
     * @returns {Node}
     */
    removeChild(node) {
        this.children = this.children.filter((child) => child !== node);
        node.parent = null;
        return node;
    }

    remove() {
        this.parent?.removeChild(this);
    }

    /**
     * @param {(arg0: this) => void} [before]
     * @param {(arg0: this) => void} [after]
     */
    traverse(before, after) {
        before?.(this);
        for (const child of this.children) {
            child.traverse(before, after);
        }
        after?.(this);
    }

    /**
     * @returns {Node[]}
     */
    linearize() {
        const array = [];
        this.traverse((node) => array.push(node));
        return array;
    }

    /**
     * @param { (node: Node) => boolean } predicate
     */
    filter(predicate) {
        return this.linearize().filter(predicate);
    }

    find(predicate) {
        return this.linearize().find(predicate);
    }

    map(transform) {
        return this.linearize().map(transform);
    }

    addComponent(component) {
        this.components.push(component);
    }

    removeComponent(component) {
        this.components = this.components.filter((c) => c !== component);
    }

    removeComponentsOfType(type) {
        this.components = this.components.filter(
            (component) => !(component instanceof type),
        );
    }

    /**
     * @template A
     * @param {A} type
     * @returns {InstanceType<A>}
     */
    getComponentOfType(type) {
        // @ts-ignore
        return this.components.find((component) => component instanceof type);
    }

    /**
     * @template A
     * @param {A} type
     * @returns {InstanceType<A>[]}
     */
    getComponentsOfType(type) {
        // @ts-ignore
        return this.components.filter((component) => component instanceof type);
    }
}
