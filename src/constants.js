// src/constants.js

/*
 * World dimensions.
 * These are simulation cells, not screen pixels.
 */

export const WORLD_WIDTH = 256;
export const WORLD_HEIGHT = 256;

/*
 * Empty cell sentinel.
 */

export const EMPTY = null;

/*
 * Neighbor directions.
 *
 * Ordered from strongest gravity preference
 * to weakest.
 */

export const MOVE_DIRECTIONS = [
    [0, 1],    // down

    [-1, 1],   // down-left
    [1, 1],    // down-right

    [-1, 0],   // left
    [1, 0],    // right

    [-1, -1],  // up-left
    [1, -1],   // up-right

    [0, -1]    // up
];

/*
 * Simulation tuning.
 *
 * These should eventually be loaded
 * from configuration instead of being
 * hardcoded.
 */

export const GRAVITY_WEIGHT = 1.0;
export const COHESION_WEIGHT = 0.02;
export const THERMAL_WEIGHT = 1.0;

/*
 * Energy transfer.
 */

export const ENERGY_DIFFUSION_RATE = 0.05;

/*
 * Bounds for properties.
 */

export const MIN_MASS = 0;
export const MAX_MASS = 255;

export const MIN_COHESION = 0;
export const MAX_COHESION = 255;

export const MIN_ENERGY = 0;
export const MAX_ENERGY = 255;

export const MIN_CONDUCTIVITY = 0;
export const MAX_CONDUCTIVITY = 255;
