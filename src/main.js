// src/main.js

import World from "./World.js";
import Cell from "./Cell.js";
import Simulation from "./Simulation.js";

import {
    WORLD_WIDTH,
    WORLD_HEIGHT
} from "./constants.js";

/*
 * ==========================================
 * BOOTSTRAP
 * ==========================================
 */

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

canvas.width = WORLD_WIDTH;
canvas.height = WORLD_HEIGHT;

canvas.style.imageRendering = "pixelated";
canvas.style.width = "100vw";
canvas.style.height = "100vh";

/*
 * ==========================================
 * WORLD + SIMULATION
 * ==========================================
 */

const world = new World(WORLD_WIDTH, WORLD_HEIGHT);
const sim = new Simulation(world);

/*
 * ==========================================
 * INITIAL CONDITIONS
 * ==========================================
 *
 * We do NOT define materials.
 * We only inject regions of different properties.
 *
 * Think: "initial state of a universe"
 */

function seedBlob(cx, cy, radius, cellFactory) {

    for (let y = cy - radius; y <= cy + radius; y++) {
        for (let x = cx - radius; x <= cx + radius; x++) {

            const dx = x - cx;
            const dy = y - cy;

            if (dx * dx + dy * dy > radius * radius)
                continue;

            if (!world.inBounds(x, y))
                continue;

            world.set(x, y, cellFactory());
        }
    }
}

/*
 * Dense cohesive matter (solid-like candidate)
 */

seedBlob(80, 60, 25, () =>
    new Cell({
        mass: 200,
        cohesion: 220,
        energy: 20,
        conductivity: 80
    })
);

/*
 * Medium cohesion / mobile matter (liquid-like candidate)
 */

seedBlob(160, 60, 25, () =>
    new Cell({
        mass: 180,
        cohesion: 90,
        energy: 90,
        conductivity: 120
    })
);

/*
 * High energy sparse matter (gas-like candidate)
 */

seedBlob(120, 140, 25, () =>
    new Cell({
        mass: 60,
        cohesion: 30,
        energy: 220,
        conductivity: 200
    })
);

/*
 * ==========================================
 * RENDERING
 * ==========================================
 *
 * We map properties -> color.
 * No material knowledge.
 */

function render() {

    const imageData =
        ctx.createImageData(world.width, world.height);

    const data = imageData.data;

    for (let i = 0; i < world.grid.length; i++) {

        const cell = world.grid[i];

        const idx = i * 4;

        if (!cell) {

            data[idx + 0] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
            data[idx + 3] = 255;

            continue;
        }

        /*
         * COLOR IS DERIVED, NOT DESIGNED
         *
         * mass -> red
         * cohesion -> green
         * energy -> blue
         */

        data[idx + 0] = cell.mass;
        data[idx + 1] = cell.cohesion;
        data[idx + 2] = cell.energy;
        data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
}

/*
 * ==========================================
 * MAIN LOOP
 * ==========================================
 */

function loop() {

    sim.step();
    render();

    requestAnimationFrame(loop);
}

loop();
