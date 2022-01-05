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

export function emptyInput(puzzle: Puzzle): Input {
  return {
    pixels: Array.from(Array(puzzle.height), () => Array(puzzle.width).fill(null)),
  };
}
