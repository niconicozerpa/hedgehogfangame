import { createMainCharacter, Character, Actions } from "./character.mjs";

const sonic = createMainCharacter(25, 100);


function initGame(keys) {
    return function() {

        let direction = null;

        if (keys.has(Actions.LEFT)) {
            direction = Actions.LEFT;
        } else if (keys.has(Actions.RIGHT)) {
            direction = Actions.RIGHT;
        }

        sonic.nextFrame(direction, keys.has(Actions.JUMP));
    };
    
}

const toExport = {
    mainChar: sonic,
    initGame
}


export default toExport;