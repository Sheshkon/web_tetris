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


class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Tetromino {

    static I = [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    static J = [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ];

    static L = [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ];

    static T = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ];

    static O = [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ];

    static S = [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ];

    static Z = [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ];

    constructor(tetromino, x, y, color) {
        this.tetromino = tetromino;
        this.x = x;
        this.y = y;
        this.color = color;
    }

    clone() {
        var tetromino = [];
        for (var i = 0; i < this.tetromino.length; i++) {
            let row = []
            for (var j = 0; j < this.tetromino[0].length; j++) {
                row.push(this.tetromino[i][j]);
            }
            tetromino.push(row);
        }

        return new Tetromino(tetromino, this.x, this.y, this.color);
    }

    rotate() {
        let rotated_tetromino = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        let N = this.tetromino.length;


        for (let y = 0; y < this.tetromino.length; y++) {
            for (let x = 0; x < this.tetromino[0].length; x++) {
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
    static list_of_colors = ["rgb(255,127,0)", "rgb(0, 0, 255)", "rgb(255, 0, 0)",
        "rgb(255, 0, 0)", "rgb(114,188,212)",
        "rgb(237, 226, 21)", "rgb(161, 13, 143)"];
    static bg_color = "rgb(237, 177, 164)";
    static LEFT = -1;
    static RIGHT = 1;
    static UP = 2;
    static DOWN = -2;
    static TIC = 1000;
    static CELLS_COUNT = 20;
    static PADDING = 20;
    static SCORE = 560;


    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.set_board_pos(width, height);
        this.score = 0;
        this.current_tetromino = this.create_new_tetromino();
        this.next_tetromino = this.create_new_tetromino();
        this.board_matrix = this.create_board();
        this.game_over = false;
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
        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "gray";
        for (var i = 0; i < this.board_matrix.length - 1; i++) {
            for (var j = 1; j < this.board_matrix[0].length - 1; j++) {
                if (this.board_matrix[i][j] == 2) {
                    // this.ctx.fillRect((j - 1) * this.cell_size + Tetris.PADDING, (i) * this.cell_size + Tetris.PADDING, this.cell_size, this.cell_size);

                    this.ctx.roundRect((j - 1) * this.cell_size + Tetris.PADDING, (i) * this.cell_size + Tetris.PADDING, this.cell_size, this.cell_size, this.cell_size / 5).fill();
                    this.ctx.roundRect((j - 1) * this.cell_size + Tetris.PADDING, (i) * this.cell_size + Tetris.PADDING, this.cell_size, this.cell_size, this.cell_size / 5).stroke()
                }
            }
        }
    }



    colision(prev_x = null, prev_y = null, prev_figure = null) {
        try {
            for (var i = 0; i < this.current_tetromino.tetromino.length; i++) {
                for (var j = 0; j < this.current_tetromino.tetromino[0].length; j++) {
                    if (this.current_tetromino.tetromino[i][j] == 1) {
                        if (this.board_matrix[this.current_tetromino.y + i][this.current_tetromino.x + j + 1] + 1 >= 3) {
                            if (prev_x != null && prev_y != null) {
                                this.current_tetromino.x = prev_x;
                                this.current_tetromino.y = prev_y;
                            }
                            if (prev_figure) {
                                this.current_tetromino = prev_figure.clone();
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
            if (prev_figure) {
                this.current_tetromino = prev_figure.clone();
            }

            // return true;

        }


        return false;
    }


    create_new_tetromino() {
        let value = this.getRandomInt(7);
        let tetromino = eval(`new Tetromino(Tetromino.${Tetris.list_of_tetrominos[value]}, 3, 0, Tetris.list_of_colors[value])`);
        return tetromino;
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    move(x, y) {
        if (this.game_over) {
            return;
        }
        let prev_x = this.current_tetromino.x;
        let prev_y = this.current_tetromino.y;
        this.current_tetromino.move(x, y);
        let is_colided = this.colision(prev_x, prev_y);

        if (is_colided && y) {
            let tmp = this.current_tetromino.clone();

            this.add_to_board(tmp);
            
            
            return false;

        }
        return true;
    }

    add_to_board(tmp) {
        for (var i = 0; i < tmp.tetromino.length; i++) {
            for (var j = 0; j < tmp.tetromino[0].length; j++) {
                if (tmp.tetromino[i][j] == 1) {
                    // console.log("taki tak", this.board_matrix[this.current_tetromino.y + i][this.current_tetromino.x+j]);

                    this.board_matrix[tmp.y + i][tmp.x + j + 1] = 2;

                }
            }
        }

        // console.log(this.board_matrix);
    }

    hard_drop() {
        let y = this.current_tetromino.y;
        for (var i = 0; i < this.board_matrix.length - y; i++) {
            let prev_x = this.current_tetromino.x;
            let prev_y = this.current_tetromino.y;
            this.current_tetromino.move(0, 1);
            let is_colided = this.colision(prev_x, prev_y);

            if (is_colided) {
                let tmp = this.current_tetromino.clone();
                this.add_to_board(tmp);
                this.current_tetromino = this.next_tetromino.clone();
                this.next_tetromino = this.create_new_tetromino();
                return;
            }
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
        this.remove_lines();
        if (this.is_game_over()) {
            // document.location.reload();
        }
    }

    is_game_over() {

        // console.log(this.board_matrix);
        for (var i = 0; i < 2; i++) {
            for (var j = 1; j < this.board_matrix[0].length - 1; j++) {
                if (this.board_matrix[i][j] == 2) {
                    this.game_over = true;
                    return true;
                }
            }
        }
        return false;
    }

    remove_lines() {
        var counter = 0;
        for (var i = 0; i < this.board_matrix.length - 1; i++) {
            let sum = 0;
            for (var j = 1; j < this.board_matrix[0].length - 1; j++) {
                sum += this.board_matrix[i][j];
            }
            if (sum == Tetris.CELLS_COUNT / 2 * 2) {
                for (var k = i; k > 1; k--) {
                    this.board_matrix[k] = this.board_matrix[k - 1];
                }

                for (var l = 1; l < this.board_matrix[0].length - 1; l++) {
                    this.board_matrix[0][l] = 0;
                }

                i--;
                counter++;
            }
        }
        this.score += Tetris.SCORE * counter;
    }

    draw_next_and_score() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.cell_size * Tetris.CELLS_COUNT / 2 + this.cell_size * 2, this.cell_size * 2, this.cell_size * Tetris.CELLS_COUNT / 3, this.cell_size * Tetris.CELLS_COUNT / 3);
        this.ctx.fillStyle = "white";
        this.ctx.font = `${this.cell_size}px serif`;
        this.ctx.fillText("_next_", this.cell_size * Tetris.CELLS_COUNT / 2 + this.cell_size * 3, this.cell_size);
        this.ctx.fillText(`score: ${this.score}`, this.cell_size * Tetris.CELLS_COUNT / 2 + this.cell_size * 3, this.cell_size * 2 + this.cell_size * (Tetris.CELLS_COUNT / 3 + 1))

        this.ctx.fillStyle = this.next_tetromino.color;
        this.ctx.strokeStyle = "black";
        for (var i = 0; i < this.next_tetromino.tetromino.length; i++) {
            for (var j = 0; j < this.next_tetromino.tetromino[0].length; j++) {
                if (this.next_tetromino.tetromino[i][j]) {
                    let x = (j + 1) * this.cell_size + this.cell_size * Tetris.CELLS_COUNT / 2 + this.cell_size * 2;
                    let y = (i + 3) * this.cell_size;

                    this.ctx.roundRect(x, y, this.cell_size, this.cell_size, this.cell_size / 5).fill();
                    this.ctx.roundRect(x, y, this.cell_size, this.cell_size, this.cell_size / 5).stroke();


                }
            }
        }


    }

    draw_current_tetromino() {
        this.ctx.fillStyle = this.current_tetromino.color;
        for (var i = 0; i < this.current_tetromino.tetromino.length; i++) {
            for (var j = 0; j < this.current_tetromino.tetromino[0].length; j++) {
                if (this.current_tetromino.tetromino[i][j]) {
                    let x = (this.current_tetromino.x + j) * this.cell_size + Tetris.PADDING;
                    let y = (this.current_tetromino.y + i) * this.cell_size + Tetris.PADDING;

                    this.ctx.roundRect(x, y, this.cell_size, this.cell_size, this.cell_size / 5).fill();
                    this.ctx.roundRect(x, y, this.cell_size, this.cell_size, this.cell_size / 5).stroke();

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
                this.ctx.closePath();

                this.ctx.beginPath();
                this.ctx.moveTo(j * this.cell_size + Tetris.PADDING, i * this.cell_size + Tetris.PADDING);
                this.ctx.lineTo((j) * this.cell_size + Tetris.PADDING, (i + 1) * this.cell_size + Tetris.PADDING);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // this.ctx.fillStyle = Tetris.bg_color;
        // this.ctx.fillRect(0, 0, this.width, this.height)
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
        tetris.rotate();
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


var tapedTwice = false;
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

    if (!tapedTwice) {
        tapedTwice = true;
        setTimeout(() => { tapedTwice = false; }, 300);
        return false;
    }
    evt.preventDefault();

    //action on double tap goes below
    tetris.hard_drop();
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
            tetris.move(-1, 0);
        } else {
            tetris.move(1, 0);
        }
    } else {
        if (yDiff > 0) {
            tetris.rotate();
        } else {
            tetris.move(0, 1);
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
};
