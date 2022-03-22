
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
    static list_of_tetrominos = ["L", "J", "S", "Z", "I", "O", "T"];
    static list_of_colors = ["rgb(255,127,0)", "rgb(0, 0, 255)", "rgb(0, 255, 0)",
        "rgb(203, 40, 40)", "rgb(114,188,212)",
        "rgb(237, 226, 21)", "rgb(161, 13, 143)"];
    static bg_color = "rgb(237, 177, 164)";
    static LEFT = -1;
    static RIGHT = 1;
    static UP = 2;
    static DOWN = -2;
    static TIC = 500;
    static CELLS_COUNT = 20;
    static PADDING = 20;
    static SCORE = 560;
    static counter_clock_wise_img = new Image(150, 150);
    static clock_wise_img = new Image(150, 150);
    static hard_drop_img = new Image(150, 150);
    static left_img = new Image(150, 150);
    static right_img = new Image(150, 150);
    static down_img = new Image(150, 150);
    buttons = [];
    board = [];
    score = 0;
    is_touchable_device = false;


    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.set_board_pos(width, height);
        this.current_tetromino = this.create_new_tetromino();
        this.next_tetromino = this.create_new_tetromino();
        this.board_matrix = this.create_board();
        this.game_over = false;
        for (let i = 0; i < 6; i++)
            this.buttons.push(new MyButton());
        this.set_buttons();
        Tetris.counter_clock_wise_img.src = 'img/counterclockwise.png';
        Tetris.clock_wise_img.src = 'img/clockwise.png';
        Tetris.hard_drop_img.src = 'img/harddrop.png';
        Tetris.left_img.src = 'img/left.png';
        Tetris.right_img.src = 'img/right.png';
        Tetris.down_img.src = 'img/down.png';
        this.matrix_of_colors = []
        for (let i = 0; i < Tetris.CELLS_COUNT; i++)
            this.matrix_of_colors.push(new Array(Tetris.CELLS_COUNT/2).fill(-1));
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
                    this.ctx.fillStyle = Tetris.list_of_colors[this.matrix_of_colors[i][j-1]];
                    // this.ctx.fillRect((j - 1) * this.cell_size + Tetris.PADDING, (i) * this.cell_size + Tetris.PADDING, this.cell_size, this.cell_size);
                    this.ctx.roundRect((j - 1) * this.cell_size + Tetris.PADDING, (i) * this.cell_size + Tetris.PADDING, this.cell_size, this.cell_size, this.cell_size / 5).fill();
                    this.ctx.roundRect((j - 1) * this.cell_size + Tetris.PADDING, (i) * this.cell_size + Tetris.PADDING, this.cell_size, this.cell_size, this.cell_size / 5).stroke();


                }
            }
        }
    }


    collision(prev_figure) {
        try {
            for (var i = 0; i < this.current_tetromino.tetromino.length; i++) {
                for (var j = 0; j < this.current_tetromino.tetromino[0].length; j++) {
                    if (this.current_tetromino.tetromino[i][j] == 1) {
                        if (this.board_matrix[this.current_tetromino.y + i][this.current_tetromino.x + j + 1] + 1 >= 3) {
                            this.current_tetromino = prev_figure.clone();
                            return true;
                        }
                    }
                }
            }
        }
        catch {
            // if (prev_x || prev_y) {
            //     this.current_tetromino.tetromino.x = prev_x;
            //     this.current_tetromino.tetromino.y = prev_y;
            // }
            // if (prev_figure) {
            //     this.current_tetromino = prev_figure.clone();
            // }

            // return true;

        }
        return false;
    }


    create_new_tetromino() {
        let value = this.getRandomInt(7);
        let tetromino = eval(`new Tetromino(Tetromino.${Tetris.list_of_tetrominos[value]}, 3, 0, Tetris.list_of_colors[value], value)`);
        return tetromino;
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    move(x, y) {
        if (this.game_over) {
            return false;
        }

        var prev = this.current_tetromino.clone();
        this.current_tetromino.move(x, y);
        let is_colided = this.collision(prev);

        if (is_colided) {
            prev = this.current_tetromino.clone();
            this.current_tetromino.move(0, 1);
            this.collision(prev);
            if (this.current_tetromino.y === prev.y) {
                var tmp = this.current_tetromino.clone();
                this.current_tetromino = this.next_tetromino.clone();
                this.next_tetromino = this.create_new_tetromino();
                this.add_to_board(tmp);
                return false;
            }
            this.current_tetromino.move(0, -1);
        }
        return true;
    }

    add_to_board(tmp) {
        let color_id = tmp.color_id;
        for (var i = 0; i < tmp.tetromino.length; i++) {
            for (var j = 0; j < tmp.tetromino[0].length; j++) {
                if (tmp.tetromino[i][j] === 1) {
                    // console.log("x: ", tmp.y + i, "y:", tmp.x + j + 1);
                    // console.log("taki tak", this.board_matrix[this.current_tetromino.y + i][this.current_tetromino.x+j]);

                    this.board_matrix[tmp.y + i][tmp.x + j + 1] = 2;
                    this.matrix_of_colors[tmp.y + i][tmp.x + j] = color_id;
                }
            }
        }
        // console.log(this.matrix_of_colors);
        // console.log(this.board_matrix);
    }

    hard_drop() {
        while (true)
            if (!this.move(0, 1)) {
                return;
            }
    }

    rotate() {
        let prev = this.current_tetromino.clone();
        this.current_tetromino.rotate();
        this.collision(prev);
    }

    set_board_pos(width, height) {
        this.width = width;
        this.height = height;
        let delta = Math.abs(width - height);
        this.cell_size = width > height ? (width - delta - Tetris.PADDING * 2) / Tetris.CELLS_COUNT : (height - delta - Tetris.PADDING * 2) / Tetris.CELLS_COUNT;
        this.glass_pos = new Position(Tetris.PADDING, Tetris.PADDING);
    }

    paint() {
        this.clear_lines();
        if (this.is_game_over()) {
            // document.location.reload();
        }
        this.update();
        this.draw_glass();
        this.draw_next_and_score();
        this.draw_buttons();
        this.draw_current_tetromino();
        this.draw_board_details();

    }

    is_game_over() {
        // console.log(this.board_matrix);
        for (var i = 0; i < 1; i++) {
            for (var j = 1; j < this.board_matrix[0].length - 1; j++) {
                if (this.board_matrix[i][j] == 2) {
                    this.game_over = true;
                    return true;
                }
            }
        }
        return false;
    }

    clear_lines() {
        var counter = 0;
        for (var i = 0; i < this.board_matrix.length - 1; i++) {
            let sum = 0;
            for (var j = 1; j < this.board_matrix[0].length - 1; j++) {
                sum += this.board_matrix[i][j];
            }
            if (sum == Tetris.CELLS_COUNT / 2 * 2) {
                for (var k = i; k > 1; k--) {
                    this.board_matrix[k] = Array.from(this.board_matrix[k - 1]);
                    this.matrix_of_colors[k] = Array.from(this.matrix_of_colors[k - 1]);
                }

                this.board_matrix[0] = new Array(Tetris.CELLS_COUNT / 2 + 2).fill(0);
                this.board_matrix[0][0] = 2;
                this.board_matrix[0][Tetris.CELLS_COUNT / 2 + 1] = 2;

                this.matrix_of_colors[0] = new Array(Tetris.CELLS_COUNT / 2).fill(-1);

                // i--;
                counter++;
            }
        }
        this.score += Tetris.SCORE * counter;
    }

    set_buttons() {
        let padding_x = (this.width - Tetris.PADDING * 2) / 4;
        let y = this.glass_pos.y + Tetris.CELLS_COUNT * this.cell_size + this.width / 6;
        let x = this.glass_pos.x;

        for (var i = 0; i < 2; i++) {
            this.buttons[i].setButton(
                x + i * padding_x,
                y, this.cell_size * 3,
                this.cell_size * 3,
                this.cell_size / 2,
                Tetris.list_of_colors[i]
            );
        }

        for (var i = 0; i < 2; i++) {
            this.buttons[i + 2].setButton(
                this.width - x - (i) * padding_x - this.cell_size * 3,
                y,
                this.cell_size * 3,
                this.cell_size * 3,
                this.cell_size / 2,
                Tetris.list_of_colors[i + 2]
            );
        }

        y = this.glass_pos.y + (Tetris.CELLS_COUNT + 5) * this.cell_size + this.width / 6;

        this.buttons[4].setButton(
            x + padding_x - 2.5 * this.cell_size,
            y, this.cell_size * 3,
            this.cell_size * 3,
            this.cell_size / 2,
            Tetris.list_of_colors[4]
        );
        this.buttons[5].setButton(
            this.width - x - padding_x - this.cell_size / 2,
            y,
            this.cell_size * 3,
            this.cell_size * 3,
            this.cell_size / 2,
            Tetris.list_of_colors[5]
        );

        // console.log("buttons");
        // console.log(this.buttons);
    }

    buttons_clicked(i){
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
                    this.buttons_clicked(i);
                    setTimeout(() => {
                        this.set_buttons();
                    }, 25);
    
                    return i;
                }
            }
            // console.log(xDown, yDown);
            // console.log(x, y);
        }
        return -1;
    }
    

    draw_buttons() {
        if (!this.is_touchable_device) {
            return;
        }

        for (var i = 0; i < this.buttons.length; i++) {
            this.ctx.fillStyle = this.buttons[i].c;
            this.ctx.roundRect(this.buttons[i].x, this.buttons[i].y, this.buttons[i].w, this.buttons[i].h, this.buttons[i].r).fill();
        }

        this.ctx.drawImage(Tetris.left_img, this.buttons[0].x, this.buttons[0].y, this.buttons[0].w, this.buttons[0].h);
        this.ctx.drawImage(Tetris.right_img, this.buttons[1].x, this.buttons[1].y, this.buttons[1].w, this.buttons[1].h);
        this.ctx.drawImage(Tetris.clock_wise_img, this.buttons[2].x, this.buttons[2].y, this.buttons[2].w, this.buttons[2].h);
        this.ctx.drawImage(Tetris.counter_clock_wise_img, this.buttons[3].x, this.buttons[3].y, this.buttons[3].w, this.buttons[3].h);
        this.ctx.drawImage(Tetris.down_img, this.buttons[4].x, this.buttons[4].y, this.buttons[4].w, this.buttons[4].h);
        this.ctx.drawImage(Tetris.hard_drop_img, this.buttons[5].x, this.buttons[5].y, this.buttons[5].w, this.buttons[5].h);
    }

    draw_next_and_score() {
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillStyle = "black";
        let next_field_x = this.cell_size * (Tetris.CELLS_COUNT / 2 + 2);
        let next_field_y = this.cell_size + this.glass_pos.y;
        let next_field_w = this.cell_size * Tetris.CELLS_COUNT / 3;
        let next_field_h = this.cell_size * Tetris.CELLS_COUNT / 3;
        let next_field_center_x = next_field_x + next_field_w/2;
        let next_field_center_y = next_field_y + next_field_h/2;

        this.ctx.roundRect(next_field_x, next_field_y, next_field_w, next_field_h, this.cell_size).fill();
        this.ctx.globalAlpha = 1;
        let font_size = this.cell_size*2;
        this.ctx.font = `bold ${font_size}px Courier New`;
        this.ctx.textAlign = "center";
        this.ctx.fillText("NEXT", next_field_center_x, next_field_y-font_size/10);
        this.ctx.fillText("SCORE", next_field_center_x, next_field_y+next_field_h + font_size);
        
        if(this.score){
            this.ctx.fillStyle = "white";
            this.ctx.fillText(`${this.score}`, next_field_center_x, next_field_y+next_field_h + font_size*2);
            this.ctx.strokeStyle = "black";
            this.ctx.strokeText(`${this.score}`, next_field_center_x, next_field_y+next_field_h + font_size*2);

        }

        this.ctx.fillStyle = this.next_tetromino.color;
        this.ctx.strokeStyle = "black";
        for (var i = 0; i < this.next_tetromino.tetromino.length; i++) {
            for (var j = 0; j < this.next_tetromino.tetromino[0].length; j++) {
                if (this.next_tetromino.tetromino[i][j]) {
                    
                    let x = (j - this.next_tetromino.tetromino[0].length/2) * this.cell_size + next_field_center_x;
                    let y = (i - this.next_tetromino.tetromino.length/2) * this.cell_size+ next_field_center_y;
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
        // this.ctx.fillStyle = "white";
        // this.ctx.roundRect(this.glass_pos.x-Tetris.PADDING/2, this.glass_pos.y-Tetris.PADDING/2, this.cell_size * Tetris.CELLS_COUNT / 2+Tetris.PADDING, this.cell_size * Tetris.CELLS_COUNT+Tetris.PADDING, this.cell_size).fill();
        this.ctx.fillStyle ="black";
        this.ctx.globalAlpha = 0.7;
        this.ctx.roundRect(this.glass_pos.x, this.glass_pos.y, this.cell_size * Tetris.CELLS_COUNT / 2, this.cell_size * Tetris.CELLS_COUNT, this.cell_size).fill();
        this.draw_cells()
        this.ctx.globalAlpha = 1.0;
    }


    draw_cells(){
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = 'white';
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