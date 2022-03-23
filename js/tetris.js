import Tetromino from '../js/tetromino.js';
import Position from '../js/position.js';


CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
}

class MyButton {
    constructor() {
    }

    setButton(x, y, w, h, r, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.r = r;
        this.c = c;
    }
}

export default class Tetris {
    static LIST_OF_COLORS = ["rgb(255,127,0)", "rgb(0, 0, 255)", "rgb(0, 255, 0)","rgb(203, 40, 40)", "rgb(114,188,212)", "rgb(237, 226, 21)","rgb(161, 13, 143)"];
    static LIST_OF_TETROMINOES = ["L", "J", "S", "Z", "I", "O", "T"];
    static counterClockWiseImg = new Image(150, 150);
    static clockWiseImg = new Image(150, 150);
    static hardDropImg = new Image(150, 150);
    static leftImg = new Image(150, 150);
    static rightImg = new Image(150, 150);
    static downImg = new Image(150, 150);
    static CELLS_COUNT = 20;
    static PADDING = 20;
    static SCORE = 560;
    static DOWN = -2;
    static TIC = 500;
    static LEFT = -1;
    static RIGHT = 1;
    static UP = 2;
   
    buttons = [];
    board = [];
    score = 0;
    isTouchableDevice = false;

    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.setBoardPos(width, height);
        this.currentTetromino = this.createNewTetromino();
        this.nextTetromino = this.createNewTetromino();
        this.boardMatrix = this.createBoard();
        this.gameOver = false;
        for (let i = 0; i < 6; i++)
            this.buttons.push(new MyButton());
        this.setButtons();
        Tetris.counterClockWiseImg.src = 'img/counterclockwise.png';
        Tetris.clockWiseImg.src = 'img/clockwise.png';
        Tetris.hardDropImg.src = 'img/harddrop.png';
        Tetris.leftImg.src = 'img/left.png';
        Tetris.rightImg.src = 'img/right.png';
        Tetris.downImg.src = 'img/down.png';
        this.createMatrixOfColors();
    }

    createMatrixOfColors() {
        this.matrixOfColors = []
        for (let i = 0; i < Tetris.CELLS_COUNT; i++)
            this.matrixOfColors.push(new Array(Tetris.CELLS_COUNT / 2).fill(-1));
    }

    createBoard() {
        let boardMatrix = [];
        for (let i = 0; i < Tetris.CELLS_COUNT + 1; i++) {
            let row = [2];
            for (let j = 0; j < Tetris.CELLS_COUNT / 2 + 1; j++) {
                if (i == Tetris.CELLS_COUNT || j == Tetris.CELLS_COUNT / 2)
                    row.push(2)
                else
                    row.push(0);
            } Tetris.PADDING
            boardMatrix.push(row);
        }

        return boardMatrix;
    }


    drawBoardDetails() {
        this.ctx.strokeStyle = "black";
        for (let i = 0; i < this.boardMatrix.length - 1; i++) {
            for (let j = 1; j < this.boardMatrix[0].length - 1; j++) {
                if (this.boardMatrix[i][j] == 2) {
                    this.ctx.fillStyle = Tetris.LIST_OF_COLORS[this.matrixOfColors[i][j - 1]];
                    this.ctx.roundRect((j - 1) * this.cellSize + Tetris.PADDING, (i) * this.cellSize + Tetris.PADDING, this.cellSize, this.cellSize, this.cellSize / 5).fill();
                    this.ctx.roundRect((j - 1) * this.cellSize + Tetris.PADDING, (i) * this.cellSize + Tetris.PADDING, this.cellSize, this.cellSize, this.cellSize / 5).stroke();
                }
            }
        }
    }


    isCollided(prevFigure) {
        try {
            for (let i = 0; i < this.currentTetromino.tetromino.length; i++) {
                for (let j = 0; j < this.currentTetromino.tetromino[0].length; j++) {
                    if (this.currentTetromino.tetromino[i][j] == 1) {
                        if (this.boardMatrix[this.currentTetromino.y + i][this.currentTetromino.x + j + 1] + 1 >= 3) {
                            this.currentTetromino = prevFigure.clone();
                            return true;
                        }
                    }
                }
            }
        }
        catch {
            console.log("collision exception")
        }
        return false;
    }


    createNewTetromino() {
        let value = this.getRandomInt(7);
        let tetromino = eval(`new Tetromino(Tetromino.${Tetris.LIST_OF_TETROMINOES[value]}, 3, 0, Tetris.LIST_OF_COLORS[value], value)`);
        return tetromino;
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    move(x, y) {
        if (this.gameOver) {
            return false;
        }

        let prev = this.currentTetromino.clone();
        this.currentTetromino.move(x, y);
        let isCollided = this.isCollided(prev);

        if (isCollided) {
            prev = this.currentTetromino.clone();
            this.currentTetromino.move(0, 1);
            this.isCollided(prev);
            if (this.currentTetromino.y === prev.y) {
                let tmp = this.currentTetromino.clone();
                this.currentTetromino = this.nextTetromino.clone();
                this.nextTetromino = this.createNewTetromino();
                this.addToBoard(tmp);
                return false;
            }
            this.currentTetromino.move(0, -1);
        }
        return true;
    }

    addToBoard(tmp) {
        let colorID = tmp.colorID;
        for (let i = 0; i < tmp.tetromino.length; i++) {
            for (let j = 0; j < tmp.tetromino[0].length; j++) {
                if (tmp.tetromino[i][j] === 1) {
                    this.boardMatrix[tmp.y + i][tmp.x + j + 1] = 2;
                    this.matrixOfColors[tmp.y + i][tmp.x + j] = colorID;
                }
            }
        }
    }

    hardDrop() {
        while (true)
            if (!this.move(0, 1)) {
                return;
            }
        
    }

    rotate() {
        let prev = this.currentTetromino.clone();
        this.currentTetromino.rotate();
        this.isCollided(prev);
    }

    setBoardPos(width, height) {
        this.width = width;
        this.height = height;
        let delta = Math.abs(width - height);
        this.cellSize = width > height ? (width - delta - Tetris.PADDING * 2) / Tetris.CELLS_COUNT : (height - delta - Tetris.PADDING * 2) / Tetris.CELLS_COUNT;
        this.glassPos = new Position(Tetris.PADDING, Tetris.PADDING);
    }

    paint() {
        this.clearLines();
        this.update();
        this.drawGlass();
        this.drawNextAndScore();
        this.drawButtons();
        this.drawCurrentTetromino();
        this.drawBoardDetails();
        if (this.isGameOver()) {
            // document.location.reload();
            this.drawGameOverScreen();
            // return;
        }
    }


    drawGameOverScreen() {
        let centerGlass = new Position(
            this.glassPos.x + Tetris.CELLS_COUNT * this.cellSize / 4,
            this.glassPos.y + Tetris.CELLS_COUNT * this.cellSize / 2,
        )
        this.ctx.fillStyle = 'black';
        this.ctx.strokeStyle = 'white';
        this.ctx.textAlign = "center";
        this.ctx.fillText('GAME OVER', centerGlass.x, centerGlass.y);
        this.ctx.strokeText('GAME OVER', centerGlass.x, centerGlass.y);
    }

    isGameOver() {
        for (let i = 0; i < 1; i++) {
            for (let j = 1; j < this.boardMatrix[0].length - 1; j++) {
                if (this.boardMatrix[i][j] == 2) {
                    this.gameOver = true;
                    return true;
                }
            }
        }
        return false;
    }

    clearLines() {
        let counter = 0;
        for (let i = 0; i < this.boardMatrix.length - 1; i++) {
            let sum = 0;
            for (let j = 1; j < this.boardMatrix[0].length - 1; j++) {
                sum += this.boardMatrix[i][j];
            }
            if (sum == Tetris.CELLS_COUNT / 2 * 2) {
                for (let k = i; k > 1; k--) {
                    this.boardMatrix[k] = Array.from(this.boardMatrix[k - 1]);
                    this.matrixOfColors[k] = Array.from(this.matrixOfColors[k - 1]);
                }

                this.boardMatrix[0] = new Array(Tetris.CELLS_COUNT / 2 + 2).fill(0);
                this.boardMatrix[0][0] = 2;
                this.boardMatrix[0][Tetris.CELLS_COUNT / 2 + 1] = 2;
                this.matrixOfColors[0] = new Array(Tetris.CELLS_COUNT / 2).fill(-1);
                counter++;
            }
        }
        this.score += Tetris.SCORE * counter;
    }

    setButtons() {
        let paddingX = (this.width - Tetris.PADDING * 2) / 4;
        let y = this.glassPos.y + Tetris.CELLS_COUNT * this.cellSize + this.width / 6;
        let x = this.glassPos.x;

        for (let i = 0; i < 2; i++) {
            this.buttons[i].setButton(
                x + i * paddingX,
                y, this.cellSize * 3,
                this.cellSize * 3,
                this.cellSize / 2,
                Tetris.LIST_OF_COLORS[i]
            );
        }

        for (let i = 0; i < 2; i++) {
            this.buttons[i + 2].setButton(
                this.width - x - (i) * paddingX - this.cellSize * 3,
                y,
                this.cellSize * 3,
                this.cellSize * 3,
                this.cellSize / 2,
                Tetris.LIST_OF_COLORS[i + 2]
            );
        }

        y = this.glassPos.y + (Tetris.CELLS_COUNT + 5) * this.cellSize + this.width / 6;

        this.buttons[4].setButton(
            x + paddingX - 2.5 * this.cellSize,
            y, this.cellSize * 3,
            this.cellSize * 3,
            this.cellSize / 2,
            Tetris.LIST_OF_COLORS[4]
        );
        this.buttons[5].setButton(
            this.width - x - paddingX - this.cellSize / 2,
            y,
            this.cellSize * 3,
            this.cellSize * 3,
            this.cellSize / 2,
            Tetris.LIST_OF_COLORS[5]
        );
    }

    buttonsClicked(i) {
        this.buttons[i].y -= 10;
        this.buttons[i].x -= 10;
        this.buttons[i].w += 20;
        this.buttons[i].h += 20;
    }

    checkButtons(x_pos, y_pos) {
        let x, y, w, h;
        for (let i = 0; i < this.buttons.length; i++) {
            x = this.buttons[i].x;
            y = this.buttons[i].y;
            w = this.buttons[i].w;
            h = this.buttons[i].h;

            if (x_pos > x && x_pos < x + w) {
                if (y_pos > y && y_pos < y + h) {
                    this.buttonsClicked(i);
                    setTimeout(() => {
                        this.setButtons();
                    }, 25);

                    return i;
                }
            }
        }
        return -1;
    }


    drawButtons() {
        if (!this.isTouchableDevice) {
            return;
        }

        for (let i = 0; i < this.buttons.length; i++) {
            this.ctx.fillStyle = this.buttons[i].c;
            this.ctx.roundRect(this.buttons[i].x, this.buttons[i].y, this.buttons[i].w, this.buttons[i].h, this.buttons[i].r).fill();
        }

        this.ctx.drawImage(Tetris.leftImg, this.buttons[0].x, this.buttons[0].y, this.buttons[0].w, this.buttons[0].h);
        this.ctx.drawImage(Tetris.rightImg, this.buttons[1].x, this.buttons[1].y, this.buttons[1].w, this.buttons[1].h);
        this.ctx.drawImage(Tetris.clockWiseImg, this.buttons[2].x, this.buttons[2].y, this.buttons[2].w, this.buttons[2].h);
        this.ctx.drawImage(Tetris.counterClockWiseImg, this.buttons[3].x, this.buttons[3].y, this.buttons[3].w, this.buttons[3].h);
        this.ctx.drawImage(Tetris.downImg, this.buttons[4].x, this.buttons[4].y, this.buttons[4].w, this.buttons[4].h);
        this.ctx.drawImage(Tetris.hardDropImg, this.buttons[5].x, this.buttons[5].y, this.buttons[5].w, this.buttons[5].h);
    }

    drawNextAndScore() {
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillStyle = "black";
        let nextFieldX = this.cellSize * (Tetris.CELLS_COUNT / 2 + 2);
        let nextFieldY = this.cellSize + this.glassPos.y;
        let nextFieldW = this.cellSize * Tetris.CELLS_COUNT / 3;
        let nextFieldH = this.cellSize * Tetris.CELLS_COUNT / 3;
        let nextFieldCenterX = nextFieldX + nextFieldW / 2;
        let nextFieldCenterY = nextFieldY + nextFieldH / 2;

        this.ctx.roundRect(nextFieldX, nextFieldY, nextFieldW, nextFieldH, this.cellSize).fill();
        this.ctx.globalAlpha = 1;
        let font_size = this.cellSize * 2;
        this.ctx.font = `bold ${font_size}px Courier New`;
        this.ctx.textAlign = "center";
        this.ctx.fillText("NEXT", nextFieldCenterX, nextFieldY - font_size / 10);
        this.ctx.fillText("SCORE", nextFieldCenterX, nextFieldY + nextFieldH + font_size);

        if (this.score) {
            this.ctx.fillStyle = "white";
            this.ctx.fillText(`${this.score}`, nextFieldCenterX, nextFieldY + nextFieldH + font_size * 2);
            this.ctx.strokeStyle = "black";
            this.ctx.strokeText(`${this.score}`, nextFieldCenterX, nextFieldY + nextFieldH + font_size * 2);
        }

        this.ctx.fillStyle = this.nextTetromino.color;
        this.ctx.strokeStyle = "black";
        for (let i = 0; i < this.nextTetromino.tetromino.length; i++) {
            for (let j = 0; j < this.nextTetromino.tetromino[0].length; j++) {
                if (this.nextTetromino.tetromino[i][j]) {
                    let x = (j - this.nextTetromino.tetromino[0].length / 2) * this.cellSize + nextFieldCenterX;
                    let y = (i - this.nextTetromino.tetromino.length / 2) * this.cellSize + nextFieldCenterY;
                    this.ctx.roundRect(x, y, this.cellSize, this.cellSize, this.cellSize / 5).fill();
                    this.ctx.roundRect(x, y, this.cellSize, this.cellSize, this.cellSize / 5).stroke();
                }
            }
        }
    }

    drawCurrentTetromino() {
        this.ctx.fillStyle = this.currentTetromino.color;
        for (let i = 0; i < this.currentTetromino.tetromino.length; i++) {
            for (let j = 0; j < this.currentTetromino.tetromino[0].length; j++) {
                if (this.currentTetromino.tetromino[i][j]) {
                    let x = (this.currentTetromino.x + j) * this.cellSize + Tetris.PADDING;
                    let y = (this.currentTetromino.y + i) * this.cellSize + Tetris.PADDING;
                    this.ctx.roundRect(x, y, this.cellSize, this.cellSize, this.cellSize / 5).fill();
                    this.ctx.roundRect(x, y, this.cellSize, this.cellSize, this.cellSize / 5).stroke();

                }
            }
        }
    }

    drawGlass() {
        this.ctx.fillStyle = "black";
        this.ctx.globalAlpha = 0.7;
        this.ctx.roundRect(this.glassPos.x, this.glassPos.y, this.cellSize * Tetris.CELLS_COUNT / 2, this.cellSize * Tetris.CELLS_COUNT, this.cellSize).fill();
        this.drawCells()
        this.ctx.globalAlpha = 1.0;
    }


    drawCells() {
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = 'white';
        for (let i = 0; i < Tetris.CELLS_COUNT; i++) {
            for (let j = 0; j < Tetris.CELLS_COUNT / 2; j++) {
                this.ctx.beginPath();
                this.ctx.moveTo(j * this.cellSize + Tetris.PADDING, i * this.cellSize + Tetris.PADDING);
                this.ctx.lineTo((j + 1) * this.cellSize + Tetris.PADDING, i * this.cellSize + Tetris.PADDING);
                this.ctx.stroke();
                this.ctx.closePath();

                this.ctx.beginPath();
                this.ctx.moveTo(j * this.cellSize + Tetris.PADDING, i * this.cellSize + Tetris.PADDING);
                this.ctx.lineTo((j) * this.cellSize + Tetris.PADDING, (i + 1) * this.cellSize + Tetris.PADDING);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}