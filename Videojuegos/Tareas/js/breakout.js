/*
 * Práctica Conceptos Básicos de Videojuegos (Breakout)
 *
 * Luis Emilio Velediaz Flores
 * 2025-03-12
 * NOTA: En el código se utiliza parseInt y alert, se recuperaron de:
 * https://developer.mozilla.org/es/docs/Web/API/Window/alert
 * https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/parseInt
 */

"use strict";

const canvasWidth = 800;
const canvasHeight = 600;
let oldTime;
const paddleVelocity = 0.5;
const initialSpeed = 0.5;
let score = 0;
let lives = 3;
let ctx;
let rows = 5;  // valor default
let cols = 8;  // valor default
let bricks = [];

const brickWidth = 80, brickHeight = 30;
const brickColors = ["green", "blue", "yellow", "orange", "red"];

class Ball extends GameObject {
    constructor(position, width, height, color) {
        super(position, width, height, color, "ball");
        this.reset();
    }

    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(deltaTime));
    }

    initVelocity() {
        this.inPlay = true;
        let angle = Math.random() * (Math.PI / 2) - (Math.PI / 4);
        this.velocity = new Vec(Math.cos(angle), Math.sin(angle)).times(initialSpeed);
        this.velocity.y *= -1;
    }

    reset() {
        this.inPlay = false;
        this.position = new Vec(canvasWidth / 2, canvasHeight - 50);
        this.velocity = new Vec(0, 0);
    }
}

class Paddle extends GameObject {
    constructor(position, width, height, color) {
        super(position, width, height, color, "paddle");
        this.velocity = new Vec(0.0, 0.0);
    }

    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(deltaTime));

        if (this.position.x < 0) {
            this.position.x = 0;
        } else if (this.position.x + this.width > canvasWidth) {
            this.position.x = canvasWidth - this.width;
        }

        if (this.position.y < 0) {
            this.position.y = 0;
        } else if (this.position.y + this.height > canvasHeight) {
            this.position.y = canvasHeight - this.height;
        }
    }
}

class Brick extends GameObject {
    constructor(position, width, height, color) {
        super(position, width, height, color, "brick");
        this.destroyed = false;
    }
}

const ball = new Ball(new Vec(canvasWidth / 2, canvasHeight - 50), 20, 20, "white");
const paddle = new Paddle(new Vec(canvasWidth / 2 - 50, canvasHeight - 25), 100, 15, "gray");

function setupBricks() {
    bricks = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const color = brickColors[i % brickColors.length];
            bricks.push(new Brick(new Vec(j * (brickWidth + 5) + 30, i * (brickHeight + 5) + 50), brickWidth, brickHeight, color));
        }
    }
}

function startGame() {

    rows = parseInt(document.getElementById('rows').value); // convierte el string que se inserto en int
    cols = parseInt(document.getElementById('cols').value); // convierte el string que se inserto en int
    setupBricks();
    main();
}

function main() {
    const canvas = document.getElementById('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');

    createEventListeners();
    drawScene(0);
}

function createEventListeners() {
    window.addEventListener('keydown', (event) => {
        if (event.key == 'ArrowLeft') {
            paddle.velocity.x = -paddleVelocity;
        } else if (event.key == 'ArrowRight') {
            paddle.velocity.x = paddleVelocity;
        } else if (event.key == 'ArrowUp') {
            paddle.velocity.y = -paddleVelocity;
        } else if (event.key == 'ArrowDown') {
            paddle.velocity.y = paddleVelocity;
        } else if (event.key == 's' && !ball.inPlay) {
            ball.initVelocity();
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key == "ArrowLeft" || event.key == "ArrowRight") {
            paddle.velocity.x = 0;
        } else if (event.key == "ArrowUp" || event.key == "ArrowDown") {
            paddle.velocity.y = 0;
        }
    });
}

function drawScene(newTime) {
    if (oldTime == undefined) {
        oldTime = newTime;
    }
    let deltaTime = newTime - oldTime;
   
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "white";
    ctx.font = '30px Arial';
    ctx.fillText(`Puntos: ${score}`, 20, 30);
    ctx.fillText(`Vidas: ${lives}`, canvasWidth - 120, 30);
    paddle.draw(ctx);
    ball.draw(ctx);

    for (let i = 0; i < bricks.length; i++) {
        if (!bricks[i].destroyed) {
            bricks[i].draw(ctx);
        }
    }

    if (ball.position.x <= 0 || ball.position.x + ball.width >= canvasWidth) {
        ball.velocity.x *= -1;
    }

    if (ball.position.y <= 0) {
        ball.velocity.y *= -1;
    }

    ball.update(deltaTime);
    paddle.update(deltaTime);

    if (boxOverlap(ball, paddle)) {
        if (ball.velocity.y > 0) {
            ball.velocity.y = -ball.velocity.y;
        }
        ball.position.y = paddle.position.y - ball.height;
    }

    for (let i = 0; i < bricks.length; i++) {
        if (!bricks[i].destroyed && boxOverlap(ball, bricks[i])) {
            ball.velocity.y *= -1;
            bricks[i].destroyed = true;
            score += 10;
        }
    }

    if (ball.position.y > canvasHeight) {
        lives--;
        if (lives > 0) {
            ball.reset();
        } else {
            alert("Game Over!!! Puntaje final: " + score); // despliega una alerta en el navegador
            return;
        }
    }

    let allBricksDestroyed = true;
    for (let i = 0; i < bricks.length; i++) {
        if (!bricks[i].destroyed) {
            allBricksDestroyed = false;
            break;
        }
    }
    if (allBricksDestroyed) {
        alert("Ganaste!!!! Puntaje final: " + score); // despliega una alerta en el navegador
        return;
    }

    oldTime = newTime;
    requestAnimationFrame(drawScene);
}

main();
