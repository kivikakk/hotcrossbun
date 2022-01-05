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

// const puzzle: Puzzle = {
//   palette: [
// 	'green',
//     'white',
//     'yellow',
//     'black',
//   ],
//   bg: '#306090',
//   width: 10,
//   height: 10,
//   pixels: [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 1, 0, 0, 0, 2, 0, 2, 0, 0],
//     [0, 1, 0, 0, 2, 2, 2, 2, 2, 0],
//     [0, 1, 0, 0, 0, 2, 2, 2, 0, 0],
//     [0, 1, 0, 0, 0, 0, 2, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [3, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [3, 3, 0, 2, 0, 2, 3, 3, 0, 1],
//     [3, 0, 3, 2, 0, 2, 3, 0, 3, 0],
//     [3, 3, 3, 2, 2, 2, 3, 0, 3, 1],
//   ],
// };

interface Input {
  pixels: (number | null)[][],
};

function emptyInput(puzzle: Puzzle): Input {
  return {
    pixels: Array.from(Array(puzzle.height), () => Array(puzzle.width).fill(null)),
  };
}

let input: Input = emptyInput(puzzle)

const saved = window.localStorage.getItem('saved');
const MAX_UNDOS = 10;
let undos: string[] = [];
let redos: string[] = [];
if (saved !== null) {
  input = JSON.parse(saved) as Input;
}

function saveState(): void {
  window.localStorage.setItem('saved', JSON.stringify(input));
}

function undoState(): void {
  if (undos.length) {
    redos.push(JSON.stringify(input));
    input = JSON.parse(undos.pop() as string) as Input;
    saveState();
  }
}

function redoState(): void {
  if (redos.length) {
    undos.push(JSON.stringify(input));
    input = JSON.parse(redos.pop() as string) as Input;
    saveState();
  }
}

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

interface PlayerHint {
  hint: Hint,
  broken: boolean,
};

function hintPuzzle(puzzle: Puzzle, color: number, kind: 'row' | 'column', rc: number): Hint {
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
    contiguous: contiguous,
  }
}

function playerHintPuzzle(puzzle: Puzzle, input: Input, color: number, kind: 'row' | 'column', rc: number): PlayerHint | null {
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
    hint,
    broken,
  };
}

function drawHint(puzzle: Puzzle, playerHint: PlayerHint | null, c: number, tx: number, ty: number): void {
  if (!playerHint) {
    return
  }

  const count = playerHint.hint.count;
  const textWidth = ctx.measureText(`${count}`).width;
  ctx.fillStyle = puzzle.palette[c];
  if (playerHint.hint.contiguous) {
    ctx.beginPath();
    ctx.ellipse(tx, ty, (hintSize + hintGap) / 2, hintSize / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = puzzle.bg;
  }
  ctx.fillText(`${count}`, tx - textWidth / 2, ty);

  if (playerHint.broken) {
    // XXX do better
    ctx.strokeStyle = 'red';
    ctx.strokeText('X', tx - textWidth / 2, ty);
  }
}

const hintSize = 24;
const hintGap = 6;

let hovered: { x: number, y: number } | null = null
let selectedColor = 0

function drawPuzzle(puzzle: Puzzle, input: Input): void {
  const inset = 20;
  const offset = inset + puzzle.palette.length * (hintSize + hintGap);
  const square = 40;
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
      const playerHint = playerHintPuzzle(puzzle, input, c, 'row', y);
      const tx = inset + (hintSize + hintGap) * c + hintSize / 2;
      const ty = offset + y * (square + gap) + square / 2;
      drawHint(puzzle, playerHint, c, tx, ty);
    }
  }

  for (let x = 0; x < puzzle.width; x++) {
    for (let c = 0; c < puzzle.palette.length; c++) {
      const playerHint = playerHintPuzzle(puzzle, input, c, 'column', x);
      const tx = offset + x * (square + gap) + square / 2;
      const ty = inset + (hintSize + hintGap) * c + hintSize / 2;
      drawHint(puzzle, playerHint, c, tx, ty);
    }
  }
}

let mouseButtonDown: 'left' | 'right' | null = null

function mouseTrigger(): void {
  if (!mouseButtonDown) {
    return
  }
  const newValue = (mouseButtonDown === 'left' ? selectedColor : null);
  if (hovered && input.pixels[hovered.y][hovered.x] !== newValue) {
    undos.push(JSON.stringify(input));
    redos = [];
    input.pixels[hovered.y][hovered.x] = newValue;
    saveState();
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
  } else if (e.key === 'c') {
    undos.push(JSON.stringify(input));
    redos = [];
    input = emptyInput(puzzle);
    saveState();
  } else if (e.key === 'u') {
    undoState();
  } else if (e.key === 'r') {
    redoState();
  } else if (e.key === 's') {
    for (let y = 0; y < puzzle.height; y++) {
      for (let x = 0; x < puzzle.width; x++) {
        input.pixels[y][x] = puzzle.pixels[y][x];
      }
    }
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
