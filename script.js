// Create Board
const board = document.querySelector('.game-board');

function generateCells(columns, rows) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let newCell = document.createElement('div');
            newCell.classList.add('board-cell');
            newCell.dataset.xCoord = j;
            newCell.dataset.yCoord = i;
            newCell.setAttribute('id', `x${j}y${i}`)
            if (j <=1 || j >= columns - 2 || i <= 1 || i >= rows - 2) {
                newCell.classList.add('claimed-cell');
            } else {
                newCell.classList.add('unclaimed-cell');
            }
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

function drawBoard(columns, rows, cellSize=20) {
    generateCells(columns, rows);
    setBoardStyle(columns, rows, cellSize);
}

// Game Functions
function toCoordsString(coords) {
    return `x${coords.x}y${coords.y}`
}

const directions = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
}

function Ball(coords, boundaries, ballType) {
    this.coords = coords;
    this.boundaries = boundaries;
    this.ballType = ballType;
    this.velocity = {
        x: 0,
        y: 0
    };
    this.moving = directions.NONE;
    this.getNextCoords = function() {
        let nextX = this.coords.x + this.velocity.x;
        let nextY = this.coords.y + this.velocity.y;
        // if out of bounds, default is to bounce back
        if (nextX < 0 || nextX > this.boundaries.x) {
            nextX = this.coords.x - this.velocity.x;
        }
        if (nextY < 0 || nextY > this.boundaries.y) {
            nextY = this.coords.y - this.velocity.y;
        }
        return {x: nextX, y: nextY}
    };
    this.setCoords = function(newCoords) {
        this.coords.x = newCoords.x;
        this.coords.y = newCoords.y;
    };
    this.updateCoords = function(forcedNextCoords) {
        let nextCoords = forcedNextCoords || this.getNextCoords();
        this.velocity.x = nextCoords.x - this.coords.x;
        this.velocity.y = nextCoords.y - this.coords.y;
        this.setCoords(nextCoords);
    };
}
function Player(coords, boundaries) {
    Ball.call(this, coords, boundaries, 'player-ball');
    this.allowedCells = ['board-cell', 'claimed-cell', 'unclaimed-cell', 'live-cell'];
    this.velocity = {
        x: 0,
        y: 0,
    };
    this.getNextCoords = function() {
        let nextX = this.coords.x + this.velocity.x;
        let nextY = this.coords.y + this.velocity.y;
        // if out of bounds, default is to stop
        if (nextX < 0 || nextX > this.boundaries.x) {
            nextX = this.coords.x;
        }
        if (nextY < 0 || nextY > this.boundaries.y) {
            nextY = this.coords.y;
        }
        return {x: nextX, y: nextY}
    };
    this.input = function(keyCode) {
        switch (keyCode) {
            case directions.LEFT:
                this.velocity.x = -1;
                this.velocity.y = 0;
                break
            case directions.UP:
                this.velocity.x = 0;
                this.velocity.y = -1;
                break
            case directions.RIGHT:
                this.velocity.x = 1;
                this.velocity.y = 0;
                break
            case directions.DOWN:
                this.velocity.x = 0;
                this.velocity.y = 1;
                break
        }
    }
}
function BlackEnemy(coords, boundaries) {
    Ball.call(this, coords, boundaries, 'black-ball');
    this.allowedCells = ['claimed-cell'];
    this.velocity = {
        x: 1,
        y: 1,
    };
}
function RedEnemy(coords, boundaries) {
    Ball.call(this, coords, boundaries, 'red-ball');
    this.allowedCells = ['unclaimed-cell', 'live-cell'];
    this.velocity = {
        x: Math.random() < 0.5 ? 1 : -1,
        y: Math.random() < 0.5 ? 1 : -1
    };
}

const game = {
    board: document.querySelector('.game-board'),
    entities: [],
    addBall: function(ball) {
        this.entities.push(ball);
    },
    updateEntities: function() {
        for (i in this.entities) {
            const ball = this.entities[i];
            const nextCell = board.querySelector('#'+toCoordsString(ball.getNextCoords()));
            if (ball.allowedCells.some(cellType => nextCell.classList.contains(cellType))) {
                ball.updateCoords();
            } else {
                //TODO calculate the next position if bounce is required
            }
        }
    },
    renderBoard: function() {
        const currentEntities = this.board.querySelectorAll('.ball');
        for (i = 0; i < currentEntities.length; i++) {
            currentEntities[i].parentNode.removeChild(currentEntities[i]);
        }
        for (i in this.entities) {
            const coords = toCoordsString(this.entities[i].coords);
            const cell = document.getElementById(coords);
            if (!cell.firstChild) {
                // only display one ball per cell
                const ball = document.createElement('div');
                ball.classList.add('ball');
                ball.classList.add(this.entities[i].ballType);
                cell.appendChild(ball);
            }
        }
    }
}

function handleInput(e) {
    playerBall.input(e.keyCode);
}

function updateBoard() {
    game.updateEntities();
    game.renderBoard();
    setTimeout(updateBoard, 60);
}

let boardDimensions = {x: 40, y: 25};
drawBoard(boardDimensions.x, boardDimensions.y);
let boardBoundaries = {x: boardDimensions.x-1, y: boardDimensions.y-1};

const playerBall = new Player ({x:19,y:0}, boardBoundaries);
const enemy1 = new RedEnemy ({x:10,y:13}, boardBoundaries);
const enemy2 = new RedEnemy ({x:30,y:13}, boardBoundaries);
const enemy3 = new BlackEnemy ({x:19,y:24}, boardBoundaries);
game.addBall(playerBall);
game.addBall(enemy1);
game.addBall(enemy2);
game.addBall(enemy3);
document.addEventListener('keypress', handleInput);

updateBoard();
