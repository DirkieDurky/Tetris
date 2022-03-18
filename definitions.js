const pieces = [{
    name:"I", color: "#009ad6",
    rotations: [
        [[-2,-1],[-1,-1],[0,-1],[1,-1]],
        [[0,0],[0,-1],[0,-2],[0,-3]],
        [[-2,-2],[-1,-2],[0,-2],[1,-2]],
        [[-1,0],[-1,-1],[-1,-2],[-1,-3]]
    ]
},{
    name:"J", color: "#213cc3",
    rotations: [
        [[-2,0],[-2,-1],[-1,-1],[0,-1]],
        [[-1,0],[0,0],[-1,-1],[-1,-2]],
        [[-2,-1],[-1,-1],[0,-1],[0,-2]],
        [[-1,0],[-1,-1],[-1,-2],[-2,-2]]
    ]
},{
    name:"L", color: "#e85b00",
    rotations: [
        [[0,0],[-2,-1],[-1,-1],[0,-1]],
        [[-1,0],[-1,-1],[-1,-2],[0,-2]],
        [[-2,-1],[-1,-1],[0,-1],[-2,-2]],
        [[-2,0],[-1,0],[-1,-1],[-1,-2]],
    ]
},{
    name:"T", color: "#b32487",
    rotations: [
        [[-1,0],[-2,-1],[-1,-1],[0,-1]],
        [[-1,0],[-1,-1],[0,-1],[-1,-2]],
        [[-2,-1],[-1,-1],[0,-1],[-1,-2]],
        [[-1,0],[-2,-1],[-1,-1],[-1,-2]]
    ]
},{
    name:"S", color: "#4fb225",
    rotations: [
        [[-1,0],[0,0],[-2,-1],[-1,-1]],
        [[-1,0],[-1,-1],[0,-1],[0,-2]],
        [[-1,-1],[0,-1],[-2,-2],[-1,-2]],
        [[-2,0],[-2,-1],[-1,-1],[-1,-2]]
    ]
},{
    name:"Z", color: "#dc0732",
    rotations: [
        [[-2,0],[-1,0],[-1,-1],[0,-1]],
        [[0,0],[-1,-1],[0,-1],[-1,-2]],
        [[-2,-1],[-1,-1],[-1,-2],[0,-2]],
        [[-1,0],[-2,-1],[-1,-1],[-2,-2]]
    ]
},{
    name:"O", color: "#e6a01a",
    rotations: [
        [[-1,0],[0,0],[-1,-1],[0,-1]],
        [[-1,0],[0,0],[-1,-1],[0,-1]],
        [[-1,0],[0,0],[-1,-1],[0,-1]],
        [[-1,0],[0,0],[-1,-1],[0,-1]]
    ]
}];
const SrsData = [{
    name:["T","J","L","S","Z"],
    rotations:[
        //0-1 / 1-0
    [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    [[0,0],[1,0],[1,-1],[0,2],[1,2]],
        //1-2 / 2-1
    [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
        //2-3 / 3-2
    [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
    [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
        //3-0 / 0-3
    [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
    [[0,0],[1,0],[1,1],[0,-2],[1,-2]],

        //180
        //0-2 / 2-0
    [[0,0],[1,0],[2,0],[1,1],[2,1],[-1,0],[-2,0],[-1,1],[-2,1],[3,0],[-3,0]],
    [[0,0],[-1,0],[-2,0],[-1,-1],[-2,-1],[1,0],[2,0],[1,-1],[2,-1],[-3,0],[3,0]],
        //1-3 / 3-1
    [[0,0],[0,1],[0,2],[-1,1],[-1,2],[0,-1],[0,-2],[-1,-1],[-1,-2],[1,0],[0,3],[0,-3]],
    [[0,0],[0,-1],[0,-2],[1,-1],[1,-2],[0,1],[0,2],[1,1],[1,2],[-1,0],[0,-3],[0,3]]
    ]
},{
    name:"I",
    rotations:[
            //0-1 / 1-0
        [[0,0],[-2,0],[1,0],[-2,1],[1,1]],
        [[0,0],[2,0],[-1,0],[2,-1],[-1,-1]],
            //1-2 / 2-1
        [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
        [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
            //2-3 / 3-2
        [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
        [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
            //3-0 / 0-3
        [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
        [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],

            //180
            //0-2 / 2-0
        [[0,0],[-1,0],[-2,0],[1,0],[2,0],[0,1]],
        [[0,0],[1,0],[2,0],[-1,0],[-2,0],[0,-1]],
            //1-3 / 3-1
        [[0,0],[1,0],[2,0],[-1,0],[-2,0],[0,-1]],
        [[0,0],[-1,0],[-2,0],[1,0],[2,0],[0,1]],
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
    das: 167,
    arr: 31,
    sds: 30,

    //PlayField
    pfGridH: 20,
    pfGridW: 10,
    blockSize: 40,
    spawnPosX: 6,
    spawnPosY: 20,

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
        tup: 500, //Time until placed when not moving the piece
        tudp: 2000, //Time until piece is placed no matter what
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
        hold: 38,
        rotateCCW: 88,
        rotateCW: 67,
        rotate180: 86,
        hardDrop: 90,
        restart: 82,
        pause: 27,
        start: 13
    }
}

// My personal settings
settings.das = 130;
settings.arr = 0;
settings.gravity = 10;
settings.sds = 0;
settings.tudp = 999999999;
settings.spawnPosY = 20;
settings.rswpp = true;
settings.hold = true;
settings.nextAmount = 6;
settings.autoRestart = false;

if (settings.nextAmount > 6) {
    throw "Max nextAmount is 6";
}

const pfW = settings.pfGridW*settings.blockSize;
const pfH = settings.pfGridH*settings.blockSize;
const holdGridW = 5;
const holdGridH = 4;
const holdW = holdGridW*settings.blockSize;
const holdH = holdGridH*settings.blockSize;
const nextGridW = 5;
const nextGridH = 1+(3*settings.nextAmount);
const nextW = nextGridW*settings.blockSize;
const nextH = nextGridH*settings.blockSize;

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
