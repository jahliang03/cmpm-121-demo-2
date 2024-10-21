import "./style.css";

const APP_NAME = "Hello";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Clear previous content or append carefully
app.innerHTML = ""; // Clear to prevent overwriting later

// Create and append the title
const gameName = "Sketchpad Game";
const title = document.createElement("h1");
title.innerHTML = gameName;
app.append(title);

// Add a canvas element programmatically if not in HTML
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 400; // Set canvas width
canvas.height = 400; // Set canvas height
app.append(canvas);

// Add a button to clear the canvas
const clearButton = document.createElement("button");
clearButton.textContent = "Clear Canvas";
app.append(clearButton);

// Ensure document title is set
document.title = APP_NAME;

// Get and set the canvas context
const context = canvas.getContext("2d");

if (context) {
  context.fillStyle = "white"; // Set fill style to white
  context.fillRect(0, 0, canvas.width, canvas.height); // Fill background

  // Mouse event handlers
  let isDrawing = false;

  canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    context.beginPath();
    context.moveTo(event.offsetX, event.offsetY);
  });

  canvas.addEventListener('mousemove', (event) => {
    if (isDrawing) {
      context.lineTo(event.offsetX, event.offsetY);
      context.stroke();
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
  });

  // Ensure drawing settings
  context.strokeStyle = "black"; // Black color for drawing line
  context.lineWidth = 2; // Line width

  // Clear button event listener
  clearButton.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height); // Refill with white background
  });
}