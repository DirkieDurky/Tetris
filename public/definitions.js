const pieces = [{
    name: "I", color: "#009ad6",
    rotations: [
        [[-2, -1], [-1, -1], [0, -1], [1, -1]],
        [[0, 0], [0, -1], [0, -2], [0, -3]],
        [[-2, -2], [-1, -2], [0, -2], [1, -2]],
        [[-1, 0], [-1, -1], [-1, -2], [-1, -3]]
    ]
}, {
    name: "J", color: "#213cc3",
    rotations: [
        [[-2, 0], [-2, -1], [-1, -1], [0, -1]],
        [[-1, 0], [0, 0], [-1, -1], [-1, -2]],
        [[-2, -1], [-1, -1], [0, -1], [0, -2]],
        [[-1, 0], [-1, -1], [-1, -2], [-2, -2]]
    ]
}, {
    name: "L", color: "#e85b00",
    rotations: [
        [[0, 0], [-2, -1], [-1, -1], [0, -1]],
        [[-1, 0], [-1, -1], [-1, -2], [0, -2]],
        [[-2, -1], [-1, -1], [0, -1], [-2, -2]],
        [[-2, 0], [-1, 0], [-1, -1], [-1, -2]],
    ]
}, {
    name: "T", color: "#b32487",
    rotations: [
        [[-1, 0], [-2, -1], [-1, -1], [0, -1]],
        [[-1, 0], [-1, -1], [0, -1], [-1, -2]],
        [[-2, -1], [-1, -1], [0, -1], [-1, -2]],
        [[-1, 0], [-2, -1], [-1, -1], [-1, -2]]
    ]
}, {
    name: "S", color: "#4fb225",
    rotations: [
        [[-1, 0], [0, 0], [-2, -1], [-1, -1]],
        [[-1, 0], [-1, -1], [0, -1], [0, -2]],
        [[-1, -1], [0, -1], [-2, -2], [-1, -2]],
        [[-2, 0], [-2, -1], [-1, -1], [-1, -2]]
    ]
}, {
    name: "Z", color: "#dc0732",
    rotations: [
        [[-2, 0], [-1, 0], [-1, -1], [0, -1]],
        [[0, 0], [-1, -1], [0, -1], [-1, -2]],
        [[-2, -1], [-1, -1], [-1, -2], [0, -2]],
        [[-1, 0], [-2, -1], [-1, -1], [-2, -2]]
    ]
}, {
    name: "O", color: "#e6a01a",
    rotations: [
        [[-1, 0], [0, 0], [-1, -1], [0, -1]],
        [[-1, 0], [0, 0], [-1, -1], [0, -1]],
        [[-1, 0], [0, 0], [-1, -1], [0, -1]],
        [[-1, 0], [0, 0], [-1, -1], [0, -1]]
    ]
}];
const SrsData = [{
    name: ["T", "J", "L", "S", "Z"],
    rotations: [
        //0-1 / 1-0
        [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        //1-2 / 2-1
        [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        //2-3 / 3-2
        [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
        [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        //3-0 / 0-3
        [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],

        //180
        //0-2 / 2-0
        [[0, 0], [1, 0], [2, 0], [1, 1], [2, 1], [-1, 0], [-2, 0], [-1, 1], [-2, 1], [3, 0], [-3, 0]],
        [[0, 0], [-1, 0], [-2, 0], [-1, -1], [-2, -1], [1, 0], [2, 0], [1, -1], [2, -1], [-3, 0], [3, 0]],
        //1-3 / 3-1
        [[0, 0], [0, 1], [0, 2], [-1, 1], [-1, 2], [0, -1], [0, -2], [-1, -1], [-1, -2], [1, 0], [0, 3], [0, -3]],
        [[0, 0], [0, -1], [0, -2], [1, -1], [1, -2], [0, 1], [0, 2], [1, 1], [1, 2], [-1, 0], [0, -3], [0, 3]]
    ]
}, {
    name: "I",
    rotations: [
        //0-1 / 1-0
        [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, 1]],
        [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, -1]],
        //1-2 / 2-1
        [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
        [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        //2-3 / 3-2
        [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        //3-0 / 0-3
        [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],

        //180
        //0-2 / 2-0
        [[0, 0], [-1, 0], [-2, 0], [1, 0], [2, 0], [0, 1]],
        [[0, 0], [1, 0], [2, 0], [-1, 0], [-2, 0], [0, -1]],
        //1-3 / 3-1
        [[0, 0], [1, 0], [2, 0], [-1, 0], [-2, 0], [0, -1]],
        [[0, 0], [-1, 0], [-2, 0], [1, 0], [2, 0], [0, 1]],
    ]
}]

let gamePaused = false;
let gameRunning = false;

let passiveBlocks = [];

let activePiece = null;
let ghostPiece = null;

let tmp = null;
let hold = null;
let held = false;

// noinspection SpellCheckingInspection
let settings = {

    //Handling
    das: 167, // Delayed auto shift
    arr: 31, // Auto repeat rate
    sds: 30, // Soft drop speed

    //PlayField
    pfGridH: 20,
    pfGridW: 10,
    blockSize: 40,
    spawnPosX: 6,
    spawnPosY: 21,

    //Gameplay
    autoRestart: false,
    hold: true,
    nextAmount: 6,
    //Amount of Next pieces
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
    leniency: true,
    ttl: 500, //Time until a piece is placed when not moving the piece (Time to lock)
    ttdl: 2000, //Time until a piece is placed no matter what (Time to definately lock)
    ttdlsd: 250, //Time until a piece is placed when softdropping (Time to definately lock Soft drop)
    spawnLeniency: 1, //Amount of blocks the game allows pieces to spawn if it cant be placed in the original spawn location
    rswpp: true, //Remove softDrop when piece placed
    ghostPiece: true,
    nesTetrisRotations: false,
    pieceRandomiser: 1,
    /*Options:
    0=trueRandom
    1=7-bag
    2=14-bag
    3=NES Tetris / Classic
    4=TGM
    5=TGM2
    6=TGM3
    7=GameBoy
    */
    topCollision: false, //Determines if the top of the playField has a collision !!If this option is true make sure to set spawnposition y to gridHeight or below or no pieces will be able to spawn

    //Customisation
    ghostPieceColor: "#7d7d7d",
    heldColor: "#7d7d7d", //Color of the hold piece if you cant use the hold anymore this turn
    /*Options:
    Custom color
    Same as Tetromino
     */
    ghostPieceOpacity: 50,

    //Controls
    controls: {
        moveRight: 39,
        moveLeft: 37,
        softDrop: 40,
        hold: 67,
        rotateCCW: 90,
        rotateCW: 38,
        hardDrop: 32,
        restart: 82,
        pause: 27,
        start: 13
    }
}

function setDirkPreferences() {
    // My personal settings
    settings.controls.moveRight = 39;
    settings.controls.moveLeft = 37;
    settings.controls.softDrop = 40;
    settings.controls.hold = 38;
    settings.controls.rotateCCW = 88;
    settings.controls.rotateCW = 67;
    settings.controls.rotate180 = 86;
    settings.controls.hardDrop = 90;
    settings.controls.restart = 82;
    settings.controls.pause = 27;
    settings.controls.start = 13;

    settings.das = 130;
    settings.arr = 0;
    settings.gravity = 10;
    settings.sds = 0;
    settings.ttdl = 999999999;
}

if (settings.nextAmount > 6) {
    throw "Max nextAmount is 6";
}

const pfW = settings.pfGridW * settings.blockSize;
const pfH = settings.pfGridH * settings.blockSize;
const holdGridW = 5;
const holdGridH = 4;
const holdW = holdGridW * settings.blockSize;
const holdH = holdGridH * settings.blockSize;
const nextGridW = 5;
const nextGridH = 1 + (3 * settings.nextAmount);
const nextW = nextGridW * settings.blockSize;
const nextH = nextGridH * settings.blockSize;

let minRepeatRate = 25;
let maxRepeatRate = 1000;
let minGravity = 1;
let maxGravity = 20;
let originalDropRepeatRate;

if (settings.repeatRate === null) {
    if (settings.gravity !== 0 && (settings.gravity > maxGravity || settings.gravity < minGravity)) throw "Invalid gravity";
    let repeatRatePerGravity = (maxRepeatRate - minRepeatRate) / (maxGravity - minGravity);
    originalDropRepeatRate = maxRepeatRate;
    originalDropRepeatRate -= repeatRatePerGravity * (settings.gravity - minGravity);
} else {
    originalDropRepeatRate = settings.repeatRate;
}
let dropRepeatRate = originalDropRepeatRate;
