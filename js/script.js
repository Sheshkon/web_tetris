import Tetris from "../js/tetris.js";
let canvas = document.getElementById('game_field');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let tetris = new Tetris(canvas.getContext('2d'), canvas.width, canvas.height);


function start() {
    console.log('start');
    let isTouchableDevice = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
    tetris.isTouchableDevice = isTouchableDevice;
    console.log(isTouchableDevice);

    let gameTimer = setInterval(() => {
        tetris.move(0, 1);
    }, Tetris.TIC);

    let repaintTimer = setInterval(() => {
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
    tetris.setBoardPos(canvas.width, canvas.height);
    tetris.setButtons();
}, true);



window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    let key = event.key;

    if (key == "DOWN" || key == "ArrowDown") {
        tetris.move(0, 1);
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
        tetris.rotate();
    }

     // else if (key == "Esc" || key == "Escape")
        //   pause;

    else if (event.code === 'Space') {
        // console.log("space");
        tetris.hardDrop();
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);


document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);


let tapedTwice = false;
let xDown = null;
let yDown = null;


function getTouches(evt) {
    return evt.touches ||             // browser API
        evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];


    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;

   let pushedButton = tetris.checkButtons(xDown, yDown);
    if (pushedButton !== -1) {
        if (pushedButton === 0) {
            tetris.move(-1, 0);
        }
        else if (pushedButton === 1) {
            tetris.move(1, 0);

        }
        else if (pushedButton === 2) {
            tetris.rotate();
            //clockwise
        }
        else if (pushedButton === 3) {
            tetris.rotate();
            //counterclockwise
        }

        else if (pushedButton === 4) {
            tetris.move(0, 1);
        }

        else if (pushedButton === 5) {
            tetris.hardDrop();
        }

        xDown = null;
        yDown = null;
        return;
    }
    // evt.preventDefault();
    if (!tapedTwice) {
        tapedTwice = true;
        setTimeout(() => { tapedTwice = false; }, 300);
        return false;
    }


    //action on double tap goes below
    // tetris.hardDrop();
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
