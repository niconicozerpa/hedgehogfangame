import { createMainCharacter } from "./character.mjs";

const sonic = createMainCharacter(25, 100);


function initGame(actions) {
    return function() {
        sonic.nextFrame(actions);
    };
    
}

const toExport = {
    mainChar: sonic,
    initGame
}


export default toExport;