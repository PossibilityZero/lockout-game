// Create Board
const board = document.querySelector('.game-board');

function generateCells(columns, rows) {
    // generate a perimeter of dummy cells, to simulate an impassible boundary
    for (let i = -1; i <= rows; i++) {
        for (let j = -1; j <= columns; j++) {
            let newCell = document.createElement('div');
            newCell.classList.add('board-cell');
            newCell.setAttribute('id', `x${j}y${i}`)
            if (j < 0 || j >= columns || i < 0 || i >= rows) {
                newCell.classList.add('dummy-cell');
            } else if (j <=1 || j >= columns - 2 || i <= 1 || i >= rows - 2) {
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
    this.originalCoords = {x: coords.x, y: coords.y};
    this.boundaries = boundaries;
    this.allowedCells = ['board-cell'];
    this.ballType = ballType;
    this.velocity = {
        x: 0,
        y: 0
    };
    this.reset = function() {
        this.coords.x = this.originalCoords.x;
        this.coords.y = this.originalCoords.y;
        this.resetVelocity();
    };
    this.resetVelocity = () => this.velocity = {x:0, y:0};
    this.canEnterCell = function(cell) {
        return this.allowedCells.some(cellType => cell.classList.contains(cellType))
    };
    this.getTargetCoords = function() {
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
    this.getBounceTargetCoords = function() {
        const xTarget = {
            x: this.coords.x + this.velocity.x,
            y: this.coords.y - this.velocity.y
        };
        const yTarget = {
            x: this.coords.x - this.velocity.x,
            y: this.coords.y + this.velocity.y
        };
        return {xTarget, yTarget};
    };
    this.getAdjacentCellCoords = function() {
        const xAdjacent = {
            x: this.coords.x + this.velocity.x,
            y: this.coords.y
        };
        const yAdjacent = {
            x: this.coords.x,
            y: this.coords.y + this.velocity.y
        };
        return {xAdjacent, yAdjacent};
    }
    this.setBounceVelocity = function(relevantCells) {
        const canMaintainX = this.canEnterCell(relevantCells.bounceTargetX);
        const canMaintainY = this.canEnterCell(relevantCells.bounceTargetY);
        const preferBounceX = !this.canEnterCell(relevantCells.adjacentX);
        const preferBounceY = !this.canEnterCell(relevantCells.adjacentY);
        if (!canMaintainX && ! canMaintainY) {
            this.velocity.x *= -1;
            this.velocity.y *= -1;
        } else if (canMaintainX && canMaintainY) {
            if (preferBounceX > preferBounceY) {
                this.velocity.x *= -1;
            } else if (preferBounceX < preferBounceY) {
                this.velocity.y *= -1;
            } else {
                this.velocity.x *= -1;
                this.velocity.y *= -1;
            }
        } else if (canMaintainX) {
            this.velocity.y *= -1;
        } else if (canMaintainY) {
            this.velocity.x *= -1;
        } 
        return this.getTargetCoords();
    };
    this.setCoords = function(newCoords) {
        this.coords.x = newCoords.x;
        this.coords.y = newCoords.y;
    };
    this.updateCoords = function(forcedNextCoords) {
        let nextCoords = forcedNextCoords || this.getTargetCoords();
        this.velocity.x = nextCoords.x - this.coords.x;
        this.velocity.y = nextCoords.y - this.coords.y;
        this.setCoords(nextCoords);
    };
}
function Player(coords, boundaries) {
    Ball.call(this, coords, boundaries, 'player-ball');
    this.allowedCells = ['board-cell', 'claimed-cell', 'unclaimed-cell', 'live-cell'];
    this.getTargetCoords = function() {
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
    this.resetVelocity = () => this.velocity = {x:1, y:1};
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
    this.resetVelocity = () => this.velocity = {
        x: Math.random() < 0.5 ? 1 : -1,
        y: Math.random() < 0.5 ? 1 : -1
    };
}

const game = {
    board: document.querySelector('.game-board'),
    entities: [],
    addBall: function(ball) {
        if (ball.ballType == 'player-ball') {
            this.playerBall = ball;
        }
        this.entities.push(ball);
    },
    updateEntities: function() {
        for (i in this.entities) {
            const ball = this.entities[i];
            const targetCell = board.querySelector('#'+toCoordsString(ball.getTargetCoords()));
            if (ball.canEnterCell(targetCell)) {
                ball.updateCoords();
            } else {
                const bounceTargetCoords = ball.getBounceTargetCoords();
                const adjacentCellCoords = ball.getAdjacentCellCoords();
                const relevantCells = {
                    bounceTargetX: board.querySelector('#'+toCoordsString(bounceTargetCoords.xTarget)),
                    bounceTargetY: board.querySelector('#'+toCoordsString(bounceTargetCoords.yTarget)),
                    adjacentX: board.querySelector('#'+toCoordsString(adjacentCellCoords.xAdjacent)),
                    adjacentY: board.querySelector('#'+toCoordsString(adjacentCellCoords.yAdjacent))
                }
                ball.setBounceVelocity(relevantCells);
                ball.updateCoords();
            }
        }
    },
    claimStartVelocity: {},
    startClaim: function() {
        this.isClaiming = true;
        this.claimStartVelocity = {};
        this.claimStartVelocity.x = this.playerBall.velocity.x;
        this.claimStartVelocity.y = this.playerBall.velocity.y;
    },
    paint: function() {
    },
    endClaim: function() {
        this.isClaiming = false;
        const boardCells = this.board.querySelectorAll('.board-cell');
        // call paint function if returning to claimed cells in different direction
        if (this.claimStartVelocity.x != this.playerBall.velocity.x ||
            this.claimStartVelocity.y != this.playerBall.velocity.y) {
            this.paint();
        }
        for (let i = 0; i < boardCells.length; i++) {
            boardCells[i].classList.replace('live-cell', 'claimed-cell');
        }
    },
    breakClaim: function() {
        this.isClaiming = false;
        this.playerBall.reset();
        const boardCells = this.board.querySelectorAll('.board-cell');
        for (let i = 0; i < boardCells.length; i++) {
            boardCells[i].classList.replace('live-cell', 'unclaimed-cell');
        }
    },
    updateBoard: function() {
        const redEnemies = this.entities.filter((ball) => ball.ballType == 'red-ball');
        for (let i = 0; i < redEnemies.length; i++) {
            let enemyCoords = toCoordsString(redEnemies[i].coords);
            let redEnemyCell = document.getElementById(enemyCoords);
            if (redEnemyCell.classList.contains('live-cell')) {
                this.breakClaim();
            }
        }
        const coords = toCoordsString(this.playerBall.coords);
        const playerCell = document.getElementById(coords);
        playerCell.classList.replace('unclaimed-cell', 'live-cell');
        if (playerCell.classList.contains('live-cell') && !this.isClaiming) {
            this.startClaim();
        } else if (playerCell.classList.contains('claimed-cell') && this.isClaiming) {
            this.endClaim();
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
    },
    update: function() {
        this.updateEntities();
        this.updateBoard();
        this.renderBoard();
    }
}

function handleInput(e) {
    playerBall.input(e.keyCode);
}

function updateBoard(tickLength) {
    game.update()
    setTimeout(() => updateBoard(tickLength), tickLength);
}
