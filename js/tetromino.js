export default class Tetromino {

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
        [0, 0, 0, 0],
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

    constructor(tetromino, x, y, color, colorID) {
        this.tetromino = tetromino;
        this.x = x;
        this.y = y;
        this.color = color;
        this.colorID = colorID;
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

        return new Tetromino(tetromino, this.x, this.y, this.color, this.colorID);
    }

    rotate(isClockWise) {
        let rotatedTetromino = [];
        let N = this.tetromino.length;
        for (var i = 0; i < N; i++) {
            rotatedTetromino[i] = new Array(N).fill(0);
        }
        if (isClockWise) {
            for (let y = 0; y < N; y++) {
                for (let x = 0; x < N; x++) {
                    rotatedTetromino[x][y] = this.tetromino[N - y - 1][x];
                }
            }
        } else {
            for (let y = 0; y < N; y++) {
                for (let x = 0; x < N; x++) {
                    rotatedTetromino[N - y - 1][x] = this.tetromino[x][y];
                }
            }
        }
        this.tetromino = rotatedTetromino;
    }


    move(x, y) {
        this.x += x;
        this.y += y;
    }
}