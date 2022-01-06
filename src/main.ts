import { drawPuzzle, hovered } from './draw';
import * as puzzles from './puzzles';
import * as SaveState from './save-state';

let canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

export const mouse = { x: 0, y: 0 };

const puzzle = puzzles.mimi;
SaveState.init(puzzle);

export let selectedColor: number | null = 0;

export let mouseButtonDown: 'left' | 'right' | null = null;

function mouseTrigger(): void {
  if (!mouseButtonDown || !hovered) {
    return
  }
  const oldValue = SaveState.input.pixels[hovered.y][hovered.x];
  const newValue = (mouseButtonDown === 'left' ? selectedColor : null);
  if ((oldValue === null && newValue !== null) || (oldValue !== null && newValue === null)) {
    SaveState.pushUndo();
    SaveState.clearRedos();
    SaveState.input.pixels[hovered.y][hovered.x] = newValue;
    SaveState.saveState();
  }
}

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
  mouseTrigger();
});

window.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    mouseButtonDown = 'left';
  } else if (e.button === 2) {
    mouseButtonDown = 'right';
  } else {
    mouseButtonDown = null;
  }
  mouseTrigger();
});

function nextColor(): void {
  if (selectedColor === null) {
    selectedColor = 0;
  } else {
    selectedColor = (selectedColor + 1) % puzzle.palette.length;
    if (selectedColor === 0) {
      selectedColor = null;
    }
  }
}

function prevColor(): void {
  if (selectedColor === null) {
    selectedColor = puzzle.palette.length - 1;
  } else {
    selectedColor = (selectedColor + puzzle.palette.length - 1) % puzzle.palette.length;
    if (selectedColor === puzzle.palette.length - 1) {
      selectedColor = null;
    }
  }
}

window.addEventListener("wheel", (e) => {
  let deltaY = -e.deltaY;
  if ((e as any).webkitDirectionInvertedFromDevice) {
    deltaY = -deltaY;
  }
  if (deltaY < 0) {
    nextColor();
  } else {
    prevColor();
  }
});

window.addEventListener("mouseup", (e) => {
  mouseButtonDown = null;
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
})

window.addEventListener("keydown", (e) => {
  if (e.key === 'ArrowRight') {
    nextColor();
  } else if (e.key === 'ArrowLeft') {
    prevColor();
  } else if (e.key === 'c') {
    SaveState.pushUndo();
    SaveState.clearRedos();
    SaveState.clearInput(puzzle);
    SaveState.saveState();
  } else if (e.key === 'u') {
    SaveState.undoState();
  } else if (e.key === 'r') {
    SaveState.redoState();
  }
})

window.addEventListener("resize", () => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
});

function animate() {
  requestAnimationFrame(animate);
  ctx.fillStyle = puzzle.bg;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  drawPuzzle(ctx, puzzle, SaveState.input);

}
animate();

export {}
