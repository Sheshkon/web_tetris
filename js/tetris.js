import Tetromino from '../js/tetromino.js';
import Position from '../js/position.js';
import botMove from '../js/bot.js';
import MyButton from '../js/myButton.js';


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



export default class Tetris {
    static START_SPEED = 1500;
    static instanceCounter = 0;
    static LIST_OF_COLORS = ["rgb(255,127,0)", "rgb(0, 0, 255)", "rgb(0, 255, 0)", "rgb(203, 40, 40)", "rgb(114,188,212)", "rgb(237, 226, 21)", "rgb(161, 13, 143)", "gray"];
    static LIST_OF_TETROMINOES = ["L", "J", "S", "Z", "I", "O", "T"];
    static LIST_OF_SCORES = [40, 100, 300, 1200];
    static CELLS_COUNT = 20;
    static PADDING = 20;
    static DOWN = -2;
    static STEP_SPEED = 75;
    static LEFT = -1;
    static RIGHT = 1;
    static UP = 2;
    static activeCounter = 0;
    static AnimationTime = 300;

    clearedLines = [];
    buttons = [];
    board = [];
    score = 0;
    lvl = 1;
    line = 0;
    isTouchableDevice = false;
    isGameOver = false;
    isPaused = false;
    isActive = false;
    currentTimerID = null;
    isAnimation = false;
    botTimer = null;

    constructor(canvas, width, height, isOpponent = false) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')
        this.isOpponent = isOpponent;
        this.setSize(width, height);
        this.currentTetromino = this.createNewTetromino();
        this.nextTetromino = this.createNewTetromino();
        this.boardMatrix = this.createFieldMatrix();
        MyButton.setButtons();
        for (let i = 0; i < 7; i++)
            this.buttons.push(new MyButton());
        this.setButtons();
        this.createMatrixOfColors();
        Tetris.instanceCounter++;
        this.currentSpeed = Tetris.START_SPEED;
        this.dpi = window.devicePixelRatio;
    }

    start() {
        this.repaintTimer = setInterval(this.paint.bind(this), 33);
        // requestAnimationFrame(this.paint.bind(this))
        this.currentTimerID = setTimeout(this.restartTimer.bind(this), this.currentSpeed)
        if (this.isOpponent)
            this.botTimer = setInterval(() => {
                let m = botMove();
                eval(m);
                // this.move(m.x, m.y);
            }, 500);
    }

    restart() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.stopTimer();
        clearInterval(this.repaintTimer);
        this.score = 0;
        this.lvl = 1;
        this.line = 0;
        this.clearedLines = [];
        this.currentSpeed = Tetris.START_SPEED;
        this.isGameOver = false;
        this.isPaused = false;
        this.currentTimerID = null;
        this.isAnimation = false;
        this.currentTetromino = this.createNewTetromino();
        this.nextTetromino = this.createNewTetromino();
        this.boardMatrix = this.createFieldMatrix();
        this.createMatrixOfColors();
        this.start();
    }

    changePausedStatus() {
        this.isPaused = this.isPaused ? false : true;
        this.changeTimerStatus();
    }

    stopTimer() {
        clearInterval(this.currentTimerID);
        this.currentTimerID = null;
    }

    restartTimer(time = null) {
        this.move(0, 1);
        this.stopTimer();
        if (!this.isGameOver)
            this.currentTimerID = setTimeout(this.restartTimer.bind(this), time ? this.currentSpeed + time : this.currentSpeed);
    }

    changeTimerStatus() {
        if (this.currentTimerID) {
            this.stopTimer();
        } else {
            clearInterval(this.currentTimerID);
            if (!this.isGameOver)
                this.currentTetromino.move(0, -1);
            this.restartTimer();
        }
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
                        if (currentFigure.y < 0)
                            return false;
                        if (this.boardMatrix[currentFigure.y + i][currentFigure.x + j + 1] + 1 >= 3) {
                            return true;
                        }
                    }
                }
            }
        } catch {
            console.log("collision exception")
            return false;
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
        this.checkGameOver();
        if (this.isGameOver || this.isPaused || this.isAnimation) {
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
                this.changeTimerStatus();
                let tmp = this.currentTetromino.clone();

                this.currentTetromino = this.nextTetromino.clone();
                this.changeTimerStatus();

                this.nextTetromino = this.createNewTetromino();
                this.checkGameOver();

                try {
                    this.addToBoard(tmp);
                } catch {
                    this.isGameOver = true;
                }

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
        if (this.isGameOver)
            return;
        while (true)
            if (!this.move(0, 1)) {
                return;
            }
    }

    rotate(isClockWise) {
        if (this.isGameOver || this.isPaused || this.isAnimation)
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
        this.cellSize = width > height ? Math.floor((width - delta - Tetris.PADDING * 6) / Tetris.CELLS_COUNT) : Math.floor((height - delta - Tetris.PADDING * 6) / Tetris.CELLS_COUNT);

        if (this.isTouchableDevice) {
            this.glassPos = new Position((this.width - this.cellSize) / 2 - ((this.cellSize * 11 + this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3)) / 2), Tetris.PADDING * 3);

        } else if (Tetris.activeCounter == 1) {
            this.glassPos = new Position(Math.floor(width / 2) - this.cellSize * 9, Tetris.PADDING * 3);
        } else {
            this.cellSize = width > height ? (Math.floor(width / 50)) : (Math.floor(height / 50));
            this.glassPos = this.isOpponent ? new Position(Tetris.PADDING * 2 + Math.floor(width / 2), Tetris.PADDING * 6) : new Position(this.cellSize * 5, Tetris.PADDING * 3);
        }
        this.borderWidth = Math.floor(this.cellSize / 7);
        this.fontSize = this.cellSize;
        this.ctx.font = `${this.fontSize}px Minecrafter Alt`;

    }


    paint() {
        if (!this.isActive) {
            return;
        }
        this.drawFieldDetails();
        this.ctx.textAlign = "center";
        this.checkGameOver();
        this.clearLines();
        this.update();
        this.ctx.globalAlpha = 0.7;
        this.drawGlass();
        this.ctx.lineWidth = this.borderWidth;
        this.ctx.globalAlpha = 1;
        this.drawNextAndLabels();
        this.drawButtons();
        this.drawFieldDetails();
        if (this.isAnimation) {
            return;
        }
        this.drawCurrentTetromino();
        this.drawShadow();
        if (this.isGameOver) {
            // document.location.reload();
            this.drawTextOnGlass("game over");
            this.stopTimer();
            return;

        } else if (this.isPaused) {
            this.drawTextOnGlass("paused");
            return;
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
        for (let j = 1; j < this.boardMatrix[0].length - 1; j++) {
            if (this.boardMatrix[0][j] == 2) {
                this.isGameOver = true;
            }
        }
    }

    copyMatrix(m) {
        let copy = [];
        for (let i = 0; i < m.length; i++) {
            copy.push(Array.from(m[i]));
        }
        return copy;
    }

    clearLines() {
        if (this.isAnimation)
            return

        let copyBoardMatrix = this.copyMatrix(this.boardMatrix);
        let copyColorsMatrix = this.copyMatrix(this.matrixOfColors)
        let counter = 0;
        ///
        for (let i = 0; i < this.boardMatrix.length - 1; i++) {
            let sum = 0;
            for (let j = 1; j < this.boardMatrix[0].length - 1; j++) {
                sum += this.boardMatrix[i][j];
            }
            if (sum == Math.floor(Tetris.CELLS_COUNT)) {
                this.clearedLines.push(i);
                copyBoardMatrix[i] = Array.from(copyBoardMatrix[0]);
                for (let k = i; k > 0; k--) {
                    copyBoardMatrix[k] = Array.from(copyBoardMatrix[k - 1]);
                    copyColorsMatrix[k] = Array.from(copyColorsMatrix[k - 1]);
                }

                copyBoardMatrix[0] = new Array(Math.floor(Tetris.CELLS_COUNT / 2) + 2).fill(0);
                copyBoardMatrix[0][0] = 2;
                copyBoardMatrix[0][Math.floor(Tetris.CELLS_COUNT / 2) + 1] = 2;
                copyColorsMatrix[0] = new Array(Math.floor(Tetris.CELLS_COUNT / 2)).fill(-1);
                counter++;
            }
        }

        let prevLVL = this.lvl;
        if (counter) {
            this.score += Tetris.LIST_OF_SCORES[counter - 1] * this.lvl;
            this.line += counter;
            this.lvl = Math.floor(this.line / 10) + 1;
            if (this.lvl > prevLVL) {
                this.currentSpeed -= this.currentSpeed > 75 ? Tetris.STEP_SPEED : 0;
                console.log("current moved delay:", this.currentSpeed, "ms");
            }
            this.animation(copyBoardMatrix, copyColorsMatrix);
        }
    }

    animation(copyBoardMatrix, copyColorsMatrix) {
        this.isAnimation = true;
        this.changeTimerStatus();
        let id = setInterval(() => {
            for (let i = 0; i < this.clearedLines.length; i++) {
                for (let j = 0; j < this.matrixOfColors[i].length; j++) {
                    this.matrixOfColors[this.clearedLines[i]][j] = this.getRandomInt(7);
                }
            }
        }, Tetris.AnimationTime / 10);

        setTimeout(() => {
            this.ctx.strokeStyle = "black";
            this.isAnimation = false;
            this.clearedLines = [];
            clearInterval(id);
            this.matrixOfColors = copyColorsMatrix;
            this.boardMatrix = copyBoardMatrix;
            this.currentTetromino.move(0, -1);
            this.restartTimer(Tetris.AnimationTime);
        }, Tetris.AnimationTime);
    }


    setButtons() {
        let paddingX = Math.floor((this.width - Tetris.PADDING * 2) / 4);
        let y = Math.floor(this.glassPos.y + Tetris.CELLS_COUNT * this.cellSize + this.width / 6);
        let x = Tetris.PADDING;

        for (let i = 0; i < 2; i++) {
            this.buttons[i].setButton(
                x + i * paddingX,
                y, this.cellSize * 3,
                this.cellSize * 3,
                Math.floor(this.cellSize * 3 / 2),
                Tetris.LIST_OF_COLORS[i]
            );
        }

        for (let i = 0; i < 2; i++) {
            this.buttons[i + 2].setButton(
                this.width - x - (i) * paddingX - this.cellSize * 3,
                y,
                this.cellSize * 3,
                this.cellSize * 3,
                Math.floor(this.cellSize * 3 / 2),
                Tetris.LIST_OF_COLORS[i + 2]
            );
        }

        y = this.glassPos.y + (Tetris.CELLS_COUNT + 5) * this.cellSize + this.width / 6;

        this.buttons[4].setButton(
            x + paddingX - Math.floor(2.5 * this.cellSize),
            y, this.cellSize * 3,
            this.cellSize * 3,
            Math.floor(this.cellSize * 3 / 2),
            Tetris.LIST_OF_COLORS[4]
        );
        this.buttons[5].setButton(
            this.width - x - paddingX - Math.floor(this.cellSize / 2),
            y,
            this.cellSize * 3,
            this.cellSize * 3,
            Math.floor(this.cellSize * 3 / 2),
            Tetris.LIST_OF_COLORS[5]
        );

        this.buttons[6].setButton(
            this.glassPos.x + this.cellSize * 11 + this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3),
            this.glassPos.y,
            this.cellSize * 2,
            this.cellSize * 2,
            0,
            null
        );
    }


    checkButtons(x_pos, y_pos) {
        let rect = this.canvas.getBoundingClientRect();
        x_pos = (x_pos - rect.left) / (rect.right - rect.left) * this.width;
        y_pos = (y_pos - rect.top) / (rect.bottom - rect.top) * this.height;

        let x = null;
        let y = null;
        let w = null;
        let h = null;
        for (let i = 0; i < this.buttons.length; i++) {
            x = this.buttons[i].x;
            y = this.buttons[i].y;
            w = this.buttons[i].w;
            h = this.buttons[i].h;
            if (x_pos > x && x_pos < x + w) {
                if (y_pos > y && y_pos < y + h) {
                    return i;
                }
            }
        }
        return -1;
    }

    drawButtons() {
        if (!this.isTouchableDevice || this.isOpponent)
            return;
        let x, y, w, h, r;

        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].isClicked) {
                x = this.buttons[i].x_clicked;
                y = this.buttons[i].y_clicked;
                w = this.buttons[i].w_clicked;
                h = this.buttons[i].h_clicked;
                r = this.buttons[i].r_clicked;
            } else {
                x = this.buttons[i].x;
                y = this.buttons[i].y;
                w = this.buttons[i].w;
                h = this.buttons[i].h;
                r = this.buttons[i].r;
            }
            if (this.buttons[i].c == null) {
                this.ctx.drawImage(MyButton.images[i], x, y, w, h);
                continue;
            }
            this.ctx.fillStyle = this.buttons[i].c;
            this.ctx.roundRect(x, y, w, h, r).fill();
            this.ctx.drawImage(MyButton.images[i], x, y, w, h);
            this.ctx.fillStyle = 'black';
            this.ctx.roundRect(x, y, w, h, r).stroke();

        }
    }

    drawNextAndLabels() {
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

    drawLabels(centerX, y, h) {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = "white";
        this.ctx.fillText("next", centerX, y + Math.floor(this.fontSize / 2));
        this.ctx.fillText("score", centerX, y + h + this.cellSize);
        this.ctx.fillText("lines", centerX, y + h + this.cellSize * 4);
        this.ctx.fillText("level", centerX, y + h + this.cellSize * 7);
        this.ctx.fillStyle = 'red';
        this.ctx.fillText(`${this.score}`, centerX, y + h + this.cellSize * 2);
        this.ctx.fillText(`${this.line}`, centerX, y + h + this.cellSize * 5);
        this.ctx.fillText(`${this.lvl}`, centerX, y + h + this.cellSize * 8);

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

    drawHelp() {

        let helpX = this.glassPos.x + this.cellSize * 11 + this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3);

        this.ctx.drawImage(Tetris.helpImg, helpX, this.glassPos.y, this.cellSize * 2, this.cellSize * 2);

    }
    update() {


        if (Tetris.activeCounter === 1 && !this.isOpponent) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        } else
        if (this.isTouchableDevice) {
            this.ctx.clearRect(0, 0, this.width, this.glassPos.y + this.cellSize);
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