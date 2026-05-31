import World from "./World.js";
import Cell from "./Cell.js";
import Simulation from "./Simulation.js";
import { Materials } from "./Materials.js";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

const W = 200;
const H = 120;

canvas.width = W;
canvas.height = H;

const world = new World(W, H);
const sim = new Simulation(world);

// seed test world

for (let x = 80; x < 120; x++) {
    for (let y = 20; y < 40; y++) {
        world.set(x, y, new Cell("sand"));
    }
}

for (let x = 90; x < 110; x++) {
    for (let y = 10; y < 15; y++) {
        world.set(x, y, new Cell("water"));
    }
}

for (let x = 60; x < 70; x++) {
    for (let y = 10; y < 50; y++) {
        world.set(x, y, new Cell("stone"));
    }
}

function render() {

    const img = ctx.createImageData(W, H);

    for (let i = 0; i < world.grid.length; i++) {

        const cell = world.grid[i];
        const p = i * 4;

        if (!cell) {
            img.data[p + 3] = 255;
            continue;
        }

        const m = Materials[cell.type];

        img.data[p] = m.color[0];
        img.data[p + 1] = m.color[1];
        img.data[p + 2] = m.color[2];
        img.data[p + 3] = 255;
    }

    ctx.putImageData(img, 0, 0);
}

function loop() {
    sim.step();
    render();
    requestAnimationFrame(loop);
}

loop();
