import * as Chr from "./character.mjs";

const sonic = Chr.createMainCharacter(25, 100);


function initGame(keys) {
    return function() {

        let direction = null;

        if (keys.has(Chr.LEFT)) {
            direction = Chr.LEFT;
        } else if (keys.has(Chr.RIGHT)) {
            direction = Chr.RIGHT;
        }

        Chr.nextFrame(sonic, direction, keys.has(Chr.JUMP));
    };
    
}

const toExport = {
    mainChar: sonic,
    initGame,
    getCollisionPoints: Chr.getCollisionPoints,
    LEFT: Chr.LEFT,
    RIGHT: Chr.RIGHT,
    JUMP: Chr.JUMP
}


export default toExport;