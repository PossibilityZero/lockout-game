let boardDimensions = {x: 10, y: 10};
drawBoard(boardDimensions.x, boardDimensions.y);
let boardBoundaries = {x: boardDimensions.x-1, y: boardDimensions.y-1};

const playerBall = new Player ({x:5,y:0}, boardBoundaries);
game.addBall(playerBall);
document.addEventListener('keypress', handleInput);

const enemy1 = new RedEnemy ({x:5,y:5}, boardBoundaries);
game.addBall(enemy1);

const cells = document.querySelectorAll('.board-cell');
function toggleClaimed(e){
    e.target.classList.toggle('unclaimed-cell');
    e.target.classList.toggle('claimed-cell');
}
for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('click', toggleClaimed);
}

updateBoard(1000);
