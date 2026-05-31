// src/Materials.js

export const Materials = {

    air: {
        density: 0,
        solid: false,
        liquid: false,
        gas: true,
        color: [0, 0, 0]
    },

    sand: {
        density: 3,
        solid: true,
        liquid: false,
        gas: false,
        color: [194, 178, 128]
    },

    water: {
        density: 1,
        solid: false,
        liquid: true,
        gas: false,
        color: [50, 100, 255]
    },

    stone: {
        density: 10,
        solid: true,
        liquid: false,
        gas: false,
        color: [120, 120, 120]
    },

    metal: {
        density: 8,
        solid: true,
        liquid: false,
        gas: false,
        color: [180, 180, 200],

        meltPoint: 800
    },

    lava: {
        density: 6,
        solid: false,
        liquid: true,
        gas: false,
        color: [255, 80, 0],

        coolPoint: 700
    },

    glass: {
        density: 9,
        solid: true,
        liquid: false,
        gas: false,
        color: [180, 220, 255]
    }
};
