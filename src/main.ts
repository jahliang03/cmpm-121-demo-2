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
canvas.width = 500; // Set canvas width
canvas.height = 500; // Set canvas height
app.append(canvas);

// Ensure document title is set
document.title = APP_NAME;

// Get and set the canvas context
const context = canvas.getContext("2d");

if (context) {
  context.fillStyle = "white"; // Set fill style to white
  context.fillRect(0, 0, canvas.width, canvas.height); // Fill background
}

