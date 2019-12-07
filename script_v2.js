const graphicsHandler = (function() {
    const canvas = document.querySelector("canvas#game");
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    const drawBoard = (cells) => {
        // 40 x 25
        let width = 40;
        let height = 25;
        cells.forEach(cell => {
            let x = cell.dataset.xCoord;
            let y = cell.dataset.yCoord;
            if (cell.classList.contains("unclaimed-cell")) {
                ctx.fillStyle = "#ddd";
            } else if (cell.classList.contains("live-cell")) {
                ctx.fillStyle = "#00f";
            } else {
                ctx.fillStyle = "#111";
            }
            ctx.fillRect(x * 20, y * 20, 19, 19);
        });
    };
    const drawBall = (ball) => {
        let x = ball.coords.x;
        let y = ball.coords.y;
        let centerX = x * 20 + 10;
        let centerY = y * 20 + 10;
        let gradient = ctx.createRadialGradient(centerX -3 , centerY -3, 1, centerX, centerY, 13);
        let gradientColors;
        switch (ball.ballType) {
            case "player-ball":
                gradientColors = ["#fff", "#888", "#000"];
                break;
            case "red-ball":
                gradientColors = ["#fee", "#d00", "#000"];
                break;
            case "black-ball":
                gradientColors = ["#fff", "#222", "#000"];
                break;
            default:
                gradientColors = ["#fff", "#fff", "#000"];
        }
        gradient.addColorStop(0, gradientColors[0]);
        gradient.addColorStop(.5, gradientColors[1]);
        gradient.addColorStop(1, gradientColors[2]);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
    };
    const renderFrame = (cells, entities) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBoard(cells);
        entities.forEach(entity => drawBall(entity));
        console.log("Rendering frame");
    };
    return {
        renderFrame
    };
})();

const createGame = function(graphicsHandler) {
    const boardContainer = document.querySelector('.game-board');
    const dimensions = {x: 40, y: 25};
    const redBallCount = 2;
    const tickLength = 80;
    startNewLevel = () => {
    };
    return {
        startNewLevel
    };
};

// Prevent movement keys from having default browser behavior
window.addEventListener('keydown', function(e){
    switch(e.keyCode){
        case 37: case 39: case 38:  case 40: // Arrow keys
        case 87: case 65: case 83:  case 68: // WASD keys
            e.preventDefault();
    }
});

const game_v2 = createGame(graphicsHandler);
game_v2.startNewLevel();
