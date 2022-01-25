import sonicURL from "./assets/sonic.webp";

const speedAnimation = (val, speedX) => Math.floor(Math.max(0, val - Math.abs(speedX)));

export const sonicSprites = {
    fileName: sonicURL,
    width: 59,
    height: 59,
    idle: [ { offsetX: 0, offsetY: 0, duration: Infinity } ],
    walking: [0, 1, 2, 3, 4, 5, 6, 7].map(function(number) {
        return { offsetX: number, offsetY: 1, duration: speedAnimation.bind(null, 8) }
    }),
    running: [0, 1, 2, 3].map(function(number) {
        return { offsetX: number, offsetY: 2, duration: speedAnimation.bind(null, 8) }
    }),
    rolling: [0, 1, 2, 3, 4, 5, 6, 7].map(function(number) {
        return { offsetX: number, offsetY: 4, duration: speedAnimation.bind(null, 4) }
    }),
    lookUp: [
        { offsetX: 0, offsetY: 6, duration: 4 },
        { offsetX: 1, offsetY: 6, duration: Infinity }
    ],
    lookDown: [
        { offsetX: 0, offsetY: 5, duration: 4 },
        { offsetX: 1, offsetY: 5, duration: Infinity }
    ]
};