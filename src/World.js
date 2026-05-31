// src/World.js

import { EMPTY } from "./constants.js";

export default class World {

    constructor(width, height) {

        this.width = width;
        this.height = height;

        this.tick = 0;

        this.grid = new Array(width * height)
            .fill(EMPTY);
    }

    /*
     * ==================================
     * INDEXING
     * ==================================
     */

    index(x, y) {
        return y * this.width + x;
    }

    inBounds(x, y) {
        return (
            x >= 0 &&
            x < this.width &&
            y >= 0 &&
            y < this.height
        );
    }

    /*
     * ==================================
     * CELL ACCESS
     * ==================================
     */

    get(x, y) {

        if (!this.inBounds(x, y))
            return null;

        return this.grid[
            this.index(x, y)
        ];
    }

    set(x, y, cell) {

        if (!this.inBounds(x, y))
            return false;

        this.grid[
            this.index(x, y)
        ] = cell;

        return true;
    }

    clear(x, y) {

        if (!this.inBounds(x, y))
            return false;

        this.grid[
            this.index(x, y)
        ] = EMPTY;

        return true;
    }

    isEmpty(x, y) {

        if (!this.inBounds(x, y))
            return false;

        return this.get(x, y) === EMPTY;
    }

    /*
     * ==================================
     * MOVEMENT
     * ==================================
     */

    move(fromX, fromY, toX, toY) {

        if (!this.inBounds(fromX, fromY))
            return false;

        if (!this.inBounds(toX, toY))
            return false;

        if (!this.isEmpty(toX, toY))
            return false;

        const cell =
            this.get(fromX, fromY);

        if (!cell)
            return false;

        this.set(toX, toY, cell);
        this.clear(fromX, fromY);

        return true;
    }

    swap(x1, y1, x2, y2) {

        if (!this.inBounds(x1, y1))
            return false;

        if (!this.inBounds(x2, y2))
            return false;

        const a =
            this.get(x1, y1);

        const b =
            this.get(x2, y2);

        this.set(x1, y1, b);
        this.set(x2, y2, a);

        return true;
    }

    /*
     * ==================================
     * NEIGHBORHOODS
     * ==================================
     */

    getNeighbors(x, y) {

        const neighbors = [];

        for (let oy = -1; oy <= 1; oy++) {

            for (let ox = -1; ox <= 1; ox++) {

                if (ox === 0 && oy === 0)
                    continue;

                const nx = x + ox;
                const ny = y + oy;

                if (!this.inBounds(nx, ny))
                    continue;

                neighbors.push({
                    x: nx,
                    y: ny,
                    cell: this.get(nx, ny)
                });
            }
        }

        return neighbors;
    }

    getOccupiedNeighbors(x, y) {

        return this.getNeighbors(x, y)
            .filter(n => n.cell !== EMPTY);
    }

    getEmptyNeighbors(x, y) {

        return this.getNeighbors(x, y)
            .filter(n => n.cell === EMPTY);
    }

    /*
     * ==================================
     * ITERATION
     * ==================================
     */

    forEachCell(callback) {

        for (let y = 0; y < this.height; y++) {

            for (let x = 0; x < this.width; x++) {

                const cell =
                    this.get(x, y);

                if (!cell)
                    continue;

                callback(cell, x, y);
            }
        }
    }

    /*
     * ==================================
     * TICK CONTROL
     * ==================================
     */

    beginTick() {
        this.tick++;
    }

    wasUpdatedThisTick(cell) {

        return (
            cell.lastUpdatedTick ===
            this.tick
        );
    }

    markUpdated(cell) {

        cell.lastUpdatedTick =
            this.tick;
    }

    /*
     * ==================================
     * STATISTICS
     * ==================================
     */

    countCells() {

        let count = 0;

        for (const cell of this.grid) {

            if (cell !== EMPTY)
                count++;
        }

        return count;
    }

    totalEnergy() {

        let total = 0;

        for (const cell of this.grid) {

            if (!cell)
                continue;

            total += cell.energy;
        }

        return total;
    }

    totalMass() {

        let total = 0;

        for (const cell of this.grid) {

            if (!cell)
                continue;

            total += cell.mass;
        }

        return total;
    }
}
