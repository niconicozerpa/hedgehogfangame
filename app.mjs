import "./styles.css";

import G from "./game.mjs";
import { importImage } from "./media.mjs";
import { WIDTH, WORLD_WIDTH, HEIGHT, FLOOR_Y_POS } from "./config.mjs";


import jumpAudioOGG from "./assets/jump.ogg";
import jumpAudioMP3 from "./assets/jump.mp3";
import rollAudioOGG from "./assets/rolling.ogg";
import rollAudioMP3 from "./assets/rolling.mp3";
import brakeAudioOGG from "./assets/braking.ogg";
import brakeAudioMP3 from "./assets/braking.mp3";
import spindashOGG from "./assets/spindash.ogg";
import spindashMP3 from "./assets/spindash.mp3";
import spindashReleaseOGG from "./assets/spindash_release.ogg";
import spindashReleaseMP3 from "./assets/spindash_release.mp3";
import musicOGG from "./assets/angelisland1.ogg";
import musicMP3 from "./assets/angelisland1.mp3";
import { Actions, Positions } from "./character.mjs";
import { sonicSprites } from "./sprites.mjs";



async function initGame(isTouchScreen = false) {

    const jumpAudio = setupAudioFile(jumpAudioOGG, jumpAudioMP3);
    const rollAudio = setupAudioFile(rollAudioOGG, rollAudioMP3);
    const brakeAudio = setupAudioFile(brakeAudioOGG, brakeAudioMP3);
    const spindashAudio = setupAudioFile(spindashOGG, spindashMP3);
    const spindashReleaseAudio = setupAudioFile(spindashReleaseOGG, spindashReleaseMP3);

    {
        const musicAudio = document.createElement("audio");

        musicAudio.setAttribute("preload", "auto");

        musicAudio.loop = true;
        musicAudio.volume = 1;
        
        const sourceMP3 = document.createElement("source");
        sourceMP3.setAttribute("type", "audio/mp3");
        sourceMP3.setAttribute("src", musicMP3);

        const sourceOGG = document.createElement("source");
        sourceOGG.setAttribute("type", "audio/ogg");
        sourceOGG.setAttribute("src", musicOGG);

        musicAudio.append(sourceOGG);
        document.body.append(musicAudio);

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioTrack = audioContext.createMediaElementSource(musicAudio);

        audioTrack.connect(audioContext.destination);
        musicAudio.play();
    }

    const canvas = document.createElement("canvas");

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    document.body.append(canvas);

    const context = canvas.getContext("2d");
    const sonicImage = await importImage(sonicSprites.fileName);

    const extraImages = {};

    for (const index in sonicSprites.extraImages) {
        extraImages[index] = await importImage(sonicSprites.extraImages[index]);
    }
    

    const keys = (function() {
        const keys = {};
        
        return {
            add(key) {
                keys[key] = Math.floor(Date.now() / 1000);
            },
            has(key) {
               return typeof keys[key] !== "undefined";
            },
            delete(key) {
                delete keys[key];
            },
            get(key) {
                return keys[key];
            }
        }
    })();


    const nextGameFrame = G.initGame(keys);
    
    
    let oldPosition = null;

    let offsetX = 0;

    let animationCount = 0;
    let animationStepNumber = 0;
    let currentAnimation = sonicSprites.idle;
    let lastJumpTime = 0;

    let extraAnimationOffset = 0;
    let extraAnimationCount = 0;

    window.requestAnimationFrame(function reqAnimFrame() {

        nextGameFrame();

        if (oldPosition !== Positions.JUMPING && G.mainChar.position === Positions.JUMPING) {
            playAudioEffect(jumpAudio);
        } else if (oldPosition !== Positions.ROLLING && G.mainChar.position === Positions.ROLLING) {
            playAudioEffect(oldPosition === Positions.SPINDASH ? spindashReleaseAudio : rollAudio);
        } else {
            
            if (G.mainChar.position === Positions.SPINDASH && keys.has(Actions.JUMP) && keys.get(Actions.JUMP) !== lastJumpTime) {
                playAudioEffect(spindashAudio);
                animationStepNumber = 0;
                animationCount = 0;
            }
        }
        lastJumpTime = keys.get(Actions.JUMP);
        oldPosition = G.mainChar.position;


        // Offset
        const screenX = parseInt(G.mainChar.x - offsetX);

        const minX = parseInt(WIDTH / 2 - 10);
        const maxX = parseInt(WIDTH / 2 + 10);

        if (screenX > maxX) {
            offsetX = Math.min(
                WORLD_WIDTH - WIDTH,
                offsetX + screenX - maxX
            );
        } else if (screenX < minX) {
            offsetX = Math.max(
                0,
                offsetX - (minX - screenX)
            );
        }


        // Background
        context.fillStyle = "#222222";
        context.fillRect(0, 0, WORLD_WIDTH, HEIGHT);


        for (let i = 0; i < WORLD_WIDTH; i += 30) {

            const dif = offsetX % 30;

            context.strokeStyle = "#444444";
            context.beginPath();
            context.moveTo(i - dif, 0);
            context.lineTo(i - dif, FLOOR_Y_POS);
            context.stroke();

            context.strokeStyle = "#00AA00";
            context.beginPath();
            context.moveTo(i - dif, FLOOR_Y_POS);
            context.lineTo(i - dif, HEIGHT);
            context.stroke();
        }

        for (let i = 0; i < HEIGHT; i += 30) {

            context.strokeStyle = i < FLOOR_Y_POS ? "#444444" : "#00AA00";
            
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(WORLD_WIDTH, i);
            context.stroke();
        }


        context.strokeStyle = "#00AA00";
            
        context.beginPath();
        context.moveTo(0, FLOOR_Y_POS);
        context.lineTo(WORLD_WIDTH, FLOOR_Y_POS);
        context.stroke();


        // Character
        let animationType = "idle";
        if (G.mainChar.speedX === 0 && G.mainChar.position !== Positions.JUMPING) {
            
            if (G.mainChar.position === Positions.SPINDASH) {
                animationType = "spindash";
            } else if (G.mainChar.lookingTo === Actions.DOWN) {
                animationType = "lookDown";
            } else if (G.mainChar.lookingTo === Actions.UP) {
                animationType = "lookUp";
            }
        } else {
            if ([Positions.JUMPING, Positions.ROLLING].includes(G.mainChar.position)) {
                animationType = "rolling";
            } else if (G.mainChar.isSkidding) {
                animationType = "skidding";
            } else if (Math.abs(G.mainChar.speedX) < G.mainChar.topRunSpeedX) {
                animationType = "walking";
            } else {
                animationType = "running";
            }
        }

        if (currentAnimation != sonicSprites[animationType]) {
            animationCount = -1;
            animationStepNumber = 0;

            switch (animationType) {
                case "skidding":
                    playAudioEffect(brakeAudio);
                    break;
                case "spindash":
                    playAudioEffect(spindashAudio);
                    break;
            }

        }
        
        let animationStep;
        currentAnimation = sonicSprites[animationType];
        if (currentAnimation instanceof Function) {
            animationStep = currentAnimation(animationStepNumber);
        } else {
            animationStep = currentAnimation[animationStepNumber];
        }
        
        let duration = animationStep.duration;
        if (duration instanceof Function) {
            duration = duration(G.mainChar.speedX);
        }


        if (duration !== Infinity) {
            animationCount++;

            if (animationCount >= duration) {
                animationCount = -1;
                animationStepNumber++;

                if (!(currentAnimation instanceof Function) && animationStepNumber >= currentAnimation.length) {
                    animationStepNumber = 0;
                }
            }
        }
            
        const [sonicSpriteOffsetX, sonicSpriteOffsetY] = animationStep.position;
        
        if (G.mainChar.direction == Actions.LEFT) {
            context.save();
            context.scale(-1, 1);
        }

        context.drawImage(
            sonicImage,
            sonicSpriteOffsetX, sonicSpriteOffsetY,
            59, 59,
            Math.round(G.mainChar.direction == Actions.LEFT ? -(G.mainChar.x - (G.mainChar.width - 1) / 2 - 19 - offsetX) - 59 : (G.mainChar.x - (G.mainChar.width - 1) / 2 - 22 - offsetX)),
            Math.round(G.mainChar.y + (G.mainChar.height - 1) / 2 - 50),
            59, 59
        );

        if (animationStep.extraImage) {
            const imageObject = extraImages[animationStep.extraImage.key];
            const [width, height] = animationStep.extraImage.dimensions;
            const [left, top] = animationStep.extraImage.position;

            let drawImageWidth = G.mainChar.x - width + left - offsetX;
            if (G.mainChar.direction === Actions.LEFT) {
                drawImageWidth *= -1;
                drawImageWidth -= G.mainChar.width;
                drawImageWidth -= width;
            }
            context.drawImage(
                imageObject,
                extraAnimationOffset, 0,
                ...animationStep.extraImage.dimensions,
                Math.round(drawImageWidth),
                Math.round(G.mainChar.y - height + top),
                ...animationStep.extraImage.dimensions
            );

            extraAnimationCount++;

            if (extraAnimationCount >= 2) {
                extraAnimationCount = 0;
                extraAnimationOffset += animationStep.extraImage.dimensions[0];
                if (extraAnimationOffset >= imageObject.naturalWidth) {
                    extraAnimationOffset = 0;
                }
            }
        } else {
            extraAnimationOffset = 0;
            extraAnimationCount = 0;
        }

        if (G.mainChar.direction == Actions.LEFT) {
            context.restore();
        }

        /**
        context.strokeStyle = "#FF0000";
        context.beginPath();

        context.moveTo(
            G.mainChar.x - (G.mainChar.width - 1) / 2 - offsetX,
            G.mainChar.y - (G.mainChar.height - 1) / 2
        );
        context.lineTo(
            G.mainChar.x + (G.mainChar.width - 1) / 2 - offsetX,
            G.mainChar.y - (G.mainChar.height - 1) / 2
        );
        context.lineTo(
            G.mainChar.x + (G.mainChar.width - 1) / 2 - offsetX,
            G.mainChar.y + (G.mainChar.height - 1) / 2
        );
        context.lineTo(
            G.mainChar.x - (G.mainChar.width - 1) / 2 - offsetX,
            G.mainChar.y + (G.mainChar.height - 1) / 2
        );
        context.lineTo(
            G.mainChar.x - (G.mainChar.width - 1) / 2 - offsetX,
            G.mainChar.y - (G.mainChar.height - 1) / 2
        );
        context.stroke();

        context.fillStyle = "#00FF00";
        context.beginPath();
        context.fillRect(
            G.mainChar.x - offsetX, G.mainChar.y,
            1, 1
        );
        const collisionPoints = G.mainChar.getCollisionPoints();
        context.fillStyle = "#FFFFFF";
        context.fillRect(
            G.mainChar.x + collisionPoints.leftTop[0] - offsetX,
            G.mainChar.y + collisionPoints.leftTop[1],
            1,
            1
        );
        context.fillRect(
            G.mainChar.x + collisionPoints.left[0] - offsetX,
            G.mainChar.y + collisionPoints.left[1],
            1,
            1
        );
        context.fillRect(
            G.mainChar.x + collisionPoints.leftBottom[0] - offsetX,
            G.mainChar.y + collisionPoints.leftBottom[1],
            1,
            1
        );
        context.fillRect(
            G.mainChar.x + collisionPoints.rightTop[0] - offsetX,
            G.mainChar.y + collisionPoints.rightTop[1],
            1,
            1
        );
        context.fillRect(
            G.mainChar.x + collisionPoints.right[0] - offsetX,
            G.mainChar.y + collisionPoints.right[1],
            1,
            1
        );
        context.fillRect(
            G.mainChar.x + collisionPoints.rightBottom[0] - offsetX,
            G.mainChar.y + collisionPoints.rightBottom[1],
            1,
            1
        );
        /**/


        window.requestAnimationFrame(reqAnimFrame);
    });


    function resizeCanvas() {

        let width, height, unit;
        if (window.innerWidth < window.innerHeight) {
            width = 100;
            unit = 'vw';
            height = width * (240 / 424);
        } else {
            height = 100;
            unit = 'vh';
            width = height * (424 / 240);
        }

        canvas.style.width = `${width}${unit}`;
        canvas.style.height = `${height}${unit}`;
        canvas.style.marginLeft = `calc(50vw - ${width}${unit} / 2)`;
        canvas.style.marginTop = `calc(50vh - ${height}${unit} / 2)`;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    window.addEventListener("keydown", function(event) {
        switch (event.key) {
            case "ArrowRight":
                keys.add(Actions.RIGHT);
                break;
            case "ArrowLeft":
                keys.add(Actions.LEFT);
                break;
            case "ArrowDown":
                keys.add(Actions.DOWN);
                break;
            case "ArrowUp":
                keys.add(Actions.UP);
                break;
            case " ":
                keys.add(Actions.JUMP);
                break;
        }
    });

    window.addEventListener("keyup", function(event) {
        switch (event.key) {
            case "ArrowRight":
                keys.delete(Actions.RIGHT);
                break;
            case "ArrowLeft":
                keys.delete(Actions.LEFT);
                break;
            case "ArrowDown":
                keys.delete(Actions.DOWN);
                break;
            case "ArrowUp":
                keys.delete(Actions.UP);
                break;
            case " ":
                keys.delete(Actions.JUMP);
                break;
        }
    });


    // Touch controls
    if (isTouchScreen) {
        const touchJumpButton = document.createElement("button");
        touchJumpButton.textContent = "Jump";
        touchJumpButton.classList.add("touchJump");

        touchJumpButton.addEventListener("touchstart", function(event) {
            keys.add(Actions.JUMP);
        });
        touchJumpButton.addEventListener("touchend", function(event) {
            keys.delete(Actions.JUMP);
        });

        document.body.append(touchJumpButton);

        const touchDirPadButton = document.createElement("button");
        
        for (const direction of ["Left", "Top", "Bottom", "Right"]) {
            const arrow = document.createElement("span");
            arrow.classList.add(`arrow${direction}`);
            arrow.textContent = "▶";
            touchDirPadButton.append(arrow);
        }

        touchDirPadButton.classList.add("touchDirPad");

        document.body.append(touchDirPadButton);

        function handleTouchEvents(event) {
            event.stopPropagation();
            event.preventDefault();
            const touch = event.touches[0];

            const posX = Math.round((touch.pageX - touchDirPadButton.offsetLeft) / touchDirPadButton.offsetWidth * 100);
            const posY = Math.round((touch.pageY - touchDirPadButton.offsetTop) / touchDirPadButton.offsetHeight * 100);

            const keysToAdd = [];
            if (posX <= 40) {
                keysToAdd.push(Actions.LEFT);
            }
            if (posX >= 60) {
                keysToAdd.push(Actions.RIGHT);
            }
            if (posY <= 40) {
                keysToAdd.push(Actions.UP);
            }
            if (posY >= 60) {
                keysToAdd.push(Actions.DOWN);
            }

            for (const action of [Actions.LEFT, Actions.RIGHT, Actions.UP, Actions.DOWN]) {
                if (keysToAdd.includes(action)) {
                    keys.add(action);
                } else {
                    keys.delete(action);
                }
            }

        }
        touchDirPadButton.addEventListener("touchstart", handleTouchEvents);
        touchDirPadButton.addEventListener("touchmove", handleTouchEvents);
        touchDirPadButton.addEventListener("touchend", function(event) {
            event.stopPropagation();
            event.preventDefault();
            for (const action of [Actions.LEFT, Actions.RIGHT, Actions.UP, Actions.DOWN]) {
                keys.delete(action);
            }
        });

        /*const touchRightButton = document.createElement("button");
        touchRightButton.textContent = "R";
        touchRightButton.classList.add("touchRight");

        touchRightButton.addEventListener("touchstart", function(event) {
            event.stopPropagation();
            event.preventDefault();
            keys.add(Actions.RIGHT);
        });
        touchRightButton.addEventListener("touchend", function(event) {
            event.stopPropagation();
            event.preventDefault();
            keys.delete(Actions.RIGHT);
        });

        document.body.append(touchRightButton);*/
    }
}

function setupAudioFile(oggFile, mp3File, volume = 1) {
    const output = document.createElement("audio");
    {
        output.setAttribute("preload", "auto");

        const sourceMP3 = document.createElement("source");
        sourceMP3.setAttribute("type", "audio/mp3");
        sourceMP3.setAttribute("src", mp3File);

        const sourceOGG = document.createElement("source");
        sourceOGG.setAttribute("type", "audio/ogg");
        sourceOGG.setAttribute("src", oggFile);

        output.volume = volume;

        output.append(sourceOGG);
        document.body.append(output);

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioTrack = audioContext.createMediaElementSource(output);


        audioTrack.connect(audioContext.destination);

        return output;
    }
} 
function playAudioEffect(audioEl) {
    audioEl.currentTime = 0;
    audioEl.play();
}


(function startScreen() {
    const startScreenDiv = document.createElement("div");
    startScreenDiv.classList.add("startScreenContainer");
    startScreenDiv.innerHTML = `
        <div class="startScreen">
            <h1>Vanilla JS Sonic Prototype</h1>
            <div>By Nico Zerpa <a href="https://twitter.com/await_nico" target="_blank">@await_nico</a></div>
            <div>Remastered music by <a href="https://www.youtube.com/watch?v=XYRRMYgCtjc" target="_blank">Bouncy Glow's Music Room</a></div>
            
            <div class="pressEnter">
                Press <strong>Enter</strong> or touch the screen to play.
            </div>
            
            <h2>Keyboard controls</h2>
            <div>Arrow keys: move character</div>
            <div>Space bar: Jump</div>
            <p>Touchscreen support available</p>
            <hr>
            <div class="disclaimer">
                This prototype is a non-profit endeavor created by fans.
                No financial gain whatsoever is made from project efforts. No intent to infringe said copyrights or registered trademarks.
                Sonic the Hedgehog is a trademark of SEGA®. The copyrights of "Sonic the Hedgehog" and all associated characters, names, terms, art, and music thereof belong to SEGA®. All registered trademarks and copyrights belong to SEGA® and Sonic Team®.
            </div>
        </div>
    `;

    document.body.append(startScreenDiv);


    function startOnEnter(event) {
        if (event.key === "Enter") {
            initGame();
            startScreenDiv.remove();
            window.removeEventListener("keydown", startOnEnter);
            document.removeEventListener("touchend", startOnTouch);
        }
    }
    window.addEventListener("keydown", startOnEnter);

    function startOnTouch() {
        initGame(true);
        startScreenDiv.remove();
        document.removeEventListener("touchend", startOnTouch);
        window.removeEventListener("keydown", startOnEnter);
    }
    document.addEventListener("touchend", startOnTouch);
})();