// src/Cell.js

import {
    MIN_MASS,
    MAX_MASS,

    MIN_COHESION,
    MAX_COHESION,

    MIN_ENERGY,
    MAX_ENERGY,

    MIN_CONDUCTIVITY,
    MAX_CONDUCTIVITY
} from "./constants.js";

/*
 * Clamp helper.
 */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/*
 * Fundamental unit of matter.
 *
 * No material types.
 * No inheritance.
 * No special behavior.
 *
 * Every occupied location in the universe
 * is represented by one of these.
 */

export default class Cell {

    constructor({
        mass = 0,
        cohesion = 0,
        energy = 0,
        conductivity = 0
    } = {}) {

        this.mass = clamp(
            mass,
            MIN_MASS,
            MAX_MASS
        );

        this.cohesion = clamp(
            cohesion,
            MIN_COHESION,
            MAX_COHESION
        );

        this.energy = clamp(
            energy,
            MIN_ENERGY,
            MAX_ENERGY
        );

        this.conductivity = clamp(
            conductivity,
            MIN_CONDUCTIVITY,
            MAX_CONDUCTIVITY
        );

        /*
         * Used by simulation scheduling.
         *
         * Prevents multiple updates
         * within a single tick.
         */

        this.lastUpdatedTick = -1;
    }

    /*
     * Create a deep copy.
     */

    clone() {
        return new Cell({
            mass: this.mass,
            cohesion: this.cohesion,
            energy: this.energy,
            conductivity: this.conductivity
        });
    }

    /*
     * Apply thermal energy.
     */

    addEnergy(amount) {
        this.energy = clamp(
            this.energy + amount,
            MIN_ENERGY,
            MAX_ENERGY
        );
    }

    /*
     * Remove thermal energy.
     */

    removeEnergy(amount) {
        this.energy = clamp(
            this.energy - amount,
            MIN_ENERGY,
            MAX_ENERGY
        );
    }

    /*
     * Adjust cohesion.
     */

    addCohesion(amount) {
        this.cohesion = clamp(
            this.cohesion + amount,
            MIN_COHESION,
            MAX_COHESION
        );
    }

    /*
     * Adjust mass.
     */

    addMass(amount) {
        this.mass = clamp(
            this.mass + amount,
            MIN_MASS,
            MAX_MASS
        );
    }

    /*
     * Serialization.
     */

    toJSON() {
        return {
            mass: this.mass,
            cohesion: this.cohesion,
            energy: this.energy,
            conductivity: this.conductivity
        };
    }

    /*
     * Convenience factory.
     */

    static fromJSON(data) {
        return new Cell(data);
    }
}
