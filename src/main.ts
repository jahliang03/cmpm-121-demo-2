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

const exportButton = document.createElement("button");
exportButton.textContent = "Export";
app.append(exportButton);

// Add "Thin" and "Thick" marker tool buttons
const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
app.append(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
app.append(thickButton);

// Container for sticker buttons
const stickerContainer = document.createElement("div");
stickerContainer.id = "sticker-container";
app.append(stickerContainer);

// Define initial set of stickers
let stickers = [
  { emoji: "🦖", label: "Dinosaur" },
  { emoji: "🌸", label: "Sakura Flower" },
  { emoji: "🦭", label: "Seal" },
];

// Create buttons for stickers
function createStickerButtons() {
  // Clear existing stickers to avoid duplicates
  stickerContainer.innerHTML = "";

  // Add buttons for each sticker
  stickers.forEach((sticker) => {
    const button = document.createElement("button");
    button.textContent = sticker.emoji;
    button.title = sticker.label;
    button.addEventListener("click", () => {
      currentSticker = sticker.emoji;
      setSelectedTool(button);
      canvas.dispatchEvent(new CustomEvent("tool-moved")); // Fire "tool-moved" event
    });
    stickerContainer.append(button);
  });
}

// Call function to create initial sticker buttons
createStickerButtons();

// Add a "Custom Sticker" button
const customStickerButton = document.createElement("button");
customStickerButton.textContent = "Custom Sticker";
app.append(customStickerButton);

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
  const stickerObjects: Sticker[] = [];
  let currentPath: MarkerLine | null = null;
  const redoStack: MarkerLine[] = [];

  canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    // Check if a sticker is selected
    if (currentSticker) {
      const newSticker = new Sticker(startX, startY, currentSticker);
      stickerObjects.push(newSticker);
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
    stickerObjects.forEach((sticker) => {
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

      stickerObjects.forEach((sticker) => {
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
    stickerObjects.length = 0; // Clear all stickers
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

  // "Custom Sticker" button event listener
  customStickerButton.addEventListener("click", () => {
    const userEmoji = prompt("Enter your custom sticker:", "🍎");
    if (userEmoji) {
      stickers.push({ emoji: userEmoji, label: "Custom Sticker" });
      currentSticker = userEmoji;
      setSelectedTool(customStickerButton); // Highlight the "Custom Sticker" button
      createStickerButtons(); // Recreate the sticker buttons
      canvas.dispatchEvent(new CustomEvent("tool-moved")); // Fire "tool-moved" event
    }
  });

  // Export button event listener
exportButton.addEventListener("click", () => {
  // Create a temporary canvas of size 1024x1024
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;

  // Prepare the context for scaling
  const exportContext = exportCanvas.getContext("2d");
  if (exportContext) {
    // Set the background to white
    exportContext.fillStyle = "white";
    exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Scale to 1024x1024 (4x in each dimension from 400x400)
    exportContext.scale(2.56, 2.56);

    // Draw all paths and stickers on the new canvas
    paths.forEach((path) => {
      path.display(exportContext);
    });

    stickerObjects.forEach((sticker) => {
      sticker.display(exportContext);
    });

    // Trigger download of the canvas content as a PNG file
    const anchor = document.createElement("a");
    anchor.href = exportCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
  }
});
}


