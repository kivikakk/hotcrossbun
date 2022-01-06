import { Input, PlayerHint, playerHintPuzzle, Puzzle } from "./models";
import { mouse, mouseButtonDown, selectedColor } from "./main";

const INSET = 20;
const SQUARE = 40;
const GAP = 2;

const SWATCH_WIDTH = 60;
const SWATCH_HEIGHT = 30;
const SWATCH_OFFSET = 30;
const SWATCH_GAP = 10;

const HINT_SIZE = 24;
const HINT_GAP = 6;

export let hovered: { x: number, y: number } | null = null;

export function drawHint(ctx: CanvasRenderingContext2D, puzzle: Puzzle, playerHint: PlayerHint | null, c: number, tx: number, ty: number): void {
  if (!playerHint) {
    return
  }

  const count = playerHint.count;
  const textWidth = ctx.measureText(`${count}`).width;
  ctx.fillStyle = puzzle.palette[c];
  if (playerHint.contiguous) {
    ctx.beginPath();
    ctx.ellipse(tx, ty, (HINT_SIZE + HINT_GAP) / 2, HINT_SIZE / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = puzzle.bg;
  }
  ctx.fillText(`${count}`, tx - textWidth / 2, ty);

  if (playerHint.broken) {
    ctx.strokeStyle = 'red';
    ctx.strokeText('X', tx - textWidth / 2, ty);
  }
}

export function drawPuzzle(ctx: CanvasRenderingContext2D, puzzle: Puzzle, input: Input): void {
  const offset = INSET + puzzle.palette.length * (HINT_SIZE + HINT_GAP);
  let complete = true;

  ctx.font = `${HINT_SIZE}px Arial Bold`;
  ctx.textBaseline = 'middle'

  for (let y = 0; y < puzzle.height; y++) {
    for (let c = 0; c < puzzle.palette.length; c++) {
      const playerHint = playerHintPuzzle(puzzle, input, c, 'row', y);
      if (playerHint) {
        complete = false;
        const tx = INSET + (HINT_SIZE + HINT_GAP) * c + HINT_SIZE / 2;
        const ty = offset + y * (SQUARE + GAP) + SQUARE / 2;
        drawHint(ctx, puzzle, playerHint, c, tx, ty);
      }
    }
  }

  for (let x = 0; x < puzzle.width; x++) {
    for (let c = 0; c < puzzle.palette.length; c++) {
      const playerHint = playerHintPuzzle(puzzle, input, c, 'column', x);
      if (playerHint) {
        complete = false;
        const tx = offset + x * (SQUARE + GAP) + SQUARE / 2;
        const ty = INSET + (HINT_SIZE + HINT_GAP) * c + HINT_SIZE / 2;
        drawHint(ctx, puzzle, playerHint, c, tx, ty);
      }
    }
  }

  hovered = null;
  for (let y = 0; y < puzzle.height; y++) {
    for (let x = 0; x < puzzle.width; x++) {
      const sx = offset + x * (SQUARE + GAP)
      const sy = offset + y * (SQUARE + GAP)
      const c = input.pixels[y][x]
      if (mouse.x >= sx && mouse.x < sx + SQUARE && mouse.y >= sy && mouse.y < sy + SQUARE) {
        hovered = { x, y }
      }

      if (c === null) {
        const selectedStyle = selectedColor !== null ? puzzle.palette[selectedColor] : puzzle.bg;
        if (hovered && hovered.x === x && hovered.y === y && mouseButtonDown !== 'right') {
          ctx.fillStyle = selectedStyle;
          ctx.fillRect(sx, sy, SQUARE, SQUARE);
        } else {
          ctx.strokeStyle = selectedStyle;
          ctx.strokeRect(sx, sy, SQUARE + GAP, SQUARE + GAP);
        }
      } else if (c !== null) {
        ctx.fillStyle = puzzle.palette[c];
        ctx.fillRect(sx, sy, SQUARE + (complete ? GAP : 0), SQUARE + (complete ? GAP : 0));
      }
    }
  }

  if (hovered) {
    ctx.strokeStyle = 'red';
    ctx.strokeRect(
      offset + hovered.x * (SQUARE + GAP),
      offset + hovered.y * (SQUARE + GAP),
      SQUARE,
      SQUARE
    );
  }

  const sx = offset + puzzle.width * (SQUARE + GAP) + SWATCH_OFFSET;
  for (let c = 0; c < puzzle.palette.length + 1; c++) {
    const sy = offset + (c + 0.5) * (SWATCH_HEIGHT + SWATCH_GAP);
    const gradient = ctx.createLinearGradient(sx, sy, sx + SWATCH_WIDTH, sy);
    if (c < puzzle.palette.length) {
      gradient.addColorStop(0, puzzle.palette[c]);
      gradient.addColorStop(0.5, puzzle.palette[c]);
      gradient.addColorStop(1, puzzle.bg);
    } else {
      gradient.addColorStop(0, puzzle.bg);
      gradient.addColorStop(0.5, puzzle.bg);
      gradient.addColorStop(1, 'red');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(sx, sy, SWATCH_WIDTH, SWATCH_HEIGHT);

    if (c === selectedColor || (c === puzzle.palette.length && selectedColor === null)) {
      ctx.strokeStyle = 'red';
      ctx.strokeRect(sx, sy, SWATCH_WIDTH, SWATCH_HEIGHT);
    }
  }
}
