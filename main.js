$(document).ready(function(){
    const canvas = document.getElementById("playField");
    const ctx = canvas.getContext("2d");

    function drawBlock(x,y,color){
        ctx.fillStyle = color;
        y = invert(y,1,gridH);
        ctx.fillRect((w/gridW)*(x-1),(h/gridH)*(y-1),w/gridW,h/gridH);
    }

    function drawTetromino(x,y,tetromino,rotation){
        drawBlock(
            x+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block1x,
            y+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block1y,
            tetrominoes.find(el => el.name === tetromino).color);
        drawBlock(
            x+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block2x,
            y+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block2y,
            tetrominoes.find(el => el.name === tetromino).color);
        drawBlock(
            x+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block3x,
            y+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block3y,
            tetrominoes.find(el => el.name === tetromino).color);
        drawBlock(
            x+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block4x,
            y+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block4y,
            tetrominoes.find(el => el.name === tetromino).color);
    }

    //Make grid
    for (let i=0;i<w;i=i+(w/gridW)) {
        ctx.moveTo(i,0);
        ctx.lineTo(i,h);
    }
    for (let j=0;j<h;j=j+h/gridH) {
        ctx.moveTo(0,j);
        ctx.lineTo(w,j);
    }

    ctx.strokeStyle="#7d7d7d";
    ctx.lineWidth=1;
    ctx.stroke();

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
    }

    let activeTetromino = null;

    function numberToTetromino(number) {
        switch (number) {
            case 1: return "I";
            case 2: return "J";
            case 3: return "L";
            case 4: return "T";
            case 5: return "S";
            case 6: return "Z";
            case 7: return "O";
            default: throw "Enter valid number";
        }
    }

    function spawnTetromino(tetromino) {
        if (Number.isInteger(tetromino)) {
            tetromino = numberToTetromino(tetromino);
        }
        console.log(tetromino);

        drawTetromino(6,22,tetromino,0);
        activeTetromino = {
            x: 6,
            y: 22,
            tetromino: tetromino,
            rotation: 0
        }
        render();
    }

    function render() {
        clearCanvas();
        drawTetromino(activeTetromino.x,activeTetromino.y,activeTetromino.tetromino,activeTetromino.rotation);
        for (let i=0;i<passiveBlocks.length;i++) {
            drawBlock(passiveBlocks[i].x,passiveBlocks[i].y,passiveBlocks[i].color);
        }
    }

    function rotate(rotation, direction) {
        direction = direction.toLowerCase();
        switch (direction) {
            case "cw":
                if (rotation < 3) {
                    return rotation+1;
                } else {
                    return 0;
                }
            case "ccw":
                if (rotation > 0) {
                    return rotation-1;
                } else {
                    return 3;
                }
            default:
                throw "Enter a valid direction";
        }
    }

    function blocksFromTetromino(x,y,tetromino,rotation){
        return {
            block1x: x+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block1x,
            block1y: y+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block1y,
            block2x: x+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block2x,
            block2y: y+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block2y,
            block3x: x+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block3x,
            block3y: y+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block3y,
            block4x: x+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block4x,
            block4y: y+tetrominoes.find(el => el.name === tetromino).rotations[rotation].block4y
        }
    }

    function checkOutOfBounds(x,y,tetromino,rotation) {
        let activeBlocks = blocksFromTetromino(x, y, tetromino, rotation);
        if (activeBlocks.block1y < 1 || activeBlocks.block2y < 1 || activeBlocks.block3y < 1 || activeBlocks.block4y < 1 ||
            activeBlocks.block1x < 1 || activeBlocks.block2x < 1 || activeBlocks.block3x < 1 || activeBlocks.block4x < 1 ||
            activeBlocks.block1x > gridW || activeBlocks.block2x > gridW || activeBlocks.block3x > gridW || activeBlocks.block4x > gridW) return true;
    }

    function checkBlockCollision(x,y,tetromino,rotation) {
        let activeBlocks = blocksFromTetromino(x,y,tetromino,rotation);
        if (passiveBlocks.find(el => el.x === activeBlocks.block1x && el.y === activeBlocks.block1y) ||
            passiveBlocks.find(el => el.x === activeBlocks.block2x && el.y === activeBlocks.block2y) ||
            passiveBlocks.find(el => el.x === activeBlocks.block3x && el.y === activeBlocks.block3y) ||
            passiveBlocks.find(el => el.x === activeBlocks.block4x && el.y === activeBlocks.block4y)) return true;
    }

    function checkCollision(mode, x = activeTetromino.x, y = activeTetromino.y, tetromino = activeTetromino.tetromino, rotation = activeTetromino.rotation){
        let activeBlocks;
        let VirtRotation;
        switch (mode) {
            case "down":
                activeBlocks = blocksFromTetromino(x,y-1,tetromino,rotation);
                if (activeBlocks.block1y < 1 || activeBlocks.block2y < 1 || activeBlocks.block3y < 1 || activeBlocks.block4y < 1) return true;
                if (checkBlockCollision(x,y-1,tetromino,rotation)) return true;
            break;
            case "left":
                activeBlocks = blocksFromTetromino(x-1,y,tetromino,rotation);
                if (activeBlocks.block1x < 1 || activeBlocks.block2x < 1 || activeBlocks.block3x < 1 || activeBlocks.block4x < 1 ||
                    checkBlockCollision(x-1,y,tetromino,rotation)) return true;
            break;
            case "right":
                activeBlocks = blocksFromTetromino(x+1,y,tetromino,rotation);
                if (activeBlocks.block1x > gridW || activeBlocks.block2x > gridW || activeBlocks.block3x > gridW || activeBlocks.block4x > gridW ||
                checkBlockCollision(x+1,y,tetromino,rotation)) return true;
            break;
            case "rotateCw":
                VirtRotation = rotate(rotation, "cw");
                if (checkOutOfBounds(x,y,tetromino,VirtRotation) ||
                checkBlockCollision(x,y,tetromino,VirtRotation)) return true;
                break;
            case "rotateCcw":
                VirtRotation = rotate(rotation, "ccw");
                if (checkOutOfBounds(x,y,tetromino,VirtRotation)||
                    checkBlockCollision(x,y,tetromino,VirtRotation)) return true;
                break;
            case "all":
                if (checkOutOfBounds(x,y,tetromino,rotation) ||
                    checkBlockCollision(x,y,tetromino,rotation)) return true;
                break;
            default:
                throw "Enter a valid mode";
        }
    }

    function executeAction(keycode) {
        switch (keycode) {
            case settings.controls.moveRight:
                if (checkCollision("right")) return;
                activeTetromino.x++;
                break;
            case settings.controls.moveLeft:
                if (checkCollision("left")) return;
                activeTetromino.x--;
                break;
            case settings.controls.rotateCCW:
                if (checkCollision("rotateCcw")) return;
                activeTetromino.rotation = rotate(activeTetromino.rotation,"ccw");
                break;
            case settings.controls.rotateCW:
                if (checkCollision("rotateCw")) return;
                activeTetromino.rotation = rotate(activeTetromino.rotation,"cw");
                break;
            case settings.controls.hold:
                if (hold == null){
                    hold = activeTetromino.tetromino;
                    activeTetromino = null;
                    spawnNextPiece();
                } else {
                    tmp = activeTetromino.tetromino;
                    activeTetromino = null;
                    spawnTetromino(hold);
                    hold = tmp;
                    tmp = null;
                }

                console.log(`${activeTetromino.tetromino} held`)
        }
        render();
    }

    let down = [];
    let timeout = [];
    let interval = [];

    $(document).keydown(function (e) {
        let keycode = (e.keyCode ? e.keyCode : e.which);
        if (down.includes(keycode)) return;
        down.push(keycode);
        executeAction(keycode);
        timeout[keycode] = setTimeout(function(){
            executeAction(keycode);
            interval[keycode] = setInterval(function(){
                executeAction(keycode);
            },settings.arr);
        },settings.das);
    })

    $(document).keyup(function(e){
        const keycode = (e.keyCode ? e.keyCode : e.which);
        const index = down.indexOf(keycode);
        if (index > -1) {
            down.splice(index, 1);
        }
        clearTimeout(timeout[keycode]);
        clearInterval(interval[keycode]);
    })

    let nextPieces;
    let gameTick;

    function spawnNextPiece() {
        if (!checkCollision("all", 6, 22, numberToTetromino(nextPieces[0]), 0)) {
            spawnTetromino(nextPieces[0]);
            nextPieces.splice(0,1);
            nextPieces.push(Math.floor(Math.random() * tetrominoes.length + 1));
        } else {
            clearInterval(gameTick);
        }
    }

    function startGame() {
        if (gameTick !== null) {
            clearInterval(gameTick);
        }
        passiveBlocks = [];
        hold = null;

        nextPieces = [];
        for (let i=0;i<6;i++) {
            nextPieces.push(Math.floor(Math.random() * tetrominoes.length+1));
        }

        spawnTetromino(nextPieces[0]);
        gameTick = setInterval(function () {
            if (checkCollision("down")) {
                let activeBlocks = blocksFromTetromino(activeTetromino.x, activeTetromino.y, activeTetromino.tetromino, activeTetromino.rotation);
                const color = tetrominoes.find(el => el.name === activeTetromino.tetromino).color;
                //Add all blocks of active Tetromino to passiveBlocks array
                passiveBlocks.push({x: activeBlocks.block1x, y: activeBlocks.block1y, color: color});
                passiveBlocks.push({x: activeBlocks.block2x, y: activeBlocks.block2y, color: color});
                passiveBlocks.push({x: activeBlocks.block3x, y: activeBlocks.block3y, color: color});
                passiveBlocks.push({x: activeBlocks.block4x, y: activeBlocks.block4y, color: color});
                //Check for line clear
                let line;
                let lineAmount = 0;
                for (let i=0;i<gridH;i++) {
                    line = passiveBlocks.filter(el => el.y === i);
                    if (line.length >= 10) {
                        lineAmount++;
                        i--;
                        //Remove line
                        line.forEach(el => passiveBlocks.splice(passiveBlocks.indexOf(el),1));
                        //Move all blocks above line down by 1
                        passiveBlocks.filter(el => el.y > i).forEach(el => el.y--);
                    }
                }
                let announcement = '';
                switch (lineAmount) {
                    case 1: console.log("Single");
                        break;
                    case 2: console.log("Double");
                        break;
                    case 3: console.log("Triple");
                        break;
                    case 4: console.log("Tetris!");
                        break;
                }

                spawnNextPiece();
            }
            activeTetromino.y--;
            render();
        }, invert(settings.gravity, 0, 10) * 10)
    }

    $(document).keydown(function (e) {
        let keycode = (e.keyCode ? e.keyCode : e.which);

        switch (keycode) {
            case 68:
                console.log(nextPieces);
                break;
            case 82:
                startGame();
        }
    })
    startGame();
})