let canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const mouse = {
  x: 0,
  y: 0,
};

type Color = string
interface Puzzle {
  palette: Color[],
  bg: Color,
  width: number,
  height: number,
  pixels: number[][],
};

const puzzle: Puzzle = {
  palette: [
    'black',
    'yellow',
    'white',
  ],
  bg: '#666',
  width: 10,
  height: 10,
  pixels: [
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  ],
};

interface Input {
  pixels: (number | null)[][],
};

function emptyInput(puzzle: Puzzle): Input {
  return {
    pixels: Array.from(Array(puzzle.height), () => Array(puzzle.width).fill(null)),
  };
}

const input: Input = emptyInput(puzzle)

// const puzzle: Puzzle = {
//   palette: [
//     'darkgreen',
//     'grey',
//     'black',
//     'pink',
//   ],
//   width: 10,
//   height: 5,
//   pixels: [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 1, 0, 1, 0, 1, 1, 1, 0, 0],
//     [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//     [0, 2, 1, 2, 1, 1, 1, 1, 1, 3],
//     [1, 1, 1, 1, 1, 3, 3, 3, 3, 3],
//   ],
// };

const puzzle2: Puzzle = {
  palette: [
    'black',
    'grey',
  ],
  bg: 'white',
  width: 10,
  height: 10,
  pixels: [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 1, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
  ]
};

interface Hint {
  count: number,
  contiguous: boolean,
};

function hintPuzzle(puzzle: Puzzle, color: number, kind: 'row' | 'column', rc: number): Hint | null {
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
  if (!count) {
    return null;
  }
  return {
    count,
    contiguous,
  }
}

function drawHint(puzzle: Puzzle, hint: Hint, c: number, tx: number, ty: number): void {
  const textWidth = ctx.measureText(`${hint.count}`).width;
  ctx.fillStyle = puzzle.palette[c];
  if (hint.contiguous) {
    ctx.beginPath();
    ctx.ellipse(tx, ty, (hintSize + hintGap) / 2, hintSize / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = puzzle.bg;
  }
  ctx.fillText(`${hint.count}`, tx - textWidth / 2, ty);

}

const hintSize = 12;
const hintGap = 6;

let hovered: { x: number, y: number } | null = null
let selectedColor = 0

function drawPuzzle(puzzle: Puzzle, input: Input): void {
  const inset = 10;
  const offset = inset + puzzle.palette.length * (hintSize + hintGap);
  const square = 20;
  const gap = 2;
  hovered = null
  for (let y = 0; y < puzzle.height; y++) {
    for (let x = 0; x < puzzle.width; x++) {
      const sx = offset + x * (square + gap)
      const sy = offset + y * (square + gap)
      const c = input.pixels[y][x]
      if (mouse.x >= sx && mouse.x < sx + square && mouse.y >= sy && mouse.y < sy + square) {
        hovered = { x, y }
      }

      if (c === null) {
        if (hovered && hovered.x === x && hovered.y === y && mouseButtonDown !== 'right') {
          ctx.fillStyle = puzzle.palette[selectedColor];
          ctx.fillRect(sx, sy, square, square);
        } else {
          ctx.strokeStyle = puzzle.palette[selectedColor];
          ctx.strokeRect(sx, sy, square, square);
        }
      } else if (c !== null) {
        ctx.fillStyle = puzzle.palette[c];
        ctx.fillRect(sx, sy, square, square);
      }
    }
  }

  ctx.font = `${hintSize}px Arial Bold`;
  ctx.textBaseline = 'middle'

  for (let y = 0; y < puzzle.height; y++) {
    for (let c = 0; c < puzzle.palette.length; c++) {
      const hint = hintPuzzle(puzzle, c, 'row', y);
      if (!hint) {
        continue;
      }
      const tx = inset + (hintSize + hintGap) * c + hintSize / 2;
      const ty = offset + y * (square + gap) + square / 2;
      drawHint(puzzle, hint, c, tx, ty);
    }
  }

  for (let x = 0; x < puzzle.width; x++) {
    for (let c = 0; c < puzzle.palette.length; c++) {
      const hint = hintPuzzle(puzzle, c, 'column', x);
      if (!hint) {
        continue;
      }
      const tx = offset + x * (square + gap) + square / 2;
      const ty = inset + (hintSize + hintGap) * c + hintSize / 2;
      drawHint(puzzle, hint, c, tx, ty);
    }
  }
}

let mouseButtonDown: 'left' | 'right' | null = null

function mouseTrigger(): void {
  if (!mouseButtonDown) {
    return
  }
  if (hovered) {
    input.pixels[hovered.y][hovered.x] = (mouseButtonDown === 'left' ? selectedColor : null);
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
})

window.addEventListener("mouseup", (e) => {
  mouseButtonDown = null;
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
})

window.addEventListener("keydown", (e) => {
  if (e.key === 'ArrowRight') {
    selectedColor = (selectedColor + 1) % puzzle.palette.length;
  } else if (e.key === 'ArrowLeft') {
    selectedColor = (selectedColor + puzzle.palette.length - 1) % puzzle.palette.length;
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
  drawPuzzle(puzzle, input);

}
animate();

export {}
