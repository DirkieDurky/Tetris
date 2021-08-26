// noinspection JSUnusedGlobalSymbols

function invert(input, min, max) {
    let distance = input - min;
    return max - distance;
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