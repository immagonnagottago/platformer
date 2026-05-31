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

// ---------------- CURSOR STATE ----------------
let mouseX = 0;
let mouseY = 0;

let mouseDown = false;
let mode = 0; // 0 = paint, 1 = erase

let brushSize = 4;

let lastGX = null;
let lastGY = null;

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

// ---------------- SEED ----------------
function seed() {
  grid.fill(EMPTY);

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

// ---------------- SAND SIM ----------------
function step() {
  next.fill(EMPTY);

  for (let y = GRID_H - 1; y >= 0; y--) {
    for (let x = 0; x < GRID_W; x++) {

      const i = idx(x, y);

      if (grid[i] !== SAND) continue;

      // down
      if (isEmpty(x, y + 1)) {
        next[idx(x, y + 1)] = SAND;
        continue;
      }

      // diagonal
      const dir = Math.random() < 0.5 ? -1 : 1;

      if (isEmpty(x + dir, y + 1)) {
        next[idx(x + dir, y + 1)] = SAND;
        continue;
      }

      if (isEmpty(x - dir, y + 1)) {
        next[idx(x - dir, y + 1)] = SAND;
        continue;
      }

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

  drawCursor();
}

// ---------------- CURSOR DRAW ----------------
function drawCursor() {
  const rect = canvas.getBoundingClientRect();

  const gx = Math.floor((mouseX - rect.left) / CELL_SIZE);
  const gy = Math.floor((mouseY - rect.top) / CELL_SIZE);

  ctx.strokeStyle = mode === 0 ? "#00ff00" : "#ff0000";
  ctx.lineWidth = 1;

  ctx.strokeRect(
    gx * CELL_SIZE - brushSize * CELL_SIZE,
    gy * CELL_SIZE - brushSize * CELL_SIZE,
    brushSize * 2 * CELL_SIZE,
    brushSize * 2 * CELL_SIZE
  );
}

// ---------------- CURSOR BRUSH ----------------
function applyBrush(cx, cy) {
  for (let y = -brushSize; y <= brushSize; y++) {
    for (let x = -brushSize; x <= brushSize; x++) {

      const gx = cx + x;
      const gy = cy + y;

      if (!inBounds(gx, gy)) continue;

      const i = idx(gx, gy);

      if (mode === 0) {
        if (grid[i] === EMPTY) grid[i] = SAND;
      } else {
        if (grid[i] === SAND) grid[i] = EMPTY;
      }
    }
  }
}

// ---------------- BRESENHAM LINE ----------------
function drawLine(x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);

  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;

  let err = dx + dy;

  while (true) {
    applyBrush(x0, y0);

    if (x0 === x1 && y0 === y1) break;

    let e2 = 2 * err;

    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }

    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

// ---------------- INPUT ----------------
canvas.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 0) mouseDown = true;

  if (e.button === 2) {
    mode = 1 - mode;
  }

  const rect = canvas.getBoundingClientRect();
  lastGX = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  lastGY = Math.floor((e.clientY - rect.top) / CELL_SIZE);
});

canvas.addEventListener("mouseup", (e) => {
  if (e.button === 0) mouseDown = false;
  lastGX = null;
  lastGY = null;
});

canvas.addEventListener("contextmenu", e => e.preventDefault());

canvas.addEventListener("wheel", (e) => {
  if (e.deltaY < 0) brushSize = Math.min(30, brushSize + 1);
  else brushSize = Math.max(1, brushSize - 1);
});

// ---------------- CURSOR UPDATE ----------------
function cursorTick() {
  if (!mouseDown) return;

  const rect = canvas.getBoundingClientRect();

  const gx = Math.floor((mouseX - rect.left) / CELL_SIZE);
  const gy = Math.floor((mouseY - rect.top) / CELL_SIZE);

  if (lastGX !== null && lastGY !== null) {
    drawLine(lastGX, lastGY, gx, gy);
  } else {
    applyBrush(gx, gy);
  }

  lastGX = gx;
  lastGY = gy;
}

// ---------------- LOOP ----------------
function loop() {
  cursorTick();
  step();
  draw();
  requestAnimationFrame(loop);
}

loop();
