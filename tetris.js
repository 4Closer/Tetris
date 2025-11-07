const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scale = 20;
ctx.scale(scale, scale);

const arena = createMatrix(12, 20);
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;
let player = {
  pos: {x: 4, y: 0},
  matrix: null,
  score: 0
};

document.getElementById('start').addEventListener('click', () => {
  reset();
  update();
});

function createMatrix(w,h){
  const m = [];
  while(h--) m.push(new Array(w).fill(0));
  return m;
}

function createPiece(type){
  if(type === 'T') return [
    [0,1,0],
    [1,1,1],
    [0,0,0]
  ];
  if(type === 'O') return [
    [2,2],
    [2,2]
  ];
  if(type === 'L') return [
    [0,0,3],
    [3,3,3],
    [0,0,0]
  ];
  if(type === 'J') return [
    [4,0,0],
    [4,4,4],
    [0,0,0]
  ];
  if(type === 'I') return [
    [0,5,0,0],
    [0,5,0,0],
    [0,5,0,0],
    [0,5,0,0]
  ];
  if(type === 'S') return [
    [0,6,6],
    [6,6,0],
    [0,0,0]
  ];
  if(type === 'Z') return [
    [7,7,0],
    [0,7,7],
    [0,0,0]
  ];
}

function collide(arena, player){
  const [m, o] = [player.matrix, player.pos];
  for(let y=0;y<m.length;y++){
    for(let x=0;x<m[y].length;x++){
      if(m[y][x] !== 0 && (arena[y+o.y] && arena[y+o.y][x+o.x]) !== 0){
        return true;
      }
    }
  }
  return false;
}

function merge(arena, player){
  player.matrix.forEach((row,y) => {
    row.forEach((value,x) => {
      if(value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
    });
  });
}

function rotate(matrix, dir){
  for(let y=0;y<matrix.length;y++){
    for(let x=0;x<y;x++){
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if(dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

function playerDrop(){
  player.pos.y++;
  if(collide(arena, player)){
    player.pos.y--;
    merge(arena, player);
    sweep();
    reset();
  }
  dropCounter = 0;
}

function playerMove(dir){
  player.pos.x += dir;
  if(collide(arena, player)) player.pos.x -= dir;
}

function sweep(){
  let rowCount = 1;
  outer: for(let y = arena.length -1; y >= 0; --y){
    for(let x = 0; x < arena[y].length; ++x){
      if(arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y,1)[0].fill(0);
    arena.unshift(row);
    player.score += rowCount * 10;
    rowCount *= 2;
  }
  document.getElementById('score').innerText = player.score;
}

function reset(){
  const pieces = 'TJLOSZI';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if(collide(arena, player)){
    arena.forEach(row => row.fill(0));
    player.score = 0;
    document.getElementById('score').innerText = player.score;
  }
}

function drawMatrix(matrix, offset){
  matrix.forEach((row,y) => {
    row.forEach((value,x) => {
      if(value !== 0){
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1,1);
      }
    });
  });
}

const colors = [
  null,
  '#FF7A7A',
  '#FFD166',
  '#06D6A0',
  '#4D96FF',
  '#9B5DE5',
  '#F15BB5',
  '#00F5D4'
];

function draw(){
  ctx.fillStyle = '#061025';
  ctx.fillRect(0,0,canvas.width/scale,canvas.height/scale);
  drawMatrix(arena, {x:0,y:0});
  drawMatrix(player.matrix, player.pos);
}

function update(time = 0){
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if(dropCounter > dropInterval) playerDrop();
  draw();
  requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
  if(event.key === 'ArrowLeft') playerMove(-1);
  else if(event.key === 'ArrowRight') playerMove(1);
  else if(event.key === 'ArrowDown') playerDrop();
  else if(event.key === 'q') { rotate(player.matrix, -1); if(collide(arena, player)) rotate(player.matrix, 1); }
  else if(event.key === 'w') { rotate(player.matrix, 1); if(collide(arena, player)) rotate(player.matrix, -1); }
});

reset();
