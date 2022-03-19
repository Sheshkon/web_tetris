class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Tetromino {

    static I = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0]
    ];

    static J = [
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
    ];

    static L = [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
    ];

    static T = [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
    ];

    static O = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ];

    static S = [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0]
    ];

    static Z = [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0]
    ];

    constructor(tetromino, x, y) {
        this.tetromino = tetromino;
        this.x = x;
        this.y = y;
    }

    clone() {
        var tetromino = [];
        for(var i =0; i<this.tetromino.length;i++){
            let row = []
            for(var j=0;j<this.tetromino[0].length;j++){
                row.push(this.tetromino[i][j]);
            }
            tetromino.push(row);
        }

        return new Tetromino(tetromino, this.x, this.y);
    }

    rotate() {
        let rotated_tetromino = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        let N = this.tetromino.length;

        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                rotated_tetromino[x][N - y - 1] = this.tetromino[y][x];
            }
        }
        this.tetromino = rotated_tetromino;
    }

    move(x, y) {
        this.x += x;
        this.y += y;
    }
}


class Tetris {
    static list_of_tetrominos = ["L", "J", "S", "Z", "I", "O", "T"];
    static LEFT = -1;
    static RIGHT = 1;
    static UP = 2;
    static DOWN = -2;
    static TIC = 1000;
    static CELLS_COUNT = 20;
    static PADDING = 20;

    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.set_board_pos(width, height);
        this.score = 0;
        this.current_tetromino = this.create_new_tetromino();
        this.next_tetromino = this.create_new_tetromino();
        this.board_matrix = this.create_board();
    }

    create_board() {
        var board_matrix = [];
        for (var i = 0; i < Tetris.CELLS_COUNT + 1; i++) {
            let row = [2];
            for (var j = 0; j < Tetris.CELLS_COUNT / 2 + 1; j++) {
                if (i == Tetris.CELLS_COUNT || j == Tetris.CELLS_COUNT / 2)
                    row.push(2)
                else
                    row.push(0);
            } Tetris.PADDING
            board_matrix.push(row);
        }

        return board_matrix;

    }

    draw_board_details() {
        this.ctx.fillStyle = "yellow";
        for (var i = 0; i < this.board_matrix.length - 1; i++) {
            for (var j = 1; j < this.board_matrix[0].length - 1; j++) {
                if (this.board_matrix[i][j] == 2)
                    this.ctx.fillRect((j - 1) * this.cell_size + Tetris.PADDING, (i) * this.cell_size + Tetris.PADDING, this.cell_size, this.cell_size);
            }
        }
    }

    colision(prev_x = null, prev_y = null, prev_figure = null) {
        try {
            for (var i = 0; i < this.current_tetromino.tetromino.length; i++) {
                for (var j = 0; j < this.current_tetromino.tetromino[0].length; j++) {
                    // console.log("square", this.current_tetromino.x);
                    if (this.current_tetromino.tetromino[i][j] == 1) {
                        // console.log("taki tak", this.board_matrix[this.current_tetromino.y + i][this.current_tetromino.x+j]);
                        if (this.board_matrix[this.current_tetromino.y + i][this.current_tetromino.x + j + 1] + 1 >= 3) {
                            if (prev_x != null && prev_y!= null) {
                                this.current_tetromino.x = prev_x;
                                this.current_tetromino.y = prev_y;
                            }
                            if(prev_figure){
                                this.current_tetromino = prev_figure;
                            }
                            return true;
                        }
                    }
                }
            }
        }
        catch {
            if (prev_x || prev_y) {
                this.current_tetromino.tetromino.x = prev_x;
                this.current_tetromino.tetromino.y = prev_y;
            }
            if(prev_figure){
                this.current_tetromino = prev_figure;
            }

            return true;

        }


        return false;
    }


    create_new_tetromino() {
        let tetromino = eval(`new Tetromino(Tetromino.${Tetris.list_of_tetrominos[this.getRandomInt(7)]}, 3, -1)`);
        return tetromino;
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    move(x, y) {
        let prev_x = this.current_tetromino.x;
        let prev_y = this.current_tetromino.y;
        this.current_tetromino.move(x, y);
        let is_colided = this.colision(prev_x, prev_y);

        if (is_colided && x == 0 && y) {
            this.add_to_board();
            this.current_tetromino = this.next_tetromino;
            this.next_tetromino = this.create_new_tetromino();
            return false;

        }
        console.log("move", this.current_tetromino.x, this.current_tetromino.y);
        if (this.current_tetromino.y > 20) {
            this.current_tetromino = this.next_tetromino;
            this.next_tetromino = this.create_new_tetromino();
        }
        return true;
    }

    add_to_board() {
        for (var i = 0; i < this.current_tetromino.tetromino.length; i++) {
            for (var j = 0; j < this.current_tetromino.tetromino[0].length; j++) {
                // console.log("square", this.current_tetromino.x);
                if (this.current_tetromino.tetromino[i][j] == 1) {
                    // console.log("taki tak", this.board_matrix[this.current_tetromino.y + i][this.current_tetromino.x+j]);
                    this.board_matrix[this.current_tetromino.y + i][this.current_tetromino.x + j + 1] = 2;

                }
            }
        }
        console.log(this.board_matrix);
    }

    hard_drop() {

        while (this.move(0, 1)) {

        }
    }

    rotate() {
        let prev_figure = this.current_tetromino.clone();
        this.current_tetromino.rotate();
        this.colision(null, null, prev_figure);
    }

    set_board_pos(width, height) {
        this.width = width;
        this.height = height;
        let delta = Math.abs(width - height);
        this.cell_size = width > height ? (width - delta - Tetris.PADDING * 2) / Tetris.CELLS_COUNT : (height - delta - Tetris.PADDING * 2) / Tetris.CELLS_COUNT;
        this.glass_pos = new Position(Tetris.PADDING, Tetris.PADDING);
    }

    paint() {
        this.update();
        this.draw_glass();
        this.draw_next_and_score();
        this.draw_current_tetromino();
        this.draw_board_details();
    }

    draw_next_and_score() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.cell_size * Tetris.CELLS_COUNT / 2 + this.cell_size * 2, this.cell_size * 2, this.cell_size * Tetris.CELLS_COUNT / 3, this.cell_size * Tetris.CELLS_COUNT / 3);
        this.ctx.fillStyle = "white";
        this.ctx.font = `${this.cell_size}px serif`;
        this.ctx.fillText("_next_", this.cell_size * Tetris.CELLS_COUNT / 2 + this.cell_size * 3, this.cell_size);
        this.ctx.fillText(`score: ${this.score}`, this.cell_size * Tetris.CELLS_COUNT / 2 + this.cell_size * 3, this.cell_size * 2 + this.cell_size * (Tetris.CELLS_COUNT / 3 + 1))

        this.ctx.fillStyle = "red";
        for (var i = 0; i < this.next_tetromino.tetromino.length; i++) {
            for (var j = 0; j < this.next_tetromino.tetromino.length; j++) {
                if (this.next_tetromino.tetromino[i][j]) {
                    let x = (j + 1) * this.cell_size + this.cell_size * Tetris.CELLS_COUNT / 2 + this.cell_size * 2;
                    let y = (i + 3) * this.cell_size;

                    this.ctx.fillRect(
                        x,
                        y,
                        this.cell_size,
                        this.cell_size)
                }
            }
        }


    }

    draw_current_tetromino() {
        this.ctx.fillStyle = "red";
        for (var i = 0; i < this.current_tetromino.tetromino.length; i++) {
            for (var j = 0; j < this.current_tetromino.tetromino.length; j++) {
                if (this.current_tetromino.tetromino[i][j]) {
                    let x = (this.current_tetromino.x + j) * this.cell_size + Tetris.PADDING;
                    let y = (this.current_tetromino.y + i) * this.cell_size + Tetris.PADDING;

                    this.ctx.fillRect(
                        x,
                        y,
                        this.cell_size,
                        this.cell_size)
                }
            }
        }
    }

    draw_glass() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.glass_pos.x, this.glass_pos.y, this.cell_size * Tetris.CELLS_COUNT / 2, this.cell_size * Tetris.CELLS_COUNT);
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 0.5;
        for (var i = 0; i < Tetris.CELLS_COUNT; i++) {
            for (var j = 0; j < Tetris.CELLS_COUNT / 2; j++) {
                this.ctx.beginPath();
                this.ctx.moveTo(j * this.cell_size + Tetris.PADDING, i * this.cell_size + Tetris.PADDING);
                this.ctx.lineTo((j + 1) * this.cell_size + Tetris.PADDING, i * this.cell_size + Tetris.PADDING);
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.moveTo(j * this.cell_size + Tetris.PADDING, i * this.cell_size + Tetris.PADDING);
                this.ctx.lineTo((j) * this.cell_size + Tetris.PADDING, (i + 1) * this.cell_size + Tetris.PADDING);
                this.ctx.stroke();
            }
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(0, 0, this.width, this.height)
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}


var canvas = document.getElementById('game_field');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var tetris = new Tetris(canvas.getContext('2d'), canvas.width, canvas.height);


function start() {
    console.log('start');

    timer2 = setInterval(() => {
        tetris.move(0, 1);
    }, Tetris.TIC);

    timer = setInterval(() => {
        tetris.paint();
    }, 33);
}

window.addEventListener('load', () => {
    console.log('All assets are loaded');
    start();
})


window.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tetris.set_board_pos(canvas.width, canvas.height);
}, true);



window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    let key = event.key;

    if (key == "DOWN" || key == "ArrowDown") {
        tetris.move(0, 1);
        // Do something for "down arrow" key press.
    }

    else if (key == "Up" || key == "ArrowUp") {
        tetris.move(0, -1);
    }

    else if (key == "Left" || key == "ArrowLeft") {
        tetris.move(-1, 0);
    }
    else if (key == "Right" || key == "ArrowRight") {
        tetris.move(1, 0);
    }

    else if (key == "Enter") {
        // for first screen
        tetris.rotate();
        // else if (key == "Esc" || key == "Escape")
        //   snake.eat();
    }

    else if (event.code === 'Space') {
        console.log("space");
        tetris.hard_drop();
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);


document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function getTouches(evt) {
    return evt.touches ||             // browser API
        evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];

    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }


    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
        if (xDiff > 0) {

        } else {

        }
    } else {
        if (yDiff > 0) {

        } else {

        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
};
