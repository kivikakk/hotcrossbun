import { emptyInput, Input, Puzzle } from "./models";

const MAX_UNDOS = 40;

let undos: string[] = [];
let redos: string[] = [];

export let input: Input;

export function init(puzzle: Puzzle): void {
  const saved = window.localStorage.getItem('saved');
  if (saved !== null) {
    input = JSON.parse(saved) as Input;

    if (input.pixels.length < puzzle.height) {
      input.pixels = input.pixels.concat(Array.from(Array(puzzle.height - input.pixels.length), () => Array(puzzle.width).fill(null)));
    }
  }

  // if (saved === null || input.pixels.length !== puzzle.height || input.pixels[0].length !== puzzle.width) {
  if (saved === null) {
    clearInput(puzzle);
  }
}

export function clearInput(puzzle: Puzzle): void {
  input = emptyInput(puzzle);
}

export function saveState(): void {
  window.localStorage.setItem('saved', JSON.stringify(input));
}

export function pushUndo(): void {
  undos.push(JSON.stringify(input));
  if (undos.length > MAX_UNDOS) {
    undos = undos.slice(undos.length - MAX_UNDOS);
  }
}

export function clearRedos(): void {
  redos = [];
}

export function undoState(): void {
  if (undos.length) {
    redos.push(JSON.stringify(input));
    input = JSON.parse(undos.pop() as string) as Input;
    saveState();
  }
}

export function redoState(): void {
  if (redos.length) {
    pushUndo();
    input = JSON.parse(redos.pop() as string) as Input;
    saveState();
  }
}
