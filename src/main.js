// src/main.js

import World from "./World.js";
import Cell from "./Cell.js";
import Simulation from "./Simulation.js";

import {
    WORLD_WIDTH,
    WORLD_HEIGHT
} from "./constants.js";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

/*
 * FIX: pixel-perfect scaling (no distortion)
 */

const scale = Math.floor(
    Math.min(
        window.innerWidth / WORLD_WIDTH,
        window.innerHeight / WORLD_HEIGHT
    )
);

canvas.width = WORLD_WIDTH;
canvas.height = WORLD_HEIGHT;

canvas.style.width = `${WORLD_WIDTH * scale}px`;
canvas.style.height = `${WORLD_HEIGHT * scale}px`;

canvas.style.display = "block";
canvas.style.margin = "auto";
canvas.style.imageRendering = "pixelated";

const world = new World(WORLD_WIDTH, WORLD_HEIGHT);
const sim = new Simulation(world);

/*
 * seed world
 */

function seedBlob(cx, cy, r, fn) {

    for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {

            const dx = x - cx;
            const dy = y - cy;

            if (dx * dx + dy * dy > r * r) continue;
            if (!world.inBounds(x, y)) continue;

            world.set(x, y, fn());
        }
    }
}

seedBlob(80, 60, 25, () =>
    new Cell({
        mass: 200,
        cohesion: 220,
        energy: 20,
        conductivity: 80
    })
);

seedBlob(160, 60, 25, () =>
    new Cell({
        mass: 180,
        cohesion: 90,
        energy: 90,
        conductivity: 120
    })
);

seedBlob(120, 140, 25, () =>
    new Cell({
        mass: 60,
        cohesion: 30,
        energy: 220,
        conductivity: 200
    })
);

function render() {

    const img =
        ctx.createImageData(world.width, world.height);

    const data = img.data;

    for (let i = 0; i < world.grid.length; i++) {

        const cell = world.grid[i];
        const p = i * 4;

        if (!cell) {
            data[p] = 0;
            data[p + 1] = 0;
            data[p + 2] = 0;
            data[p + 3] = 255;
            continue;
        }

        data[p] = cell.mass;
        data[p + 1] = cell.cohesion;
        data[p + 2] = cell.energy;
        data[p + 3] = 255;
    }

    ctx.putImageData(img, 0, 0);
}

function loop() {
    sim.step();
    render();
    requestAnimationFrame(loop);
}

loop();
