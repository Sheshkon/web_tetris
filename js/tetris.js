import Tetromino from '../js/tetromino.js';
import Position from '../js/position.js';


CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = Math.floor(w / 2);
    if (h < 2 * r) r = Math.floor(h / 2);
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
    constructor() {}

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
    static instanceCounter = 0;
    static LIST_OF_COLORS = ["rgb(255,127,0)", "rgb(0, 0, 255)", "rgb(0, 255, 0)", "rgb(203, 40, 40)", "rgb(114,188,212)", "rgb(237, 226, 21)", "rgb(161, 13, 143)"];
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
    static activeCounter = 0;

    buttons = [];
    board = [];
    score = 0;
    lvl = 1;
    line = 0;
    isTouchableDevice = false;
    isGameOver = false;
    isPaused = false;
    isActive = false;



    constructor(ctx, width, height, isOpponent = false) {
        this.ctx = ctx;
        this.isOpponent = isOpponent;
        this.setSize(width, height);
        this.currentTetromino = this.createNewTetromino();
        this.nextTetromino = this.createNewTetromino();
        this.boardMatrix = this.createFieldMatrix();
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
        Tetris.instanceCounter++;
    }

    changeActive() {
        if (this.isActive) {
            this.isActive = false;
            Tetris.activeCounter--;
        } else {
            this.isActive = true;
            Tetris.activeCounter++;
        }
    }

    createMatrixOfColors() {
        this.matrixOfColors = []
        for (let i = 0; i < Tetris.CELLS_COUNT; i++)
            this.matrixOfColors.push(new Array(Math.floor(Tetris.CELLS_COUNT / 2)).fill(-1));
    }

    createFieldMatrix() {
        let fieldMatrix = [];
        for (let i = 0; i < Tetris.CELLS_COUNT + 1; i++) {
            let row = [2];
            for (let j = 0; j < Math.floor(Tetris.CELLS_COUNT / 2) + 1; j++) {
                if (i == Tetris.CELLS_COUNT || j == Math.floor(Tetris.CELLS_COUNT / 2))
                    row.push(2)
                else
                    row.push(0);
            }
            Tetris.PADDING
            fieldMatrix.push(row);
        }

        return fieldMatrix;
    }

    drawFieldDetails() {
        for (let i = 0; i < this.boardMatrix.length - 1; i++) {
            for (let j = 1; j < this.boardMatrix[0].length - 1; j++) {
                if (this.boardMatrix[i][j] == 2) {
                    this.ctx.fillStyle = Tetris.LIST_OF_COLORS[this.matrixOfColors[i][j - 1]];
                    this.ctx.roundRect((j - 1) * this.cellSize + this.glassPos.x, (i) * this.cellSize + this.glassPos.y, this.cellSize, this.cellSize, Math.floor(this.cellSize / 4)).fill();
                    this.ctx.roundRect((j - 1) * this.cellSize + this.glassPos.x, (i) * this.cellSize + this.glassPos.y, this.cellSize, this.cellSize, Math.floor(this.cellSize / 4)).stroke();
                }
            }
        }
    }


    isCollided(currentFigure) {
        try {
            for (let i = 0; i < currentFigure.tetromino.length; i++) {
                for (let j = 0; j < currentFigure.tetromino[0].length; j++) {
                    if (currentFigure.tetromino[i][j] == 1) {
                        if (this.boardMatrix[currentFigure.y + i][currentFigure.x + j + 1] + 1 >= 3) {
                            return true;
                        }
                    }
                }
            }
        } catch {
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
        if (this.isGameOver || this.isPaused) {
            return false;
        }

        let prev = this.currentTetromino.clone();
        this.currentTetromino.move(x, y);
        let isCollided = this.isCollided(this.currentTetromino);

        if (isCollided) {
            this.currentTetromino = prev;
            prev = this.currentTetromino.clone();
            this.currentTetromino.move(0, 1);
            if (this.isCollided(this.currentTetromino)) {
                this.currentTetromino = prev;
            }

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

    changePausedStatus() {
        this.isPaused = this.isPaused ? false : true;
    }

    hardDrop() {
        while (true)
            if (!this.move(0, 1)) {
                return;
            }
    }

    rotate(isClockWise) {
        if (this.isGameOver || this.isPaused)
            return;

        let prev = this.currentTetromino.clone();
        this.currentTetromino.rotate(isClockWise)
        if (this.isCollided(this.currentTetromino))
            this.currentTetromino = prev;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        let delta = Math.abs(width - height);
        this.cellSize = width > height ? Math.floor((width - delta - Tetris.PADDING * 2) / Tetris.CELLS_COUNT) : Math.floor((height - delta - Tetris.PADDING * 2) / Tetris.CELLS_COUNT);
        if (this.isTouchableDevice) {
            if (this.isOpponent) {
                this.cellSize = width > height ? Math.floor((width - delta - Tetris.PADDING * 2) / Tetris.CELLS_COUNT / 2) : Math.floor((height - delta - Tetris.PADDING * 2) / Tetris.CELLS_COUNT / 2);
                this.glassPos = new Position(Tetris.PADDING * 2, Tetris.PADDING)
            } else {
                this.glassPos = this.isTouchableDevice ? new Position(Tetris.PADDING * 2, Tetris.PADDING) : new Position(Math.floor(Tetris.PADDING / 2), Tetris.PADDING);
            }

        } else if (Tetris.activeCounter == 1) {
            this.glassPos = new Position(Math.floor(width / 2) - this.cellSize * 9, Tetris.PADDING);
        } else {
            this.cellSize = width > height ? (Math.floor(width / 50)) : (Math.floor(height / 50));
            this.glassPos = this.isOpponent ? new Position(Tetris.PADDING * 2 + Math.floor(width / 2), Tetris.PADDING * 2) : new Position(this.cellSize * 5, Tetris.PADDING * 2);
        }
        this.borderWidth = Math.floor(this.cellSize / 7);
        this.fontSize = this.isTouchableDevice ? this.cellSize * 2 : this.cellSize;
        this.ctx.font = `${this.fontSize}px Minecrafter Alt`;
    }


    paint() {
        this.ctx.textAlign = "center";
        // if(this.isTouchableDevice &&  this.isOpponent || !this.isActive)
        //     return;

        this.clearLines();
        this.update();
        this.ctx.globalAlpha = 0.7;
        this.drawGlass();
        // this.ctx.lineWidth = 1;
        // this.drawCells()
        this.ctx.lineWidth = this.borderWidth;
        this.ctx.globalAlpha = 1;
        this.drawNextAndLabels();
        this.drawButtons();
        this.drawCurrentTetromino();
        this.drawShadow();
        this.drawFieldDetails();
        this.checkGameOver();
        if (this.isGameOver) {
            // document.location.reload();
            this.drawTextOnGlass("game over");
            // return;
        } else if (this.isPaused) {
            this.drawTextOnGlass("paused");
        }
    }


    drawTextOnGlass(text) {
        let centerGlass = new Position(
            Math.floor(this.glassPos.x + Tetris.CELLS_COUNT * this.cellSize / 4),
            Math.floor(this.glassPos.y + Tetris.CELLS_COUNT * this.cellSize / 2),
        )
        this.ctx.fillStyle = 'red';
        this.ctx.fillText(text, centerGlass.x, centerGlass.y);
    }

    checkGameOver() {
        for (let i = 0; i < 1; i++) {
            for (let j = 1; j < this.boardMatrix[0].length - 1; j++) {
                if (this.boardMatrix[i][j] == 2) {
                    this.isGameOver = true;
                }
            }
        }
    }

    clearLines() {
        let counter = 0;
        for (let i = 0; i < this.boardMatrix.length - 1; i++) {
            let sum = 0;
            for (let j = 1; j < this.boardMatrix[0].length - 1; j++) {
                sum += this.boardMatrix[i][j];
            }
            if (sum == Math.floor(Tetris.CELLS_COUNT)) {
                for (let k = i; k > 1; k--) {
                    this.boardMatrix[k] = Array.from(this.boardMatrix[k - 1]);
                    this.matrixOfColors[k] = Array.from(this.matrixOfColors[k - 1]);
                }

                this.boardMatrix[0] = new Array(Math.floor(Tetris.CELLS_COUNT / 2) + 2).fill(0);
                this.boardMatrix[0][0] = 2;
                this.boardMatrix[0][Math.floor(Tetris.CELLS_COUNT / 2) + 1] = 2;
                this.matrixOfColors[0] = new Array(Math.floor(Tetris.CELLS_COUNT / 2)).fill(-1);
                counter++;
            }
        }
        if (counter) {
            this.score += Tetris.SCORE * counter;
            this.line += counter;
            this.lvl = Math.floor(this.line / 10) + 1;
        }
    }

    setButtons() {
        let paddingX = Math.floor((this.width - Tetris.PADDING * 2) / 4);
        let y = Math.floor(this.glassPos.y + Tetris.CELLS_COUNT * this.cellSize + this.width / 6);
        let x = this.glassPos.x;

        for (let i = 0; i < 2; i++) {
            this.buttons[i].setButton(
                x + i * paddingX,
                y, this.cellSize * 3,
                this.cellSize * 3,
                Math.floor(this.cellSize / 2),
                Tetris.LIST_OF_COLORS[i]
            );
        }

        for (let i = 0; i < 2; i++) {
            this.buttons[i + 2].setButton(
                this.width - x - (i) * paddingX - this.cellSize * 3,
                y,
                this.cellSize * 3,
                this.cellSize * 3,
                Math.floor(this.cellSize / 2),
                Tetris.LIST_OF_COLORS[i + 2]
            );
        }

        y = this.glassPos.y + (Tetris.CELLS_COUNT + 5) * this.cellSize + this.width / 6;

        this.buttons[4].setButton(
            x + paddingX - 2.5 * this.cellSize,
            y, this.cellSize * 3,
            this.cellSize * 3,
            Math.floor(this.cellSize / 2),
            Tetris.LIST_OF_COLORS[4]
        );
        this.buttons[5].setButton(
            this.width - x - paddingX - this.cellSize / 2,
            y,
            this.cellSize * 3,
            this.cellSize * 3,
            Math.floor(this.cellSize / 2),
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
        if (!this.isTouchableDevice || this.isOpponent)
            return;

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

    drawNextAndLabels() {
        // this.ctx.fillStyle = "black";
        // this.ctx.strokeStyle = "black";
        if (this.isTouchableDevice && this.isOpponent)
            return;

        let nextFieldX = this.glassPos.x + this.cellSize * 11;
        let nextFieldY = this.cellSize + this.glassPos.y;
        let nextFieldW = this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3);
        let nextFieldH = this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3);
        let nextFieldCenterX = nextFieldX + Math.floor(nextFieldW / 2);
        let nextFieldCenterY = nextFieldY + Math.floor(nextFieldH / 2);

        this.ctx.globalAlpha = 0.7;
        this.ctx.roundRect(nextFieldX, nextFieldY, nextFieldW, nextFieldH, this.cellSize).fill();
        this.drawLabels(nextFieldCenterX, nextFieldY, nextFieldH);
        this.ctx.fillStyle = this.nextTetromino.color;

        for (let i = 0; i < this.nextTetromino.tetromino.length; i++) {
            for (let j = 0; j < this.nextTetromino.tetromino[0].length; j++) {
                if (this.nextTetromino.tetromino[i][j]) {
                    let x = (j - this.nextTetromino.tetromino[0].length / 2) * this.cellSize + nextFieldCenterX;
                    let y = (i - this.nextTetromino.tetromino.length / 2) * this.cellSize + nextFieldCenterY;
                    this.ctx.roundRect(x, y, this.cellSize, this.cellSize, Math.floor(this.cellSize / 4)).fill();
                    this.ctx.roundRect(x, y, this.cellSize, this.cellSize, Math.floor(this.cellSize / 4)).stroke();
                }
            }
        }
    }

    drawLabels(nextFieldCenterX, nextFieldY, nextFieldH) {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = "white";
        this.ctx.fillText("next", nextFieldCenterX, nextFieldY + Math.floor(this.fontSize / 2));
        this.ctx.fillText("score", nextFieldCenterX, nextFieldY + nextFieldH + this.cellSize);
        this.ctx.fillText("lines", nextFieldCenterX, nextFieldY + nextFieldH + this.cellSize * 4);
        this.ctx.fillText("level", nextFieldCenterX, nextFieldY + nextFieldH + this.cellSize * 7);
        this.ctx.fillStyle = 'red';
        this.ctx.fillText(`${this.score}`, nextFieldCenterX, nextFieldY + nextFieldH + this.cellSize * 2);
        this.ctx.fillText(`${this.line}`, nextFieldCenterX, nextFieldY + nextFieldH + this.cellSize * 5);
        this.ctx.fillText(`${this.lvl}`, nextFieldCenterX, nextFieldY + nextFieldH + this.cellSize * 8);

    }

    drawCurrentTetromino() {
        this.ctx.fillStyle = this.currentTetromino.color;
        for (let i = 0; i < this.currentTetromino.tetromino.length; i++) {
            for (let j = 0; j < this.currentTetromino.tetromino[0].length; j++) {
                if (this.currentTetromino.tetromino[i][j]) {
                    let x = (this.currentTetromino.x + j) * this.cellSize + this.glassPos.x;
                    let y = (this.currentTetromino.y + i) * this.cellSize + this.glassPos.y;
                    this.ctx.roundRect(x, y, this.cellSize, this.cellSize, Math.floor(this.cellSize / 4)).fill();
                    this.ctx.roundRect(x, y, this.cellSize, this.cellSize, Math.floor(this.cellSize / 4)).stroke();
                }
            }
        }
    }

    drawShadow() {
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillStyle = Tetris.LIST_OF_COLORS[this.currentTetromino.colorID];
        let shadowedTetromino = this.currentTetromino.clone();
        let isCollided = false;
        let prev = null;
        while (true) {
            prev = shadowedTetromino.clone();
            shadowedTetromino.move(0, 1);
            isCollided = this.isCollided(shadowedTetromino);
            if (isCollided)
                break;
        }

        if (isCollided) {
            shadowedTetromino = prev;
            prev = shadowedTetromino.clone();
            shadowedTetromino.move(0, 1);
            if (this.isCollided(shadowedTetromino)) {
                shadowedTetromino = prev;
            }

            if (shadowedTetromino.y === prev.y) {
                for (let i = 0; i < shadowedTetromino.tetromino.length; i++) {
                    for (let j = 0; j < shadowedTetromino.tetromino[0].length; j++) {
                        if (shadowedTetromino.tetromino[i][j] == 1) {
                            this.ctx.roundRect((shadowedTetromino.x + j) * this.cellSize + this.glassPos.x, (shadowedTetromino.y + i) * this.cellSize + this.glassPos.y, this.cellSize, this.cellSize, Math.floor(this.cellSize / 4)).fill();
                            // this.ctx.roundRect((shadowedTetromino.x + j) * this.cellSize + this.glassPos.x, (shadowedTetromino.y + i) * this.cellSize + this.glassPos.y, this.cellSize, this.cellSize, Math.floor(this.cellSize / 4)).stroke();
                        }
                    }
                }

            }
            shadowedTetromino.move(0, -1);
        }
        this.ctx.globalAlpha = 1;
    }

    drawGlass() {
        this.ctx.fillStyle = "black";
        if (this.isTouchableDevice && this.isOpponent)
            this.ctx.fillRect(this.glassPos.x, this.glassPos.y, this.cellSize * Math.floor(Tetris.CELLS_COUNT / 2), this.cellSize * Tetris.CELLS_COUNT);

        else
            this.ctx.roundRect(this.glassPos.x, this.glassPos.y, this.cellSize * Math.floor(Tetris.CELLS_COUNT / 2), this.cellSize * Tetris.CELLS_COUNT, this.cellSize).fill();
    }


    drawCells() {
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = 'white';
        for (let i = 0; i < Math.floor(Tetris.CELLS_COUNT); i++) {
            for (let j = 0; j < Math.floor(Tetris.CELLS_COUNT / 2); j++) {
                this.ctx.beginPath();
                this.ctx.moveTo(j * this.cellSize + this.glassPos.x, i * this.cellSize + this.glassPos.y);
                this.ctx.lineTo((j + 1) * this.cellSize + this.glassPos.x, i * this.cellSize + this.glassPos.y);
                this.ctx.stroke();
                this.ctx.closePath();
                this.ctx.beginPath();
                this.ctx.moveTo(j * this.cellSize + this.glassPos.x, i * this.cellSize + this.glassPos.y);
                this.ctx.lineTo((j) * this.cellSize + this.glassPos.x, (i + 1) * this.cellSize + this.glassPos.y);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    }

    update() {

        if (Tetris.activeCounter === 1 && !this.isOpponent) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        } else if (this.isTouchableDevice) {
            if (this.isOpponent) {
                this.ctx.clearRect(this.glassPos.x, this.glassPos.y, this.cellSize * Math.floor(Tetris.CELLS_COUNT / 2), this.cellSize * Tetris.CELLS_COUNT);
            } else {
                this.ctx.clearRect(0, 0, this.width, this.height);
            }


        } else if (!this.isOpponent) {
            this.ctx.clearRect(0, 0, Math.floor(this.width / 2), this.height);
        } else {
            this.ctx.clearRect(Math.floor(this.width / 2), 0, this.width, this.height);
        }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}