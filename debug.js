const enemy1 = new RedEnemy ({x:10,y:13}, boardBoundaries);
const enemy2 = new RedEnemy ({x:30,y:13}, boardBoundaries);
const enemy3 = new BlackEnemy ({x:36,y:23}, boardBoundaries);
game.addBall(enemy1);
game.addBall(enemy2);
game.addBall(enemy3);

const cells = document.querySelectorAll('.board-cell');
function toggleClaimed(e){
    e.target.classList.toggle('unclaimed-cell');
    e.target.classList.toggle('claimed-cell');
}
for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('click', toggleClaimed);
}
