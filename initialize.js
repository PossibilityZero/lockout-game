const board = document.querySelector('.game-board');

for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
        let newCell = document.createElement('div');
        newCell.classList.add('board-cell');
        newCell.dataset.xCoord = j;
        newCell.dataset.yCoord = i;
        newCell.setAttribute('id', `(${j},${i})`)
        board.appendChild(newCell);
    }
}
