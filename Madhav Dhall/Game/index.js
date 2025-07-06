let number;
let attempts = 0;

const generateNumber = () => {
    number = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
}

document.addEventListener("DOMContentLoaded", () => {
    generateNumber();
});


const guessForm = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const resultMessage = document.getElementById("message");

guessForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const guess = parseInt(guessInput.value, 10);

    if (isNaN(guess) || guess < 1 || guess > 100) {
        resultMessage.textContent = "Please enter a valid number between 1 and 100.";
        return;
    }

    if (guess === number) {
        resultMessage.textContent = "Congratulations! You've guessed the number! " + number + ".";
    } else if (guess < number) {
        resultMessage.textContent = "Too low! Try again.";
    } else {
        resultMessage.textContent = "Too high! Try again.";
    }

    guessInput.value = "";
    attempts++;
    document.getElementById("attempts").textContent = attempts;
});