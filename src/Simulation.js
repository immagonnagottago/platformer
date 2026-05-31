// src/Simulation.js

export default class Simulation {

    constructor(world) {
        this.world = world;
    }

    step() {

        this.world.beginTick();

        const parity = this.world.tick % 2;

        // checkerboard update removes sweep bias
        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {

                if ((x + y) % 2 !== parity)
                    continue;

                const cell = this.world.get(x, y);

                if (!cell)
                    continue;

                if (this.world.wasUpdatedThisTick(cell))
                    continue;

                this.updateCell(x, y, cell);

                this.world.markUpdated(cell);
            }
        }

        this.diffuseEnergy();
    }

    /*
     * =====================================================
     * CORE PHYSICS: PRESSURE RELAXATION ONLY
     * =====================================================
     *
     * No direction choice.
     * No scoring.
     * No gravity.
     * No "best move".
     *
     * Just local imbalance resolution.
     */

    updateCell(x, y, cell) {

        // pick ONE random neighbor (fully symmetric)
        const dx = (Math.random() * 3 | 0) - 1;
        const dy = (Math.random() * 3 | 0) - 1;

        if (dx === 0 && dy === 0)
            return;

        const nx = x + dx;
        const ny = y + dy;

        if (!this.world.inBounds(nx, ny))
            return;

        const other = this.world.get(nx, ny);

        if (!other)
            return;

        this.resolvePressure(cell, other);
    }

    /*
     * =====================================================
     * PRESSURE MODEL (THIS IS THE ENTIRE SYSTEM)
     * =====================================================
     *
     * mass + compressibility = pressure proxy
     *
     * No direction.
     * Just equalization of state differences.
     */

    resolvePressure(a, b) {

        const pa = a.mass * (a.compressibility ?? 1);
        const pb = b.mass * (b.compressibility ?? 1);

        const dp = pa - pb;

        // equilibrium → do nothing
        if (Math.abs(dp) < 0.01)
            return;

        const transfer = dp * 0.25;

        // symmetric relaxation
        a.mass -= transfer;
        b.mass += transfer;

        /*
         * Energy follows deformation slightly
         * (this creates viscosity-like behavior)
         */

        const energyFlow = transfer * 0.15;

        a.energy -= energyFlow;
        b.energy += energyFlow;

        /*
         * Optional cohesion smoothing
         * (kept weak so structures can still form)
         */

        const dc = (a.cohesion - b.cohesion) * 0.05;

        a.cohesion -= dc;
        b.cohesion += dc;
    }

    /*
     * =====================================================
     * ENERGY DIFFUSION
     * =====================================================
     *
     * This is the ONLY smoothing process.
     */

    diffuseEnergy() {

        const transfers = [];

        this.world.forEachCell((cell, x, y) => {

            const neighbors =
                this.world.getOccupiedNeighbors(x, y);

            for (const n of neighbors) {

                const other = n.cell;

                const delta =
                    (cell.energy - other.energy) * 0.05;

                if (Math.abs(delta) < 0.01)
                    continue;

                transfers.push({
                    a: cell,
                    b: other,
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
