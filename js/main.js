import Tetris from "../js/tetris.js";
const delayTime = 85;
let canvas = document.getElementById('game_field');
let tetris = null;
let keyDownTimerID = [null, null, null];
let isFired = [false, false, false];
let xDown = null;
let yDown = null;
// let bot = new Tetris(canvas.getContext('2d'), canvas.width, canvas.height, true); // maybe bot in the future
// let botIsStarted = false;

let body = document.getElementById('_body');
document.getElementById("help_button").addEventListener("click", showHelp, false);
document.getElementById('fullscreen_button').addEventListener('click', fullScreen);
document.getElementById('music_button').addEventListener('click', pauseResumeMusic);
document.addEventListener('keydown', handleKeyDown, true);
document.addEventListener('keyup', handleKeyUP, false);
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);


let leftMoveTimerID;
$('#left_button').on('touchstart', function(e) {
    e.preventDefault();
    tetris.move(-1, 0);
    $(this).addClass('pushed');
    $(this).removeClass('border');
    leftMoveTimerID = setInterval(() => {
        tetris.move(-1, 0);
    }, delayTime)
}).bind('touchend', () => {
    clearInterval(leftMoveTimerID);
    $('#left_button').removeClass('pushed');
    $('#left_button').addClass('border')
});

let rightMoveTimerID;
$('#right_button').on('touchstart', function(e) {
    e.preventDefault();
    tetris.move(1, 0);
    $(this).addClass('pushed');
    $(this).removeClass('border');
    rightMoveTimerID = setInterval(() => {
        tetris.move(1, 0);
    }, delayTime)
}).bind('touchend', () => {
    clearInterval(rightMoveTimerID);
    $('#right_button').removeClass('pushed');
    $('#right_button').addClass('border')
});

let downMoveTimerID;
$('#down_button').on('touchstart', function(e) {
    e.preventDefault();
    tetris.move(0, 1);
    $(this).addClass('pushed');
    $(this).removeClass('border');
    downMoveTimerID = setInterval(() => {
        tetris.move(0, 1);
    }, delayTime)
}).bind('touchend', () => {
    clearInterval(downMoveTimerID);
    $('#down_button').removeClass('pushed');
    $('#down_button').addClass('border')
});

let hardDropTimerId;
$('#harddrop_button').on('touchstart', function(e) {
    e.preventDefault();
    tetris.hardDrop();
    $(this).addClass('pushed');
    $(this).removeClass('border');

    if (hardDropTimerId)
        clearTimeout(hardDropTimerId);

    hardDropTimerId = setTimeout(() => {
        $('#harddrop_button').removeClass('pushed');
        $('#harddrop_button').addClass('border');
        hardDropTimerId = null;
    }, delayTime);
});

let rotateCounterWiseTimerId;
$('#counterclockwise_button').on('touchstart', function(e) {
    e.preventDefault();
    tetris.rotate(false);
    $(this).addClass('pushed');
    $(this).removeClass('border');

    if (rotateCounterWiseTimerId)
        clearTimeout(rotateCounterWiseTimerId);

    setTimeout(() => {
        $('#counterclockwise_button').removeClass('pushed');
        $('#counterclockwise_button').addClass('border');
        rotateCounterWiseTimerId = null;
    }, delayTime);
});

let clockWiseTimerID;
$('#clockwise_button').on('touchstart', function(e) {
    e.preventDefault();
    tetris.rotate(true);
    $(this).addClass('pushed');
    $(this).removeClass('border');

    if (clockWiseTimerID)
        clearTimeout(clockWiseTimerID);

    setTimeout(() => {
        $('#clockwise_button').removeClass('pushed');
        $('#clockwise_button').addClass('border');
        clockWiseTimerID = null;
    }, delayTime);
});

canvas.onselectstart = () => { return false; }

window.addEventListener('load', () => {
    console.log('All assets are loaded');
    start();
})

window.addEventListener('resize', (event) => {
    setSize();
}, true);

window.onfocus = function() {
    tetris.resumeBackgroundAudio();
    tetris.changePausedStatus();
    console.log('focused');
};

window.onblur = function() {
    tetris.stopBackgroundAudio();
    tetris.changePausedStatus();
    console.log('blur');
};

function pauseResumeMusic() {
    if (tetris.isDisableSound) {
        tetris.isDisableSound = false;
        tetris.resumeBackgroundAudio();
    } else {
        tetris.isDisableSound = true;
        tetris.stopBackgroundAudio();
    }
}

function fullScreen() {
    console.log(canvas.requestFullscreen)
    if (canvas.requestFullscreen) {
        body.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) { /* Safari */
        body.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { /* IE11 */
        body.msRequestFullscreen();
    }
}


function start() {
    console.log('start');
    document.getElementById('bg').style.backgroundImage = `url('https://blog.1a23.com/wp-content/uploads/sites/2/2020/02/pattern-${Math.floor(Math.random() * 33)}.svg')`;
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
    document.getElementById('buttons').style.visibility = 'visible';
    document.getElementById('labels').style.visibility = 'visible';
    // bot.start();
}

// function moveLeft() {
//     tetris.move(-1, 0);
// }


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
    tetris.setLabels();

    // bot.setSize(canvas.width, canvas.height);
    // bot.setButtons();
}


function showHelp() {
    tetris.changePausedStatus();
    setTimeout(() => {
        if (confirm(tetris.helpText)) {
            tetris.changePausedStatus();
            // if (!isFullScreen)
            // fullScreen();
        }
    }, 85);
}



function handleKeyDown(event) {
    // if (event.defaultPrevented) {
    //     return; // Do nothing if the event was already processed
    // }
    if (!tetris.isBackgroundAudio) {
        tetris.playBackgroundAudio();
        tetris.isStoppedAudio = false;
    }

    let key = event.key;
    let code = event.code;

    if (key == "DOWN" || key == "ArrowDown" || code == "KeyS") {
        if (isFired[0])
            return;
        tetris.move(0, 1);
        clearButtonsIntervals(keyDownTimerID, true);
        keyDownTimerID[0] = setInterval(() => {
            tetris.move(0, 1);
        }, 85);
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
        }, 85);
        isFired[1] = true;

    }
    if (key == "Right" || key == "ArrowRight" || code == "KeyD") {
        if (isFired[2])
            return;
        tetris.move(1, 0);
        clearButtonsIntervals(keyDownTimerID, true);
        keyDownTimerID[2] = setInterval(() => {
            tetris.move(1, 0);
        }, 85);
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
    if (!tetris.isBackgroundAudio) {
        tetris.playBackgroundAudio();
        tetris.isStoppedAudio = false;
    }

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
            tetris.rotate(true);
        } else {
            tetris.move(0, 1);
        }
    }

    /* reset values */
    xDown = null;
    yDown = null;
};