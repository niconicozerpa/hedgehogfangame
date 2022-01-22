import { WORLD_WIDTH, FLOOR_Y_POS } from "./config.mjs";

export function createMainCharacter(x, y) {
    return {
        x: x,
        y: y,
        speedX: 0,
        speedY: 0,
        width: 19,
        height: 39,
        accel: 0.046875,
        decel: 0.5,
        friction: 0.046875,
        topSpeedX: 6,
        airAccel: 0.09375,
        jumpForce: 6.5,
        gravity: 0.21875,
        animationCount: 0,
        changeAnimation: false,
        direction: RIGHT,
        isJumping: false,

        collisionPoints: {
            leftTop: [-9, -19],
            left: [-10, 0],
            leftBottom: [-9, 19],

            rightTop: [9, -19],
            right: [10, 0],
            rightBottom: [9, 19]
        },

        jumpingCollisionPoints: {
            leftTop: [-7, -14],
            left: [-10, 0],
            leftBottom: [-7, 14],

            rightTop: [7, -14],
            right: [10, 0],
            rightBottom: [7, 14]
        }
    };
}


export const [LEFT, RIGHT, JUMP] = [0, 1, 2];

function moveX(character, direction = RIGHT) {

    character.direction = direction;

    const accel = character.isJumping ? character.airAccel : character.accel;
    
    if (direction === LEFT && character.speedX > 0) {
        character.speedX -= character.decel;
    } else if (direction === RIGHT && character.speedX < 0) {
        character.speedX += character.decel;
    } else {
        character.speedX = Math.min(Math.abs(character.speedX) + accel, character.topSpeedX);
        if (direction === LEFT) {
            character.speedX *= -1;
        }
    }

    collisionMoveX(character);
}

function collisionMoveX(character) {
    const collisionPoints = getCollisionPoints(character);

    let collision = false;

    const minX = 0;
    const maxX = WORLD_WIDTH;

    const leftTopX = [character.x, collisionPoints.leftTop[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
    const leftX = [character.x, collisionPoints.left[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
    const leftBottomX = [character.x, collisionPoints.leftBottom[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);

    const rightTopX = [character.x, collisionPoints.rightTop[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
    const rightX = [character.x, collisionPoints.right[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
    const rightBottomX = [character.x, collisionPoints.rightBottom[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);


    if (character.speedX < 0) {

        if (leftTopX <= minX) {
            collision = true;
            character.speedX = 0;
            character.x = minX - parseInt(collisionPoints.leftTop[0]);
        }

        if (leftX <= minX) {
            collision = true;
            character.speedX = 0;
            character.x = minX - parseInt(collisionPoints.left[0]);
        }

        if (leftBottomX <= minX) {
            collision = true;
            character.speedX = 0;
            character.x = minX - parseInt(collisionPoints.leftBottom[0]);
        }
    }

    if (character.speedX > 0) {

        if (rightTopX >= maxX) {
            collision = true;
            character.speedX = 0;
            character.x = maxX - parseInt(collisionPoints.rightTop[0]);
        }

        if (rightX >= maxX) {
            collision = true;
            character.speedX = 0;
            character.x = maxX - parseInt(collisionPoints.right[0]);
        }

        if (rightBottomX >= maxX) {
            collision = true;
            character.speedX = 0;
            character.x = maxX - parseInt(collisionPoints.rightBottom[0]);
        }
    }

    

    if (!collision) {
        character.x += character.speedX;
    }
}

function moveY(character) {
    const maxY = FLOOR_Y_POS;

    character.speedY += character.gravity;

    const collisionPoints = getCollisionPoints(character);

    let leftBottomY = [character.speedY, character.y, collisionPoints.leftBottom[1]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
    let rightBottomY = [character.speedY, character.y, collisionPoints.rightBottom[1]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);


    if (leftBottomY + 1 >= maxY) {
        if (character.isJumping) {
            character.isJumping = false;
        }
        character.y = maxY - collisionPoints.leftBottom[1] - 1;
        character.speedY = 0;
    } if (rightBottomY + 1 >= maxY) {
        if (character.isJumping) {
            character.isJumping = false;
        }
        character.y = maxY - collisionPoints.rightBottom[1] - 1;
        character.speedY = 0;        
    } else {
        character.y += character.speedY;
    }
}

export function nextFrame(character, direction = null, jumping = false) {

    if (character.speedX === 0 && !character.isJumping) {
        character.animationCount = 0;
    }

    if (jumping && !character.isJumping) {
        character.isJumping = true;
        character.speedY -= character.jumpForce;
    }

    if (character.isJumping && !jumping) {
        character.speedY = Math.max(-4, character.speedY);
    }

    if ([LEFT, RIGHT].includes(direction)) {
        moveX(character, direction);
    } else {

        if (character.speedX !== 0) {
            if (character.speedX > 0) {
                character.speedX = Math.max(0, character.speedX - character.friction);
            } else if (character.speedX < 0) {
                character.speedX = Math.min(0, character.speedX + character.friction);
            }

            collisionMoveX(character);
        }
    }

    character.changeAnimation = false;

    if (character.speedX != 0 || character.isJumping) {
        let duration;

        if (character.isJumping) {
            duration = Math.floor(Math.max(0, 4 - Math.abs(character.speedX)));
        } else {
            duration = Math.floor(Math.max(0, 6 - Math.abs(character.speedX)));
        }

        if (character.animationCount > duration) {
            character.animationCount = 0;
            character.changeAnimation = true;
        } else {
            character.animationCount++;
        }
    }

    moveY(character);
}

export const getCollisionPoints = character => character.isJumping ? character.jumpingCollisionPoints : character.collisionPoints;