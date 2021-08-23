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

    function spawnTetromino(tetromino) {
        switch (tetromino) {
            case 1: tetromino = "I";
                break;
            case 2: tetromino = "J";
                break;
            case 3: tetromino = "L";
                break;
            case 4: tetromino = "T";
                break;
            case 5: tetromino = "S";
                break;
            case 6: tetromino = "Z";
                break;
            case 7: tetromino = "O";
                break;
        }
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

    function checkCollision(mode){
        let activeBlocks;
        let rotation;
        switch (mode) {
            case "down":
                activeBlocks = blocksFromTetromino(activeTetromino.x,activeTetromino.y-1,activeTetromino.tetromino,activeTetromino.rotation);
                if (activeBlocks.block1y < 1 || activeBlocks.block2y < 1 || activeBlocks.block3y < 1 || activeBlocks.block4y < 1) return true;
                if (checkBlockCollision(activeTetromino.x,activeTetromino.y-1,activeTetromino.tetromino,activeTetromino.rotation)) return true;
            break;
            case "left":
                activeBlocks = blocksFromTetromino(activeTetromino.x-1,activeTetromino.y,activeTetromino.tetromino,activeTetromino.rotation);
                if (activeBlocks.block1x < 1 || activeBlocks.block2x < 1 || activeBlocks.block3x < 1 || activeBlocks.block4x < 1 ||
                    checkBlockCollision(activeTetromino.x-1,activeTetromino.y,activeTetromino.tetromino,activeTetromino.rotation)) return true;
            break;
            case "right":
                activeBlocks = blocksFromTetromino(activeTetromino.x+1,activeTetromino.y,activeTetromino.tetromino,activeTetromino.rotation);
                if (activeBlocks.block1x > gridW || activeBlocks.block2x > gridW || activeBlocks.block3x > gridW || activeBlocks.block4x > gridW ||
                checkBlockCollision(activeTetromino.x+1,activeTetromino.y,activeTetromino.tetromino,activeTetromino.rotation)) return true;
            break;
            case "rotateCw":
                rotation = rotate(activeTetromino.rotation, "cw");
                if (checkOutOfBounds(activeTetromino.x,activeTetromino.y,activeTetromino.tetromino,rotation) ||
                checkBlockCollision(activeTetromino.x,activeTetromino.y,activeTetromino.tetromino,rotation)) return true;
                break;
            case "rotateCcw":
                rotation = rotate(activeTetromino.rotation, "ccw");
                if (checkOutOfBounds(activeTetromino.x,activeTetromino.y,activeTetromino.tetromino,rotation)||
                    checkBlockCollision(activeTetromino.x,activeTetromino.y,activeTetromino.tetromino,rotation)) return true;
                break;
            case "all":
                if (checkOutOfBounds(activeTetromino.x,activeTetromino.y,activeTetromino.tetromino,activeTetromino.rotation)) return true;
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
        }
        render();
    }

    let down = [];
    let timeout = [];
    let interval = [];

    $(document).keydown(function (e) {
        let keycode = (e.keyCode ? e.keyCode : e.which);

        if (keycode === 68) {
            console.log(activeTetromino.tetromino);
        }
    })

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

    //Gravity
    setInterval(function(){
        if (checkCollision("down")) {
            let activeBlocks = blocksFromTetromino(activeTetromino.x, activeTetromino.y, activeTetromino.tetromino, activeTetromino.rotation);
            const color = tetrominoes.find(el => el.name === activeTetromino.tetromino).color;
            passiveBlocks.push({x: activeBlocks.block1x,y: activeBlocks.block1y,color: color});
            passiveBlocks.push({x: activeBlocks.block2x,y: activeBlocks.block2y,color: color});
            passiveBlocks.push({x: activeBlocks.block3x,y: activeBlocks.block3y,color: color});
            passiveBlocks.push({x: activeBlocks.block4x,y: activeBlocks.block4y,color: color});
            spawnTetromino(Math.floor(Math.random() * tetrominoes.length+1))
        }
        activeTetromino.y--;
        render();
    },invert(settings.gravity,0,10)*10)

    spawnTetromino("L");
})