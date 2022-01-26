import { createMainCharacter } from "./character.mjs";

const sonic = createMainCharacter(200, 136);


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