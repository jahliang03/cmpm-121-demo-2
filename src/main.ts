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
clearButton.textContent = "Clear";
app.append(clearButton);

// Ensure document title is set
document.title = APP_NAME;

// Get and set the canvas context
const context = canvas.getContext("2d");

if (context) {
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  let isDrawing = false;
  const paths: { x: number, y: number }[][] = [];
  let currentPath: { x: number, y: number }[] = [];

  canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    currentPath = [];
    paths.push(currentPath);
  });

  canvas.addEventListener('mousemove', (event) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    currentPath.push(point);

    // Dispatch custom event on point addition
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
  });

  // Listen for "drawing-changed" to redraw the paths
  canvas.addEventListener("drawing-changed", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    paths.forEach(path => {
      if (path.length > 0) {
        context.beginPath();
        context.moveTo(path[0].x, path[0].y);
        path.forEach(point => {
          context.lineTo(point.x, point.y);
        });
        context.stroke();
      }
    });
  });

  // Drawing style settings
  context.strokeStyle = "black";
  context.lineWidth = 2;

  // Clear button event listener
  clearButton.addEventListener('click', () => {
    paths.length = 0; // Clear all paths
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height); // Refill with white background
  });
}
