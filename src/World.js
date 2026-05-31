// src/World.js

export default class World {

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.grid = new Array(width * height).fill(null);

        this.tick = 0;
    }

    index(x, y) {
        return x + y * this.width;
    }

    inBounds(x, y) {
        return x >= 0 &&
               x < this.width &&
               y >= 0 &&
               y < this.height;
    }

    get(x, y) {
        return this.grid[this.index(x, y)];
    }

    set(x, y, cell) {
        this.grid[this.index(x, y)] = cell;
    }

    swap(x1, y1, x2, y2) {
        const i1 = this.index(x1, y1);
        const i2 = this.index(x2, y2);

        const tmp = this.grid[i1];
        this.grid[i1] = this.grid[i2];
        this.grid[i2] = tmp;
    }

    beginTick() {
        this.tick++;
    }
}
