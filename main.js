$(document).ready(function(){
    const playField = document.getElementById("playField");
    const pfCtx = playField.getContext("2d");

    const holdBox = document.getElementById("holdBox");
    const hbCtx = holdBox.getContext("2d");

    const nextBox = document.getElementById("nextBox");
    const nbCtx = nextBox.getContext("2d");

    playField.setAttribute("width",pfW+"px");
    playField.setAttribute("height",pfH+"px");
    playField.style.width = pfW+"px";
    playField.style.height = pfH+"px";

    holdBox.setAttribute("width",holdW+"px");
    holdBox.setAttribute("height",holdH+"px");
    holdBox.style.width = holdW+"px";
    holdBox.style.height = holdH+"px";

    nextBox.setAttribute("width",nextW+"px");
    nextBox.setAttribute("height",nextH+"px");
    nextBox.style.width = nextW+"px";
    nextBox.style.height = nextH+"px";

    if (!settings.hold) {
        $("#holdBox").remove();
    }

    if (settings.nextAmount < 1) {
        $("#nextBox").remove();
    }

    //Center everything exactly
    // const container = document.getElementById("container");
    // if (holdBox.style.width > nextBox.style.width) {
    //     container.style.left = "calc(50% - "+(parseInt(holdBox.style.width)-parseInt(nextBox.style.width))/2+"px)";
    // } else {
    //     container.style.left = "calc(50% + "+(parseInt(nextBox.style.width)-parseInt(holdBox.style.width))/2+"px)";
    // }

    //Make grid
    for (let i=0; i<pfW; i=i+(pfW/settings.pfGridW)) {
        pfCtx.moveTo(i,0);
        pfCtx.lineTo(i,pfH);
    }
    for (let j=0; j<pfH; j=j+pfH/settings.pfGridH) {
        pfCtx.moveTo(0,j);
        pfCtx.lineTo(pfW,j);
    }

    pfCtx.strokeStyle="#7d7d7d";
    pfCtx.lineWidth=1;
    pfCtx.stroke();

    function clearCanvas(ctx,canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
    }

    function drawBlock(ctx,x,y,color,opacity = 100){
        let w;
        let h;
        let gridW;
        let gridH;
        switch (ctx) {
            case pfCtx:
                w = pfW;
                h = pfH;
                gridW = settings.pfGridW;
                gridH = settings.pfGridH;
                break;
            case hbCtx:
                w = holdW;
                h = holdH;
                gridW = holdGridW;
                gridH = holdGridH;
                break;
            case nbCtx:
                w = nextW;
                h = nextH;
                gridW = nextGridW;
                gridH = nextGridH;
                break;
            default: throw "Invalid ctx";
        }
        ctx.fillStyle = hexToRgbA(color,opacity);
        y = invert(y,1,gridH);
        ctx.fillRect((w/gridW)*(x-1),(h/gridH*(y-1)),w/gridW,h/gridH);
    }

    function drawTetromino(ctx,x,y,tetromino,rotation,color,opacity = 100){
        let tetrominoData = tetrominoes.find(el => el.name === tetromino);
        let tetrominoRotation = tetrominoData.rotations[rotation];
        if (typeof color === "undefined") {
            color = tetrominoData.color;
        }
        drawBlock(ctx,
            x+tetrominoRotation.block1x,
            y+tetrominoRotation.block1y,
            color,opacity);
        drawBlock(ctx,
            x+tetrominoRotation.block2x,
            y+tetrominoRotation.block2y,
            color,opacity);
        drawBlock(ctx,
            x+tetrominoRotation.block3x,
            y+tetrominoRotation.block3y,
            color,opacity);
        drawBlock(ctx,
            x+tetrominoRotation.block4x,
            y+tetrominoRotation.block4y,
            color,opacity);
    }

    function renderHold() {
        clearCanvas(hbCtx,holdBox);
        if (hold !== null) {
            let tetrominoData = tetrominoes.find(el => el.name === hold);
            const tetrominoRotation = tetrominoData.rotations[0];
            const offsetX = 4;
            const offsetY = 3;
            let tetrominoOffsetX = 0;
            let tetrominoOffsetY = 0;

            let color;
            if (held) {
                color = settings.heldColor
            } else {
                color = tetrominoData.color;
            }

            switch (hold) {
                case "I":
                    tetrominoOffsetY = 0.5;
                case "O":
                    tetrominoOffsetX = -.5
                    break;
            }

            drawBlock(hbCtx,offsetX + tetrominoOffsetX + tetrominoRotation.block1x,
                offsetY + tetrominoOffsetY + tetrominoRotation.block1y,
                color);
            drawBlock(hbCtx,offsetX + tetrominoOffsetX + tetrominoRotation.block2x,
                offsetY + tetrominoOffsetY + tetrominoRotation.block2y,
                color);
            drawBlock(hbCtx,offsetX + tetrominoOffsetX + tetrominoRotation.block3x,
                offsetY + tetrominoOffsetY + tetrominoRotation.block3y,
                color);
            drawBlock(hbCtx,offsetX + tetrominoOffsetX + tetrominoRotation.block4x,
                offsetY + tetrominoOffsetY + tetrominoRotation.block4y,
                color);
        }
    }

    function renderNext() {
        clearCanvas(nbCtx,nextBox);

        const offsetX = 4;
        let offsetY = 3 + 3*settings.nextAmount;

        nextPieces.forEach(tetromino => {
            let tetrominoData = tetrominoes.find(el => el.name === numberToTetromino(tetromino));
            const tetrominoRotation = tetrominoData.rotations[0];
            offsetY = offsetY - 3;
            let tetrominoOffsetX = 0;
            let tetrominoOffsetY = 0;
            let color = tetrominoData.color;

            switch (numberToTetromino(tetromino)) {
                case "I":
                    tetrominoOffsetY = 0.5;
                case "O":
                    tetrominoOffsetX = -.5
                    break;
            }

            drawBlock(nbCtx,offsetX + tetrominoOffsetX + tetrominoRotation.block1x,
                offsetY + tetrominoOffsetY + tetrominoRotation.block1y,
                color);
            drawBlock(nbCtx,offsetX + tetrominoOffsetX + tetrominoRotation.block2x,
                offsetY + tetrominoOffsetY + tetrominoRotation.block2y,
                color);
            drawBlock(nbCtx,offsetX + tetrominoOffsetX + tetrominoRotation.block3x,
                offsetY + tetrominoOffsetY + tetrominoRotation.block3y,
                color);
            drawBlock(nbCtx,offsetX + tetrominoOffsetX + tetrominoRotation.block4x,
                offsetY + tetrominoOffsetY + tetrominoRotation.block4y,
                color);
        })
    }

    function render() {
        clearCanvas(pfCtx,playField);

        //Get ghost piece position
        if (settings.ghostPiece) {
            ghostTetromino = {
                y: activeTetromino.y,
            }
            while (!checkCollision("down", activeTetromino.x, ghostTetromino.y, activeTetromino.tetromino, activeTetromino.rotation)) {
                ghostTetromino.y--;
            }
            drawTetromino(pfCtx,activeTetromino.x, ghostTetromino.y, activeTetromino.tetromino, activeTetromino.rotation, settings.ghostPieceColor, settings.ghostPieceOpacity);
        }
        drawTetromino(pfCtx,activeTetromino.x,activeTetromino.y,activeTetromino.tetromino,activeTetromino.rotation);
        for (let i=0;i<passiveBlocks.length;i++) {
            drawBlock(pfCtx,passiveBlocks[i].x,passiveBlocks[i].y,passiveBlocks[i].color);
        }
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
            default: throw "Invalid number";
        }
    }

    function spawnTetromino(tetromino) {
        if (Number.isInteger(tetromino)) {
            tetromino = numberToTetromino(tetromino);
        }

        activeTetromino = {
            x: settings.spawnPosX,
            y: settings.spawnPosY,
            tetromino: tetromino,
            rotation: 0
        }
        render();
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
        if (settings.topCollision) {
            if (activeBlocks.block1y < 1 || activeBlocks.block2y < 1 || activeBlocks.block3y < 1 || activeBlocks.block4y < 1 ||
                activeBlocks.block1x < 1 || activeBlocks.block2x < 1 || activeBlocks.block3x < 1 || activeBlocks.block4x < 1 ||
                activeBlocks.block1y > settings.pfGridH || activeBlocks.block2y > settings.pfGridH || activeBlocks.block3y > settings.pfGridH || activeBlocks.block4y > settings.pfGridH ||
                activeBlocks.block1x > settings.pfGridW || activeBlocks.block2x > settings.pfGridW || activeBlocks.block3x > settings.pfGridW || activeBlocks.block4x > settings.pfGridW) return true;
        } else {
            if (activeBlocks.block1y < 1 || activeBlocks.block2y < 1 || activeBlocks.block3y < 1 || activeBlocks.block4y < 1 ||
                activeBlocks.block1x < 1 || activeBlocks.block2x < 1 || activeBlocks.block3x < 1 || activeBlocks.block4x < 1 ||
                activeBlocks.block1x > settings.pfGridW || activeBlocks.block2x > settings.pfGridW || activeBlocks.block3x > settings.pfGridW || activeBlocks.block4x > settings.pfGridW) return true;
        }
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
                if (activeBlocks.block1x > settings.pfGridW || activeBlocks.block2x > settings.pfGridW || activeBlocks.block3x > settings.pfGridW || activeBlocks.block4x > settings.pfGridW ||
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

    function tryPosition(x,y,rotation) {
        // console.log(`Trying position ${activeTetromino.x+x},${activeTetromino.y+y} with tetromino ${activeTetromino.tetromino} at rotation ${rotation}...`)
        return !(checkCollision("all",activeTetromino.x+x,activeTetromino.y+y,activeTetromino.tetromino,rotation))
        // if (checkCollision("all",activeTetromino.x+x,activeTetromino.y+y,activeTetromino.tetromino,rotation)) {
        //     console.log('Not possible');
        //     return false;
        // } else {
        //     console.log("Success!");
        //     return true;
        // }
    }

    function rotate(direction) {
        if (activeTetromino.tetromino === "O") return;

        rotationName = activeTetromino.rotation+"-"+virtRotate(activeTetromino.rotation,direction);
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
            case "0-2": rotation = 8; break;
            case "2-0": rotation = 9; break;
            case "1-3": rotation = 10; break;
            case "3-1": rotation = 11; break;
        }
        let neededSrsData = SrsData.find(el => el.name.includes(activeTetromino.tetromino)).rotations[rotation];
        for (let i=0;i<neededSrsData.length;i++) {
            if (tryPosition(neededSrsData[i][0],neededSrsData[i][1],virtRotate(activeTetromino.rotation,direction))) {
                activeTetromino.x += neededSrsData[i][0];
                activeTetromino.y += neededSrsData[i][1];
                activeTetromino.rotation = virtRotate(activeTetromino.rotation,direction);
                return;
            }
        }
    }

    let down = [];
    let timeout = [];
    let interval = [];
    let rotationName;

    function moveInstantly(keycode) {
        let side;
        switch (keycode) {
            case settings.controls.moveLeft: side = "left";
            break;
            case settings.controls.moveRight: side = "right";
            break;
            default: throw "Invalid keycode";
        }
        while (!checkCollision(side)) {
            switch (side) {
                case "left": activeTetromino.x--;
                break;
                case "right": activeTetromino.x++;
                break;
            }
        }
        render();
        switch (side) {
            case "left":
                clearTimeout(timeout[settings.controls.moveRight]);
                clearInterval(interval[settings.controls.moveRight]);
                break;
            case "right":
                clearTimeout(timeout[settings.controls.moveLeft]);
                clearInterval(interval[settings.controls.moveLeft]);
        }
    }
    let softDropHeld = false;
    let heldSide = [];
    function das(keycode, toExecute) {
        toExecute();
        timeout[keycode] = setTimeout(function () {
            toExecute();
            if (settings.arr !== 0) {
                interval[keycode] = setInterval(function () {
                    toExecute();
                }, settings.arr);
            } else {
                if (!heldSide.includes(keycode)) heldSide.push(keycode);
                moveInstantly(heldSide[0]);
                softDrop();
            }
        }, settings.das);
    }

    $(document).keydown(function (e) {
        let keycode = (e.keyCode ? e.keyCode : e.which);
        if (down.includes(keycode)) return;
        down.push(keycode);

        if (tup !== null) {
            clearTimeout(tup);
            startTimeout();
        }

        function keyPressed() {
            switch (keycode) {
                case settings.controls.moveRight:
                    das(keycode, function () {
                        if (checkCollision("right")) return;
                        activeTetromino.x++;
                        softDrop();
                        render();
                        clearTimeout(timeout[settings.controls.moveLeft]);
                        clearInterval(interval[settings.controls.moveLeft]);
                    }, "right");
                    return true;
                case settings.controls.moveLeft:
                    das(keycode, function () {
                        if (checkCollision("left")) return;
                        activeTetromino.x--;
                        softDrop();
                        render();
                        clearTimeout(timeout[settings.controls.moveRight]);
                        clearInterval(interval[settings.controls.moveRight]);
                    }, "left");
                    return true;
                case settings.controls.rotateCCW:
                    rotate("ccw");
                    if (heldSide.length !== 0) {
                        moveInstantly(heldSide[0])
                    }
                    softDrop();
                    return true;
                case settings.controls.rotateCW:
                    rotate("cw");
                    if (heldSide.length !== 0) {
                        moveInstantly(heldSide[0])
                    }
                    softDrop();
                    return true;
                case settings.controls.rotate180:
                    rotate("180");
                    if (heldSide.length !== 0) {
                        moveInstantly(heldSide[0])
                    }
                    softDrop();
                    return true;
                case settings.controls.hold:
                    if (!held) {
                        held = true;
                        if (hold == null) {
                            hold = activeTetromino.tetromino;
                            renderHold();
                            activeTetromino = null;
                            spawnNextPiece();
                        } else {
                            tmp = activeTetromino.tetromino;
                            activeTetromino = null;
                            spawnTetromino(hold);
                            hold = tmp;
                            renderHold();
                            tmp = null;
                        }
                    }
                    if (heldSide.length !== 0) {
                        moveInstantly(heldSide[0])
                    }
                    if (!settings.rswpp) {
                        softDrop();
                    }
                    return true;
                case settings.controls.softDrop:
                    if (settings.sds !== 0) {
                        softDrop = setInterval(function () {
                            if (checkCollision("down")) {
                                clearInterval(gameTick);
                                startInterval();
                                render();
                                return;
                            }
                            activeTetromino.y--;
                            render();
                        }, settings.sds);
                    } else {
                        softDropHeld = true;
                        softDrop();
                    }
                    return true;
                case settings.controls.hardDrop:
                    while (!checkCollision("down")) {
                        activeTetromino.y--;
                    }
                    placeTetromino();
                    return true;
                case settings.controls.restart:
                    startGame();
                    return true;
            }
        }
        if (keyPressed()) {
            render();
        }
    })

    function softDrop() {
        if (softDropHeld) {
            while (!checkCollision("down")) {
                activeTetromino.y--;
            }
            clearInterval(gameTick);
            startInterval();
            render();
        }
    }

    $(document).keyup(function(e){
        const keycode = (e.keyCode ? e.keyCode : e.which);
        const index = down.indexOf(keycode);
        if (index > -1) {
            down.splice(index, 1);
        }
        clearTimeout(timeout[keycode]);
        clearInterval(interval[keycode]);

        switch (keycode) {
            case settings.controls.softDrop:
                if (settings.sds !== 0) {
                    clearInterval(softDrop);
                } else {
                    softDropHeld = false;
                }
                break;
            case settings.controls.moveLeft:
            case settings.controls.moveRight:
                heldSide.splice(heldSide.indexOf(keycode));
        }
        if (keycode === settings.controls.softDrop) {
            clearInterval(softDrop);
        }
        if (keycode === settings.controls.moveLeft) {

        }
    })

    let nextPieces;
    let gameTick;
    let tup = null;
    let tudp = null;
    let nextTetromino;

    function spawnNextPiece() {
        if (settings.nextAmount > 0) {
            nextTetromino = numberToTetromino(nextPieces[0])
        } else {
            nextTetromino = numberToTetromino(Math.floor(Math.random() * tetrominoes.length + 1));
        }
        if (!checkCollision("all", settings.spawnPosX, settings.spawnPosY, nextTetromino, 0)) {
            if (settings.nextAmount > 0) {
                spawnTetromino(nextPieces[0]);
                nextPieces.splice(0, 1);
                nextPieces.push(Math.floor(Math.random() * tetrominoes.length + 1));
            } else {
                spawnTetromino(nextTetromino);
            }
            renderNext();
        } else {
            clearInterval(gameTick);
            gameRunning = false;
        }

        if (heldSide.length !== 0) {
            moveInstantly(heldSide[0])
        }
    }

    function startInterval() {
        if (settings.gravity !== 0) {
            gameTick = setInterval(function () {
                if (checkCollision("down")) {
                    if (settings.leniency) {
                        if (tup === null) {
                            startTimeout();
                        }
                        if (tudp === null) {
                            tudp = setTimeout(function () {
                                clearInterval(tup);
                                if (checkCollision("down")) {
                                    placeTetromino();
                                } else {
                                    tudp = null;
                                }
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
    }

    function startGame() {
        gameRunning = true;
        if (gameTick !== null) {
            clearInterval(gameTick);
        }
        passiveBlocks = [];
        held = false;
        hold = null;
        renderHold();

        nextPieces = [];
        for (let i=0;i<settings.nextAmount;i++) {
            nextPieces.push(Math.floor(Math.random() * tetrominoes.length+1));
        }

        startInterval();
        spawnNextPiece();
    }

    function blockAtPos(x,y) {
        return !!passiveBlocks.find(el => el.x === x && el.y === y);
    }

    function blockAtRelPos(x,y) {
        if (settings.topCollision) {
            return !!activeTetromino.x+x > settings.pfGridW || activeTetromino.x+x < 1 || activeTetromino.y+y > settings.pfGridH || activeTetromino.y+y < 1 ||
                passiveBlocks.find(el => el.x === activeTetromino.x+x && el.y === activeTetromino.y+y);
        } else {
            return !!activeTetromino.x+x > settings.pfGridW || activeTetromino.x+x < 1 || activeTetromino.y+y < 1 ||
                passiveBlocks.find(el => el.x === activeTetromino.x+x && el.y === activeTetromino.y+y);
        }
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
                case 0: if ((blockAtRelPos(0,0) && blockAtRelPos(-2,0) && (blockAtRelPos(-2,-2) || blockAtRelPos(0,-2))) ||
                    blockAtRelPos(-2,-2) && blockAtRelPos(0,-2) && (blockAtRelPos(0,0) || blockAtRelPos(-2,0))) tSpin = true;
                    break;
                case 1: if (blockAtRelPos(0,0) && blockAtRelPos(0,-2) && (blockAtRelPos(-2,0) || blockAtRelPos(-2,-2)) ||
                    blockAtRelPos(-2,0) && blockAtRelPos(-2,-2) && (blockAtRelPos(0,0) || blockAtRelPos(0,-2))) tSpin = true;
                    break;
                case 2: if (blockAtRelPos(-2,-2) && blockAtRelPos(0,-2) && (blockAtRelPos(0,0) || blockAtRelPos(-2,0)) ||
                    blockAtRelPos(0,0) && blockAtRelPos(-2,0) && (blockAtRelPos(-2,-2) || blockAtRelPos(0,-2))) tSpin = true;
                    break;
                case 3: if (blockAtRelPos(-2,0) && blockAtRelPos(-2,-2) && (blockAtRelPos(0,0) || blockAtRelPos(0,-2)) ||
                    blockAtRelPos(0,0) && blockAtRelPos(0,-2) && (blockAtRelPos(-2,0) || blockAtRelPos(-2,-2))) tSpin = true;
                    break;
            }
        }

        //Clear lines if applicable
        let line;
        let lineAmount = 0;
        for (let i=0; i<settings.pfGridH; i++) {
            line = passiveBlocks.filter(el => el.y === i);
            if (line.length >= settings.pfGridW) {
                lineAmount++;
                i--;
                //Remove line
                line.forEach(el => passiveBlocks.splice(passiveBlocks.indexOf(el),1));
                //Move all blocks above line down by 1
                passiveBlocks.filter(el => el.y > i).forEach(el => el.y--);
            }
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

        //Check for All clears
        if (passiveBlocks.length === 0) console.log("All clear!");
        tup = null;
        tudp = null;
        spawnNextPiece();

        //Remove softDrop when piece placed
        if (settings.rswpp) {
            clearInterval(softDrop);
            softDropHeld = false;
        } else {
            softDrop();
        }
        held = false;
        renderHold();
    }

    function startTimeout() {
        tup = setTimeout(function(){
            clearInterval(tudp);
            if (checkCollision("down")) {
                placeTetromino();
            } else {
                tup = null;
            }
        },settings.tup);
    }

    startGame();
})