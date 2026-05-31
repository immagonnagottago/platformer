// src/Simulation.js

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

    step() {

        this.world.beginTick();

        for (let y = this.world.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.world.width; x++) {

                const cell = this.world.get(x, y);

                if (!cell) continue;
                if (this.world.wasUpdatedThisTick(cell)) continue;

                this.updateCell(x, y, cell);
                this.world.markUpdated(cell);
            }
        }

        this.diffuseEnergy();
    }

    updateCell(x, y, cell) {

        let bestScore = -Infinity;
        let bestMoves = [];

        // shuffle directions to remove directional bias
        const dirs = MOVE_DIRECTIONS.slice();
        this.shuffle(dirs);

        for (const [dx, dy] of dirs) {

            const nx = x + dx;
            const ny = y + dy;

            if (!this.world.inBounds(nx, ny)) continue;

            const target = this.world.get(nx, ny);

            // only allow empty space movement for now
            if (target !== null) continue;

            const score = this.scoreMove(x, y, nx, ny, cell);

            if (
                score > bestScore + 1e-9
            ) {
                bestScore = score;
                bestMoves = [{ x: nx, y: ny }];
            } else if (Math.abs(score - bestScore) < 1e-9) {
                bestMoves.push({ x: nx, y: ny });
            }
        }

        if (bestMoves.length === 0) return;

        const move =
            bestMoves[
                (Math.random() * bestMoves.length) | 0
            ];

        this.world.move(x, y, move.x, move.y);
    }

    scoreMove(x, y, nx, ny, cell) {

        let score = 0;

        const dy = ny - y;

        score += dy * cell.mass * GRAVITY_WEIGHT;

        const neighbors =
            this.world.getOccupiedNeighbors(nx, ny);

        let cohesion = 0;

        for (const n of neighbors) {
            cohesion += cell.cohesion * n.cell.cohesion;
        }

        score += cohesion * COHESION_WEIGHT;

        score +=
            (Math.random() - 0.5)
            * cell.energy
            * THERMAL_WEIGHT;

        return score;
    }

    diffuseEnergy() {

        const transfers = [];

        this.world.forEachCell((cell, x, y) => {

            const neighbors =
                this.world.getOccupiedNeighbors(x, y);

            for (const n of neighbors) {

                const delta =
                    (cell.energy - n.cell.energy)
                    * ENERGY_DIFFUSION_RATE;

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

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
}
