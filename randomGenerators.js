const pieceBag = ["I", "J", "L", "T", "S", "Z", "O"];

function* trueRandom() {
    while (true) {
        yield pieceBag[Math.floor(Math.random() * pieces.length)];
    }
}

function* classic() {
    let lastPiece;

    while (true) {
        let piece = pieceBag[Math.floor(Math.random() * pieces.length)];
        // noinspection JSUnusedAssignment
        if (piece === lastPiece) {
            piece = pieceBag[Math.floor(Math.random() * pieces.length)];
        }
        lastPiece = piece;
        yield piece;
    }
}

let sevenBag = [];

function* bag(bagAmount) {
    while (true) {
        if (sevenBag.length < 1) {
            let executeAmount = 1;
            if (bagAmount === 14) executeAmount = 2;
            for (let i=0;i<executeAmount;i++) {
                pieceBag.forEach(el => {
                    sevenBag.push(el);
                })
            }
        }
        let piece = sevenBag[Math.floor(Math.random() * sevenBag.length)]
        sevenBag.splice(sevenBag.indexOf(piece),1);
        yield piece;
    }
}

function* tgm() {
    let piece = ['I', 'J', 'L', 'T'][Math.floor(Math.random() * 4)];
    yield piece;

    let history = ['S', 'Z', 'S', piece];

    while (true) {
        for (let roll = 0; roll < 4; ++roll) {
            piece = pieceBag[Math.floor(Math.random() * 7)];
            if (history.includes(piece) === false) break;
        }
        history.shift();
        history.push(piece);
        yield piece;
    }
}

function* tgm2() {
    /*
    Not listed here is Tetris the Grandmaster 2.
    TGM2 hits the sweet spot between tgm1 and tgm3 in terms of predictability from the perspective of many fans.
    It increases the number of rolls to avoid dealing a piece in the 4-piece long history from 4 to 6. Essentially,
    it decreases the odds of a "history duplicate" from ~10% to 3%. With a 1 piece preview, it encourages a very unique type of planning,
    where you know what piece you need to prepare for immediately (at high speeds this means holding inputs before it even enters the play field),
    and also know with almost certainty the next piece is going to be 1 of 4 pieces. Unlike bag systems where the duplicate chance is 2% every 7
    pieces here it's only 1% constantly, and the chance of drought is also much lower than bag. The chance of a 10 piece drought for I pieces
    is almost 0, but you're basically guaranteed to have a random unpleasant drought of 11-13 pieces in a long enough bag7 game. This strongly
    encourages you to use the hold mechanic strategically for safety, breaking flow and speed.
    This may all seem academic, and it is very important for the type of high speed games tgm is, but it really is the biggest thing I miss playing
    modern tetris games. Barring other gimmicks, you build and plan the exact same way in every modern tetris game. With the ever present hold mechanic
    to switch out a piece, you don't even need multiple piece previews that some new games give you. Consider, after playing 3 pieces, you know with
    certainty the next 4. With the hold plus 1 piece preview, you spend over half your time in the second half of the bag knowing the next three pieces.
     */
}

function* tgm3() {
    let order = [];

    // Create 35 pool.
    let pool = pieceBag.concat(pieceBag, pieceBag, pieceBag, pieceBag);

    // First piece special conditions
    const firstPiece = ['I', 'J', 'L', 'T'][Math.floor(Math.random() * 4)];
    yield firstPiece;

    let history = ['S', 'Z', 'S', firstPiece];

    while (true) {
        let roll;
        let i;
        let piece;

        // Roll For piece
        for (roll = 0; roll < 6; ++roll) {
            i = Math.floor(Math.random() * 35);
            piece = pool[i];
            if (history.includes(piece) === false || roll === 5) {
                break;
            }
            if (order.length) pool[i] = order[0];
        }

        // Update piece order
        if (order.includes(piece)) {
            order.splice(order.indexOf(piece), 1);
        }
        order.push(piece);

        pool[i] = order[0];

        // Update history
        history.shift();
        history[3] = piece;

        yield piece;
    }
}

function* gameBoy() {
    //https://harddrop.com/wiki/Tetris_(Game_Boy)#Randomizer
}

function* bastet() {
    //https://github.com/fph/bastet/
}

//Possibly more bags to add: https://news.ycombinator.com/item?id=20872110