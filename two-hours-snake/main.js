const canvasElement = document.getElementById('canvas');
const scoreElement = document.getElementById('score');
const c = canvasElement.getContext('2d');
c.fillStyle = 'black';

let stepDelay = 300;
let boardSize = {width: 20, height: 20};
let cellSize = 20;
let body = [
    {x: 3, y: 5},
    {x: 3, y: 4},
    {x: 3, y: 3}
];
let food = randomFoodPosition();

const directions = {
    down: {x: 0, y: 1},
    up: {x: 0, y: -1},
    left: {x: -1, y: 0},
    right: {x: 1, y: 0}
};
let direction = directions.down;
let lastDirection = direction;

function draw() {
    c.clearRect(0, 0, cellSize * boardSize.width + 1, cellSize * boardSize.height + 1);
    const width = cellSize * boardSize.width;
    const height = cellSize * boardSize.height;
    for (let x = 0; x <= width; x += cellSize) {
        drawLine(vector(x, 0), vector(x, height));
    }
    for (let y = 0; y <= height; y += cellSize) {
        drawLine(vector(0, y), vector(width, y));
    }
    drawSquare(food, 'lime');
    drawSquare(body[0], 'red');
    for (const part of body.slice(1)) {
        drawSquare(part, 'pink');
    }
    scoreElement.innerText = body.length;
}

function drawLine(from, to, fillStyle = 'black') {
    c.strokeStyle = fillStyle;
    c.beginPath();
    c.moveTo(from.x + 0.5, from.y + 0.5);
    c.lineTo(to.x + 0.5, to.y + 0.5);
    c.stroke();
}

function drawSquare(position, fillStyle = 'black') {
    c.fillStyle = fillStyle;
    c.fillRect(position.x * cellSize + 0.5, position.y * cellSize + 0.5, cellSize, cellSize);
}

function vector(x, y) {
    return {x: x, y: y};
}

function vectorAdd(a, b) {
    return {x: a.x + b.x, y: a.y + b.y};
}

function checkGameOver() {
    const head = body[0];
    if (head.x < 0 || head.y < 0 || head.x >= boardSize.width || head.y >= boardSize.height) {
        return true;
    }
    for (const part of body.slice(1)) {
        if (part.x == head.x && part.y == head.y) {
            return true;
        }
    }
    return false;
}

function move() {
    const head = vectorAdd(body[0], direction);
    const gotFood = checkFood(head);
    if (!gotFood) {
        body = body.slice(0, -1);
    } else {
        stepDelay = Math.max(50, stepDelay - 10);
    }
    body.unshift(head);
    if (checkGameOver()) {
        document.getElementById('game-over').setAttribute('style', '');
        return;
    }
    lastDirection = direction;
    draw();
    window.setTimeout(move, stepDelay);
}

function checkFood(position) {
    if (position.x == food.x && position.y == food.y) {
        food = randomFoodPosition();
        return true;
    }
    return false;
}

function randomFoodPosition() {
    while (true) {
        const random = vector(
            Math.floor(Math.random() * boardSize.width),
            Math.floor(Math.random() * boardSize.width)
        );
        let ok = true;
        for (const part of body) {
            if (random.x == part.x && random.y == part.y) {
                ok = false;
                break;
            }
        }
        if (ok) {
            return random;
        }
    }
}

canvasElement.setAttribute('width', (cellSize * boardSize.width + 1).toString());
canvasElement.setAttribute('height', (cellSize * boardSize.height + 1).toString());
draw();
move();

document.body.addEventListener('keydown', event => {
    const keysToDirections = {
        KeyW: 'up',
        KeyS: 'down',
        KeyA: 'left',
        KeyD: 'right'
    };
    const directionName = keysToDirections[event.code];
    if (!directionName) {
        return;
    }
    const newDirection = directions[directionName];
    const second = body[1];
    const newHead = vectorAdd(newDirection, body[0]);
    if (newHead.x == second.x && newHead.y == second.y) {
        return;
    }
    direction = newDirection;
});