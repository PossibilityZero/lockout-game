const directions = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
}

function Ball(coords, boundaries, ballType) {
    this.coords = coords;
    this.getCoords = function() {
        return `(${this.coords.x},${this.coords.y})`
    };
    this.boundaries = boundaries;
    this.ballType = ballType;
    this.velocity = {
        x: -1,
        y: 1
    };
    this.moving = directions.NONE;
    this.updateCoords = function() {
        let nextX = this.coords.x + this.velocity.x;
        let nextY = this.coords.y + this.velocity.y;
        if (nextX < 0 || nextX > this.boundaries.x) {
            this.velocity.x *= -1;
            nextX = this.coords.x + this.velocity.x;
        }
        if (nextY < 0 || nextY > this.boundaries.y) {
            this.velocity.y *= -1;
            nextY = this.coords.y + this.velocity.y;
        }
        this.coords.x = nextX;
        this.coords.y = nextY;
    }
}
function Player(coords, boundaries) {
    Ball.call(this, coords, boundaries, 'player-ball');
    this.velocity.x = 0;
    this.velocity.y = 0;
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
}
function RedEnemy(coords, boundaries) {
    Ball.call(this, coords, boundaries, 'red-ball');
}

const game = {
    board: document.querySelector('.game-board'),
    entities: [],
    addBall: function(ball) {
        this.entities.push(ball);
    },
    updateEntities: function() {
        for (i in this.entities) {
            this.entities[i].updateCoords();
        }
    },
    render: function() {
        let currentEntities = this.board.querySelectorAll('.ball');
        for (i = 0; i < currentEntities.length; i++) {
            currentEntities[i].parentNode.removeChild(currentEntities[i]);
        }
        for (i in this.entities) {
            let coords = this.entities[i].getCoords()
            let cell = document.getElementById(coords);
            let ball = document.createElement('div');
            ball.classList.add('ball');
            ball.classList.add(this.entities[i].ballType);
            cell.appendChild(ball);
        }
    }
}

function handleInput(e) {
    playerBall.input(e.keyCode);
}

function updateBoard() {
    game.updateEntities();
    game.render();
    setTimeout(updateBoard, 60);
}

let boardDimensions = {x: 29, y: 19};
const playerBall = new Player ({x:14,y:0}, boardDimensions);
const enemy1 = new RedEnemy ({x:1,y:9}, boardDimensions);
const enemy2 = new BlackEnemy ({x:15,y:10}, boardDimensions);
game.addBall(playerBall);
game.addBall(enemy1);
game.addBall(enemy2);
document.addEventListener('keypress', handleInput);

updateBoard();
