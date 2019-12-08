const graphicsHandler = (function() {
    const canvas = document.querySelector("canvas#game");
    canvas.width = 800;
    canvas.height = 500;
    let cellSize = 20;
    const ctx = canvas.getContext("2d");
    const setCellSize = (newCellSize) => {
        cellSize = newCellSize;
    }
    const setupBoard = (columns, rows) => {
        canvas.width = columns * cellSize - 1;
        canvas.height = rows * cellSize - 1;
    }
    const drawBoard = (cells) => {
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
        ctx.arc(centerX, centerY, ballRadius, 0, Math.PI * 2);
        ctx.fill();
    };
    const renderFrame = (cells, entities) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBoard(cells);
        entities.forEach(entity => drawBall(entity));
        console.log("Rendering frame");
    };
    return {
        renderFrame, setupBoard, setCellSize
    };
})();
