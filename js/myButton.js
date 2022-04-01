export default class MyButton {
    static imagePaths = ['img/left.png', 'img/right.png', 'img/clockwise.png', 'img/counterclockwise.png', 'img/down.png', 'img/harddrop.png', 'img/q.png'];
    static images = new Array(7);
    isClicked = false;
    timerID = null;
    img = null;

    static isSettedButtons = false;
    constructor() {}

    static setButtons() {
        if (MyButton.isSettedButtons)
            return;
        for (let i = 0; i < MyButton.images.length; i++) {
            MyButton.images[i] = new Image();
            MyButton.images[i].src = MyButton.imagePaths[i];
        }
        MyButton.isSettedButtons = true;
    }


    setButton(x, y, w, h, r, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.r = r;
        this.c = c;
        this.x_clicked = x -= 10;
        this.y_clicked = y -= 10;
        this.w_clicked = w += 20;
        this.h_clicked = h += 20;
        this.r_clicked = Math.floor(this.w_clicked / 2);
    }

    changeActive() {
        this.isClicked = this.isClicked ? false : true;
    }
}