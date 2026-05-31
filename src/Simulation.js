// src/Simulation.js

import Cell from "./Cell.js";
import {
    MOVE_DIRECTIONS,
    GRAVITY_WEIGHT,
    COHESION_WEIGHT,
    THERMAL_WEIGHT,
    ENERGY_DIFFUSION_RATE
} from "./constants.js";

export default class Simulation {

    constructor(world) {
        this.world = world;
    }

    /*
     * ==========================================
     * MAIN TICK
     * ==========================================
     */

    step() {

        this.world.beginTick();

        // bottom-up scan reduces bias from gravity
        for (let y = this.world.height - 1; y >= 0; y--) {

            for (let x = 0; x < this.world.width; x++) {

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
     * ==========================================
     * CORE CELL UPDATE RULE
     * ==========================================
     */

    updateCell(x, y, cell) {

        const candidates = [];

        for (const [dx, dy] of MOVE_DIRECTIONS) {

            const nx = x + dx;
            const ny = y + dy;

            if (!this.world.inBounds(nx, ny))
                continue;

            const target = this.world.get(nx, ny);

            // only consider empty or swappable space
            if (target && target !== null)
                continue;

            const score = this.scoreMove(
                x, y,
                nx, ny,
                cell
            );

            candidates.push({
                x: nx,
                y: ny,
                score
            });
        }

        if (candidates.length === 0)
            return;

        // pick best candidate
        candidates.sort((a, b) => b.score - a.score);

        const best = candidates[0];

        // execute move
        this.world.move(x, y, best.x, best.y);
    }

    /*
     * ==========================================
     * UNIVERSAL PHYSICS SCORING FUNCTION
     * ==========================================
     */

    scoreMove(x, y, nx, ny, cell) {

        let score = 0;

        const dy = ny - y;

        /*
         * GRAVITY
         * bias toward downward movement
         */

        score += dy * cell.mass * GRAVITY_WEIGHT;

        /*
         * COHESION
         * pull toward clustered matter
         */

        const neighbors = this.world.getOccupiedNeighbors(nx, ny);

        let cohesionForce = 0;

        for (const n of neighbors) {

            cohesionForce +=
                (cell.cohesion * n.cell.cohesion);
        }

        score += cohesionForce * COHESION_WEIGHT;

        /*
         * THERMAL MOTION
         * random perturbation based on energy
         */

        score +=
            (Math.random() - 0.5)
            * cell.energy
            * THERMAL_WEIGHT;

        return score;
    }

    /*
     * ==========================================
     * ENERGY DIFFUSION
     * ==========================================
     *
     * This is what eventually makes:
     * - heat spread
     * - temperature emerge
     * - phase changes possible
     */

    diffuseEnergy() {

        const transfers = [];

        this.world.forEachCell((cell, x, y) => {

            const neighbors =
                this.world.getOccupiedNeighbors(x, y);

            for (const n of neighbors) {

                const other = n.cell;

                const delta =
                    (cell.energy - other.energy)
                    * ENERGY_DIFFUSION_RATE;

                if (Math.abs(delta) < 0.01)
                    continue;

                transfers.push({
                    a: cell,
                    b: other,
                    amount: delta
                });
            }
        });

        // apply transfers
        for (const t of transfers) {

            t.a.energy -= t.amount;
            t.b.energy += t.amount;
        }
    }
}
