import { WORLD_WIDTH, FLOOR_Y_POS } from "./config.mjs";

export const Actions = {
    LEFT: 0,
    RIGHT: 1,
    JUMP: 2
}

export const Positions = {
    STAND_UP: 0,
    JUMPING: 1,
    ROLLING: 2
}

class CollisionPoints {
    leftTop;
    left;
    leftBottom;
    rightTop;
    right;
    rightBottom;

    constructor({ leftTop, left, leftBottom, rightTop, right, rightBottom }) {
        this.leftTop = leftTop;
        this.left = left;
        this.leftBottom = leftBottom;
        this.rightTop = rightTop;
        this.right = right;
        this.rightBottom = rightBottom;
    }
}


export function createMainCharacter(x, y) {
    return new Character({
        x: x,
        y: y,
        width: 19,
        height: 39,
        accel: 0.046875,
        decel: 0.5,
        airAccel: 0.09375,
        jumpForce: 6.5,
        topSpeedX: 6,

        collisionPoints: new CollisionPoints({
            leftTop: [-9, -19],
            left: [-10, 0],
            leftBottom: [-9, 19],

            rightTop: [9, -19],
            right: [10, 0],
            rightBottom: [9, 19]
        }),

        jumpingCollisionPoints: new CollisionPoints({
            leftTop: [-7, -14],
            left: [-10, 0],
            leftBottom: [-7, 14],

            rightTop: [7, -14],
            right: [10, 0],
            rightBottom: [7, 14]
        })
    });
}


export class Character {
    x;
    y;
    speedX = 0;
    speedY = 0;
    width;
    height;
    accel;
    decel;
    friction = 0.046875;
    topSpeedX;
    airAccel;
    jumpForce;
    gravity = 0.21875;
    animationCount = 0;
    changeAnimation = false;
    direction = Actions.RIGHT;
    position = Positions.STAND_UP;
    collisionPoints;
    jumpingCollisionPoints;

    constructor({
        x, y,
        width, height,
        accel,
        decel,
        topSpeedX,
        airAccel,
        jumpForce,
        collisionPoints,
        jumpingCollisionPoints
    }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.accel = accel;
        this.decel = decel;
        this.topSpeedX = topSpeedX;
        this.airAccel = airAccel;
        this.jumpForce = jumpForce;
        this.collisionPoints = collisionPoints;
        this.jumpingCollisionPoints = jumpingCollisionPoints;
    }

    #moveX(direction = Actions.RIGHT) {
        this.direction = direction;

        const accel = this.position === Positions.JUMPING ? this.airAccel : this.accel;
        
        if (direction === Actions.LEFT && this.speedX > 0) {
            this.speedX -= this.decel;
        } else if (direction === Actions.RIGHT && this.speedX < 0) {
            this.speedX += this.decel;
        } else {
            this.speedX = Math.min(Math.abs(this.speedX) + accel, this.topSpeedX);
            if (direction === Actions.LEFT) {
                this.speedX *= -1;
            }
        }

        this.#collisionMoveX();
    }

    #collisionMoveX() {
        const collisionPoints = this.getCollisionPoints();

        let collision = false;

        const minX = 0;
        const maxX = WORLD_WIDTH;

        const leftTopX = [this.x, collisionPoints.leftTop[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
        const leftX = [this.x, collisionPoints.left[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
        const leftBottomX = [this.x, collisionPoints.leftBottom[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);

        const rightTopX = [this.x, collisionPoints.rightTop[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
        const rightX = [this.x, collisionPoints.right[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
        const rightBottomX = [this.x, collisionPoints.rightBottom[0]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);

        if (this.speedX < 0) {

            if (leftTopX <= minX) {
                collision = true;
                this.speedX = 0;
                this.x = minX - parseInt(collisionPoints.leftTop[0]);
            }

            if (leftX <= minX) {
                collision = true;
                this.speedX = 0;
                this.x = minX - parseInt(collisionPoints.left[0]);
            }

            if (leftBottomX <= minX) {
                collision = true;
                this.speedX = 0;
                this.x = minX - parseInt(collisionPoints.leftBottom[0]);
            }
        }

        if (this.speedX > 0) {

            if (rightTopX >= maxX) {
                collision = true;
                this.speedX = 0;
                this.x = maxX - parseInt(collisionPoints.rightTop[0]);
            }

            if (rightX >= maxX) {
                collision = true;
                this.speedX = 0;
                this.x = maxX - parseInt(collisionPoints.right[0]);
            }

            if (rightBottomX >= maxX) {
                collision = true;
                this.speedX = 0;
                this.x = maxX - parseInt(collisionPoints.rightBottom[0]);
            }
        }

        

        if (!collision) {
            this.x += this.speedX;
        }
    }
    
    #moveY() {
        const maxY = FLOOR_Y_POS;

        this.speedY += this.gravity;

        const collisionPoints = this.getCollisionPoints();

        let leftBottomY = [this.speedY, this.y, collisionPoints.leftBottom[1]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
        let rightBottomY = [this.speedY, this.y, collisionPoints.rightBottom[1]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);


        if (leftBottomY + 1 >= maxY) {
            if (this.position === Positions.JUMPING) {
                this.position = Positions.STAND_UP;
            }
            this.y = maxY - collisionPoints.leftBottom[1] - 1;
            this.speedY = 0;
        } if (rightBottomY + 1 >= maxY) {
            if (this.position === Positions.JUMPING) {
                this.position = Positions.STAND_UP;
            }
            this.y = maxY - collisionPoints.rightBottom[1] - 1;
            this.speedY = 0;        
        } else {
            this.y += this.speedY;
        }
    }

    nextFrame(direction = null, jumping = false) {
        if (this.speedX === 0 && this.position !== Positions.JUMPING) {
            this.animationCount = 0;
        }

        if (jumping && this.position !== Positions.JUMPING) {
            this.position = Positions.JUMPING;
            this.speedY -= this.jumpForce;
        }

        if (this.position === Positions.JUMPING && !jumping) {
            this.speedY = Math.max(-4, this.speedY);
        }

        if ([Actions.LEFT, Actions.RIGHT].includes(direction)) {
            this.#moveX(direction);
        } else {

            if (this.speedX !== 0) {
                if (this.speedX > 0) {
                    this.speedX = Math.max(0, this.speedX - this.friction);
                } else if (this.speedX < 0) {
                    this.speedX = Math.min(0, this.speedX + this.friction);
                }

                this.#collisionMoveX();
            }
        }

        this.changeAnimation = false;

        if (this.speedX != 0 || this.position === Positions.JUMPING) {
            let duration;

            if (this.position === Positions.JUMPING) {
                duration = Math.floor(Math.max(0, 4 - Math.abs(this.speedX)));
            } else {
                duration = Math.floor(Math.max(0, 6 - Math.abs(this.speedX)));
            }

            if (this.animationCount > duration) {
                this.animationCount = 0;
                this.changeAnimation = true;
            } else {
                this.animationCount++;
            }
        }

        this.#moveY();
    }

    getCollisionPoints() {
        return this.position === Positions.JUMPING ? this.jumpingCollisionPoints : this.collisionPoints;
    }
}