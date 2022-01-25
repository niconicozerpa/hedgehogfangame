import sonicURL from "./assets/sonic.webp";

const speedAnimation = (val, speedX) => Math.floor(Math.max(0, val - Math.abs(speedX)));

class Sprite {
    position;
    centerOffset;
    duration;
    #dimensions = null;

    constructor([dimensionsWidth, dimensionsHeight], [positionX, positionY], duration = Infinity, [centerOffsetX, centerOffsetY] = [50, 50]) {
        this.position = [positionX, positionY],
        this.centerOffset = [centerOffsetX, centerOffsetY],
        this.duration = duration;
        this.#dimensions = [dimensionsWidth, dimensionsHeight];
    }

    get dimensions() {
        return [
            this.#dimensions[0] + this.centerOffset[0],
            this.#dimensions[1] + this.centerOffset[1]
        ]
    }
}

const sonicDimensions = [59, 59];

export const sonicSprites = {
    fileName: sonicURL,
    idle: (step) => {
        if (step === 0) {
            return new Sprite(sonicDimensions, [0, 0], 180);
        } else if (step === 1) {
            return new Sprite(sonicDimensions, [0, 7 * 59], 6);
        } else if (step === 2) {
            return new Sprite(sonicDimensions, [59, 7 * 59], 30);
        } else if (step <= 26) {

            let offsetX;
            let duration;
            if ((step + 6) % 8 === 0) {
                offsetX = 4;
                duration = 60;
            } else {
                offsetX = 2 + (step % 2 === 0);
                duration = 42;
            }

            return new Sprite(sonicDimensions, [offsetX * 59, 7 * 59], duration);
        } else if (step === 27) {
            return new Sprite(sonicDimensions, [5 * 59, 7 * 59], 6);
        } else {
            return new Sprite(sonicDimensions, [(6 + (step % 2 === 0)) * 59, 7 * 59], 18);
        }
    },
    walking: [0, 1, 2, 3, 4, 5, 6, 7].map(number => new Sprite(sonicDimensions, [number * 59, 59], speedAnimation.bind(null, 8))),
    running: [0, 1, 2, 3].map(number => new Sprite(sonicDimensions, [number * 59, 2 * 59], speedAnimation.bind(null, 8))),
    rolling: [0, 1, 2, 3, 4, 5, 6, 7].map(number => new Sprite(sonicDimensions, [number * 59, 4 * 59], speedAnimation.bind(null, 4))),
    skidding: [
        ...[0, 1, 2].map(number => new Sprite(sonicDimensions, [number * 59, 3 * 59], 8)),
        new Sprite(sonicDimensions, [2 * 59, 3 * 59])
    ],

    lookUp: [
        new Sprite(sonicDimensions, [0, 59 * 6], 4),
        new Sprite(sonicDimensions, [59, 59 * 6])
    ],
    lookDown: [
        new Sprite(sonicDimensions, [0, 59 * 5], 4),
        new Sprite(sonicDimensions, [59, 59 * 5])
    ],
    spindash: [0, 1, 2, 3, 4,]
        .map(number => new Sprite(sonicDimensions, [59 * number, 59 * 8], 1))
        .reduce((acc, item) => {
            acc.push(item);
            acc.push(new Sprite(sonicDimensions, [59 * 5, 59 * 8], 1));
            return acc;
        }, [])
};