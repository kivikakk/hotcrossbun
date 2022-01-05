let canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

interface Puzzle {
  palette: Record<string, string>,
  width: number,
  height: number,
  pixels: number[][],
};

const puzzle: Puzzle = {
  palette: {
    1: 'darkgreen',
    2: 'grey',
    3: 'black',
    4: 'pink',
  },
  width: 10,
  height: 5,
  pixels: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 1, 2, 1, 2, 2, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 3, 2, 3, 2, 2, 2, 2, 2, 4],
    [2, 2, 2, 2, 2, 4, 4, 4, 4, 4],
  ],
};

function drawPuzzle(puzzle: Puzzle): void {
  for (let y = 0; y < puzzle.height; y++) {
    for (let x = 0; x < puzzle.width; x++) {
      ctx.fillStyle = puzzle.palette[puzzle.pixels[y][x]];
      ctx.fillRect(x * 10, y * 10, 10, 10);
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
