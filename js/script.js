class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Tetris {
    static LEFT = -1;
    static RIGHT = 1;
    static UP = 2;
    static DOWN = -2;
    static TIC = 100;
    static CELLS_COUNT = 20;
    static PADDING = 20;

    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.set_board_pos(width, height);
        this.score = 0;
    }

    set_board_pos(width, height) {
        let delta = Math.abs(width - height);
        this.cell_size = width > height ? (width - delta - Tetris.PADDING*2) / Tetris.CELLS_COUNT : (height - delta - Tetris.PADDING*2) / Tetris.CELLS_COUNT;
        this.stakan_pos = new Position(Tetris.PADDING, Tetris.PADDING);
    }

    paint() {
        this.update();
        this.draw_stakan();
        this.draw_next_and_score();
    }

    draw_next_and_score(){
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.cell_size * Tetris.CELLS_COUNT/2 + this.cell_size*2, this.cell_size*2, this.cell_size * Tetris.CELLS_COUNT/4, this.cell_size *Tetris.CELLS_COUNT/4);
        this.ctx.fillStyle = "white";
        this.ctx.font = `${this.cell_size}px serif`;
        this.ctx.fillText("_next_", this.cell_size * Tetris.CELLS_COUNT/2 + this.cell_size*3, this.cell_size);
        this.ctx.fillText(`score: ${this.score}`, this.cell_size * Tetris.CELLS_COUNT/2 + this.cell_size*3 , this.cell_size*2 + this.cell_size *(Tetris.CELLS_COUNT/3 + 1))
    }

    draw_stakan(){

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.stakan_pos.x, this.stakan_pos.y, this.cell_size * Tetris.CELLS_COUNT/2, this.cell_size * Tetris.CELLS_COUNT);
        this.ctx.strokeStyle = 'gray';
        this.ctx.lineWidth = 1;
        for(var i = 0; i < Tetris.CELLS_COUNT; i++){
            for(var j = 0; j < Tetris.CELLS_COUNT/2; j++){
                this.ctx.beginPath();
                this.ctx.moveTo(j*this.cell_size +Tetris.PADDING, i*this.cell_size + Tetris.PADDING);
                this.ctx.lineTo((j+1)*this.cell_size +Tetris.PADDING, i*this.cell_size + Tetris.PADDING);                
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.moveTo(j*this.cell_size +Tetris.PADDING, i*this.cell_size + Tetris.PADDING);
                this.ctx.lineTo((j)*this.cell_size +Tetris.PADDING, (i+1)*this.cell_size + Tetris.PADDING);                
                this.ctx.stroke();
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


var canvas = document.getElementById('game_field');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var tetris = new Tetris(canvas.getContext('2d'), canvas.width, canvas.height);


function start() {
    console.log('start');
    timer = setInterval(() => {
        tetris.paint();
    }, Tetris.TIC);
}

window.addEventListener('load', () => {
    console.log('All assets are loaded');
    start();
})


window.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // setTimeout(() => {
    tetris.set_board_pos(canvas.width, canvas.height);
    // }, Tetris.TIC);

}, true);



window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    let key = event.key;

    if (key == "DOWN" || key == "ArrowDown") {
        if (snake.vec != Snake.UP)
            snake.set_vec(Snake.DOWN);
        // Do something for "down arrow" key press.
    }

    else if (key == "Up" || key == "ArrowUp") {
        if (snake.vec != Snake.DOWN)
            snake.set_vec(Snake.UP);
    }

    else if (key == "Left" || key == "ArrowLeft") {
        if (snake.vec != Snake.RIGHT)
            snake.set_vec(Snake.LEFT);
    }
    else if (key == "Right" || key == "ArrowRight") {
        if (snake.vec != Snake.LEFT)
            snake.set_vec(Snake.RIGHT);
    }

    else if (key == "Enter")
        // for first screen
        if (!snake.is_game_stated)
            start();

    // else if (key == "Esc" || key == "Escape")
    //   snake.eat();

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
