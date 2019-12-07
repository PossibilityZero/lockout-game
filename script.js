const FRAMERATE = 15;
function Board(columns, rows) {
    this.boardContainer = document.querySelector('.game-board');
    this.cells = [];
    this.toCoordsString = function(coords) {
        return `x${coords.x}y${coords.y}`
    };
    this.generateCells = function(columns, rows) {
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
                newCell.dataset.xCoord = (j);
                newCell.dataset.yCoord = (i);
                this.boardContainer.appendChild(newCell);
                this.cells.push(newCell);
            }
        }
    };
    this.getCellByCoords = function(coords) {
        return this.boardContainer.querySelector('#'+this.toCoordsString(coords));
    };
    this.getAllCells = function() {
        return Array.from(this.boardContainer.querySelectorAll('.board-cell'));
    };
    this.setBoardStyle = function(columns, rows, cellSize) {
        this.boardContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
        this.boardContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`
        this.boardContainer.style.width = cellSize * columns + 'px';
        this.boardContainer.style.height = cellSize * rows + 'px';
    };
    this.drawBoard = function(columns, rows, cellSize=20) {
        this.generateCells(columns, rows);
        this.setBoardStyle(columns, rows, cellSize);
    };
    this.removeAllEntities = function() {
        const currentEntities = this.boardContainer.querySelectorAll('.ball');
        for (i = 0; i < currentEntities.length; i++) {
            currentEntities[i].parentNode.removeChild(currentEntities[i]);
        }
    };
    this.drawBall = function(coords, ballType) {
        const cell = this.getCellByCoords(coords);
        if (!cell.firstChild) {
            // only display one ball per cell
            const ball = document.createElement('div');
            ball.classList.add('ball');
            ball.classList.add(ballType);
            cell.appendChild(ball);
        }
    }
    this.drawBoard(columns, rows);
}

function Ball(coords, ballType) {
    this.coords = coords;
    this.originalCoords = {x: coords.x, y: coords.y};
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
function Player(coords) {
    Ball.call(this, coords, 'player-ball');
    this.allowedCells = ['claimed-cell', 'unclaimed-cell', 'live-cell'];
    this.directions = {
        LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
        W: 87, A: 65, S: 83, D: 68
    };
    this.setBounceVelocity = function() {
        // Player ball never bounces
        this.velocity.x = 0;
        this.velocity.y = 0;
    };
    this.input = function(keyCode) {
        switch (keyCode) {
            case this.directions.LEFT: case this.directions.A:
                this.velocity.x = -1;
                this.velocity.y = 0;
                break
            case this.directions.UP: case this.directions.W:
                this.velocity.x = 0;
                this.velocity.y = -1;
                break
            case this.directions.RIGHT: case this.directions.D:
                this.velocity.x = 1;
                this.velocity.y = 0;
                break
            case this.directions.DOWN: case this.directions.S:
                this.velocity.x = 0;
                this.velocity.y = 1;
                break
        }
    };
    this.handleInput = function(e) {
        this.input(e.keyCode);
    };
}
function BlackEnemy(coords) {
    Ball.call(this, coords, 'black-ball');
    this.allowedCells = ['claimed-cell'];
    this.resetVelocity = () => this.velocity = {x:1, y:1};
    this.velocity = {
        x: 1,
        y: 1,
    };
}
function RedEnemy(coords) {
    Ball.call(this, coords, 'red-ball');
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

function Level(board) {
    this.board = board;
    this.lives = 3;
    this.winRatio = 0.65;
    this.entities = [];
    this.addBall = function(ball) {
        if (ball.ballType == 'player-ball') {
            this.playerBall = ball;
            document.addEventListener('keydown', (e) => ball.handleInput(e));
        }
        this.entities.push(ball);
    };
    this.updateEntities = function() {
        for (i in this.entities) {
            const ball = this.entities[i];
            const targetCell = this.board.getCellByCoords(ball.getTargetCoords());
            if (ball.canEnterCell(targetCell)) {
                ball.updateCoords();
            } else {
                const bounceTargetCoords = ball.getBounceTargetCoords();
                const adjacentCellCoords = ball.getAdjacentCellCoords();
                const relevantCells = {
                    bounceTargetX: this.board.getCellByCoords(bounceTargetCoords.xTarget),
                    bounceTargetY: this.board.getCellByCoords(bounceTargetCoords.yTarget),
                    adjacentX: this.board.getCellByCoords(adjacentCellCoords.xAdjacent),
                    adjacentY: this.board.getCellByCoords(adjacentCellCoords.yAdjacent)
                }
                ball.setBounceVelocity(relevantCells);
                ball.updateCoords();
            }
        }
    };
    this.claimStartVelocity = {};
    this.isClaiming = false;
    this.claimBoundaries = {
        max: {},
        min: {}};
    this.startClaim = function() {
        this.isClaiming = true;
        this.claimStartVelocity = {};
        this.claimStartVelocity.x = this.playerBall.velocity.x;
        this.claimStartVelocity.y = this.playerBall.velocity.y;
        this.claimBoundaries.max.x = this.playerBall.coords.x;
        this.claimBoundaries.max.y = this.playerBall.coords.y;
        this.claimBoundaries.min.x = this.playerBall.coords.x;
        this.claimBoundaries.min.y = this.playerBall.coords.y;
    };
    this.expandClaimBoundaries = function() {
        this.claimBoundaries.max.x = Math.max(this.claimBoundaries.max.x, this.playerBall.coords.x);
        this.claimBoundaries.max.y = Math.max(this.claimBoundaries.max.y, this.playerBall.coords.y);
        this.claimBoundaries.min.x = Math.min(this.claimBoundaries.min.x, this.playerBall.coords.x);
        this.claimBoundaries.min.y = Math.min(this.claimBoundaries.min.y, this.playerBall.coords.y);
    };
    this.activateSurroundedCells = function() {
        const boardCells = this.board.getAllCells();
        const claimedCells = [];
        boardCells.forEach(function(cell) {
            if (this.claimBoundaries.min.x <= cell.dataset.xCoord &&
                cell.dataset.xCoord <= this.claimBoundaries.max.x &&
                this.claimBoundaries.min.y <= cell.dataset.yCoord &&
                cell.dataset.yCoord <= this.claimBoundaries.max.y) {
                claimedCells.push(cell);
            }
        }, this);
        for (let i = 0; i < claimedCells.length; i++) {
            claimedCells[i].classList.replace('unclaimed-cell', 'live-cell')
        }
    };
    this.completeClaim = function() {
        const boardCells = this.board.getAllCells();
        // call paint function if returning to claimed cells in different direction
        if (this.claimStartVelocity.x != this.playerBall.velocity.x ||
            this.claimStartVelocity.y != this.playerBall.velocity.y) {
            this.activateSurroundedCells();
        }
        for (let i = 0; i < boardCells.length; i++) {
            boardCells[i].classList.replace('live-cell', 'claimed-cell');
        }
        this.endClaim();
    };
    this.breakClaim = function() {
        this.isClaiming = false;
        this.loseLife();
        const boardCells = this.board.getAllCells();
        for (let i = 0; i < boardCells.length; i++) {
            boardCells[i].classList.replace('live-cell', 'unclaimed-cell');
        }
    };
    this.endClaim = function() {
        this.isClaiming = false;
        let claimedCount = this.board.getAllCells()
            .filter(cell => cell.classList.contains('claimed-cell'))
            .length;
        let cellCount = this.board.getAllCells().length;
        let claimedRatio = claimedCount / cellCount;
        if (claimedRatio >= this.winRatio) {
            this.stop();
        }
    };
    this.loseLife = function() {
        this.lives -= 1;
        if (this.lives <= 0) {
            this.stop();
        } else {
            this.playerBall.reset();
            const blackEnemies = this.entities.filter((ball) => ball.ballType == 'black-ball');
            blackEnemies.forEach(blackEnemy => blackEnemy.reset());
        }
    };
    this.updateBoard = function() {
        // Check Red Enemy Functions
        const redEnemies = this.entities.filter((ball) => ball.ballType == 'red-ball');
        redEnemies.forEach(function(redEnemy) {
            let redEnemyCell = this.board.getCellByCoords(redEnemy.coords);
            if (redEnemyCell.classList.contains('live-cell')) {
                this.breakClaim();
            }
        }, this);
        // Check Black Enemy Functions
        const blackEnemies = this.entities.filter((ball) => ball.ballType == 'black-ball');
        blackEnemies.forEach(function(blackEnemy) {
            if (Math.abs(blackEnemy.coords.x - this.playerBall.coords.x) <= 1 &&
                Math.abs(blackEnemy.coords.y - this.playerBall.coords.y) <= 1) {
                this.loseLife();
            }
        }, this);
        // Check Player Functions
        const playerCell = this.board.getCellByCoords(this.playerBall.coords);
        if (playerCell.classList.contains('unclaimed-cell') && !this.isClaiming) {
            this.startClaim();
        } else if (playerCell.classList.contains('claimed-cell') && this.isClaiming) {
            this.completeClaim();
        }
        if (this.isClaiming) {
            playerCell.classList.replace('unclaimed-cell', 'live-cell');
            this.expandClaimBoundaries();
        }
    };
    this.renderBoard = function() {
        graphicsHandler.renderFrame(this.board.cells, this.entities); 
    };
    this.update = function() {
        this.updateEntities();
        this.updateBoard();
        this.renderBoard();
    };
    this.play = function() {
        this.update();
        if (this.playing) {setTimeout(() => this.play(), this.tickLength)}
    };
    this.setSpeed = function(tickLength) {
        this.tickLength = tickLength;
    };
    this.start = function(tickLength) {
        if (!this.playing) {
            this.playing = true;
            this.setSpeed(tickLength);
            this.play(this.tickLength);
        }
    };
    this.stop = function() {
        this.playing = false;
    };
}

function Game(){
    this.boardContainer = document.querySelector('.game-board');
    this.dimensions = {x: 40, y: 25};
    this.redBallCount = 2;
    this.tickLength = Math.floor(1000 / FRAMERATE);
    this.reset = function() {
        if (this.level) {
            this.level.stop();
        };
        while (this.boardContainer.firstChild) {
            this.boardContainer.removeChild(this.boardContainer.firstChild);
        }
    };
    this.startNewLevel = function(redBallCount=this.redBallCount, tickLength=this.tickLength) {
        this.reset();
        const board = new Board(this.dimensions.x, this.dimensions.y);
        const entities = [];
        this.level = new Level(board);
        entities.push(new Player ({x:Math.floor(this.dimensions.x / 2), y:0}));
        entities.push(new BlackEnemy ({x:Math.floor(this.dimensions.x / 2), y:this.dimensions.y-1}));
        for (let i = 0; i < redBallCount; i++) {
            let xStart = Math.floor(Math.random() * 30) + 3;
            let yStart = Math.floor(Math.random() * 20) + 3;
            entities.push(new RedEnemy ({x: xStart, y: yStart}));
        }
        for (let i = 0; i < entities.length; i++) {
            this.level.addBall(entities[i]);
        }
        this.level.start(tickLength);
    };
    this.setBoardDimensions = function(columns, rows) {
        this.dimensions.x = columns;
        this.dimensions.y = rows;
    };
}

// Prevent movement keys from having default browser behavior
window.addEventListener('keydown', function(e){
    switch(e.keyCode){
        case 37: case 39: case 38:  case 40: // Arrow keys
        case 87: case 65: case 83:  case 68: // WASD keys
            e.preventDefault();
    }
});

const game = new Game();
game.startNewLevel();
