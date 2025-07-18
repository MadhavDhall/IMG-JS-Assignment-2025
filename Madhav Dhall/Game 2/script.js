const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// initializing required variables 
const playerSpeed = 1; // speed of the player

const totalGameTime = 60; // total game time in seconds
let timeLeft = totalGameTime; // time left in the game
let redLight = false; // flag to indicate if it's red light
let intervalId; // to store the interval ID for the game timer

// initialize the game to default start settings and stuff
function initGame() {
    redLight = false; // reset red light flag
    timeLeft = totalGameTime; // reset time left for the next game
    clearCanvas(); // clear the canvas before starting the game
    drawRoad();

    document.getElementById("light").innerText = ""; // reset the light display

    document.getElementById("time-left-value").textContent = timeLeft; // reset time left display
    document.getElementById("start-button").innerText = "Start Game"; // reset the start button text

    document.getElementById("start-button").removeEventListener("click", stopGame); // remove the stop game listener
    document.getElementById("start-button").addEventListener("click", startGame); // start the game when the button is clicked
    // reset player position
    player.x = 0;
    player.draw(); // redraw player at starting position
}

// start game function 
function startGame() {
    initGame(); // initialize the game
    document.getElementById("start-button").innerText = "Reset Game"; // disable the start button to prevent multiple clicks
    document.getElementById("start-button").removeEventListener("click", startGame);
    document.getElementById("start-button").addEventListener("click", stopGame); // change the button to reset the game

    intervalId = setInterval(updateGameTime, 1000); // start the game timer

    const lightsTimeIntervals = timeIntervals(totalGameTime, canvas.width, 8);

    runLights(lightsTimeIntervals);
}

function stopGame() {
    clearInterval(intervalId); // stop the game timer
    clearInterval(lightTimer); // stop the light timer
    initGame();
}

// make a road for the player to walk on
function drawRoad() {
    ctx.fillStyle = "#808080"; // gray color for the road
    ctx.fillRect(0, canvas.height / 2 - 20, canvas.width, 40);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw() {
        ctx.fillStyle = "#0000FF"; // blue color for the player
        ctx.fillRect(this.x, this.y, 10, 10); // player is a square
    }
}

const player = new Player(0, canvas.height / 2 - 5);

function movePlayer(x) {
    clearCanvas(); // clear the canvas before drawing
    drawRoad(); // draw the road
    this.x = x; // update player position
    player.draw(); // draw the player at the current position
}

// on key press change the player position
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
        player.x >= canvas.width - 10 ? player.x = canvas.width - 10 : player.x += playerSpeed; // move player to the right, reset if out of bounds

        if (redLight) {
            console.log(player.x);

            stopGame()
            return alert("You lost")
        }

        // log if player reaches the end of the road
        if (player.x >= canvas.width - 10) {
            stopGame();
            return alert("You won!");
        }

    } else if (event.key === "ArrowLeft") {
        player.x <= 0 ? player.x = 0 : player.x -= playerSpeed; // move player to the left, reset if out of bounds

        if (redLight) {
            stopGame()
            return alert("You lost")
        }
    }
    movePlayer(player.x); // update player position on canvas
});

// game time left function.
function updateGameTime() {
    timeLeft--;
    document.getElementById("time-left-value").textContent = timeLeft; // update the time left on the page
    if (timeLeft <= 0) {
        clearInterval(this); // stop the timer

        alert("You lost!"); // alert the user that the game is over
        console.log(this);

        stopGame(); // call stopGame to reset the game
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initGame(); // initialize the game when the document is loaded
});

// function to generate a winnable pattern of green and red lights
function timeIntervals(
    totalTime,
    distance,
    speed,
    minGreenTime = 2,
    maxGreenTime = 5,
    minRedTime = 2,
    maxRedTime = 5
) {
    const minGreenTimeNeeded = Math.ceil(distance / speed); // minimum green time needed to reach the goal
    const greenTimeNeeded = minGreenTimeNeeded + 7
    let greenLights = [];
    let greenTimeAccumulated = 0;

    // STEP 1: Generate green lights till greenTime >= needed
    while (greenTimeAccumulated < greenTimeNeeded) {
        let green = Math.floor(Math.random() * (maxGreenTime - minGreenTime + 1)) + minGreenTime;
        greenLights.push(green);
        greenTimeAccumulated += green;
    }

    const numLights = greenLights.length;
    const remainingRedTime = totalTime - greenTimeAccumulated;

    // STEP 2: Generate red lights that total up to remainingRedTime
    let redLights = splitTimeEvenlyWithRandomness(remainingRedTime, numLights, minRedTime, maxRedTime);

    // STEP 3: Interleave green and red lights
    let fullPattern = [];
    for (let i = 0; i < numLights; i++) {
        fullPattern.push({ type: "green", duration: greenLights[i] });
        fullPattern.push({ type: "red", duration: redLights[i] });
    }

    return fullPattern;
}


function splitTimeEvenlyWithRandomness(total, parts, min, max) {
    let base = Array(parts).fill(min);
    let remaining = total - min * parts;

    while (remaining > 0) {
        let i = Math.floor(Math.random() * parts);
        console.log("remaining");

        if (base[i] == min) {
            base[i] = Math.floor(Math.random() * (max - min) + min)
            console.log(`Adding ${base[i]} to part ${i}`);

            remaining = remaining - base[i];
        }
    }

    return base;
}

// Global variable to hold the current light timer
let lightTimer = null;

// Helper function to create a promise and store the timer so it can be cleared
function lightDelay(ms) {
    return new Promise(resolve => {
        lightTimer = setTimeout(resolve, ms);
    });
}

// Use an async function to await each light's duration before moving to the next
async function runLights(lightsTimeIntervals) {
    for (let i = 0; i < lightsTimeIntervals.length; i++) {
        const { type, duration } = lightsTimeIntervals[i];
        redLight = (type === "red");
        document.getElementById("light").innerText = type.charAt(0).toUpperCase() + type.slice(1) + " Light!";

        if (!redLight) {
            await lightDelay((duration - 1) * 1000);
            document.getElementById("light").innerText = "Yellow Light!";
            await lightDelay(1000);
            continue;
        }
        await lightDelay(duration * 1000); // wait for the red light duration
    }
}