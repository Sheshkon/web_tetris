import Tetris from "../js/tetris.js";
let canvas = document.getElementById('game_field');
let tetris = new Tetris(canvas.getContext('2d'), canvas.width, canvas.height);
let keyDownTimerID = [null, null, null];
let isFired = [false, false, false];
let xDown = null;
let yDown = null;
let touchID = [null, null, null];
let isTouched = [false, false, false];
// let bot = new Tetris(canvas.getContext('2d'), canvas.width, canvas.height, true); // maybe bot in the future
// let botIsStarted = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.addEventListener('keydown', handleKeyDown, true);
document.addEventListener('keyup', handleKeyUP, false);
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
document.addEventListener('touchend', handleTouchEnd, false);



function start() {
    console.log('start');
    let isTouchableDevice = false;
    isTouchableDevice = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
    console.log("is touchable device:", isTouchableDevice);
    tetris.isTouchableDevice = isTouchableDevice;
    // bot.isTouchableDevice = isTouchableDevice;
    tetris.changeActive();
    setSize();
    tetris.start();
    // bot.start();
}


window.addEventListener('load', () => {
    console.log('All assets are loaded');
    start();
})


window.addEventListener('resize', (event) => {
    setSize();
}, true);


function setSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tetris.setSize(canvas.width, canvas.height);
    tetris.setButtons();

    // bot.setSize(canvas.width, canvas.height);
    // bot.setButtons();
}

function handleKeyDown(event) {
    // if (event.defaultPrevented) {
    //     return; // Do nothing if the event was already processed
    // }

    let key = event.key;
    let code = event.code;

    if (key == "DOWN" || key == "ArrowDown" || code == "KeyS") {
        if (isFired[0])
            return;
        tetris.move(0, 1);
        keyDownTimerID[0] = setInterval(() => {
            tetris.move(0, 1);
        }, 125);
        isFired[0] = true;

    }
    if (key == "Up" || key == "ArrowUp" || code == "KeyW" || code == "KeyE") {
        tetris.rotate(true);
    }
    if (code == "KeyQ") {
        tetris.rotate(false);
    }
    if (key == "Left" || key == "ArrowLeft" || code == "KeyA") {
        if (isFired[1])
            return;
        tetris.move(-1, 0);
        keyDownTimerID[1] = setInterval(() => {
            tetris.move(-1, 0);
        }, 125);
        isFired[1] = true;

    }
    if (key == "Right" || key == "ArrowRight" || code == "KeyD") {
        if (isFired[2])
            return;
        tetris.move(1, 0);
        keyDownTimerID[2] = setInterval(() => {
            tetris.move(1, 0);
        }, 125);
        isFired[2] = true;

    }
    if (key == "Enter") {
        tetris.restart();
        setSize();
    }
    if (key == "Esc" || key == "Escape") {
        tetris.changePausedStatus();
    }
    if (event.code === 'Space') {
        tetris.hardDrop();
    }

    // if (code == "KeyB") {
    //     bot.changeActive();
    //     setSize();
    // }


    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}


function handleKeyUP(event) {
    let key = event.key;
    let code = event.code;
    if (key == "Right" || key == "ArrowRight" || code == "KeyD") {
        isFired[2] = false;
        clearInterval(keyDownTimerID[2]);
    }

    if (key == "Left" || key == "ArrowLeft" || code == "KeyA") {
        isFired[1] = false;
        clearInterval(keyDownTimerID[1]);
    }

    if (key == "DOWN" || key == "ArrowDown" || code == "KeyS") {
        isFired[0] = false;
        clearInterval(keyDownTimerID[0])
    }
}


function getTouches(evt) {
    return evt.touches || // browser API
        evt.originalEvent.touches; // jQuery
}

function handleTouchStart(event) {
    const firstTouch = getTouches(event)[0];
    if (event.touches.length == 3) {
        // document.location.reload();
        tetris.changePausedStatus();

    }
    if (event.touches.length == 4) {
        tetris.restart();
    }

    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;


    let pushedButton = tetris.checkButtons(xDown, yDown);

    if (pushedButton !== -1) {
        // tetris.changeButtonForm(pushedButton);


        if (pushedButton === 0) {
            if (tetris.buttons[pushedButton].isClicked)
                return;
            tetris.buttons[pushedButton].isClicked = true;
            tetris.move(-1, 0);
            clearInterval(tetris.buttons[pushedButton].timerID);
            tetris.buttons[pushedButton].timerID = setInterval(() => {
                tetris.move(-1, 0);

            }, 125);

        }
        if (pushedButton === 1) {
            if (tetris.buttons[pushedButton].isClicked)
                return;

            tetris.buttons[pushedButton].isClicked = true;
            tetris.move(1, 0);
            clearInterval(tetris.buttons[pushedButton].timerID);
            tetris.buttons[pushedButton].timerID = setInterval(() => {
                tetris.move(1, 0);

            }, 125);

        }
        if (pushedButton === 2) {
            tetris.rotate(true);
            tetris.buttons[pushedButton].isClicked = true;
            setTimeout(() => {
                // tetris.setButtons();
                tetris.buttons[pushedButton].isClicked = false;
            }, 125);

            //clockwise
        }
        if (pushedButton === 3) {
            tetris.rotate(false);
            tetris.buttons[pushedButton].isClicked = true;
            setTimeout(() => {
                // tetris.setButtons();
                tetris.buttons[pushedButton].isClicked = false;
            }, 125);
            //counterclockwise
        }

        if (pushedButton === 4) {
            if (tetris.buttons[pushedButton].isClicked)
                return;

            tetris.buttons[pushedButton].isClicked = true;
            tetris.move(0, 1);
            clearInterval(tetris.buttons[pushedButton].timerID);
            tetris.buttons[pushedButton].timerID = setInterval(() => {
                tetris.move(0, 1);

            }, 125);
        }

        if (pushedButton === 5) {
            tetris.hardDrop();
            tetris.buttons[pushedButton].isClicked = true;
            setTimeout(() => {
                // tetris.setButtons();
                tetris.buttons[pushedButton].isClicked = false;
            }, 125);
        }

        if (pushedButton == 6) {
            tetris.buttons[pushedButton].isClicked = true;
            if (confirm("redirect to about page?")) {
                window.open("https://github.com/Sheshkon/web_tetris#web-tetris-game", '_blank');
            }

            setTimeout(() => {
                // tetris.setButtons();
                tetris.buttons[pushedButton].isClicked = false;
            }, 500);
        }

        xDown = null;
        yDown = null;
        return;
    }
    event.preventDefault();
};

function handleTouchEnd(event) {
    for (let i = 0; i < tetris.buttons.length; i++) {
        if (tetris.buttons[i].isClicked) {
            clearInterval(tetris.buttons[i].timerID);
            setTimeout(() => {
                tetris.buttons[i].isClicked = false;
            }, 50);
        }
    }
}


function handleTouchMove(event) {
    if (!xDown || !yDown) {
        return;
    }


    var xUp = event.touches[0].clientX;
    var yUp = event.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) { /*most significant*/
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