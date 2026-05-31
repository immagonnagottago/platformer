const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

// ---------------- CONFIG ----------------
const CELL_SIZE = 4;

let GRID_W = 0;
let GRID_H = 0;

let grid;
let next;

const EMPTY = 0;
const SAND = 1;
const WATER = 2;
const STONE = 3;

// ---------------- HELPERS ----------------
function idx(x, y) {
  return x + y * GRID_W;
}

function inBounds(x, y) {
  return x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;
}

function isEmpty(x, y) {
  return inBounds(x, y) && grid[idx(x, y)] === EMPTY;
}

// ---------------- RESIZE ----------------
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

// ---------------- INIT ----------------
function seed() {
  grid.fill(EMPTY);

  const cx = Math.floor(GRID_W / 3);
  const cy = Math.floor(GRID_H / 2);
  const r = 10;

  // ---------------- STONE SPHERE ----------------
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) {
        const gx = cx + x;
        const gy = cy + y;

        if (inBounds(gx, gy)) {
          grid[idx(gx, gy)] = STONE;
        }
      }
    }
  }

  // ---------------- SAND SPHERE ----------------
  const sx = Math.floor(GRID_W / 2);
  const sy = Math.floor(GRID_H / 3);
  const sr = 8;

  for (let y = -sr; y <= sr; y++) {
    for (let x = -sr; x <= sr; x++) {
      if (x * x + y * y <= sr * sr) {
        const gx = sx + x;
        const gy = sy + y;

        if (inBounds(gx, gy)) {
          grid[idx(gx, gy)] = SAND;
        }
      }
    }
  }

  // ---------------- WATER SPHERE ----------------
  const wx = Math.floor(GRID_W * 0.75);
  const wy = Math.floor(GRID_H / 3);
  const wr = 6;

  for (let y = -wr; y <= wr; y++) {
    for (let x = -wr; x <= wr; x++) {
      if (x * x + y * y <= wr * wr) {
        const gx = wx + x;
        const gy = wy + y;

        if (inBounds(gx, gy)) {
          grid[idx(gx, gy)] = WATER;
        }
      }
    }
  }
}

// ---------------- STEP ----------------
function step() {
  next.fill(EMPTY);

  for (let y = GRID_H - 1; y >= 0; y--) {
    for (let x = 0; x < GRID_W; x++) {

      const i = idx(x, y);
      const v = grid[i];

      if (v === EMPTY) continue;

      // ---------------- STONE ----------------
      if (v === STONE) {
        next[i] = STONE;
        continue;
      }

      // ---------------- SAND ----------------
      if (v === SAND) {
        if (isEmpty(x, y + 1)) {
          next[idx(x, y + 1)] = SAND;
        } else {
          const dir = Math.random() < 0.5 ? -1 : 1;

          if (isEmpty(x + dir, y + 1)) {
            next[idx(x + dir, y + 1)] = SAND;
          } else if (isEmpty(x - dir, y + 1)) {
            next[idx(x - dir, y + 1)] = SAND;
          } else {
            next[i] = SAND;
          }
        }
        continue;
      }

      // ---------------- WATER ----------------
      if (v === WATER) {

        // 1. down
        if (isEmpty(x, y + 1)) {
          next[idx(x, y + 1)] = WATER;
          continue;
        }

        // 2. sideways (randomized direction)
        const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];

        for (let d of dirs) {
          if (isEmpty(x + d, y)) {
            next[idx(x + d, y)] = WATER;
            continue;
          }
        }

        // 3. diagonal down
        const d2 = Math.random() < 0.5 ? -1 : 1;

        if (isEmpty(x + d2, y + 1)) {
          next[idx(x + d2, y + 1)] = WATER;
        } else {
          next[i] = WATER;
        }

        continue;
      }
    }
  }

  const tmp = grid;
  grid = next;
  next = tmp;
}

// ---------------- DRAW ----------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {

      const v = grid[idx(x, y)];
      if (v === EMPTY) continue;

      if (v === SAND) ctx.fillStyle = "#d6c28a";
      else if (v === WATER) ctx.fillStyle = "#4aa3ff";
      else if (v === STONE) ctx.fillStyle = "#666666";

      ctx.fillRect(
        x * CELL_SIZE,
        y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }
}

// ---------------- LOOP ----------------
function loop() {
  step();
  draw();
  requestAnimationFrame(loop);
}

loop();
