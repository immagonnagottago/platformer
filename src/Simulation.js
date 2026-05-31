// src/Simulation.js

export default class Simulation {

    constructor(world) {
        this.world = world;
    }

    step() {

        this.world.beginTick();

        // checkerboard update = removes scan bias
        const parity = this.world.tick % 2;

        for (let y = this.world.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.world.width; x++) {

                if ((x + y) % 2 !== parity) continue;

                const cell = this.world.get(x, y);

                if (!cell) continue;
                if (this.world.wasUpdatedThisTick(cell)) continue;

                this.updateCell(x, y, cell);
                this.world.markUpdated(cell);
            }
        }

        this.diffuseEnergy();
    }

    /*
     * =========================================================
     * SYMMETRIC LOCAL EXCHANGE (NO DIRECTIONAL "MOVEMENT")
     * =========================================================
     */

    updateCell(x, y, cell) {

        // pick ONE random neighbor pair (no evaluation, no scoring)
        const dx = (Math.random() * 3 | 0) - 1;
        const dy = (Math.random() * 3 | 0) - 1;

        if (dx === 0 && dy === 0) return;

        const nx = x + dx;
        const ny = y + dy;

        if (!this.world.inBounds(nx, ny)) return;

        const other = this.world.get(nx, ny);

        if (!other) return;

        this.exchange(cell, other);
    }

    /*
     * =========================================================
     * FIELD RELAXATION (CORE PHYSICS OPERATOR)
     * =========================================================
     *
     * No movement. No direction. No gravity.
     * Just local equilibration of properties.
     */

    exchange(a, b) {

        const rate = 0.25;

        // mass diffusion
        const dm = a.mass - b.mass;
        a.mass -= dm * rate;
        b.mass += dm * rate;

        // energy diffusion
        const de = a.energy - b.energy;
        a.energy -= de * rate;
        b.energy += de * rate;

        // cohesion diffusion
        const dc = a.cohesion - b.cohesion;
        a.cohesion -= dc * rate;
        b.cohesion += dc * rate;

        // conductivity diffusion
        const dcond = a.conductivity - b.conductivity;
        a.conductivity -= dcond * rate;
        b.conductivity += dcond * rate;
    }

    /*
     * =========================================================
     * ENERGY DIFFUSION (kept separate but symmetric)
     * =========================================================
     */

    diffuseEnergy() {

        const transfers = [];

        this.world.forEachCell((cell, x, y) => {

            const neighbors =
                this.world.getOccupiedNeighbors(x, y);

            for (const n of neighbors) {

                const delta =
                    (cell.energy - n.cell.energy) * 0.05;

                if (Math.abs(delta) < 0.01) continue;

                transfers.push({
                    a: cell,
                    b: n.cell,
                    amount: delta
                });
            }
        });

        for (const t of transfers) {
            t.a.energy -= t.amount;
            t.b.energy += t.amount;
        }
    }
}
