const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make canvas BIG (full screen style)
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.85;

const GOAL = 30; // 🔥 Win condition upgraded
const SNAKE_RADIUS = 10;
const FOOD_RADIUS = 8;
const INITIAL_LENGTH = 8;

const SNAKE_SPEED = 1.4; 
const STUN_DURATION = 2000;

let snake = [];
let food = {};
let trees = [];
let score = 0;
let gameOver = false;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

let stunned = false;
let stunStartTime = 0;
let starsAngle = 0;
let stunnedTreeIndex = null;

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

function init() {
    snake = [];
    score = 0;
    gameOver = false;
    stunned = false;
    stunnedTreeIndex = null;

    for (let i = 0; i < INITIAL_LENGTH; i++) {
        snake.push({
            x: canvas.width / 2 - i * 18,
            y: canvas.height / 2
        });
    }

    generateFood();
    generateTrees();
}

function generateFood() {
    food = {
        x: Math.random() * (canvas.width - 60) + 30,
        y: Math.random() * (canvas.height - 60) + 30
    };
}

function generateTrees() {
    trees = [];

    const numberOfTrees = 12; // 🌳 MORE TREES

    for (let i = 0; i < numberOfTrees; i++) {
        trees.push({
            x: Math.random() * (canvas.width - 120) + 60,
            y: Math.random() * (canvas.height - 120) + 60,
            radius: 28,
            stunnedOnce: false
        });
    }
}

function update() {
    if (gameOver) return;

    const head = snake[0];

    if (!stunned) {
        let dx = mouseX - head.x;
        let dy = mouseY - head.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
            head.x += (dx / distance) * SNAKE_SPEED;
            head.y += (dy / distance) * SNAKE_SPEED;
        }
    } else {
        starsAngle += 0.15;

        if (Date.now() - stunStartTime > STUN_DURATION) {
            stunned = false;

            if (stunnedTreeIndex !== null) {
                trees[stunnedTreeIndex].stunnedOnce = true;
            }

            stunnedTreeIndex = null;
        }
    }

    // Body follow
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i].x += (snake[i - 1].x - snake[i].x) * 0.28;
        snake[i].y += (snake[i - 1].y - snake[i].y) * 0.28;
    }

    checkCollision();
}

function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (
        head.x < SNAKE_RADIUS ||
        head.x > canvas.width - SNAKE_RADIUS ||
        head.y < SNAKE_RADIUS ||
        head.y > canvas.height - SNAKE_RADIUS
    ) {
        endGame();
    }

    // Tree collision
    trees.forEach((tree, index) => {
        const dx = head.x - tree.x;
        const dy = head.y - tree.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (
            distance < tree.radius + SNAKE_RADIUS &&
            !tree.stunnedOnce &&
            !stunned
        ) {
            stunned = true;
            stunStartTime = Date.now();
            stunnedTreeIndex = index;
        }
    });

    // Food collision
    const dx = head.x - food.x;
    const dy = head.y - food.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < SNAKE_RADIUS + FOOD_RADIUS) {
        snake.push({
            x: snake[snake.length - 1].x,
            y: snake[snake.length - 1].y
        });

        score++;

        if (score >= GOAL) {
            winGame();
        }

        generateFood();
    }
}

function drawStars(head) {
    ctx.save();
    ctx.translate(head.x, head.y - 28);
    ctx.rotate(starsAngle);

    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(
            18 * Math.cos((i * 2 * Math.PI) / 4),
            18 * Math.sin((i * 2 * Math.PI) / 4),
            4,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "yellow";
        ctx.fill();
    }

    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw trees
    trees.forEach(tree => {
        ctx.beginPath();
        ctx.arc(tree.x, tree.y, tree.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#145A32";
        ctx.fill();
    });

    // Draw food
    ctx.beginPath();
    ctx.arc(food.x, food.y, FOOD_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "pink";
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, SNAKE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? "#00FFAA" : "#00CC88";
        ctx.fill();
    });

    if (stunned) {
        drawStars(snake[0]);
    }

    // Score display
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score + " / " + GOAL, 30, 40);
}

function endGame() {
    gameOver = true;
    alert("Game Over! Final Score: " + score);
    init();
}

function winGame() {
    gameOver = true;
    alert("🏆 You Won! Snake hunted 30 mice!");
    init();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

init();
gameLoop();