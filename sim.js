const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

// ---------- CONFIG ----------
const CELL_SIZE = 4;

let GRID_W = 0;
let GRID_H = 0;

let grid;
let next;

const EMPTY = 0;
const SAND = 1;

// ---------- HELPERS ----------
function idx(x, y) {
  return x + y * GRID_W;
}

// out of bounds = solid (NOT air)
function isAir(x, y) {
  if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return false;
  return grid[idx(x, y)] === EMPTY;
}

// ---------- RESIZE ----------
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  GRID_W = Math.floor(canvas.width / CELL_SIZE);
  GRID_H = Math.floor(canvas.height / CELL_SIZE);

  grid = new Uint8Array(GRID_W * GRID_H);
  next = new Uint8Array(GRID_W * GRID_H);

  seed();
}

window.addEventListener("resize", resize);
resize();

// ---------- INIT ----------
function seed() {
  grid.fill(EMPTY);

  // simple top layer of sand
  for (let x = 0; x < GRID_W; x++) {
    grid[idx(x, 0)] = SAND;
  }
}

// ---------- STEP ----------
function step() {
  next.fill(EMPTY);

  for (let y = GRID_H - 1; y >= 0; y--) {
    for (let x = 0; x < GRID_W; x++) {

      const i = idx(x, y);

      if (grid[i] !== SAND) continue;

      // 1. fall straight down
      if (isAir(x, y + 1)) {
        next[idx(x, y + 1)] = SAND;
        continue;
      }

      // 2. check diagonals
      const left = isAir(x - 1, y + 1);
      const right = isAir(x + 1, y + 1);

      if (left && right) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        next[idx(x + dir, y + 1)] = SAND;
      } else if (left) {
        next[idx(x - 1, y + 1)] = SAND;
      } else if (right) {
        next[idx(x + 1, y + 1)] = SAND;
      } else {
        // stay in place
        next[i] = SAND;
      }
    }
  }

  // swap buffers
  const tmp = grid;
  grid = next;
  next = tmp;
}

// ---------- DRAW ----------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#d6c28a";

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {

      if (grid[idx(x, y)] !== SAND) continue;

      ctx.fillRect(
        x * CELL_SIZE,
        y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }
}

// ---------- LOOP ----------
function loop() {
  step();
  draw();
  requestAnimationFrame(loop);
}

loop();
