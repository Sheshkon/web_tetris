import Tetris from "../js/tetris.js";
// const socket = io('https://salty-fjord-01783.herokuapp.com', {
//     rejectUnauthorized: false,
// });

// socket.on('connect', function () {
//     console.log("connected");

//     socket.on("connect_error", (err) => {
//         console.log(`connect_error due to ${err}`);
//     });
// });

let canvas = document.getElementById('game_field');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let tetris = new Tetris(canvas.getContext('2d'), canvas.width, canvas.height);
let tetris2 = new Tetris(canvas.getContext('2d'), canvas.width, canvas.height, true);
let isTouchableDevice = false;


function start() {
    console.log('start');
    isTouchableDevice = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
    console.log(isTouchableDevice);
    tetris.isTouchableDevice = isTouchableDevice;
    tetris2.isTouchableDevice = isTouchableDevice;
    tetris.changeActive();
    setSize();
    tetris.start();
    // tetris2.start();
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
    tetris2.setSize(canvas.width, canvas.height);
    tetris2.setButtons();
}

let keydownId = [null, null, null];
let isFired = [false, false, false];


window.addEventListener("keydown", (event) => {
    // if (event.defaultPrevented) {
    //     return; // Do nothing if the event was already processed
    // }

    let key = event.key;
    let code = event.code;

    if (key == "DOWN" || key == "ArrowDown" || code == "KeyS") {
        if (isFired[0])
            return;
        tetris.move(0, 1);
        keydownId[0] = setInterval(() => {
            tetris.move(0, 1);
        }, 125);
        isFired[0] = true;

    }
    if (key == "Up" || key == "ArrowUp" || code == "KeyW" || code == "KeyE") {
        tetris.rotate(true);
        // keydownId = setInterval(() => {
        //     tetris.rotate(true);
        // }, 100);
    }
    if (code == "KeyQ") {
        tetris.rotate(false);
        // keydownId = setInterval(() => {
        //     tetris.rotate(false);
        // }, 100);
    }
    if (key == "Left" || key == "ArrowLeft" || code == "KeyA") {
        if (isFired[1])
            return;
        tetris.move(-1, 0);
        keydownId[1] = setInterval(() => {
            tetris.move(-1, 0);
        }, 125);
        isFired[1] = true;

    }
    if (key == "Right" || key == "ArrowRight" || code == "KeyD") {
        if (isFired[2])
            return;
        tetris.move(1, 0);
        keydownId[2] = setInterval(() => {
            tetris.move(1, 0);
        }, 125);
        isFired[2] = true;

    }
    if (key == "Enter") {
        // tetris2.changeActive();
        tetris.restart();


        // socket.emit("join", 966 );

        // socket.on("success join", objects => {
        //     console.log("successfully join to the room " + "[" + objects + "]");
        //     socket.emit("nickname", 966, "Lesha");
        // });

        // socket.on("nickname", objects => {
        //     console.log(objects);

        // });

    }
    if (key == "Esc" || key == "Escape") {
        tetris.changePausedStatus();
    }
    if (event.code === 'Space') {
        // console.log("space");
        tetris.hardDrop();
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);


document.addEventListener('keyup', (event) => {
    let key = event.key;
    let code = event.code;
    if (key == "Right" || key == "ArrowRight" || code == "KeyD") {
        isFired[2] = false;
        clearInterval(keydownId[2]);
    }

    if (key == "Left" || key == "ArrowLeft" || code == "KeyA") {
        isFired[1] = false;
        clearInterval(keydownId[1]);
    }

    if (key == "DOWN" || key == "ArrowDown" || code == "KeyS") {
        isFired[0] = false;
        clearInterval(keydownId[0])
    }

});


document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
document.addEventListener('touchend', handleTouchEnd, false);



let xDown = null;
let yDown = null;


function getTouches(evt) {
    return evt.touches || // browser API
        evt.originalEvent.touches; // jQuery
}


let touchId = [null, null, null];

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    if (evt.touches.length == 3) {
        // document.location.reload();
        tetris.changePausedStatus();

    }
    if (evt.touches.length == 4) {
        tetris.restart();
    }

    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;


    let pushedButton = tetris.checkButtons(xDown, yDown);

    if (pushedButton !== -1) {
        if (pushedButton === 0) {
            keydownId[0] = setInterval(() => {
                tetris.move(-1, 0);
            }, 125);
            tetris.move(-1, 0);

        }
        if (pushedButton === 1) {
            keydownId[1] = setInterval(() => {
                tetris.move(11, 0);
            }, 125);
            tetris.move(-1, 0);
            tetris.move(1, 0);

        }
        if (pushedButton === 2) {
            tetris.rotate(true);
            //clockwise
        }
        if (pushedButton === 3) {
            tetris.rotate(false);
            //counterclockwise
        }

        if (pushedButton === 4) {
            tetris.move(0, 1);
        }

        if (pushedButton === 5) {
            tetris.hardDrop();
        }


        xDown = null;
        yDown = null;
        return;
    }
    evt.preventDefault();
    // if (!tapedTwice) {
    //     tapedTwice = true;
    //     setTimeout(() => { tapedTwice = false; }, 300);
    //     return false;
    // }


    //action on double tap goes below
    // tetris.hardDrop();
};

function handleTouchEnd(evt) {
    for (let i = 0; i < touchId.length; i++) {
        clearInterval(touchId[i]);
    }
}





function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }


    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

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