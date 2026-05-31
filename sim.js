const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

// ---------- GRID ----------
let GRID_W = 200;
let GRID_H = 120;

let grid = new Uint8Array(GRID_W * GRID_H);
let next = new Uint8Array(GRID_W * GRID_H);

const EMPTY = 0;
const SAND = 1;

// ---------- RESIZE ----------
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ---------- HELPERS ----------
function idx(x, y) {
  return x + y * GRID_W;
}

// out-of-bounds = SOLID
function isAir(x, y) {
  if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return false;
  return grid[idx(x, y)] === EMPTY;
}

// ---------- INIT ----------
function seed() {
  for (let x = 0; x < GRID_W; x++) {
    grid[idx(x, 0)] = SAND; // top line of sand
  }
}
seed();

// ---------- STEP ----------
function step() {
  next.fill(EMPTY);

  // bottom-up prevents overwriting issues
  for (let y = GRID_H - 1; y >= 0; y--) {
    for (let x = 0; x < GRID_W; x++) {

      const i = idx(x, y);

      if (grid[i] !== SAND) continue;

      // try move down
      if (isAir(x, y + 1)) {
        next[idx(x, y + 1)] = SAND;
        continue;
      }

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
        next[i] = SAND;
      }
    }
  }

  const tmp = grid;
  grid = next;
  next = tmp;
}

// ---------- DRAW ----------
function draw() {
  const cellW = canvas.width / GRID_W;
  const cellH = canvas.height / GRID_H;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#d6c28a";

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (grid[idx(x, y)] === SAND) {
        ctx.fillRect(
          x * cellW,
          y * cellH,
          cellW + 1,
          cellH + 1
        );
      }
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
