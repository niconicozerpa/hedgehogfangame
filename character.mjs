import { WORLD_WIDTH, FLOOR_Y_POS } from "./config.mjs";

export const Actions = {
    LEFT: 0,
    RIGHT: 1,
    DOWN: 2,
    UP: 3,
    JUMP: 4
}

export const Positions = {
    STAND_UP: 0,
    JUMPING: 1,
    ROLLING: 2,
    SPINDASH: 3
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
        topRunSpeedX: 6,
        topSpeedX: 8,

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
    rollDecel = 0.125;
    topRunSpeedX;
    topSpeedX;
    airAccel;
    jumpForce;
    gravity = 0.21875;
    direction = Actions.RIGHT;
    position = Positions.STAND_UP;
    isSkidding = false;
    collisionPoints;
    jumpingCollisionPoints;
    lookingTo = null;
    spindashCount = 0;

    constructor({
        x, y,
        width, height,
        accel,
        decel,
        topRunSpeedX,
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
        this.topRunSpeedX = topRunSpeedX;
        this.topSpeedX = topSpeedX;
        this.airAccel = airAccel;
        this.jumpForce = jumpForce;
        this.collisionPoints = collisionPoints;
        this.jumpingCollisionPoints = jumpingCollisionPoints;
    }

    #pushX(direction = Actions.RIGHT) {
        this.direction = direction;

        const accel = Positions.JUMPING === this.position ? this.airAccel : this.accel;
        
        if (direction === Actions.LEFT && this.speedX > 0) {
            if (!this.isSkidding) {
                this.isSkidding = this.speedX >= 4;
            }
            this.speedX -= this.decel;
        } else if (direction === Actions.RIGHT && this.speedX < 0) {
            if (!this.isSkidding) {
                this.isSkidding = this.speedX <= -4;
            }
            this.speedX += this.decel;
        } else {
            this.isSkidding = false;
            this.speedX = Math.min(Math.abs(this.speedX) + accel, this.topRunSpeedX);
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

        if (this.speedX === 0 && this.position === Positions.ROLLING) {
            this.position = Positions.STAND_UP;
        }
    }
    
    #moveY() {
        const maxY = FLOOR_Y_POS;

        this.speedY += this.gravity;

        const collisionPoints = this.getCollisionPoints();

        let leftBottomY = [this.speedY, this.y, collisionPoints.leftBottom[1]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);
        let rightBottomY = [this.speedY, this.y, collisionPoints.rightBottom[1]].map(x => parseFloat(x)).reduce((acc, n) => acc + n, 0);

        const origPosition = this.position;

        if (leftBottomY + 1 >= maxY) {
            if (origPosition === Positions.JUMPING) {
                this.position = Positions.STAND_UP;
                this.y = maxY - this.collisionPoints.leftBottom[1] - 1;
            } else {
                this.y = maxY - collisionPoints.leftBottom[1] - 1;
            }
            this.speedY = 0;
        } if (rightBottomY + 1 >= maxY) {
            if (origPosition === Positions.JUMPING) {
                this.position = Positions.STAND_UP;
                this.y = maxY - this.collisionPoints.rightBottom[1] - 1;
            } else {
                this.y = maxY - collisionPoints.rightBottom[1] - 1;
            }
            this.speedY = 0;        
        } else {
            this.y += this.speedY;
        }
    }

    #spindash() {

        let dashSpeed = 8 + Math.floor(this.spindashCount) / 2;
        if (this.direction === Actions.LEFT) {
            dashSpeed *= -1;
        }

        this.speedX += dashSpeed;
        this.#startRolling();
        this.#collisionMoveX();
    }

    #startRolling() {
        const maxYNow = Math.max(this.collisionPoints.leftBottom[1], this.collisionPoints.rightBottom[1]);
        const maxYRoll = Math.max(this.jumpingCollisionPoints.leftBottom[1], this.jumpingCollisionPoints.rightBottom[1]);

        this.y += Math.max(maxYRoll, maxYNow) - Math.min(maxYRoll, maxYNow);

        this.position = Positions.ROLLING;
    }

    nextFrame(actions) {

        const jumping = actions.has(Actions.JUMP);
        let direction = null;

        if (actions.has(Actions.LEFT)) {
            direction = Actions.LEFT;
        }
        if (actions.has(Actions.RIGHT)) {
            direction = Actions.RIGHT;
        }

        if (jumping && this.position !== Positions.JUMPING) {

            if (actions.has(Actions.DOWN)) {
                if (this.position !== Positions.SPINDASH) {
                    this.position = Positions.SPINDASH;
                    this.spindashCount = -1;
                }
            } else {
                this.position = Positions.JUMPING;
                this.speedY -= this.jumpForce;
            }
        }

        if (this.position === Positions.SPINDASH) {
            if (!actions.has(Actions.DOWN)) {
                this.#spindash();
            }
            if (jumping) {
                this.spindashCount = Math.min(8, this.spindashCount + 2);
            } else {
                this.spindashCount -= Math.floor(this.spindashCount / 0.125) / 256;
            }
        }

        if (this.position === Positions.JUMPING && !jumping) {
            this.speedY = Math.max(-4, this.speedY);
        }

        if (actions.has(Actions.DOWN) && this.position === Positions.STAND_UP && Math.abs(this.speedX) >= 0.5) {
            this.#startRolling();
        }

        if ([Actions.LEFT, Actions.RIGHT].includes(direction) && ![Positions.ROLLING, Positions.SPINDASH].includes(this.position)) {
            this.#pushX(direction);
        } else {

            if (this.speedX !== 0) {

                let friction = this.friction / (this.position === Positions.ROLLING ? 2 : 1);

                if (this.speedX > 0 && direction === Actions.LEFT
                    || this.speedX <0 && direction === Actions.RIGHT
                ) {
                    friction += this.rollDecel;
                }

                if (this.speedX > 0) {
                    this.speedX = Math.max(0, this.speedX - friction);
                } else if (this.speedX < 0) {
                    this.speedX = Math.min(0, this.speedX + friction);
                }

                this.#collisionMoveX();
            }
        }

        this.#moveY();

        if (this.position != Positions.SPINDASH && this.speedX === 0 && actions.has(Actions.DOWN)) {
            this.lookingTo = Actions.DOWN;
        } else if (this.position != Positions.SPINDASH && this.speedX === 0 && actions.has(Actions.UP)) {
            this.lookingTo = Actions.UP;
        } else {
            this.lookingTo = null;
        }
    }

    getCollisionPoints() {
        return [Positions.ROLLING, Positions.JUMPING].includes(this.position) ? this.jumpingCollisionPoints : this.collisionPoints;
    }
}