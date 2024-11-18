import { vec3 } from '../../extern/glm/index.js';
import { Transform } from '../core.js';

export class TranslateAnimator {
    constructor(node, {
        amplitude = 1,
        frequency = 1, // Number of oscillations per second
        startTime = 0,
        loop = true,
    } = {}) {
        this.node = node;
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.startTime = startTime;
        this.loop = loop;
        this.playing = true;
    }

    play() {
        this.playing = true;
        this.startTime = performance.now();
    }

    pause() {
        this.playing = false;
    }

    update(t, dt) {
        if (!this.playing) {
            return;
        }

        const elapsed = t - this.startTime;
        const loopTime = 1000 / this.frequency;

        if (elapsed >= loopTime) {
            if (this.loop) {
                this.startTime = t;
            } else {
                this.playing = false;
            }
        }

        const offsetY = Math.sin((elapsed / loopTime) * Math.PI * 2) * this.amplitude;

        this.updateNode(offsetY);
    }

    updateNode(offsetY) {
        const transform = this.node.getComponentOfType(Transform);
        if (transform) {
            const originalPosition = transform.translation;
            transform.translation = vec3.fromValues(originalPosition[0], offsetY, originalPosition[2]);
        }
    }
}
