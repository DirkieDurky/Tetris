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

function invert(input, min, max) {
    let distance = input - min;
    return max - distance;
}

let passiveBlocks = [];
let tmp = null;
let hold = null;

const w=400;
const h=800;
const gridW=10;
const gridH=20;

let settings = {
    das: 167,
    arr: 31,
    sdf: 6,
    gravity: 1,
    leniency: true,
    rswpp: true, //Remove softDrop when piece placed
    nesTetrisRotations: false,
    randomBagType: "trueRandom",
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

/*randomBagType options:
trueRandom
7-bag
14-bag
classic
*/

let minRepeatRate = 25;
let maxRepeatRate = 250;
let minGravity = 1;
let maxGravity = 20;

// My preferred settings
settings.das = 100;
settings.arr = 0;
settings.gravity = 14;
//

if (settings.gravity > maxGravity || settings.gravity < minGravity) {
    throw "Invalid gravity";
}
let repeatRatePerGravity = (maxRepeatRate-minRepeatRate)/(maxGravity-minGravity);
let originalDropRepeatRate = maxRepeatRate;
originalDropRepeatRate -= repeatRatePerGravity*(settings.gravity-minGravity);

let dropRepeatRate = originalDropRepeatRate;

let gameRunning = false;
let spawnPosX = 6;
let spawnPosY = 19;

/*
Todo

 - Basic Tetris -
Add T-bag option
If left and right are pressed at the same time only press key pressed latest until released
Make hold only allowed once per block
Add hardDrop
Add leniency
Add STS
Make hold visible
Make next pieces visible
Make a start/pause button
Make 0 gravity stop the pieces from falling
Make settings tab

 - Finesse Trainer -
 4*7*10 = 280 possible options
Make object with all possible piece placements and the best keystrokes needed to put that piece there / A way to calculate best keystrokes per option
Make selection screen with all possible piece placements / Just a piece selection screen with a way to select option by moving piece to that specific position and rotation
 */