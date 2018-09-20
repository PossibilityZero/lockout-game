const directions = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    NONE: 0
}

const ball = {
    coords: {
        x: 0,
        y: 0
    },
    getCoords: function() {
        return `(${this.coords.x},${this.coords.y})`
    },
    boundaries: {
        x: 19,
        y: 19
    },
    moving: directions.NONE,
    updateCoords: function() {
        switch (this.moving) {
            case directions.LEFT:
                this.coords.x -= 1;
                break;
            case directions.UP:
                this.coords.y -= 1;
                break;
            case directions.RIGHT:
                this.coords.x += 1;
                break;
            case directions.DOWN:
                this.coords.y += 1;
                break;
        }
        if (this.coords.x > this.boundaries.x) {
            this.coords.x = this.boundaries.x;
            this.moving = directions.NONE;
        }
        if (this.coords.x < 0) {
            this.coords.x = 0;
            this.moving = directions.NONE;
        }
        if (this.coords.y > this.boundaries.y) {
            this.coords.y = this.boundaries.y;
            this.moving = directions.NONE;
        }
        if (this.coords.y < 0) {
            this.coords.y = 0;
            this.moving = directions.NONE;
        }
    }
}

const game = {
    board: document.querySelector('.game-board'),
    entities: [ball],
    render: function() {
        let currentEntities = this.board.querySelectorAll('.ball');
        for (i = 0; i < currentEntities.length; i++) {
            currentEntities[i].parentNode.removeChild(currentEntities[i]);
        }
        for (i in this.entities) {
            let coords = this.entities[i].getCoords()
            let cell = document.getElementById(coords);
            let ball = document.createElement('div');
            ball.classList.add('ball')
            cell.appendChild(ball);
        }
    }
}

function handleInput(e) {
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        ball.moving = e.keyCode;
    }
}

function updateBoard() {
    ball.updateCoords();
    game.render();
    setTimeout(updateBoard, 100);
}

document.addEventListener('keypress', handleInput);

// click to start
document.querySelector('.game-board').addEventListener('click', updateBoard);
