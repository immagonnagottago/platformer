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

function randDir() {
  return Math.random() < 0.5 ? -1 : 1;
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

// ---------------- SEED ----------------
function seed() {
  grid.fill(EMPTY);

  // simple sand pile in center
  const cx = Math.floor(GRID_W / 2);
  const cy = Math.floor(GRID_H / 4);
  const r = 10;

  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) {
        const gx = cx + x;
        const gy = cy + y;

        if (inBounds(gx, gy)) {
          grid[idx(gx, gy)] = SAND;
        }
      }
    }
  }
}

// ---------------- STEP ----------------
function step() {
  next.fill(EMPTY);

  // bottom-up so sand settles correctly
  for (let y = GRID_H - 1; y >= 0; y--) {
    for (let x = 0; x < GRID_W; x++) {

      const i = idx(x, y);

      if (grid[i] !== SAND) continue;

      // 1. fall down
      if (isEmpty(x, y + 1)) {
        next[idx(x, y + 1)] = SAND;
        continue;
      }

      // 2. diagonal fall
      const dir = randDir();

      if (isEmpty(x + dir, y + 1)) {
        next[idx(x + dir, y + 1)] = SAND;
        continue;
      }

      if (isEmpty(x - dir, y + 1)) {
        next[idx(x - dir, y + 1)] = SAND;
        continue;
      }

      // 3. stay
      next[i] = SAND;
    }
  }

  const tmp = grid;
  grid = next;
  next = tmp;
}

// ---------------- DRAW ----------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#d6c28a";

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (grid[idx(x, y)] === SAND) {
        ctx.fillRect(
          x * CELL_SIZE,
          y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );
      }
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
