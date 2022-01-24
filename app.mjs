import "./styles.css";

import G from "./game.mjs";
import { importImage } from "./media.mjs";
import { WIDTH, WORLD_WIDTH, HEIGHT, FLOOR_Y_POS } from "./config.mjs";


import jumpAudioOGG from "./assets/jump.ogg";
import jumpAudioMP3 from "./assets/jump.mp3";
import musicOGG from "./assets/angelisland1.ogg";
import musicMP3 from "./assets/angelisland1.mp3";
import sonicURL from "./assets/sonic.webp";
import { Actions, Positions } from "./character.mjs";



async function initGame(isTouchScreen = false) {

    const jumpAudio = document.createElement("audio");
    {
        jumpAudio.setAttribute("preload", "auto");

        const sourceMP3 = document.createElement("source");
        sourceMP3.setAttribute("type", "audio/mp3");
        sourceMP3.setAttribute("src", jumpAudioMP3);

        const sourceOGG = document.createElement("source");
        sourceOGG.setAttribute("type", "audio/ogg");
        sourceOGG.setAttribute("src", jumpAudioOGG);

        jumpAudio.append(sourceOGG);
        document.body.append(jumpAudio);

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioTrack = audioContext.createMediaElementSource(jumpAudio);


        audioTrack.connect(audioContext.destination);
    }

    {
        const musicAudio = document.createElement("audio");

        musicAudio.setAttribute("preload", "auto");

        musicAudio.loop = true;
        musicAudio.volume = 0.55;
        
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
    const sonicImage = await importImage(sonicURL);
    const keys = new Set();


    let sonicSpriteOffsetX = 0;
    let sonicSpriteOffsetY = 0;


    const nextGameFrame = G.initGame(keys);
    
    
    let oldIsJumping = false;

    let firstFrame = true;
    let offsetX = 0;
    window.requestAnimationFrame(function reqAnimFrame() {

        if (firstFrame) {
            document.documentElement.scrollLeft = 0;
            firstFrame = false;
        } else {
            nextGameFrame();
        }

        if (!oldIsJumping && G.mainChar.position === G.POS_JUMPING) {
            jumpAudio.play();
            oldIsJumping = true;
        }
        oldIsJumping = G.mainChar.position === G.POS_JUMPING;


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

        if (G.mainChar.speedX === 0 && G.mainChar.position !== Positions.JUMPING) {
            sonicSpriteOffsetX = 0;
            sonicSpriteOffsetY = 0;
        } else {
            let maxFrames;

            if (G.mainChar.position === Positions.JUMPING) {
                sonicSpriteOffsetY = 59 * 4;
                maxFrames = 8;

            } else if (Math.abs(G.mainChar.speedX) < G.mainChar.topSpeedX) {
                sonicSpriteOffsetY = 59;
                maxFrames = 8;
            } else {
                sonicSpriteOffsetY = 59 * 2;
                maxFrames = 4;
            }
            

            if (G.mainChar.changeAnimation) {
                
                sonicSpriteOffsetX += 59;
                
                if (sonicSpriteOffsetX >= 59 * maxFrames) {
                    sonicSpriteOffsetX = 0;
                }
            }
        }

        if (G.mainChar.direction == Actions.LEFT) {
            context.save();
            context.scale(-1, 1);
        }

        context.drawImage(
            sonicImage,
            sonicSpriteOffsetX, sonicSpriteOffsetY,
            59, 59,
            G.mainChar.direction == Actions.LEFT ? -(G.mainChar.x - (G.mainChar.width - 1) / 2 - 19 - offsetX) - 59 : (G.mainChar.x - (G.mainChar.width - 1) / 2 - 22 - offsetX),
            G.mainChar.y + (G.mainChar.height - 1) / 2 - 50,
            59, 59
        );
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

        const touchLeftButton = document.createElement("button");
        touchLeftButton.textContent = "L";
        touchLeftButton.classList.add("touchLeft");

        touchLeftButton.addEventListener("touchstart", function(event) {
            event.stopPropagation();
            event.preventDefault();
            keys.add(Actions.LEFT);
        });
        touchLeftButton.addEventListener("touchend", function(event) {
            event.stopPropagation();
            event.preventDefault();
            keys.delete(Actions.LEFT);
        });

        document.body.append(touchLeftButton);

        const touchRightButton = document.createElement("button");
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

        document.body.append(touchRightButton);
    }
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