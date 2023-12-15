// snake.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const snake = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 2,
    dx: 0,
    dy: 0,
    length: 1,
    body: [{ x: canvas.width / 2, y: canvas.height / 2, color: getRandomColor() }],
    color: getRandomColor(),
};

const food = {
    x: 100,
    y: 100,
    size: 15,
    color: "#00F",
};

let enemies = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

const topScores = JSON.parse(localStorage.getItem("topScores")) || [];

function updateTopScores(playerName, playerScore) {
    topScores.push({ playerName, playerScore });
    topScores.sort((a, b) => b.playerScore - a.playerScore);
    topScores.splice(5);
    localStorage.setItem("topScores", JSON.stringify(topScores));
}

function showTopScores() {
    const topScoresContainer = document.getElementById("topScores");
    topScoresContainer.innerHTML = "<h2>Top Scores</h2>";

    for (let i = 0; i < topScores.length; i++) {
        const { playerName, playerScore } = topScores[i];
        const scoreListItem = document.createElement("li");
        scoreListItem.textContent = `${i + 1}. ${playerName}: ${playerScore}`;
        topScoresContainer.appendChild(scoreListItem);
    }
}

let growthRate = 3;

function update() {
    const currentTime = Date.now();

    // Update body segments
    for (let i = snake.body.length - 1; i > 0; i--) {
        snake.body[i].x = snake.body[i - 1].x;
        snake.body[i].y = snake.body[i - 1].y;
    }

    snake.body[0].x = snake.x;
    snake.body[0].y = snake.y;

    // Update head position
    snake.x += snake.dx * snake.speed;
    snake.y += snake.dy * snake.speed;

    if (
        snake.x < 0 ||
        snake.x + snake.size > canvas.width ||
        snake.y < 0 ||
        snake.y + snake.size > canvas.height
    ) {
        handleGameOver();
    }

    if (checkCollision(snake, food)) {
        // increase the snake's length in growth rate above
        for (let i = 0; i < growthRate; i++) {
            snake.body.push({
                x: snake.body[0].x,
                y: snake.body[0].y,
                color: snake.color,
            }); // add new body segments with the head position
        }
        score += 10;

        if (score % 100 === 0) {
            const newEnemy = {
                x: Math.random() * (canvas.width - snake.size),
                y: Math.random() * (canvas.height - snake.size),
                size: 20,
            };
            enemies.push(newEnemy);
        }

        resetSnakeColor();
        food.x = Math.random() * (canvas.width - food.size);
        food.y = Math.random() * (canvas.height - food.size);
    }

    for (const enemy of enemies) {
        if (checkCollision(snake, enemy)) {
            handleGameOver();
        }
    }

    draw();
    updateScore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.body.length; i++) {
        ctx.fillStyle = snake.body[i].color;
        ctx.fillRect(snake.body[i].x, snake.body[i].y, snake.size, snake.size);
    }

    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, food.size, food.size);

    ctx.fillStyle = "#F00";
    for (const enemy of enemies) {
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    }
}

function updateScore() {
    const scoreElement = document.getElementById("score");
    const highScoreElement = document.getElementById("highScore");

    scoreElement.textContent = "Score: " + score;
    highScoreElement.textContent = "High Score: " + highScore;
}

function handleGameOver() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    const playerName = prompt("Game Over! Enter your name to save your score:", "Player");

    if (playerName) {
        saveScore(playerName, score);
        showSavedScore(playerName, score);
    }

    resetGame();
    showTopScores();
}

function resetGame() {
    snake.x = canvas.width / 2;
    snake.y = canvas.height / 2;

    snake.length = 1;
    snake.body = [{ x: canvas.width / 2, y: canvas.height / 2, color: snake.color }];

    score = 0;
    enemies = [];
    resetSnakeColor();
}

function handleInput(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    const angle = Math.atan2(mouseY - snake.y, mouseX - snake.x);
    snake.dx = Math.cos(angle);
    snake.dy = Math.sin(angle);
}

function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.size &&
        obj1.x + obj1.size > obj2.x &&
        obj1.y < obj2.y + obj2.size &&
        obj1.y + obj1.size > obj2.y
    );
}

function resetSnakeColor() {
    clearInterval(snake.colorTimer);
    snake.colorTimer = setInterval(changeSnakeColor, 10);
}

function changeSnakeColor() {
    const currentTime = Date.now();
    const colorSpeed = 0.5; // Adjust this value to control the speed of color change
    const overallRainbowColor = `hsl(${(currentTime * colorSpeed) % 360}, 100%, 50%)`;

    for (let i = 0; i < snake.body.length; i++) {
        // Use the same time reference for consistent speed
        const segmentColor = `hsl(${((currentTime * colorSpeed) - i * 5) % 360}, 100%, 50%)`;
        snake.body[i].color = segmentColor;
    }

    snake.color = overallRainbowColor;
}

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function saveScore(playerName, playerScore) {
    console.log(`Player: ${playerName}, Score: ${playerScore} - Score saved!`);
}

function showSavedScore(playerName, playerScore) {
    updateTopScores(playerName, playerScore);
    showTopScores();
}

document.addEventListener("DOMContentLoaded", showTopScores);

canvas.addEventListener("mousedown", handleInput);

function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

resetSnakeColor();
gameLoop();