// snake.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const snake = {
    x: 10,
    y: 10,
    size: 20,
    speed: 2,
    dx: 0,
    dy: 0,
    length: 1,
    body: [{ x: 10, y: 10 }],
    color: getRandomColor(), // Initial snake color
};

const food = {
    x: 100,
    y: 100,
    size: 15,
    color: "#00F", // Initial food color (green)
};

let enemies = []; // Array to store enemies

let score = 0; // Initial score

function update() {
    snake.x += snake.dx * snake.speed;
    snake.y += snake.dy * snake.speed;

    // Check for collisions
    if (
        snake.x < 0 ||
        snake.x + snake.size > canvas.width ||
        snake.y < 0 ||
        snake.y + snake.size > canvas.height
    ) {
        // Game over - reset the snake position, length, and score
        snake.x = 10;
        snake.y = 10;
        snake.length = 1;
        snake.body = [{ x: 10, y: 10 }];
        score = 0;
        enemies = [];
        resetSnakeColor();
    }

    if (checkCollision(snake, food)) {
        // Snake ate the food - increase length, update score, and randomly place new food
        snake.length++;
        score += 10;

        // Spawn a new enemy every 100 points
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

    // Check for collisions with enemies
    for (const enemy of enemies) {
        if (checkCollision(snake, enemy)) {
            // Game over if the snake collides with an enemy
            snake.x = 10;
            snake.y = 10;
            snake.length = 1;
            snake.body = [{ x: 10, y: 10 }];
            score = 0;
            enemies = [];
            resetSnakeColor();
        }
    }

    // Update snake body segments
    snake.body.unshift({ x: snake.x, y: snake.y });
    if (snake.body.length > snake.length) {
        snake.body.pop();
    }

    draw();
    updateScore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake body with flashing color
    ctx.fillStyle = snake.color;
    for (const segment of snake.body) {
        ctx.fillRect(segment.x, segment.y, snake.size, snake.size);
    }

    // Draw food
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, food.size, food.size);

    // Draw enemies
    ctx.fillStyle = "#F00";
    for (const enemy of enemies) {
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    }
}

function updateScore() {
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = "Score: " + score;
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
    // Reset the color-changing effect for the snake
    clearInterval(snake.colorTimer);
    snake.colorTimer = setInterval(changeSnakeColor, 100); // Change color every 100 milliseconds
}

function changeSnakeColor() {
    // Change the snake color to a random color
    snake.color = getRandomColor();
}

function getRandomColor() {
    // Generate a random color in hex format
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

canvas.addEventListener("mousedown", handleInput);

function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

// Initial color-changing effect for the snake
resetSnakeColor();

gameLoop();