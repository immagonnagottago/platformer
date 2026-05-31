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

    exchange(a, b, ax, ay, bx, by) {

    const rate = 0.25;

    // spatial bias stays extremely small
    const bias = (ay - by) * 0.01;

    // inertia prevents collapse (THIS IS KEY)
    const inertiaA = 1 + a.energy * 0.005;
    const inertiaB = 1 + b.energy * 0.005;

    const influenceA = (1 + bias) / inertiaA;
    const influenceB = (1 - bias) / inertiaB;

    // mass (now resistant to flattening)
    const dm = a.mass - b.mass;

    a.mass -= dm * rate * influenceA;
    b.mass += dm * rate * influenceB;

    // energy (slightly self-stabilizing)
    const de = a.energy - b.energy;

    a.energy -= de * rate * influenceA;
    b.energy += de * rate * influenceB;

    // cohesion (this is what creates “structure memory”)
    const dc = a.cohesion - b.cohesion;

    a.cohesion -= dc * rate * influenceA;
    b.cohesion += dc * rate * influenceB;

    // conductivity
    const d = a.conductivity - b.conductivity;

    a.conductivity -= d * rate * influenceA;
    b.conductivity += d * rate * influenceB;
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
