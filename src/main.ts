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

// Add buttons
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
app.append(clearButton);

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
app.append(redoButton);

// Add "Thin" and "Thick" marker tool buttons
const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
app.append(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
app.append(thickButton);

// Add sticker buttons
const dinosaurButton = document.createElement("button");
dinosaurButton.textContent = "🦖";
app.append(dinosaurButton);

const sakuraButton = document.createElement("button");
sakuraButton.textContent = "🌸";
app.append(sakuraButton);

const sealButton = document.createElement("button");
sealButton.textContent = "🦭";
app.append(sealButton);

// Ensure document title is set
document.title = APP_NAME;

// CSS helper function to set selected tool styling
function setSelectedTool(button: HTMLButtonElement) {
  document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selectedTool"));
  button.classList.add("selectedTool");
}

// Set initial line thickness and selected tool
let lineThickness = 4; // Default to "Thin"
setSelectedTool(thinButton); // Set "Thin" as the default tool

// Variables for tool preview, drawing state, and stickers
let isDrawing = false;
let previewX = 0;
let previewY = 0;
let currentSticker: string | null = null;

// MarkerLine class definition
class MarkerLine {
  private points: { x: number; y: number }[];
  private thickness: number;

  constructor(initialX: number, initialY: number, thickness: number) {
    this.points = [{ x: initialX, y: initialY }];
    this.thickness = thickness;
  }

  // Extend the line by adding new points
  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  // Draw the line on the provided context
  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 0) {
      ctx.lineWidth = this.thickness;
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.stroke();
    }
  }
}

// Sticker class definition
class Sticker {
  private x: number;
  private y: number;
  private emoji: string;

  constructor(x: number, y: number, emoji: string) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
  }

  // Reposition the sticker
  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // Draw the sticker on the provided context
  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
  }
}

// Get and set the canvas context
const context = canvas.getContext("2d");

if (context) {
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const paths: MarkerLine[] = [];
  const stickers: Sticker[] = [];
  let currentPath: MarkerLine | null = null;
  const redoStack: MarkerLine[] = [];

  canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    // Check if a sticker is selected
    if (currentSticker) {
      const newSticker = new Sticker(startX, startY, currentSticker);
      stickers.push(newSticker);
      canvas.dispatchEvent(new CustomEvent("drawing-changed"));
      return; // Exit early to prevent line drawing
    }

    // Start line drawing
    isDrawing = true;
    currentPath = new MarkerLine(startX, startY, lineThickness);
    paths.push(currentPath);

    // Clear redo stack when starting a new path
    redoStack.length = 0;
  });

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // If drawing, update the current path
    if (isDrawing && currentPath) {
      currentPath.drag(x, y);
      canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    } else {
      // Update tool preview position
      previewX = x;
      previewY = y;
      canvas.dispatchEvent(new CustomEvent("tool-moved"));
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
  });

  // Listen for "drawing-changed" to redraw the paths and stickers
  canvas.addEventListener("drawing-changed", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach((path) => {
      path.display(context);
    });

    // Draw all stickers
    stickers.forEach((sticker) => {
      sticker.display(context);
    });
  });

  // Listen for "tool-moved" to display the tool preview
  canvas.addEventListener("tool-moved", () => {
    if (!isDrawing) {
      // Redraw paths and stickers first
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);

      paths.forEach((path) => {
        path.display(context);
      });

      stickers.forEach((sticker) => {
        sticker.display(context);
      });

      // Draw the tool preview
      if (currentSticker) {
        context.font = "24px Arial";
        context.fillText(currentSticker, previewX, previewY);
      } else {
        context.beginPath();
        context.arc(previewX, previewY, lineThickness / 2, 0, 2 * Math.PI);
        context.fillStyle = "black";
        context.fill();
      }
    }
  });

  // Drawing style settings
  context.strokeStyle = "black";

  // Clear button event listener
  clearButton.addEventListener("click", () => {
    paths.length = 0; // Clear all paths
    stickers.length = 0; // Clear all stickers
    redoStack.length = 0; // Clear redo stack
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height); // Refill with white background
  });

  // "Thin" tool button event listener
  thinButton.addEventListener("click", () => {
    lineThickness = 4; // Set smaller circle for thin tool
    currentSticker = null; // Clear current sticker
    setSelectedTool(thinButton); // Update tool selection styling
  });

  // "Thick" tool button event listener
  thickButton.addEventListener("click", () => {
    lineThickness = 12; // Set bigger circle for thick tool
    currentSticker = null; // Clear current sticker
    setSelectedTool(thickButton); // Update tool selection styling
  });

  // Dinosaur sticker button event listener
  dinosaurButton.addEventListener("click", () => {
    currentSticker = "🦖"; // Set sticker to dinosaur
    setSelectedTool(dinosaurButton); // Update tool selection styling
    canvas.dispatchEvent(new CustomEvent("tool-moved")); // Fire "tool-moved" event
  });

  // Sakura flower sticker button event listener
  sakuraButton.addEventListener("click", () => {
    currentSticker = "🌸"; // Set sticker to sakura flower
    setSelectedTool(sakuraButton); // Update tool selection styling
    canvas.dispatchEvent(new CustomEvent("tool-moved")); // Fire "tool-moved" event
  });

  // Seal sticker button event listener
  sealButton.addEventListener("click", () => {
    currentSticker = "🦭"; // Set sticker to seal
    setSelectedTool(sealButton); // Update tool selection styling
    canvas.dispatchEvent(new CustomEvent("tool-moved")); // Fire "tool-moved" event
  });
}
