let canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

interface Puzzle {
  palette: string[],
  width: number,
  height: number,
  pixels: number[][],
};

const puzzle: Puzzle = {
  palette: [
    'darkgreen',
    'grey',
    'black',
    'pink',
  ],
  width: 10,
  height: 5,
  pixels: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 2, 1, 2, 1, 1, 1, 1, 1, 3],
    [1, 1, 1, 1, 1, 3, 3, 3, 3, 3],
  ],
};

function drawPuzzle(puzzle: Puzzle): void {
  const hintSize = 12;
  const hintGap = 2;

  const inset = 10;
  const offset = inset + puzzle.palette.length * (hintSize + hintGap);
  const square = 20;
  const gap = 2;
  for (let y = 0; y < puzzle.height; y++) {
    for (let x = 0; x < puzzle.width; x++) {
      ctx.fillStyle = puzzle.palette[puzzle.pixels[y][x]];
      ctx.fillRect(offset + x * (square + gap), offset + y * (square + gap), square, square);
    }
  }

  ctx.font = `${hintSize}px Arial Bold`;
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'black';

  for (let y = 0; y < puzzle.height; y++) {
    for (let c = 0; c < puzzle.palette.length; c++) {
      const textWidth = ctx.measureText('4').width;
      ctx.fillText(
        '4',
        inset + (hintSize + hintGap) * c + (hintSize - textWidth) / 2,
        offset + y * (square + gap) + square / 2);
    }
  }

  for (let x = 0; x < puzzle.width; x++) {
    for (let c = 0; c < puzzle.palette.length; c++) {
      const textWidth = ctx.measureText('4').width;
      ctx.fillText(
        '4',
        offset + x * (square + gap) + (square - textWidth) / 2,
        inset + (hintSize + hintGap) * c + hintSize / 2);
    }
  }
}

let mouse = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener("resize", () => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
});

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawPuzzle(puzzle);

}
animate();

export {}
