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
let spawnEnemyTimeout;
let delayTime = 2000; // Initial delay time in milliseconds
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
            if (spawnEnemyTimeout) {
                clearTimeout(spawnEnemyTimeout);
            }

            // Set a timeout to spawn the enemy a few seconds later
            spawnEnemyTimeout = setTimeout(() => {
                // Set the enemy position behind the snake's tail
                const tail = snake.body[snake.body.length - 1];
                const newEnemy = {
                    x: tail.x,
                    y: tail.y,
                    size: 20,
                };
                enemies.push(newEnemy);

                // Increase the delay time by 10 seconds
            delayTime += 10;
            }, delayTime); // Adjust the delay time (in milliseconds) as needed
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
    // Draw green ground
    ctx.fillStyle = "#00A74A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw blades of grass
    ctx.fillStyle = "#00FF00"; // Adjust the color to your preference
    const grassWidth = 2; // Adjust the width of the grass blades
    const grassHeight = 15; // Adjust the height of the grass blades

    for (let x = 0; x < canvas.width; x += 20) {
        const randomHeight = Math.random() * grassHeight;
        ctx.fillRect(x, canvas.height - randomHeight, grassWidth, randomHeight);
    }

    for (let i = 0; i < snake.body.length; i++) {
        if (i === 0) {
            // Draw the head with eyes and mouth
            drawSnakeHead(snake.body[i]);
        } else {
            // Draw rounded body segments
            drawSnakeHexagonSegment(snake.body[i]);
        }
    }

    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, food.size, food.size);

    ctx.fillStyle = "#F00";
    for (const enemy of enemies) {
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    }
}

function drawSnakeHexagonSegment(segment) {
    ctx.fillStyle = segment.color;

    const size = snake.size;
    const centerX = segment.x + size / 2;
    const centerY = segment.y + size / 2;

    ctx.beginPath();
    ctx.moveTo(centerX + size / 2, centerY); // Move to the right point

    // Draw the hexagon
    for (let i = 1; i <= 6; i++) {
        const angle = (i * 2 * Math.PI) / 6;
        const x = centerX + size / 2 * Math.cos(angle);
        const y = centerY + size / 2 * Math.sin(angle);
        ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
}

function drawSnakeHead(head) {
    // Draw the head with eyes and mouth
    const headSize = snake.size;
    const pearTopRadius = headSize / 2;
    const pearBottomRadius = headSize;
    const pearHeight = headSize * 1.5;

    ctx.fillStyle = head.color;

    if (snake.dx !== 0 || snake.dy !== 0) {
        const angle = Math.atan2(snake.dy, snake.dx);
        ctx.translate(head.x + headSize / 2, head.y + headSize / 2);
        ctx.rotate(angle);

        // Draw pear-shaped head
        ctx.beginPath();
        ctx.moveTo(0, -pearHeight / 2);
        ctx.bezierCurveTo(
            -pearTopRadius, -pearHeight / 2,
            -pearTopRadius, pearHeight / 2,
            0, pearHeight / 2
        );
        ctx.bezierCurveTo(
            pearTopRadius, pearHeight / 2,
            pearTopRadius, -pearHeight / 2,
            0, -pearHeight / 2
        );
        ctx.fill();

        // Draw circular eyes on the sides
        const eyeSize = 6; // Adjust the size of the eyes
        const eyeY = headSize / - 10 - 10; // Adjust the vertical position of the eyes
        const eyeX = headSize / 10 - -10;
        const eyeSpacing = headSize / 3 ; // Adjust the horizontal spacing between the eyes

        ctx.fillStyle = "#FFF"; // Eye color

        // Adjusted eye positions
const rotatedEyeX1 = eyeSpacing;
const rotatedEyeY1 = eyeY;

const rotatedEyeX2 = eyeSpacing;
const rotatedEyeY2 = eyeX;

ctx.beginPath();
ctx.arc(rotatedEyeX1, rotatedEyeY1, eyeSize, 0, 2 * Math.PI);
ctx.fill();

ctx.beginPath();
ctx.arc(rotatedEyeX2, rotatedEyeY2, eyeSize, 0, 2 * Math.PI);
ctx.fill();

// Draw black pupils inside the eyes
ctx.fillStyle = "#000"; // Pupil color

// Draw left pupil
const pupilSize = 3; // Adjust the size of the pupils
ctx.beginPath();
ctx.arc(rotatedEyeX1, rotatedEyeY1, pupilSize, 0, 2 * Math.PI);
ctx.fill();

// Draw right pupil
ctx.beginPath();
ctx.arc(rotatedEyeX2, rotatedEyeY2, pupilSize, 0, 2 * Math.PI);
ctx.fill();

        // Draw mouth based on the direction
        ctx.fillStyle = "#000"; // Mouth color
        const mouthSize = 4;
        if (snake.dx > 0) {
            ctx.fillRect(0, headSize / 4 - mouthSize / 2, 2, mouthSize);
        } else if (snake.dx < 0) {
            ctx.fillRect(0, -headSize / 4 - mouthSize / 2, 2, mouthSize);
        } else if (snake.dy > 0) {
            ctx.fillRect(headSize / 4 - mouthSize / 2, 0, mouthSize, 2);
        } else if (snake.dy < 0) {
            ctx.fillRect(-headSize / 4 - mouthSize / 2, 0, mouthSize, 2);
        }

        // Reset the transformation
        ctx.rotate(-angle);
        ctx.translate(-head.x - headSize / 2, -head.y - headSize / 2);
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