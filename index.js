import { startRendering } from "./src/main.js";

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const playButton = document.getElementById("play-button");
const playAgainButton = document.getElementById("play-again-button");
const gameCanvas = document.getElementById("game-canvas");

function showScreen(screen) {
    [startScreen, gameScreen, gameOverScreen].forEach((s) => s.classList.remove("active"));
    screen.classList.add("active");
}

function startGame() {
    showScreen(gameScreen);
    startRendering(gameCanvas);
}

export function onGameOver() {
    showScreen(gameOverScreen);
}
function ReStartGame(){
    showScreen(gameScreen);
}

playButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", ReStartGame);