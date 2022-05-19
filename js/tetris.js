import Tetromino from '../js/tetromino.js';
import Position from '../js/position.js';
import { clearScores, addScore } from '../js/db.js'

// init();

// import botMove from '../js/bot.js';

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
    static MOBILE_HELP_TEXT = "CONTROLS:\n  use screen buttons or swipes\n  - LEFT/RIGHT/DOWN swipe - left/right/down move\n  - UP swipe - rotation\n  - multitouch x3 - pause\n  - multitouch x4 - restart"
    static PC_HELP_TEXT = "CONTROLS:\n  ⬅️ ➡️ ⬇️ or A, D, S - left/right/down move\n  ⬆️ or W - rotation\n  Q, E - counterclockwise and clockwise rotation\n  F1 - help\n  P - pause\n  Enter - restart\n  Space - hard drop\n"
    static LIST_OF_COLORS = ["rgb(255,127,0)", "rgb(0, 0, 255)", "rgb(0, 255, 0)", "rgb(203, 40, 40)", "rgb(114,188,212)", "rgb(237, 226, 21)", "rgb(161, 13, 143)", "gray"];
    static LIST_OF_DARKER_COLORS = ["rgb(120,60,0)", "rgb(0, 0, 120)", "rgb(0, 120, 0)", "rgb(100, 20, 20)", "rgb(57,99,106)", "rgb(115, 112, 10)", "rgb(80, 6, 71)", "gray"];
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
    // static CLEARED_LINES_AUDIO = new Audio('./audio/cleared_lines.mp3');
    // static LVL_UP_AUDIO = new Audio('./audio/level_up.mp3');
    // static PAUSED_AUDIO = new Audio('./audio/paused.mp3');
    // static REPAUSED_AUDIO = new Audio('./audio/repaused.mp3');
    // static HARD_DROP_AUDIO = new Audio('./audio/hard_drop.wav');
    // static GAME_OVER_SOUND = new Audio('./audio/game_over.wav');
    // static RESTART_GAME_AUDIO = new Audio('./audio/restart_game.wav');
    // static TAP_SOUND = new Audio('./audio/tap_sound.wav');
    static BACKGROUND_AUDIO_LIST = [new Audio('./audio/background/1.mp3')];
    clearedLines = [];
    buttons = [];
    board = [];
    score = 0;
    lvl = 1;
    line = 0;
    isTouchableDevice = false;
    helpText = Tetris.PC_HELP_TEXT;
    isGameOver = false;
    isPaused = false;
    isActive = false;
    currentTimerID = null;
    isAnimation = false;
    botTimer = null;
    isBackgroundAudio = false;
    isStoppedAudio = true;
    fullScreenBtn = document.getElementById('fullscreen_button');
    leftBtn = document.getElementById('left_button');
    rightBtn = document.getElementById('right_button');
    helpBtn = document.getElementById('help_button');
    musicBtn = document.getElementById('music_button');
    musicLine = document.getElementById('music_line');
    themeBtn = document.getElementById('dark_light_theme_button');
    clockwiseBtn = document.getElementById('clockwise_button');
    counterClockwiseBtn = document.getElementById('counterclockwise_button');
    downBtn = document.getElementById('down_button');
    harddropBtn = document.getElementById('harddrop_button');
    nextLabel = document.getElementById('next_label');
    scoreLabel = document.getElementById('score_label');
    levelLabel = document.getElementById('level_label');
    linesLabel = document.getElementById('lines_label');
    glass = document.getElementById('glass');
    next = document.getElementById('next');
    body = document.getElementById('_body');
    isDisableSound = true;


    constructor(canvas, width, height, isOpponent = false) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')
        this.isOpponent = isOpponent;
        this.setSize(width, height);
        this.currentTetromino = this.createNewTetromino();
        this.nextTetromino = this.createNewTetromino();
        this.boardMatrix = this.createFieldMatrix();
        this.setButtons();
        this.setLabels();
        this.createMatrixOfColors();
        Tetris.instanceCounter++;
        this.currentSpeed = Tetris.START_SPEED;
        this.dpi = window.devicePixelRatio;
        Tetris.BACKGROUND_AUDIO_LIST[0].loop = true;
    }

    // playBackgroundAudio() {
    //     if (this.isBackgroundAudio) return;

    //     Tetris.BACKGROUND_AUDIO_LIST[0].play().then(() => {
    //         this.isBackgroundAudio = true
    //     }).catch(() => {
    //         return;
    //     });
    // }


    stopBackgroundAudio() {
        if (this.isStoppedAudio) return;
        this.isStoppedAudio = true;
        Tetris.BACKGROUND_AUDIO_LIST[0].pause();
    }

    resumeBackgroundAudio() {
        if (this.isDisableSound || !this.isStoppedAudio) return;
        Tetris.BACKGROUND_AUDIO_LIST[0].play().then(() => {
            this.isStoppedAudio = false;
        }).catch(() => {
            return;
        });
    }



    start() {
        this.repaintTimer = setInterval(this.paint.bind(this), 33);
        // requestAnimationFrame(this.paint.bind(this))
        this.currentTimerID = setTimeout(this.restartTimer.bind(this), this.currentSpeed)
            // if (this.isOpponent)
            //     this.botTimer = setInterval(() => {
            //         let m = botMove();
            //         eval(m);
            //         // this.move(m.x, m.y);
            //     }, 500);
    }

    restart() {
        // Tetris.RESTART_GAME_AUDIO.pause();
        // Tetris.RESTART_GAME_AUDIO.currentTime = 0;
        // Tetris.RESTART_GAME_AUDIO.play();
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
        if (this.isGameOver)
            return;

        if (this.isPaused) {
            // Tetris.REPAUSED_AUDIO.play();
            this.isPaused = false;
        } else {
            // Tetris.PAUSED_AUDIO.play();
            this.isPaused = true;
        }
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
                    this.setGameOver();
                    // Tetris.GAME_OVER_SOUND.play();
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
        this.clearLines();
    }

    hardDrop() {
        if (this.isGameOver)
            return;
        while (true)
            if (!this.move(0, 1)) {
                // Tetris.HARD_DROP_AUDIO.pause();
                // Tetris.HARD_DROP_AUDIO.currentTime = 0;
                // Tetris.HARD_DROP_AUDIO.play();
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

        // if (this.isTouchableDevice) {
        //     this.glassPos = new Position((this.width - this.cellSize) / 2 - ((this.cellSize * 11 + this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3)) / 2), Tetris.PADDING * 3);
        // }
        if (Tetris.activeCounter == 1) {
            this.glassPos = new Position(Math.floor(width / 2) - this.cellSize * 9, Tetris.PADDING * 3);
        } else {
            this.cellSize = width > height ? (Math.floor(width / 50)) : (Math.floor(height / 50));
            this.glassPos = this.isOpponent ? new Position(Tetris.PADDING * 2 + Math.floor(width / 2), Tetris.PADDING * 6) : new Position(this.cellSize * 5, Tetris.PADDING * 3);
        }
        this.glass.style.width = `${this.canvasCords2Document(Tetris.CELLS_COUNT/2 * this.cellSize)}px`;
        this.glass.style.height = `${this.canvasCords2Document(Tetris.CELLS_COUNT * this.cellSize)}px`;
        this.glass.style.left = `${this.canvasCords2Document(this.glassPos.x)}px`;
        this.glass.style.top = `${this.canvasCords2Document(this.glassPos.y)}px`;
        this.glass.style.borderRadius = `${this.canvasCords2Document(this.cellSize/4)}px`;
        this.borderWidth = Math.floor(this.cellSize / 7);
        this.fontSize = this.cellSize;
        this.body.style.fontSize = `${this.canvasCords2Document(this.fontSize)}px`;
        this.ctx.font = `${this.fontSize}px Minecrafter Alt`;
        this.next.style.width = `${this.canvasCords2Document(this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3))}px`;
        this.next.style.height = `${this.canvasCords2Document(this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3))}px`;
        this.next.style.left = `${this.canvasCords2Document(this.glassPos.x + this.cellSize * 11)}px`;
        this.next.style.top = `${this.canvasCords2Document(this.cellSize + this.glassPos.y)}px`;
        this.next.style.borderRadius = `${this.canvasCords2Document(this.cellSize/4)}px`
            // this.ctx.roundRect(nextFieldX, nextFieldY, nextFieldW, nextFieldH, this.cellSize).fill();
    }

    canvasCords2Document(x, y = null) {
        let rect = this.canvas.getBoundingClientRect();
        let newX = (x) * (rect.right - rect.left) / (this.width);

        if (!y)
            return newX;

        let newY = (y) / this.height * (rect.bottom - rect.top);
        return { x: newX, y: newY };
    }


    paint() {
        if (!this.isActive) {
            return;
        }

        this.ctx.textAlign = "center";
        this.checkGameOver();
        this.update();
        this.ctx.lineWidth = this.borderWidth;
        this.drawNextAndLabels();
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
        if (this.isGameOver) {

            return true;
        }

        for (let j = 1; j < this.boardMatrix[0].length - 1; j++) {
            if (this.boardMatrix[0][j] == 2) {
                this.setGameOver();
                // Tetris.GAME_OVER_SOUND.play();
            }
        }
    }

    setGameOver() {
        if (!this.isGameOver) {
            addScore(this.score, this.lvl, this.line);
            this.isGameOver = true;
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
        let isFullLine = true;

        for (let i = 0; i < this.boardMatrix.length - 1; i++) {
            isFullLine = true;
            for (let j = 1; j < this.boardMatrix[0].length - 1; j++) {
                if (this.boardMatrix[i][j] != 2) {
                    isFullLine = false;
                    break;
                }
            }
            if (isFullLine) {
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
                // Tetris.LVL_UP_AUDIO.play();
                this.currentSpeed -= this.currentSpeed > Tetris.STEP_SPEED ? Tetris.STEP_SPEED : 0;
                console.log("current moved delay:", this.currentSpeed, "ms");
            }
            this.animation(copyBoardMatrix, copyColorsMatrix);
        }
    }

    animation(copyBoardMatrix, copyColorsMatrix) {
        this.isAnimation = true;

        console.log("animation");
        // Tetris.CLEARED_LINES_AUDIO.play();
        this.changeTimerStatus();
        let id = setInterval(() => {
            for (let i = 0; i < this.clearedLines.length; i++) {
                for (let j = 0; j < this.matrixOfColors[i].length; j++) {
                    this.matrixOfColors[this.clearedLines[i]][j] = this.getRandomInt(7);
                }
            }
        });



        setTimeout(() => {
            this.ctx.strokeStyle = "black";
            this.isAnimation = false;
            this.clearedLines = [];
            clearInterval(id);
            this.matrixOfColors = copyColorsMatrix;
            this.boardMatrix = copyBoardMatrix;
            this.currentTetromino.move(0, -1);
            this.restartTimer(Tetris.AnimationTime);
            // Tetris.CLEARED_LINES_AUDIO.pause();
            // Tetris.CLEARED_LINES_AUDIO.currentTime = 0;
        }, Tetris.AnimationTime);
    }


    setButtons() {
        let paddingX = Math.floor((this.height - Tetris.PADDING * 2) / 4);
        let y = Math.floor(this.height / 2);
        let x = Tetris.PADDING;
        let w = this.cellSize * 5;
        let h = w;

        if (this.width < this.height) {
            paddingX = Math.floor((this.width - Tetris.PADDING * 2) / 4);
            y = this.height - (this.height - (this.glassPos.y + Tetris.CELLS_COUNT * this.cellSize)) / 2 - h;
            // w = this.cellSize * 4;
            // h = w;
        }

        this.leftBtn.style.width = `${this.canvasCords2Document(w)}px`;
        this.leftBtn.style.height = `${this.canvasCords2Document(h)}px`;
        this.leftBtn.style.left = `${this.canvasCords2Document(x)}px`;
        this.leftBtn.style.top = `${this.canvasCords2Document(y)}px`;

        this.rightBtn.style.width = `${this.canvasCords2Document(w)}px`;
        this.rightBtn.style.height = `${this.canvasCords2Document(h)}px`;
        this.rightBtn.style.left = `${this.canvasCords2Document(x+paddingX)}px`;
        this.rightBtn.style.top = `${this.canvasCords2Document(y)}px`;

        this.clockwiseBtn.style.width = `${this.canvasCords2Document(w)}px`;
        this.clockwiseBtn.style.height = `${this.canvasCords2Document(h)}px`;
        this.clockwiseBtn.style.left = `${this.canvasCords2Document(this.width - x  - w)}px`;
        this.clockwiseBtn.style.top = `${this.canvasCords2Document(y)}px`;

        this.counterClockwiseBtn.style.width = `${this.canvasCords2Document(w)}px`;
        this.counterClockwiseBtn.style.height = `${this.canvasCords2Document(h)}px`;
        this.counterClockwiseBtn.style.left = `${this.canvasCords2Document(this.width - x - paddingX - w)}px`;
        this.counterClockwiseBtn.style.top = `${this.canvasCords2Document(y)}px`;

        this.downBtn.style.width = `${this.canvasCords2Document(w)}px`;
        this.downBtn.style.height = `${this.canvasCords2Document(h)}px`;
        this.downBtn.style.left = `${this.canvasCords2Document(x + Math.floor(paddingX / 2))}px`;
        this.downBtn.style.top = `${this.canvasCords2Document(y + Math.floor(paddingX * Math.sqrt(3) / 2))}px`;

        this.harddropBtn.style.width = `${this.canvasCords2Document(w)}px`;
        this.harddropBtn.style.height = `${this.canvasCords2Document(h)}px`;
        this.harddropBtn.style.left = `${this.canvasCords2Document(this.width - x - paddingX / 2 - w)}px`;
        this.harddropBtn.style.top = `${this.canvasCords2Document(y + Math.floor(paddingX * Math.sqrt(3) / 2))}px`;

        w = this.canvasCords2Document(this.cellSize * 2);
        this.fullScreenBtn.style.width = `${w*0.75}px`;
        this.fullScreenBtn.style.height = `${w*0.75}px`;
        this.musicBtn.style.height = `${w*0.9}px`;
        this.musicBtn.style.width = `${w*0.9}px`;
        this.musicLine.style.height = `${w*0.9}px`;
        this.musicLine.style.width = `${w*0.8}px`;

        this.helpBtn.style.height = `${w}px`;
        this.helpBtn.style.width = `${w}px`;
        this.themeBtn.style.width = `${w}px`;
        this.themeBtn.style.height = `${w}px`;


        y = this.glassPos.y;
        x = this.glassPos.x + this.cellSize * 11 + this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3) + this.cellSize / 2;

        let x_y = this.canvasCords2Document(x + w * 0.25, y + w * 0.25);
        this.fullScreenBtn.style.left = `${x_y.x}px`;
        this.fullScreenBtn.style.top = `${x_y.y}px`;

        x_y = this.canvasCords2Document(x, y + this.cellSize * 2);
        this.helpBtn.style.left = `${x_y.x}px`;
        this.helpBtn.style.top = `${x_y.y}px`;

        x_y = this.canvasCords2Document(x, y + w * 0.25 + this.cellSize * 4);
        this.musicBtn.style.left = `${x_y.x}px`;
        this.musicBtn.style.top = `${x_y.y}px`;
        this.musicLine.style.left = `${x_y.x}px`;
        this.musicLine.style.top = `${x_y.y}px`;

        x_y = this.canvasCords2Document(x, y + w * 0.25 + this.cellSize * 6);
        this.themeBtn.style.left = `${x_y.x}px`;
        this.themeBtn.style.top = `${x_y.y}px`;
    }

    setLabels() {
        let y = this.cellSize + this.glassPos.y - this.fontSize;
        let h = this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3);
        let x = this.glassPos.x + this.cellSize * 11; + Math.floor(this.cellSize * Math.floor(Tetris.CELLS_COUNT / 3) / 2);
        let w = this.cellSize * 6;
        let padding = this.canvasCords2Document(this.fontSize);
        w = this.canvasCords2Document(w);
        x = this.canvasCords2Document(x);
        h = this.canvasCords2Document(h) + padding / 10;
        y = this.canvasCords2Document(y);

        this.nextLabel.style.left = `${x}px`;
        this.nextLabel.style.top = `${y-padding}px`;
        this.nextLabel.style.width = `${w}px`

        this.scoreLabel.style.left = `${x}px`;
        this.scoreLabel.style.top = `${y+h}px`;
        this.scoreLabel.style.width = `${w}px`

        this.linesLabel.style.left = `${x}px`;
        this.linesLabel.style.top = `${y+h*1.5}px`;
        this.linesLabel.style.width = `${w}px`

        this.levelLabel.style.left = `${x}px`;
        this.levelLabel.style.top = `${y+h*2}px`;
        this.levelLabel.style.width = `${w}px`
    }

    coords2Canvas(x, y) {
        let rect = this.canvas.getBoundingClientRect();
        x_pos = (x - rect.left) / (rect.right - rect.left) * this.width;
        y_pos = (y - rect.top) / (rect.bottom - rect.top) * this.height;
        return { x_pos, y_pos }
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