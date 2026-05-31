const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

// ---- CONFIG ----
let GRID_W = 200;
let GRID_H = 120;

let grid = new Uint8Array(GRID_W * GRID_H);
let next = new Uint8Array(GRID_W * GRID_H);

const EMPTY = 0;
const SAND = 1;
const WATER = 2;
const STONE = 3;

// ---- RESIZE HANDLING (IMPORTANT FOR NO STRETCHING) ----
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ---- HELPERS ----
function idx(x, y) {
  return x + y * GRID_W;
}

function swap() {
  let tmp = grid;
  grid = next;
  next = tmp;
}

// ---- INIT: random test world ----
function seed() {
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      let r = Math.random();
      if (y > GRID_H * 0.8) {
        grid[idx(x, y)] = r < 0.3 ? SAND : r < 0.35 ? WATER : EMPTY;
      } else if (y === GRID_H - 1) {
        grid[idx(x, y)] = STONE;
      } else {
        grid[idx(x, y)] = EMPTY;
      }
    }
  }
}
seed();

// ---- SIMULATION STEP ----
function step() {
  next.fill(EMPTY);

  // copy stone first
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === STONE) next[i] = STONE;
  }

  // bottom-up scan (important for gravity correctness)
  for (let y = GRID_H - 2; y >= 0; y--) {
    for (let x = 0; x < GRID_W; x++) {
      let i = idx(x, y);
      let cell = grid[i];

      if (cell === EMPTY || cell === STONE) continue;

      if (cell === SAND) {
        sand(x, y, i);
      } else if (cell === WATER) {
        water(x, y, i);
      }
    }
  }

  swap();
}

// ---- SAND BEHAVIOR ----
function sand(x, y, i) {
  let below = idx(x, y + 1);

  if (grid[below] === EMPTY) {
    next[below] = SAND;
    return;
  }

  // diagonal fall
  let dir = Math.random() < 0.5 ? -1 : 1;
  let dl = idx(x + dir, y + 1);

  if (x + dir >= 0 && x + dir < GRID_W && grid[dl] === EMPTY) {
    next[dl] = SAND;
    return;
  }

  // stay
  next[i] = SAND;
}

// ---- WATER BEHAVIOR ----
function water(x, y, i) {
  let below = idx(x, y + 1);

  if (grid[below] === EMPTY) {
    next[below] = WATER;
    return;
  }

  let dirs = [-1, 1];
  for (let d of dirs) {
    let nx = x + d;
    let ni = idx(nx, y);
    if (nx >= 0 && nx < GRID_W && grid[ni] === EMPTY) {
      next[ni] = WATER;
      return;
    }
  }

  next[i] = WATER;
}

// ---- RENDER ----
function draw() {
  const cellW = canvas.width / GRID_W;
  const cellH = canvas.height / GRID_H;

  // prevent distortion: we use grid ratio match, not pixel mapping
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      let v = grid[idx(x, y)];
      if (v === EMPTY) continue;

      switch (v) {
        case SAND:
          ctx.fillStyle = "#d6c28a";
          break;
        case WATER:
          ctx.fillStyle = "#4aa3ff";
          break;
        case STONE:
          ctx.fillStyle = "#666666";
          break;
      }

      ctx.fillRect(
        x * cellW,
        y * cellH,
        cellW + 1,
        cellH + 1
      );
    }
  }
}

// ---- LOOP ----
function loop() {
  step();
  draw();
  requestAnimationFrame(loop);
}

loop();
