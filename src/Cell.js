// src/Cell.js

export default class Cell {
    constructor(type) {
        this.type = type;

        // temperature drives phase changes
        this.temperature = 20;

        // used for scheduling stability
        this.updated = false;
    }

    clone() {
        const c = new Cell(this.type);
        c.temperature = this.temperature;
        return c;
    }
}
