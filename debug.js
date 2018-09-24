const boardDimensions = {x: 40, y: 25};
const game = new Game();
game.startNewLevel();

//game.setBoardDimensions(boardDimensions.x, boardDimensions.y);
const cells = document.querySelectorAll('.board-cell');
function toggleClaimed(e){
    e.target.classList.toggle('unclaimed-cell');
    e.target.classList.toggle('claimed-cell');
}
for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('click', toggleClaimed);
}
