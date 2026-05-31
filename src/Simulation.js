// src/Simulation.js

import { Materials } from "./Materials.js";

export default class Simulation {

    constructor(world) {
        this.world = world;
    }

    step() {

        this.world.beginTick();

        const parity = this.world.tick % 2;

        for (let y = this.world.height - 2; y >= 0; y--) {
            for (let x = 0; x < this.world.width; x++) {

                if ((x + y) % 2 !== parity)
                    continue;

                const cell = this.world.get(x, y);

                if (!cell)
                    continue;

                this.update(x, y, cell);
            }
        }
    }

    update(x, y, cell) {

        const belowY = y + 1;

        if (!this.world.inBounds(x, belowY))
            return;

        const below = this.world.get(x, belowY);

        if (!below)
            return;

        const a = Materials[cell.type];
        const b = Materials[below.type];

        // gravity rule: heavier falls through lighter
        if (a.density > b.density) {
            this.world.swap(x, y, x, belowY);
        }
    }
}
