class Tetromino {
    constructor(name, color, rotations) {
        this.name = name;
        this.color = color;
        this.rotations = rotations;
    }
}

class Rotation {
    constructor(block1x,block1y,block2x,block2y,block3x,block3y,block4x,block4y) {
        this.block1x = block1x;
        this.block1y = block1y;
        this.block2x = block2x;
        this.block2y = block2y;
        this.block3x = block3x;
        this.block3y = block3y;
        this.block4x = block4x;
        this.block4y = block4y;
    }
}
const tetrominoes = [
    new Tetromino("I","#009ad6", [
        new Rotation(-2,0,-1, 0, 0, 0, 1, 0),
        new Rotation(0, 1, 0, 0, 0, -1, 0, -2,),
        new Rotation(-2, -1, -1, -1, 0, -1, 1, -1),
        new Rotation(-1, 1, -1, 0, -1, -1, -1, -2,)
    ]),
    new Tetromino("J","#213cc3", [
        new Rotation(-2,1,-2,0,-1,0,0,0),
        new Rotation(-1,1,0,1,-1,0,-1,-1),
        new Rotation(-2,0,-1,0,0,0,0,-1),
        new Rotation(-1,1,-1,0,-1,-1,-2,-1)
    ]),
    new Tetromino("L","#e85b00", [
        new Rotation(0,0,-2,-1,-1,-1,0,-1),
        new Rotation(-1,0,-1,-1,-1,-2,0,-2),
        new Rotation(-2,-1,-1,-1,0,-1,-2,-2),
        new Rotation(-2,0,-1,0,-1,-1,-1,-2)
    ]),
    new Tetromino("T","#b32487", [
        new Rotation(-1,0,-2,-1,-1,-1,0,-1),
        new Rotation(-1,0,-1,-1,0,-1,-1,-2),
        new Rotation(-2,-1,-1,-1,0,-1,-1,-2),
        new Rotation(-1,0,-2,-1,-1,-1,-1,-2)
    ]),
    new Tetromino("S","#4fb225", [
        new Rotation(-1,0,0,0,-2,-1,-1,-1),
        new Rotation(-1,0,-1,-1,0,-1,0,-2),
        new Rotation(-1,-1,0,-1,-2,-2,-1,-2),
        new Rotation(-2,0,-2,-1,-1,-1,-1,-2)
    ]),
    new Tetromino("Z","#dc0732", [
        new Rotation(-2,0,-1,0,-1,-1,0,-1),
        new Rotation(0,0,-1,-1,0,-1,-1,-2),
        new Rotation(-2,-1,-1,-1,-1,-2,0,-2),
        new Rotation(-1,0,-2,-1,-1,-1,-2,-2)
    ]),
    new Tetromino("O","#e6a01a", [
        new Rotation(-1,0,0,0,-1,-1,0,-1),
        new Rotation(-1,0,0,0,-1,-1,0,-1),
        new Rotation(-1,0,0,0,-1,-1,0,-1),
        new Rotation(-1,0,0,0,-1,-1,0,-1)
    ])
];

let passiveBlocks = [];
let tmp = null;
let hold = null;

const w=400;
const h=800;
const gridW=10;
const gridH=20;

function invert(input, min, max) {
    let distance = input - min;
    return max - distance;
}

let settings = {
    das: 167,
    arr: 31,
    sdf: 6,
    gravity: 1,
    controls: {
        moveRight: 39,
        moveLeft: 37,
        softDrop: 40,
        hold: 38,
        rotateCCW: 88,
        rotateCW: 67,
        hardDrop: 90
    }
}