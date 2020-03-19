const FRAMERATE = 15;

const graphicsHandler = (function() {
  const canvas = document.querySelector('canvas#game');
  const ctx = canvas.getContext('2d');
  let cellSize = 20;
  const setCellSize = (newCellSize) => {
    cellSize = newCellSize;
  }
  const setupBoard = (columns, rows) => {
    canvas.width = columns * cellSize - 1;
    canvas.height = rows * cellSize - 1;
  }
  const drawBoard = (cells) => {
    cells.forEach(cell => {
      const {x, y} = cell.getCoords();
      if (cell.isType('unclaimed-cell')) {
        ctx.fillStyle = '#ddd';
      } else if (cell.isType('live-cell')) {
        ctx.fillStyle = '#00f';
      } else {
        ctx.fillStyle = '#111';
      }
      ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
    });
  };
  const drawBall = (ball) => {
    let x = ball.coords.x;
    let y = ball.coords.y;
    let centerX = x * cellSize + Math.floor(cellSize * 0.5);
    let centerY = y * cellSize + Math.floor(cellSize * 0.5);
    let ballRadius = Math.floor(cellSize * 0.4);
    let gradient = ctx.createRadialGradient(
      centerX - ballRadius * 0.3,
      centerY - ballRadius * 0.3,
      ballRadius * 0.2,
      centerX,
      centerY,
      ballRadius * 1.6);
    let gradientColors;
    switch (ball.ballType) {
      case 'player-ball':
        gradientColors = ['#fff', '#888', '#000'];
        break;
      case 'red-ball':
        gradientColors = ['#fee', '#d00', '#000'];
        break;
      case 'black-ball':
        gradientColors = ['#fff', '#222', '#000'];
        break;
      default:
        gradientColors = ['#fff', '#fff', '#000'];
    }
    gradient.addColorStop(0, gradientColors[0]);
    gradient.addColorStop(.5, gradientColors[1]);
    gradient.addColorStop(1, gradientColors[2]);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
  };
  const renderFrame = (cells, entities) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard(cells);
    entities.forEach(entity => drawBall(entity));
    console.log('Rendering frame');
  };
  return {
    renderFrame, setupBoard, setCellSize
  };
})();

const infoPanelHandler = (function() {
  const infoPanel = document.querySelector('.info-panel');
  const livesReadout = document.getElementById('lives-readout');
  const claimedReadout = document.getElementById('claimed-percentage-readout');
  const targetReadout = document.getElementById('target-percentage-readout');
  const updateStats = (lives, claimedRatio, winRatio) => {
    livesReadout.textContent = `Remaining Lives: ${lives}`;
    claimedReadout.textContent = `Claimed Percentage: ${Math.floor(claimedRatio * 100)}%`;
    targetReadout.textContent = `Target Percentage: ${Math.floor(winRatio * 100)}%`;
  };
  return {
    updateStats
  };
})();

function Board(columns, rows) {
  this.cells = [];
  this.columns = columns;
  this.rows = rows;
  this.toCoordsString = function(coords) {
    return `x${coords.x}y${coords.y}`
  };
  this.generateCells = function(columns, rows) {
    // generate a perimeter of dummy cells, to simulate an impassible boundary
    for (let x = 0; x < columns; x++) {
      let newRow = [];
      for (let y = 0; y < rows; y++) {
        let newCell;
        if (y <=1 || y >= rows - 2 || x <= 1 || x >= columns - 2) {
          newCell = makeCell('claimed-cell', x, y);
        } else {
          newCell = makeCell('unclaimed-cell', x, y);
        }
        newRow.push(newCell);
      }
      this.cells.push(newRow);
    }
  };
  this.getCellByCoords = function(coords) {
    return this.cells[coords.x][coords.y];
  };
  this.isOutsideOfBoard = function(coords) {
    return (
      coords.x < 0 ||
      coords.y < 0 ||
      coords.x > this.columns - 1 ||
      coords.y > this.rows - 1
    );
  };
  this.coordCanBeEntered = function(coords, allowedCellTypes) {
    if (this.isOutsideOfBoard(coords)) {
      return false;
    } else {
      const targetCell = this.getCellByCoords(coords);
      return allowedCellTypes.some(cellType => targetCell.isType(cellType));
    }
  }
  this.getAllCells = function() {
    return this.cells.flat();
  };
  this.drawBoard = function(columns, rows, cellSize=20) {
    this.generateCells(columns, rows);
    graphicsHandler.setCellSize(cellSize);
    graphicsHandler.setupBoard(columns, rows);
  };
  this.removeAllEntities = function() {
    const currentEntities = this.boardContainer.querySelectorAll('.ball');
    for (i = 0; i < currentEntities.length; i++) {
      currentEntities[i].parentNode.removeChild(currentEntities[i]);
    }
  };
  this.drawBoard(columns, rows);
}

function makeCell(type, x, y) {
  let cellType = type;
  const setType = (newType) => {
    cellType = newType;
  }
  const getType = () => cellType;
  const isType = (type) => cellType == type;
  const getCoords = () => ({x, y});
  const cell = {isType, setType, getType, getCoords};
  return cell;
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
    return this.allowedCells.some(cellType => cell.isType(cellType))
  };
  this.getTargetCoords = function(board) {
    const target = {
      x: this.coords.x + this.velocity.x,
      y: this.coords.y + this.velocity.y
    };
    if (board.coordCanBeEntered(target, this.allowedCells)) {
      return target;
    } else {
      return this.getBounceTargetCoords(board);
    }
  };
  this.getBounceTargetCoords = function(board) {
    const {xAdjacent, yAdjacent} = this.getAdjacentCellCoords();
    const xCanEnter = board.coordCanBeEntered(xAdjacent, this.allowedCells);
    const yCanEnter = board.coordCanBeEntered(yAdjacent, this.allowedCells);
    // If it's a corner, bounce back. Otherwise, change velocity of blocked side
    let xChange, yChange;
    if (xCanEnter === yCanEnter) {
      xChange = -1;
      yChange = -1;
    } else {
      xChange = xCanEnter ? 1 : -1;
      yChange = yCanEnter ? 1 : -1;
    }

    return {
      x: this.coords.x + this.velocity.x * xChange,
      y: this.coords.y + this.velocity.y * yChange
    };
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
  this.setCoords = function(newCoords) {
    this.coords.x = newCoords.x;
    this.coords.y = newCoords.y;
  };
  this.updateCoords = function(board) {
    let nextCoords = this.getTargetCoords(board);
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
  this.getBounceTargetCoords = function() {
    // Player ball never bounces
    return this.coords;
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
  this.claimedRatio = 0;
  this.entities = [];
  this.addBall = function(ball) {
    if (ball.ballType == 'player-ball') {
      this.playerBall = ball;
      document.addEventListener('keydown', (e) => ball.handleInput(e));
    }
    this.entities.push(ball);
  };
  this.updateEntities = function() {
    this.entities.forEach(ball => {
      const targetCoords = ball.getTargetCoords(this.board); // unneccesary
      ball.updateCoords(this.board);
    });
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
      const {x, y} = cell.getCoords();
      if (this.claimBoundaries.min.x <= x &&
        x <= this.claimBoundaries.max.x &&
        this.claimBoundaries.min.y <= y &&
        y <= this.claimBoundaries.max.y) {
        claimedCells.push(cell);
      }
    }, this);
    claimedCells.forEach(cell => {
      cell.setType('live-cell');
    });
  };
  this.completeClaim = function() {
    const boardCells = this.board.getAllCells();
    // call paint function if returning to claimed cells in different direction
    if (this.claimStartVelocity.x != this.playerBall.velocity.x ||
      this.claimStartVelocity.y != this.playerBall.velocity.y) {
      this.activateSurroundedCells();
    }
    boardCells.forEach(cell => {
      if (cell.isType('live-cell')) {
        cell.setType('claimed-cell');
      }
    });
    this.endClaim();
  };
  this.breakClaim = function() {
    this.isClaiming = false;
    this.loseLife();
    const boardCells = this.board.getAllCells();
    boardCells.forEach(cell => {
      if (cell.isType('live-cell')) {
        cell.setType('unclaimed-cell');
      }
    });
  };
  this.calculateClaimRatio = function() {
    let claimedCount = this.board.getAllCells()
      .filter(cell => cell.isType('claimed-cell'))
      .length;
    let cellCount = this.board.getAllCells().length;
    this.claimedRatio = claimedCount / cellCount;
  };
  this.endClaim = function() {
    this.isClaiming = false;
    this.calculateClaimRatio();
    if (this.claimedRatio >= this.winRatio) {
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
      if (redEnemyCell.isType('live-cell')) {
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
    if (playerCell.isType('unclaimed-cell') && !this.isClaiming) {
      this.startClaim();
    } else if (playerCell.isType('claimed-cell') && this.isClaiming) {
      this.completeClaim();
    }
    if (this.isClaiming) {
      playerCell.setType('live-cell');
      this.expandClaimBoundaries();
    }
  };
  this.flipUnallowedCells = function() {
    // if a ball ends up in a cell it shouldn't occupy, flip it back
    this.entities.forEach(ball => {
      if (!board.coordCanBeEntered(ball.coords, ball.allowedCells)) {
        let cell = board.getCellByCoords(ball.coords);
        cell.setType(ball.allowedCells[0]);
        console.log("problem!");
      }
    });
  };
  this.renderBoard = function() {
    graphicsHandler.renderFrame(this.board.getAllCells(), this.entities); 
  };
  this.updateInfoPanel = function() {
    infoPanelHandler.updateStats(this.lives, this.claimedRatio, this.winRatio);
  };
  this.update = function() {
    this.updateEntities();
    this.updateBoard();
    this.flipUnallowedCells();
    this.renderBoard();
    this.updateInfoPanel();
  };
  this.play = function() {
    this.update();
    if (this.playing) {setTimeout(() => this.play(), this.tickLength)}
  };
  this.setSpeed = function(tickLength) {
    this.tickLength = tickLength;
  };
  this.start = function(tickLength) {
    this.calculateClaimRatio();
    if (!this.playing) {
      this.playing = true;
      this.setSpeed(tickLength);
      this.play();
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
  this.startNewLevel = function(redBallCount=this.redBallCount, tickLength=this.tickLength) {
    const board = new Board(this.dimensions.x, this.dimensions.y);
    const entities = [];
    this.level = new Level(board);
    entities.push(new Player ({x:Math.floor(this.dimensions.x / 2), y:0}));
    entities.push(new BlackEnemy ({x:Math.floor(this.dimensions.x / 2), y:this.dimensions.y-1}));
    for (let i = 0; i < redBallCount; i++) {
      let xStart = Math.floor(Math.random() * (this.dimensions.x - 4)) + 3;
      let yStart = Math.floor(Math.random() * (this.dimensions.y - 4)) + 3;
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
