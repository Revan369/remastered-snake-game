const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const snake = {
    x: 10,
    y: 10,
    size: 20,
    speed: 2,
    dx: 0,
    dy: 0,
};

function update() {
    snake.x += snake.dx * snake.speed;
    snake.y += snake.dy * snake.speed;

    // Check for collisions or other game logic here

    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00F";
    ctx.fillRect(snake.x, snake.y, snake.size, snake.size);
}

function handleInput(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    const angle = Math.atan2(mouseY - snake.y, mouseX - snake.x);
    snake.dx = Math.cos(angle);
    snake.dy = Math.sin(angle);
}

canvas.addEventListener("mousedown", handleInput);

function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

gameLoop();