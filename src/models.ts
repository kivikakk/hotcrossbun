export type Color = string
export interface Puzzle {
  palette: Color[],
  bg: Color,
  width: number,
  height: number,
  pixels: number[][],
};

export interface Input {
  pixels: (number | null)[][],
};

export interface Hint {
  count: number,
  contiguous: boolean,
};

export type PlayerHint = Hint & { broken: boolean };

export function emptyInput(puzzle: Puzzle): Input {
  return {
    pixels: Array.from(Array(puzzle.height), () => Array(puzzle.width).fill(null)),
  };
}

export function hintPuzzle(puzzle: Puzzle, color: number, kind: 'row' | 'column', rc: number): Hint {
  let broke = false;
  let contiguous = true;
  let count = 0;
  const length = kind === 'row' ? puzzle.width : puzzle.height;
  for (let i = 0; i < length; i++) {
    const p = kind === 'row' ? puzzle.pixels[rc][i] : puzzle.pixels[i][rc];
    if (p === color) {
      if (broke && count > 0) {
        contiguous = false;
      }
      count += 1;
    } else if (count > 0) {
      broke = true;
    }
  }
  contiguous &&= count > 1;
  return {
    count,
    contiguous,
  }
}

export function playerHintPuzzle(puzzle: Puzzle, input: Input, color: number, kind: 'row' | 'column', rc: number): PlayerHint | null {
  const hint = hintPuzzle(puzzle, color, kind, rc);
  let broken = false;

  let broke = false;
  let contiguous = true;
  let count = 0;
  const length = kind === 'row' ? puzzle.width : puzzle.height;
  for (let i = 0; i < length; i++) {
    const p = kind === 'row' ? input.pixels[rc][i] : input.pixels[i][rc];
    if (p === color) {
      if (broke && count > 0) {
        contiguous = false;
      }
      count += 1;
    } else if (count > 0) {
      broke = true;
    }
  }

  contiguous &&= count > 1;

  if (hint.count === count && hint.contiguous === contiguous) {
    return null;
  }

  if (count > hint.count) {
    broken = true;
  }

  if (count === hint.count && contiguous !== hint.contiguous) {
    broken = true;
  }

  return {
    ...hint,
    broken,
  };
}
