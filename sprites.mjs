import sonicURL from "./assets/sonic.webp";

const speedAnimation = (val, speedX) => Math.floor(Math.max(0, val - Math.abs(speedX)));

export const sonicSprites = {
    fileName: sonicURL,
    width: 59,
    height: 59,
    idle: function(step) {
        if (step === 0) {
            return { offsetX: 0, offsetY: 0, duration: 180 };
        } else if (step === 1) {
            return { offsetX: 0, offsetY: 7, duration: 6 };
        } else if (step === 2) {
            return { offsetX: 1, offsetY: 7, duration: 30 };
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

            return { offsetX, offsetY: 7, duration };
        } else if (step === 27) {
            return { offsetX: 5, offsetY: 7, duration: 6 };
        } else {
            return { offsetX: 6 + (step % 2 === 0), offsetY: 7, duration: 18 };
        }
    },
    walking: [0, 1, 2, 3, 4, 5, 6, 7].map(function(number) {
        return { offsetX: number, offsetY: 1, duration: speedAnimation.bind(null, 8) }
    }),
    running: [0, 1, 2, 3].map(function(number) {
        return { offsetX: number, offsetY: 2, duration: speedAnimation.bind(null, 8) }
    }),
    rolling: [0, 1, 2, 3, 4, 5, 6, 7].map(function(number) {
        return { offsetX: number, offsetY: 4, duration: speedAnimation.bind(null, 4) }
    }),
    skidding: [
        ...[0, 1, 2].map(number => ({ offsetX: number, offsetY: 3, duration: 8 })),
        { offsetX: 3, offsetY: 3, duration: Infinity }
    ],

    lookUp: [
        { offsetX: 0, offsetY: 6, duration: 4 },
        { offsetX: 1, offsetY: 6, duration: Infinity }
    ],
    lookDown: [
        { offsetX: 0, offsetY: 5, duration: 4 },
        { offsetX: 1, offsetY: 5, duration: Infinity }
    ]
};