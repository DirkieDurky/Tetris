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

const SRSKickData = [{
    name:["T","J","L","S","Z"],
    rotations:[
    [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    [[0,0],[1,0],[1,-1],[0,2],[1,2]],

    [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],

    [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
    [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],

    [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
    [[0,0],[1,0],[1,1],[0,-2],[1,-2]]
]
},{
    name:"I",
    rotations:[
    [[0,0],[-2,0],[1,0],[-2,1],[1,1]],
    [[0,0],[2,0],[-1,0],[2,-1],[-1,-1]],

    [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
    [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],

    [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
    [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],

    [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
    [[0,0],[-1,0],[2,0],[-1,2],[2,-1]]
]
}
]

/*
"0-1":
"1-2":
"2-3":
"3-0":
 */
function invert(input, min, max) {
    let distance = input - min;
    return max - distance;
}

function negPos(int) {
    if (int < 0) {
        return Math.abs(int);
    } else if (int > 0) {
        return int-int*2;
    } else return 0;
}

function hexToRgbA(hex,opacity = 100){
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c = hex.substring(1).split('');
        if(c.length === 3){
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+opacity/100+')';
    }
    throw new Error('Bad Hex');
}

let gameRunning = false;

let passiveBlocks = [];
const spawnPosX = 6;
const spawnPosY = 19;
let activeTetromino = null;
let ghostTetromino = null;
let softDrop;

let tmp = null;
let hold = null;
let held = false;

// const w=400;
// const h=800;

const gridW=20;
const gridH=20;
const blockSize = 40;
const h = gridH*blockSize;
const w = gridW*blockSize;

// noinspection SpellCheckingInspection
let settings = {
    das: 167,
    arr: 31,
    sds: 30,
    gravity: 1,
    repeatRate: null,
    RotationSystem: "SRS",
        /*Options:
        NRS (Nintendo Rotation System)
        ORS (Original Rotation System)
        SRS (Super Rotation System)
        SRS-X
        SRS+
        TBRS (Tetris Best Rotation System)
        ARS (Arika Rotation System)
        Sega Rotation System
        DTET Rotation System
         */
    leniency: false,
        tup: 500, //Time until placed when not moving the piece
        tudp: 2000, //Time until piece is placed no matter what
    ghostPiece: true,
    ghostPieceColor: "#7d7d7d",
        /*Options:
        Custom color
        Same as Tetromino
         */
    ghostPieceOpacity: 50,
    rswpp: true, //Remove softDrop when piece placed
    nesTetrisRotations: false,
    randomBagType: "trueRandom",
        /*Options:
        trueRandom
        7-bag
        14-bag
        classic
        */
    controls: {
        moveRight: 39,
        moveLeft: 37,
        softDrop: 40,
        hold: 38,
        rotateCCW: 88,
        rotateCW: 67,
        rotate180: 86,
        hardDrop: 90
    }
}

// My personal settings
settings.das = 100;
settings.arr = 0;
settings.gravity = 1;
settings.sds = 0;
settings.tudp = 999999;
//

let minRepeatRate = 25;
let maxRepeatRate = 1000;
let minGravity = 1;
let maxGravity = 20;
let originalDropRepeatRate;

if (settings.repeatRate === null) {
    if (settings.gravity > maxGravity || settings.gravity < minGravity) throw "Invalid gravity";
    let repeatRatePerGravity = (maxRepeatRate - minRepeatRate) / (maxGravity - minGravity);
    originalDropRepeatRate = maxRepeatRate;
    originalDropRepeatRate -= repeatRatePerGravity * (settings.gravity - minGravity);
} else {
    originalDropRepeatRate = settings.repeatRate;
}
let dropRepeatRate = originalDropRepeatRate;

/*
Todo
 - Basic Tetris -
Still no Triple T-spins setups possible?
Make hold visible
Make next pieces visible
Make a start/pause button
Make 0 gravity stop the pieces from falling
Make settings tab
Add other bagtype options
Add other Rotation System options

 - Finesse Trainer -
 4*7*10 = 280 possible options
Make object with all possible piece placements and the best keystrokes needed to put that piece there / A way to calculate best keystrokes per option
Make selection screen with all possible piece placements / Just a piece selection screen with a way to select option by moving piece to that specific position and rotation

 - Bonus -
Score display
Line count
Tetromino count
Tetris rate
Burn amount
Levels
Recognise other piece spins
Recognise combo

Customisable death cause
    - Not being able to place tetromino
    - Block placed over specific height
*/