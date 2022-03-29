// maybe in the future
import Position from '../js/position.js';

// const moves = { R: 'this.move(1, 0)', L: 'this.move(-1, 0)', D: 'this.move(0, 1)', R: 'this.rotate(true)', R2: 'this.rotate(false)' };
const moves = ['this.move(1, 0)', 'this.move(-1, 0)', 'this.move(0, 1)', 'this.rotate(true)', 'this.rotate(false)'];
// const detailsByColor()

export default function botMove() {
    let m = getRandomInt(moves.length);
    return moves[m];

}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}