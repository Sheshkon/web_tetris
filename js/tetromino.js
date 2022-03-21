
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
        [1, 1],
        [1, 1]
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
        let rotated_tetromino = [];
        let N = this.tetromino.length;
        for (var i = 0; i < N; i++) {
            rotated_tetromino[i] = new Array(N).fill(0);
        }
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                rotated_tetromino[x][y] = this.tetromino[N - y - 1][x];
            }
        }
        this.tetromino = rotated_tetromino;
    }

    move(x, y) {
        this.x += x;
        this.y += y;
    }
}