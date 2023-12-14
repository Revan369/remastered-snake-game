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
    body: [{ x: canvas.width / 2, y: canvas.height / 2 }],
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
let highScore = localStorage.getItem("highScore") || 0; // Retrieve high score from local storage

function update() {
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
        snake.length++;
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

    snake.body.unshift({ x: snake.x, y: snake.y });
    if (snake.body.length > snake.length) {
        snake.body.pop();
    }

    draw();
    updateScore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = snake.color;
    for (const segment of snake.body) {
        ctx.fillRect(segment.x, segment.y, snake.size, snake.size);
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
        // Update and store the new high score
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    // Ask the user to save their score and name
    const playerName = prompt("Game Over! Enter your name to save your score:", "Player");

    if (playerName) {
        // Save the player's score and name
        saveScore(playerName, score);
        showSavedScore(playerName, score);
    }

    // Reset the game
    resetGame();
}

function resetGame() {
    // Set the initial position of the snake to the center of the canvas
    snake.x = canvas.width / 2;
    snake.y = canvas.height / 2;

    snake.length = 1;
    snake.body = [{ x: canvas.width / 2, y: canvas.height / 2 }];

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
    snake.colorTimer = setInterval(changeSnakeColor, 100);
}

function changeSnakeColor() {
    snake.color = getRandomColor();
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
    // Implement your logic to save the score (e.g., to a server or additional local storage)
    console.log(`Player: ${playerName}, Score: ${playerScore} - Score saved!`);
}

function showSavedScore(playerName, playerScore) {
    // Display the saved score and name below the canvas
    const savedScoresContainer = document.getElementById("savedScores");
    const scoreListItem = document.createElement("li");
    scoreListItem.textContent = `Player: ${playerName}, Score: ${playerScore}`;
    savedScoresContainer.appendChild(scoreListItem);
}

canvas.addEventListener("mousedown", handleInput);

function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

resetSnakeColor();
gameLoop();