import Tetris from "../js/tetris.js";
let canvas = document.getElementById('game_field');
let tetris = null;
let keyDownTimerID = [null, null, null];
let isFired = [false, false, false];
let xDown = null;
let yDown = null;
// let bot = new Tetris(canvas.getContext('2d'), canvas.width, canvas.height, true); // maybe bot in the future
// let botIsStarted = false;

document.addEventListener('keydown', handleKeyDown, true);
document.addEventListener('keyup', handleKeyUP, false);
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
document.addEventListener('touchend', handleTouchEnd, false);
document.addEventListener('mousedown', handleMouseDown, false);
canvas.addEventListener("mousemove", handleMouseEnter, false);
canvas.onselectstart = () => { return false; }

window.addEventListener('load', () => {
    console.log('All assets are loaded');
    start();
})

window.addEventListener('resize', (event) => {
    setSize();
}, true);



function start() {
    console.log('start');
    let isTouchableDevice = false;

    tetris = new Tetris(canvas, canvas.width, canvas.height);

    isTouchableDevice = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
    console.log("is touchable device:", isTouchableDevice);
    if (isTouchableDevice) {
        tetris.isTouchableDevice = true;
        tetris.helpText = Tetris.MOBILE_HELP_TEXT;
    }

    // bot.isTouchableDevice = isTouchableDevice;
    tetris.changeActive();
    setSize();
    tetris.start();
    // bot.start();
}


function setSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ratio = Math.ceil(window.devicePixelRatio);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    tetris.setSize(canvas.width, canvas.height);
    tetris.setButtons();

    // bot.setSize(canvas.width, canvas.height);
    // bot.setButtons();
}

function handleMouseEnter(event) {
    let x = event.clientX;
    let y = event.clientY;
    let index = tetris.checkButtons(x, y, tetris.buttons.length - 1);
    if (index == -1) {
        tetris.buttons[tetris.buttons.length - 1].isHovered = false;
        return;
    }

    tetris.buttons[tetris.buttons.length - 1].isHovered = true;
}

function handleMouseDown(event) {
    let x = event.clientX;
    let y = event.clientY;
    let index = tetris.checkButtons(x, y, tetris.buttons.length - 1);
    if (index == -1) return;
    tetris.changePausedStatus();
    setTimeout(() => {
        if (confirm(tetris.helpText)) {
            tetris.changePausedStatus();
        }
        tetris.buttons[tetris.buttons.length - 1].isHovered = false;
    }, 100);


}

function handleKeyDown(event) {
    // if (event.defaultPrevented) {
    //     return; // Do nothing if the event was already processed
    // }
    // if (!tetris.isBackgroundAudio) {
    //     tetris.playBackgroundAudio();
    // }

    let key = event.key;
    let code = event.code;

    if (key == "DOWN" || key == "ArrowDown" || code == "KeyS") {
        if (isFired[0])
            return;
        tetris.move(0, 1);
        clearButtonsIntervals(keyDownTimerID, true);
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
        clearButtonsIntervals(keyDownTimerID, true);
        keyDownTimerID[1] = setInterval(() => {
            tetris.move(-1, 0);
        }, 125);
        isFired[1] = true;

    }
    if (key == "Right" || key == "ArrowRight" || code == "KeyD") {
        if (isFired[2])
            return;
        tetris.move(1, 0);
        clearButtonsIntervals(keyDownTimerID, true);
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
        clearInterval(keyDownTimerID[0]);
    }
}


function getTouches(evt) {
    return evt.touches || // browser API
        evt.originalEvent.touches; // jQuery
}

function handleTouchStart(event) {
    // if (!tetris.isBackgroundAudio) {
    //     tetris.playBackgroundAudio();
    // }

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

    if (tetris.isAnimation)
        return;

    let pushedButton = tetris.checkButtons(xDown, yDown);

    if (pushedButton !== -1) {
        // tetris.changeButtonForm(pushedButton);

        if (pushedButton === 0) {
            if (tetris.buttons[pushedButton].isClicked)
                return;
            tetris.buttons[pushedButton].isClicked = true;
            tetris.move(-1, 0);
            clearButtonsIntervals(tetris.buttons);
            // clearInterval(tetris.buttons[pushedButton].timerID);
            tetris.buttons[pushedButton].timerID = setInterval(() => {
                tetris.move(-1, 0);

            }, 100);

        }
        if (pushedButton === 1) {
            if (tetris.buttons[pushedButton].isClicked)
                return;

            tetris.buttons[pushedButton].isClicked = true;
            tetris.move(1, 0);
            clearButtonsIntervals(tetris.buttons);
            // clearInterval(tetris.buttons[pushedButton].timerID);
            tetris.buttons[pushedButton].timerID = setInterval(() => {
                tetris.move(1, 0);

            }, 100);

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
            clearButtonsIntervals(tetris.buttons);
            // clearInterval(tetris.buttons[pushedButton].timerID);
            tetris.buttons[pushedButton].timerID = setInterval(() => {
                tetris.move(0, 1);

            }, 100);
        }

        if (pushedButton === 5) {
            tetris.hardDrop();
            tetris.buttons[pushedButton].isClicked = true;

            setTimeout(() => {
                // tetris.setButtons();
                tetris.buttons[pushedButton].isClicked = false;
            }, 125);

        }

        // Tetris.TAP_SOUND.pause();
        // Tetris.TAP_SOUND.currentTime = 0;
        // Tetris.TAP_SOUND.play();

        // if (pushedButton == 6) {
        //     // tetris.buttons[pushedButton].isClicked = true;
        //     tetris.changePausedStatus();
        //     setTimeout(() => {
        //         if (confirm("CONTROLS:\n  use screen buttons or swipes\n  - LEFT/RIGHT/DOWN swipe - left/right/down move\n  - UP swipe - rotation\n  - multitouch x3 - pause\n  - multitouch x4 - restart")) {
        //             tetris.changePausedStatus();
        //             // window.open("https://github.com/Sheshkon/web_tetris#web-tetris-game", '_blank');
        //         }
        //     }, 1000);

        //     setTimeout(() => {
        //         // tetris.setButtons();
        //         tetris.buttons[pushedButton].isClicked = false;
        //     }, 500);
        // }

        xDown = null;
        yDown = null;
        return;
    }
    event.preventDefault();
};

function clearButtonsIntervals(container, keys = false) {
    if (keys) {
        for (let i = 0; i < container.length; i++) {
            clearInterval(container[i]);
        }
        return;
    }
    for (let i = 0; i < container.length; i++) {
        clearInterval(container[i].timerID);
    }
}

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