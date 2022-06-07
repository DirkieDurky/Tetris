// sendUserLogInMessage("Tetris");

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

    const startButton = $("#startButton");
    let restartButton = null;

    if (!settings.hold) {
        $("#holdBox").remove();
    }

    if (settings.nextAmount < 1) {
        $("#nextBox").remove();
    }

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

    function drawPiece(ctx = pfCtx,x = activePiece.x,y = activePiece.y,piece = activePiece.piece,
                           rotation = activePiece.rotation,color,opacity = 100){
        let pieceData = pieces.find(el => el.name === piece);
        let pieceRotation = pieceData.rotations[rotation];
        if (typeof color === "undefined") {
            color = pieceData.color;
        }

        for (let i=0;i<pieceRotation.length;i++) {
            drawBlock(ctx,x+pieceRotation[i][0],y+pieceRotation[i][1],color,opacity);
        }
    }

    function setOffset(piece) {
        let result = {
            y:0,
            x:0
        };

        switch (piece) {
            case "I":
                result.y = 0.5;
            case "O":
                result.x = -0.5
                break;
        }

        return result;
    }

    function renderHold() {
        clearCanvas(hbCtx,holdBox);
        if (hold !== null) {
            let pieceData = pieces.find(el => el.name === hold);
            const pieceRotation = pieceData.rotations[0];
            const offsetX = 4;
            const offsetY = 3;

            let color;
            if (held) {
                color = settings.heldColor
            } else {
                color = pieceData.color;
            }

            const offset = setOffset(hold);

            for (let i=0;i<pieceRotation.length;i++) {
                drawBlock(hbCtx, offsetX + offset.x + pieceRotation[i][0], offsetY + offset.y + pieceRotation[i][1],color);
            }
        }
    }

    function renderNext() {
        clearCanvas(nbCtx,nextBox);

        const offsetX = 4;
        let offsetY = 3 + 3*settings.nextAmount;
        nextPieces.forEach(piece => {
            const pieceData = pieces.find(el => el.name === piece);
            const pieceRotation = pieceData.rotations[0];
            offsetY = offsetY - 3;
            let color = pieceData.color;

            const offset = setOffset(piece);

            for (let i=0;i<pieceRotation.length;i++) {
                drawBlock(nbCtx, offsetX + offset.x + pieceRotation[i][0], offsetY + offset.y + pieceRotation[i][1],color);
            }
        })
    }

    function render() {
        clearCanvas(pfCtx,playField);

        //Get ghost piece position
        if (settings.ghostPiece) {
            ghostPiece = {
                y: activePiece.y,
            }
            while (!checkCollision("down", activePiece.x, ghostPiece.y, activePiece.piece, activePiece.rotation)) {
                ghostPiece.y--;
            }
            drawPiece(undefined,undefined, ghostPiece.y, undefined, undefined, settings.ghostPieceColor, settings.ghostPieceOpacity);
        }
        drawPiece();
        for (let i=0;i<passiveBlocks.length;i++) {
            drawBlock(pfCtx,passiveBlocks[i].x,passiveBlocks[i].y,passiveBlocks[i].color);
        }
    }

    function spawnPiece(piece,yOffset) {
        if (Number.isInteger(piece)) {
            piece = pieceBag[piece];
        }

        activePiece = {
            x: settings.spawnPosX,
            y: settings.spawnPosY + yOffset,
            piece: piece,
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

    function checkOutOfBounds(x,y,piece,rotation) {
        let pieceRotation = pieces.find(el => el.name === piece).rotations[rotation];
        let outOfBounds = false;
        for (let i=0;i<pieceRotation.length;i++) {
            if (x+pieceRotation[i][0] < 1) outOfBounds = true; else
            if (x+pieceRotation[i][0] > settings.pfGridW) outOfBounds = true; else
            if (y+pieceRotation[i][1] < 1) outOfBounds = true; else
            if (settings.topCollision) {
                if (y+pieceRotation[i][1] > settings.pfGridH) outOfBounds = true;
            }
        }
        return outOfBounds;
    }

    function checkBlockCollision(x,y,piece,rotation) {
        let pieceRotation = pieces.find(el => el.name === piece).rotations[rotation];
        for (let i=0;i<pieceRotation.length;i++) {
            if (blockAtPos(x+pieceRotation[i][0],y+pieceRotation[i][1])) return true;
        }
    }

    function checkCollision(mode, x = activePiece.x, y = activePiece.y, piece = activePiece.piece, rotation = activePiece.rotation){
        let pieceRotations = pieces.find(el => el.name === piece).rotations[rotation];
        let VirtRotation;
        switch (mode) {
            case "down":
                for (let i=0;i<pieceRotations.length;i++) if (y+pieceRotations[i][1]-1 < 1) return true;
                if (checkBlockCollision(x,y-1,piece,rotation)) return true;
                break;
            case "left":
                for (let i=0;i<pieceRotations.length;i++) if (x+pieceRotations[i][0]-1 < 1) return true;
                if (checkBlockCollision(x-1,y,piece,rotation)) return true;
                break;
            case "right":
                for (let i=0;i<pieceRotations.length;i++) if (x+pieceRotations[i][0]+1 > settings.pfGridW) return true;
                if (checkBlockCollision(x+1,y,piece,rotation)) return true;
                break;
            case "rotateCw":
                VirtRotation = virtRotate(rotation, "cw");
                if (checkOutOfBounds(x,y,piece,VirtRotation) ||
                checkBlockCollision(x,y,piece,VirtRotation)) return true;
                break;
            case "rotateCcw":
                VirtRotation = virtRotate(rotation, "ccw");
                if (checkOutOfBounds(x,y,piece,VirtRotation)||
                    checkBlockCollision(x,y,piece,VirtRotation)) return true;
                break;
            case "rotate180":
                VirtRotation = virtRotate(rotation, "180");
                if (checkOutOfBounds(x,y,piece,VirtRotation)||
                    checkBlockCollision(x,y,piece,VirtRotation)) return true;
                break;
            case "all":
                if (checkOutOfBounds(x,y,piece,rotation) ||
                    checkBlockCollision(x,y,piece,rotation)) return true;
                break;
            default:
                throw "Enter a valid mode";
        }
    }

    function tryPosition(x,y,rotation) {
        // console.log(`Trying position ${activePiece.x+x},${activePiece.y+y} with piece ${activePiece.piece} at rotation ${rotation}...`)
        return !(checkCollision("all",activePiece.x+x,activePiece.y+y,activePiece.piece,rotation))
        // if (checkCollision("all",activePiece.x+x,activePiece.y+y,activePiece.piece,rotation)) {
        //     console.log('Not possible');
        //     return false;
        // } else {
        //     console.log("Success!");
        //     return true;
        // }
    }

    function rotate(direction) {
        if (activePiece.piece === "O") return;

        rotationName = activePiece.rotation+"-"+virtRotate(activePiece.rotation,direction);
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
        let neededSrsData = SrsData.find(el => el.name.includes(activePiece.piece)).rotations[rotation];
        for (let i=0;i<neededSrsData.length;i++) {
            if (tryPosition(neededSrsData[i][0],neededSrsData[i][1],virtRotate(activePiece.rotation,direction))) {
                activePiece.x += neededSrsData[i][0];
                activePiece.y += neededSrsData[i][1];
                activePiece.rotation = virtRotate(activePiece.rotation,direction);
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
                case "left": activePiece.x--;
                break;
                case "right": activePiece.x++;
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
                dropInstantly();
            }
        }, settings.das);
    }

    let softDrop;
    $(document).keydown(function (e) {
        let keycode = (e.keyCode ? e.keyCode : e.which);
        if (gameRunning) {
            if (keycode === settings.controls.pause) {
                pause();
            }
            if (keycode === settings.controls.restart) {
                restart();
            }
        } else {
            if (keycode === settings.controls.start) {
                start();
            }
        }
        if (!gamePaused && gameRunning) {
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
                            if (gamePaused) return;
                            activePiece.x++;
                            dropInstantly();
                            render();
                            clearTimeout(timeout[settings.controls.moveLeft]);
                            clearInterval(interval[settings.controls.moveLeft]);
                        }, "right");
                        return true;
                    case settings.controls.moveLeft:
                        das(keycode, function () {
                            if (checkCollision("left")) return;
                            if (gamePaused) return;
                            activePiece.x--;
                            dropInstantly();
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
                        dropInstantly();
                        return true;
                    case settings.controls.rotateCW:
                        rotate("cw");
                        if (heldSide.length !== 0) {
                            moveInstantly(heldSide[0])
                        }
                        dropInstantly();
                        return true;
                    case settings.controls.rotate180:
                        rotate("180");
                        if (heldSide.length !== 0) {
                            moveInstantly(heldSide[0])
                        }
                        dropInstantly();
                        return true;
                    case settings.controls.hold:
                        if (settings.hold) {
                            if (!held) {
                                held = true;
                                if (hold == null) {
                                    hold = activePiece.piece;
                                    renderHold();
                                    activePiece = null;
                                    spawnNextPiece();
                                } else {
                                    tmp = activePiece.piece;
                                    activePiece = null;
                                    spawnPiece(hold,0);
                                    hold = tmp;
                                    renderHold();
                                    // noinspection JSUndeclaredVariable
                                    tmp = null;
                                }
                            }
                            if (heldSide.length !== 0) {
                                moveInstantly(heldSide[0])
                            }
                            if (!settings.rswpp) {
                                dropInstantly();
                            }
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
                                activePiece.y--;
                                render();
                            }, settings.sds);
                        } else {
                            softDropHeld = true;
                            dropInstantly();
                        }
                        return true;
                    case settings.controls.hardDrop:
                        while (!checkCollision("down")) {
                            activePiece.y--;
                        }
                        placePiece();
                        return true;
                }
            }
            if (keyPressed()) {
                render();
            }
        }
    })

    function dropInstantly() {
        if (settings.sds < 1) {
            if (softDropHeld) {
                while (!checkCollision("down")) {
                    activePiece.y--;
                }
                clearInterval(gameTick);
                startInterval();
                render();
            }
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
    })

    let nextPieces;
    let gameTick;
    let tup = null;
    let tudp = null;
    let nextPiece;

    function spawnNextPiece() {
        if (settings.nextAmount > 0) {
            nextPiece = nextPieces[0];
        } else {
            nextPiece = addNextPiece();
        }
        for (let i=0;i<=settings.spawnLeniency;i++){
            if (!checkCollision("all", settings.spawnPosX, settings.spawnPosY+i, nextPiece, 0)) {
                if (settings.nextAmount > 0) {
                    spawnPiece(nextPieces[0], i);
                    nextPieces.shift();
                    nextPieces.push(addNextPiece());
                } else {
                    spawnPiece(nextPiece, 0);
                }
                renderNext();
                if (heldSide.length !== 0) {
                    moveInstantly(heldSide[0])
                }
                return;
            }
        }
        clearInterval(gameTick);
        gameRunning = false;
        startButton.html("Start");
        if (settings.autoRestart) {
            startGame();
        } else {
            if (restartButton != null){
                restartButton.remove();
            }
        }
    }

    function startInterval() {
        if (settings.gravity !== 0) {
            gameTick = setInterval(function () {
                if (!gamePaused) {
                    if (checkCollision("down")) {
                        if (settings.leniency) {
                            if (tup === null) {
                                startTimeout();
                            }
                            if (tudp === null) {
                                tudp = setTimeout(function () {
                                    clearInterval(tup);
                                    if (checkCollision("down")) {
                                        placePiece();
                                    } else {
                                        tudp = null;
                                    }
                                }, settings.tudp);
                            }
                        } else {
                            placePiece();
                        }
                    } else {
                        activePiece.y--;
                    }
                    render();
                }
            }, dropRepeatRate)
        }
    }

    function addNextPiece() {
        switch (settings.pieceRandomiser) {
            case 0: return trueRandom().next().value;
            case 1: return bag(7).next().value;
            case 2: return bag(14).next().value;
            case 3: return classic().next().value;
            case 4: return tgm().next().value;
            case 5: return tgm2().next().value;
            case 6: return tgm3().next().value;
            case 7: return gameBoy().next().value;
            default: throw "Invalid pieceRandomiser";
        }
    }

    function startGame() {
        gameRunning = true;
        if (gameTick !== null) {
            clearInterval(gameTick);
        }
        gamePaused = false;
        passiveBlocks = [];
        held = false;
        hold = null;
        renderHold();

        nextPieces = [];
        for (let i=0;i<settings.nextAmount;i++) {
            nextPieces.push(addNextPiece());
        }

        spawnNextPiece();
        startInterval();
    }

    function blockAtPos(x,y) {
        return !!passiveBlocks.find(el => el.x === x && el.y === y);
    }

    function blockAtRelPos(x,y) {
        if (settings.topCollision) {
            return !!activePiece.x+x > settings.pfGridW || activePiece.x+x < 1 || activePiece.y+y > settings.pfGridH || activePiece.y+y < 1 ||
                passiveBlocks.find(el => el.x === activePiece.x+x && el.y === activePiece.y+y);
        } else {
            return !!activePiece.x+x > settings.pfGridW || activePiece.x+x < 1 || activePiece.y+y < 1 ||
                passiveBlocks.find(el => el.x === activePiece.x+x && el.y === activePiece.y+y);
        }
    }

    function placePiece() {
        let pieceData = pieces.find(el => el.name === activePiece.piece).rotations[activePiece.rotation];
        let x = activePiece.x;
        let y = activePiece.y;
        // let activeBlocks = blocksFromPiece(activePiece.x, activePiece.y, activePiece.piece, activePiece.rotation);
        const color = pieces.find(el => el.name === activePiece.piece).color;
        //Add all blocks of active Piece to passiveBlocks array
        for (let i=0;i<pieceData.length;i++) {
            passiveBlocks.push({x: x+pieceData[i][0], y: y+pieceData[i][1], color: color});
        }
        //Check for T-spin
        let tSpin = false;
        if (activePiece.piece === "T") {
            switch (activePiece.rotation) {
                //2 blocks in the 'armpit'                                        and 1 on the flat side
                case 0: if ((blockAtRelPos(0,0) && blockAtRelPos(-2,0) && (blockAtRelPos(-2,-2) || blockAtRelPos(0,-2))) ||
                    //2 blocks on the flat side,
                    blockAtRelPos(-2,-2) && blockAtRelPos(0,-2) &&
                    //1 in an armpit and cant move
                        ((blockAtRelPos(0,0) && blockAtRelPos(-3,-1)) || (blockAtRelPos(-2,0) && blockAtRelPos(1,-1)))) tSpin = true;
                    break;
                case 1: if (blockAtRelPos(0,0) && blockAtRelPos(0,-2) && (blockAtRelPos(-2,0) || blockAtRelPos(-2,-2)) ||
                    blockAtRelPos(-2,0) && blockAtRelPos(-2,-2) &&
                        ((blockAtRelPos(0,0) && blockAtRelPos(-1,-3)) || (blockAtRelPos(0,-2) && blockAtRelPos(-1,1)))) tSpin = true;
                    break;
                case 2: if (blockAtRelPos(-2,-2) && blockAtRelPos(0,-2) && (blockAtRelPos(0,0) || blockAtRelPos(-2,0)) ||
                    blockAtRelPos(0,0) && blockAtRelPos(-2,0) &&
                        ((blockAtRelPos(-2,-2) && blockAtRelPos(1,-1)) || (blockAtRelPos(0,-2) && blockAtRelPos(-3,-1)))) tSpin = true;
                    break;
                case 3: if (blockAtRelPos(-2,0) && blockAtRelPos(-2,-2) && (blockAtRelPos(0,0) || blockAtRelPos(0,-2)) ||
                    blockAtRelPos(0,0) && blockAtRelPos(0,-2) &&
                        ((blockAtRelPos(-2,0) && blockAtRelPos(-1,-3)) || (blockAtRelPos(-2,-2) && blockAtRelPos(-1,1)))) tSpin = true;
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
            dropInstantly();
        }
        held = false;
        renderHold();
    }

    function startTimeout() {
        tup = setTimeout(function(){
            clearInterval(tudp);
            if (checkCollision("down")) {
                placePiece();
            } else {
                tup = null;
            }
        },settings.tup);
    }

    function pause() {
        gamePaused = !gamePaused;
        if (gamePaused) {
            startButton.html("Continue");
        } else {
            startButton.html("Pause");
        }
    }

    function start() {
        startButton.html("Pause");
        startButton.after("<button id=\"restartButton\" class=\"button\">Restart</button>");
        restartButton = $("#restartButton");
        startGame();
        restartButton.click(function(){
            restart();
        })
    }

    startButton.click(function (){
        if (!gameRunning) {
            start();
        } else {
            pause();
        }
    });

    function restart() {
        sevenBag = [];
        startGame();
    }
})