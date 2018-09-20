const board = document.querySelector('.game-board');

function generateCells(columns, rows) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let newCell = document.createElement('div');
            newCell.classList.add('board-cell');
            newCell.dataset.xCoord = j;
            newCell.dataset.yCoord = i;
            newCell.setAttribute('id', `(${j},${i})`)
            board.appendChild(newCell);
        }
    }
}

function setBoardStyle(columns, rows, cellSize) {
    board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`
    board.style.width = cellSize * columns + 'px';
    board.style.height = cellSize * rows + 'px';
}

function createBoard(columns, rows, cellSize=20) {
    generateCells(columns, rows);
    setBoardStyle(columns, rows, cellSize);
}

createBoard(30, 20);
