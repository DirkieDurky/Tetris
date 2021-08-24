$(document).ready(function(){
    const canvas = document.getElementById("playField");
    const ctx = canvas.getContext("2d");

    document.getElementById("playField").setAttribute("width",w+"px");
    document.getElementById("playField").setAttribute("height",h+"px");

    function drawBlock(x,y,color,opacity = 100){
        ctx.fillStyle = hexToRgbA(color,opacity);
        y = invert(y,1,gridH);
        ctx.fillRect((w/gridW)*(x-1),(h/gridH)*(y-1),w/gridW,h/gridH);
    }

    function drawTetromino(x,y,tetromino,rotation,color,opacity = 100){
        let tetrominoData = tetrominoes.find(el => el.name === tetromino);
        let tetrominoRotation = tetrominoData.rotations[rotation];
        if (typeof color === "undefined") {
            color = tetrominoData.color;
        }
        drawBlock(
            x+tetrominoRotation.block1x,
            y+tetrominoRotation.block1y,
            color,opacity);
        drawBlock(
            x+tetrominoRotation.block2x,
            y+tetrominoRotation.block2y,
            color,opacity);
        drawBlock(
            x+tetrominoRotation.block3x,
            y+tetrominoRotation.block3y,
            color,opacity);
        drawBlock(
            x+tetrominoRotation.block4x,
            y+tetrominoRotation.block4y,
            color,opacity);
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

        activeTetromino = {
            x: spawnPosX,
            y: spawnPosY,
            tetromino: tetromino,
            rotation: 0
        }

        render();
    }

    function render() {
        clearCanvas();

        //Get ghost piece position
        if (settings.ghostPiece) {
            ghostTetromino = {
                y: activeTetromino.y,
            }
            while (!checkCollision("down", activeTetromino.x, ghostTetromino.y, activeTetromino.tetromino, activeTetromino.rotation)) {
                ghostTetromino.y--;
            }
            drawTetromino(activeTetromino.x, ghostTetromino.y, activeTetromino.tetromino, activeTetromino.rotation, settings.ghostPieceColor, settings.ghostPieceOpacity);
        }
        drawTetromino(activeTetromino.x,activeTetromino.y,activeTetromino.tetromino,activeTetromino.rotation);
        for (let i=0;i<passiveBlocks.length;i++) {
            drawBlock(passiveBlocks[i].x,passiveBlocks[i].y,passiveBlocks[i].color);
        }
    }

    function virtRotate(rotation, direction) {
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
            case "180":
                for (let i=0;i<2;i++){
                    if (rotation < 3) {
                        rotation = rotation+1;
                    } else {
                        rotation = 0;
                    }
                }
                return rotation;
            default:
                throw "Enter a valid direction";
        }
    }

    function blocksFromTetromino(x,y,tetromino,rotation){
        let tetrominoRotation = tetrominoes.find(el => el.name === tetromino).rotations[rotation]
        return {
            block1x: x+tetrominoRotation.block1x,
            block1y: y+tetrominoRotation.block1y,
            block2x: x+tetrominoRotation.block2x,
            block2y: y+tetrominoRotation.block2y,
            block3x: x+tetrominoRotation.block3x,
            block3y: y+tetrominoRotation.block3y,
            block4x: x+tetrominoRotation.block4x,
            block4y: y+tetrominoRotation.block4y
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
        if (blockAtPos(activeBlocks.block1x,activeBlocks.block1y) ||
            blockAtPos(activeBlocks.block2x,activeBlocks.block2y) ||
            blockAtPos(activeBlocks.block3x,activeBlocks.block3y) ||
            blockAtPos(activeBlocks.block4x,activeBlocks.block4y)) return true;
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
                VirtRotation = virtRotate(rotation, "cw");
                if (checkOutOfBounds(x,y,tetromino,VirtRotation) ||
                checkBlockCollision(x,y,tetromino,VirtRotation)) return true;
                break;
            case "rotateCcw":
                VirtRotation = virtRotate(rotation, "ccw");
                if (checkOutOfBounds(x,y,tetromino,VirtRotation)||
                    checkBlockCollision(x,y,tetromino,VirtRotation)) return true;
                break;
            case "rotate180":
                VirtRotation = virtRotate(rotation, "180");
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

    function das(keycode, toExecute) {
        toExecute();
        timeout[keycode] = setTimeout(function () {
            toExecute();
            interval[keycode] = setInterval(function () {
                toExecute();
            }, settings.arr);
        }, settings.das);
    }

    function tryPosition(x,y,rotation) {
        // console.log(`trying position ${activeTetromino.x+x},${activeTetromino.y+y} with piece ${activeTetromino.tetromino} at rotation ${rotation}`)
        return !(checkCollision("all",activeTetromino.x+x,activeTetromino.y+y,activeTetromino.tetromino,rotation))
    }

    function rotate(collisionMode, direction) {
        if (activeTetromino.tetromino === "O") return;
        //if (checkCollision(collisionMode)) return;
        //activeTetromino.rotation = virtRotate(activeTetromino.rotation,direction);

        rotationName = activeTetromino.rotation+"-"+virtRotate(activeTetromino.rotation,"ccw");
        let rotation;
        switch (rotationName) {
            case "0-1": rotation = 0; break;
            case "1-0": rotation = 1; break;
            case "1-2": rotation = 2; break;
            case "2-1": rotation = 3; break;
            case "2-3": rotation = 4; break;
            case "3-2": rotation = 5; break;
            case "3-0": rotation = 6; break;
            case "0-3": rotation = 7; break;
        }
        let neededSrsData = SRSKickData.find(el => el.name.includes(activeTetromino.tetromino)).rotations[rotation];
        for (let i=0;i<5;i++) {
            if (tryPosition(neededSrsData[i][0],neededSrsData[i][1],virtRotate(activeTetromino.rotation,direction))) {
                activeTetromino.x += neededSrsData[i][0];
                activeTetromino.y += neededSrsData[i][1];
                activeTetromino.rotation = virtRotate(activeTetromino.rotation,direction);
                return;
            }
        }
        console.log('no possible options found!');
    }

    let down = [];
    let timeout = [];
    let interval = [];
    let rotationName;

    $(document).keydown(function (e) {
            let keycode = (e.keyCode ? e.keyCode : e.which);
            if (down.includes(keycode)) return;
            down.push(keycode);

            switch (keycode) {
                case settings.controls.moveRight:
                    das(keycode,function(){
                        if (checkCollision("right")) return;
                        activeTetromino.x++;
                        if (tup !== null) {
                            clearTimeout(tup);
                            startTimeout();
                        }
                        render();
                        clearTimeout(timeout[settings.controls.moveLeft]);
                        clearInterval(interval[settings.controls.moveLeft]);
                    })
                    break;
                case settings.controls.moveLeft:
                    das(keycode,function(){
                        if (checkCollision("left")) return;
                        activeTetromino.x--;
                        if (tup !== null) {
                            clearTimeout(tup);
                            startTimeout();
                        }
                        render();
                        clearTimeout(timeout[settings.controls.moveRight]);
                        clearInterval(interval[settings.controls.moveRight]);
                    })
                    break;
                case settings.controls.rotateCCW:
                    rotate("rotateCcw","ccw");
                    break;
                case settings.controls.rotateCW:
                    rotate("rotateCcw","cw");
                    break;
                case settings.controls.rotate180:
                    rotate("rotateCcw","180");
                    break;
                case settings.controls.hold:
                    if (!held) {
                        held = true;
                        if (hold == null) {
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
                    }
                    break;
                case settings.controls.softDrop:
                    dropRepeatRate = originalDropRepeatRate/settings.sdf;
                    clearInterval(gameTick);
                    startInterval();
                    break;
                case settings.controls.hardDrop:
                    while (!checkCollision("down")) {
                        activeTetromino.y--;
                    }
                    clearTimeout(tup);
                    clearTimeout(tudp);
                    placeTetromino();
                    break;
            }
            render();
    })

    $(document).keyup(function(e){
        const keycode = (e.keyCode ? e.keyCode : e.which);
        const index = down.indexOf(keycode);
        if (index > -1) {
            down.splice(index, 1);
        }
        clearTimeout(timeout[keycode]);
        clearInterval(interval[keycode]);

        if (keycode === settings.controls.softDrop) {
            dropRepeatRate = originalDropRepeatRate;
            clearInterval(gameTick);
            startInterval();
        }
    })

    let nextPieces;
    let gameTick;
    let tup = null;
    let tudp = null;

    function spawnNextPiece() {
        if (!checkCollision("all", spawnPosX, spawnPosY, numberToTetromino(nextPieces[0]), 0)) {
            spawnTetromino(nextPieces[0]);
            nextPieces.splice(0,1);
            nextPieces.push(Math.floor(Math.random() * tetrominoes.length + 1));
        } else {
            clearInterval(gameTick);
            gameRunning = false;
        }
    }

    function startGame() {
        gameRunning = true;
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
        startInterval();
    }

    function blockAtPos(x,y) {
        return !!passiveBlocks.find(el => el.x === x && el.y === y);
    }

    function blockAtRelPos(x,y) {
        return !!passiveBlocks.find(el => el.x === activeTetromino.x+x && el.y === activeTetromino.y+y);
    }

    function placeTetromino() {
        let activeBlocks = blocksFromTetromino(activeTetromino.x, activeTetromino.y, activeTetromino.tetromino, activeTetromino.rotation);
        const color = tetrominoes.find(el => el.name === activeTetromino.tetromino).color;
        //Add all blocks of active Tetromino to passiveBlocks array
        passiveBlocks.push({x: activeBlocks.block1x, y: activeBlocks.block1y, color: color});
        passiveBlocks.push({x: activeBlocks.block2x, y: activeBlocks.block2y, color: color});
        passiveBlocks.push({x: activeBlocks.block3x, y: activeBlocks.block3y, color: color});
        passiveBlocks.push({x: activeBlocks.block4x, y: activeBlocks.block4y, color: color});
        //Check for T-spin
        let tSpin = false;
        if (activeTetromino.tetromino === "T") {
            switch (activeTetromino.rotation) {
                case 0: if (blockAtRelPos(0,0) && blockAtRelPos(-2,0)) {
                    if (blockAtRelPos(-2,-2) || blockAtRelPos(0,-2)) tSpin = true;
                } break;
                case 1: if (blockAtRelPos(0,0) && blockAtRelPos(0,-2)) {
                    if (blockAtRelPos(-2,0) || blockAtRelPos(-2,-2)) tSpin = true;
                } break;
                case 2: if (blockAtRelPos(-2,-2) && blockAtRelPos(0,-2)) {
                    if (blockAtRelPos(0,0) || blockAtRelPos(-2,0)) tSpin = true;
                } break;
                case 3: if (blockAtRelPos(-2,0) && blockAtRelPos(-2,-2)) {
                    if (blockAtRelPos(0,0) || blockAtRelPos(0,-2)) tSpin = true;
                } break;
            }
        }

        //Check for line clear
        let line;
        let lineAmount = 0;
        for (let i=0;i<gridH;i++) {
            line = passiveBlocks.filter(el => el.y === i);
            if (line.length >= gridW) {
                lineAmount++;
                i--;
                //Remove line
                line.forEach(el => passiveBlocks.splice(passiveBlocks.indexOf(el),1));
                //Move all blocks above line down by 1
                passiveBlocks.filter(el => el.y > i).forEach(el => el.y--);
            }
            //Remove softDrop when piece placed
            if (settings.rswpp) {
                if (dropRepeatRate !== originalDropRepeatRate) {
                    dropRepeatRate = originalDropRepeatRate;
                    clearInterval(gameTick);
                    startInterval();
                }
            }
            held = false;
        }

        switch (lineAmount) {
            case 1:
                if (tSpin) {
                    console.log("T-Spin single");
                } else {
                    console.log("Single");
                }
                break;
            case 2:
                if (tSpin) {
                    console.log("T-Spin double");
                } else {
                    console.log("Double");
                }
                break;
            case 3:
                if (tSpin) {
                    console.log("T-Spin triple");
                } else {
                    console.log("Triple");
                }
                break;
            case 4: console.log("Tetris!");
                break;
            default:
                if (tSpin) {
                    console.log("T-Spin");
                }
        }
        tup = null;
        tudp = null;
        spawnNextPiece();
    }

    function startInterval() {
                gameTick = setInterval(function () {
                    if (checkCollision("down")) {
                        if (settings.leniency) {
                            if (tup === null) {
                                startTimeout();
                            }
                            if (tudp === null) {
                                tudp = setTimeout(function () {
                                    clearInterval(tup);
                                    placeTetromino();
                                }, settings.tudp);
                            }
                        } else {
                            placeTetromino();
                        }
                    } else {
                        activeTetromino.y--;
                    }
                    render();
                }, dropRepeatRate)
    }

    function startTimeout() {
        tup = setTimeout(function(){
            clearInterval(tudp);
            placeTetromino();
        },settings.tup);
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