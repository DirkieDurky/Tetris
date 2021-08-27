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

    function drawTetromino(ctx = pfCtx,x = activeTetromino.x,y = activeTetromino.y,tetromino = activeTetromino.tetromino,
                           rotation = activeTetromino.rotation,color,opacity = 100){
        let tetrominoData = tetrominoes.find(el => el.name === tetromino);
        console.log(x);
        let tetrominoRotation = tetrominoData.rotations[rotation];
        if (typeof color === "undefined") {
            color = tetrominoData.color;
        }

        for (let i=0;i<tetrominoRotation.length;i++) {
            drawBlock(ctx,x+tetrominoRotation[i][0],y+tetrominoRotation[i][1],color,opacity);
        }
    }

    function setOffset(tetromino) {
        let result = {
            y:0,
            x:0
        };

        switch (tetromino) {
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
            let tetrominoData = tetrominoes.find(el => el.name === hold);
            const tetrominoRotation = tetrominoData.rotations[0];
            const offsetX = 4;
            const offsetY = 3;

            let color;
            if (held) {
                color = settings.heldColor
            } else {
                color = tetrominoData.color;
            }

            const offset = setOffset(hold);

            for (let i=0;i<tetrominoRotation.length;i++) {
                drawBlock(hbCtx, offsetX + offset.x + tetrominoRotation[i][0], offsetY + offset.y + tetrominoRotation[i][1],color);
            }
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
            let color = tetrominoData.color;

            const offset = setOffset(numberToTetromino(tetromino));

            for (let i=0;i<tetrominoRotation.length;i++) {
                drawBlock(nbCtx, offsetX + offset.x + tetrominoRotation[i][0], offsetY + offset.y + tetrominoRotation[i][1],color);
            }
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
            drawTetromino(undefined,undefined, ghostTetromino.y, undefined, undefined, settings.ghostPieceColor, settings.ghostPieceOpacity);
        }
        drawTetromino();
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

    function checkOutOfBounds(x,y,tetromino,rotation) {
        let tetrominoRotation = tetrominoes.find(el => el.name === tetromino).rotations[rotation];
        let outOfBounds = false;
        for (let i=0;i<tetrominoRotation.length;i++) {
            if (x+tetrominoRotation[i][0] < 1) outOfBounds = true; else
            if (x+tetrominoRotation[i][0] > settings.pfGridW) outOfBounds = true; else
            if (y+tetrominoRotation[i][1] < 1) outOfBounds = true; else
            if (settings.topCollision) {
                if (y+tetrominoRotation[i][1] > settings.pfGridH) outOfBounds = true;
            }
        }
        return outOfBounds;
    }

    function checkBlockCollision(x,y,tetromino,rotation) {
        let tetrominoRotation = tetrominoes.find(el => el.name === tetromino).rotations[rotation];
        for (let i=0;i<tetrominoRotation.length;i++) {
            if (blockAtPos(x+tetrominoRotation[i][0],y+tetrominoRotation[i][1])) return true;
        }
    }

    function checkCollision(mode, x = activeTetromino.x, y = activeTetromino.y, tetromino = activeTetromino.tetromino, rotation = activeTetromino.rotation){
        let tetrominoRotations = tetrominoes.find(el => el.name === tetromino).rotations[rotation];
        let VirtRotation;
        switch (mode) {
            case "down":
                for (let i=0;i<tetrominoRotations.length;i++) if (y+tetrominoRotations[i][1]-1 < 1) return true;
                if (checkBlockCollision(x,y-1,tetromino,rotation)) return true;
                break;
            case "left":
                for (let i=0;i<tetrominoRotations.length;i++) if (x+tetrominoRotations[i][0]-1 < 1) return true;
                if (checkBlockCollision(x-1,y,tetromino,rotation)) return true;
                break;
            case "right":
                for (let i=0;i<tetrominoRotations.length;i++) if (x+tetrominoRotations[i][0]+1 > settings.pfGridW) return true;
                if (checkBlockCollision(x+1,y,tetromino,rotation)) return true;
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
                dropInstantly();
            }
        }, settings.das);
    }

    let softDrop;
    $(document).keydown(function (e) {
        let keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode === settings.controls.restart) {
            if (!gameRunning) {
                startButton.html("Pause");
                startButton.after("<button id=\"restartButton\" class=\"button\">Restart</button>");
                const restartButton = $("#restartButton");
                restartButton.click(function(){
                    startGame();
                })
            }
            startGame();
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
                            activeTetromino.x++;
                            dropInstantly();
                            render();
                            clearTimeout(timeout[settings.controls.moveLeft]);
                            clearInterval(interval[settings.controls.moveLeft]);
                        }, "right");
                        return true;
                    case settings.controls.moveLeft:
                        das(keycode, function () {
                            if (checkCollision("left")) return;
                            activeTetromino.x--;
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
                                activeTetromino.y--;
                                render();
                            }, settings.sds);
                        } else {
                            softDropHeld = true;
                            dropInstantly();
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
        }
    })

    function dropInstantly() {
        if (settings.sds < 1) {
            if (softDropHeld) {
                while (!checkCollision("down")) {
                    activeTetromino.y--;
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
            startButton.html("Start");
            if (settings.autoRestart) {
                startGame();
            } else {
                // noinspection JSUnresolvedVariable
                restartButton.remove();
            }
        }

        if (heldSide.length !== 0) {
            moveInstantly(heldSide[0])
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
                }
            }, dropRepeatRate)
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
        let tetrominoData = tetrominoes.find(el => el.name === activeTetromino.tetromino).rotations[activeTetromino.rotation];
        let x = activeTetromino.x;
        let y = activeTetromino.y;
        // let activeBlocks = blocksFromTetromino(activeTetromino.x, activeTetromino.y, activeTetromino.tetromino, activeTetromino.rotation);
        const color = tetrominoes.find(el => el.name === activeTetromino.tetromino).color;
        //Add all blocks of active Tetromino to passiveBlocks array
        for (let i=0;i<tetrominoData.length;i++) {
            passiveBlocks.push({x: x+tetrominoData[i][0], y: y+tetrominoData[i][1], color: color});
        }
        //Check for T-spin
        let tSpin = false;
        if (activeTetromino.tetromino === "T") {
            switch (activeTetromino.rotation) {
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
                placeTetromino();
            } else {
                tup = null;
            }
        },settings.tup);
    }

    startButton.click(function (){
        if (!gameRunning) {
            startButton.html("Pause");
            startButton.after("<button id=\"restartButton\" class=\"button\">Restart</button>");
            const restartButton = $("#restartButton");
            startGame();
            restartButton.click(function(){
                startGame();
            })
        } else {
            gamePaused = !gamePaused;
            if (gamePaused) {
                startButton.html("Continue");
            } else {
                startButton.html("Pause");
            }
        }
    });
})