import "./style.css";

const APP_NAME = "Hello";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Clear previous content or append carefully
app.innerHTML = "";

// Create and append the title
const gameName = "Sketchpad Game";
const title = document.createElement("h1");
title.innerHTML = gameName;
app.append(title);

// Create a container for the canvas and buttons
const layoutContainer = document.createElement("div");
layoutContainer.style.display = "flex";
layoutContainer.style.alignItems = "flex-start";
layoutContainer.style.gap = "20px";
app.append(layoutContainer);

// Add a canvas element programmatically if not in HTML
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 400; // Set canvas width
canvas.height = 400; // Set canvas height
layoutContainer.append(canvas);

// Create a container for the buttons
const buttonContainer = document.createElement("div");
buttonContainer.classList.add("button-container");
layoutContainer.append(buttonContainer);

// Add buttons to the button container
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
buttonContainer.append(clearButton);

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
buttonContainer.append(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
buttonContainer.append(redoButton);

const exportButton = document.createElement("button");
exportButton.textContent = "Export";
buttonContainer.append(exportButton);

const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
buttonContainer.append(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
buttonContainer.append(thickButton);

// Container for sticker buttons inside button container
const stickerContainer = document.createElement("div");
stickerContainer.id = "sticker-container";
buttonContainer.append(stickerContainer);

// Initial set of stickers
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
    });
    stickerContainer.append(button);
  });
}

// Call function to create initial sticker buttons
createStickerButtons();

// Add a "Custom Sticker" button
const customStickerButton = document.createElement("button");
customStickerButton.textContent = "Custom Sticker";
buttonContainer.append(customStickerButton);

// CSS helper function to set selected tool styling
function setSelectedTool(button: HTMLButtonElement) {
  document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selectedTool"));
  button.classList.add("selectedTool");
}


// Variables for drawing and stickers
let lineThickness = 4; // Default to "Thin"
let isDrawing = false;
let currentSticker: string | null = null;

const actions: (MarkerLine | Sticker)[] = [];
const redoStack: (MarkerLine | Sticker)[] = [];
let currentPath: MarkerLine | null = null;

// MarkerLine class definition
class MarkerLine {
  private points: { x: number; y: number }[];
  private thickness: number;

  constructor(initialX: number, initialY: number, thickness: number) {
    this.points = [{ x: initialX, y: initialY }];
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

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

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
  }
}

// Get canvas context
const context = canvas.getContext("2d");
if (context) {
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Canvas event listeners
  canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    if (currentSticker) {
      const newSticker = new Sticker(startX, startY, currentSticker);
      actions.push(newSticker);
      redoStack.length = 0; // Clear redo stack
      redrawCanvas();
    } else {
      isDrawing = true;
      currentPath = new MarkerLine(startX, startY, lineThickness);
      actions.push(currentPath);
      redoStack.length = 0; // Clear redo stack
    }
  });

  canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (currentPath) {
      currentPath.drag(x, y);
      redrawCanvas();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  // Redraw function
  function redrawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    actions.forEach((action) => action.display(context));
  }

  // Button functionalities
  clearButton.addEventListener("click", () => {
    actions.length = 0;
    redoStack.length = 0;
    redrawCanvas();
  });

  undoButton.addEventListener("click", () => {
    if (actions.length > 0) {
      redoStack.push(actions.pop()!); // Move the last action to the redo stack
      redrawCanvas();
    }
  });

  redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
      actions.push(redoStack.pop()!); // Move the last redo action back to actions
      redrawCanvas();
    }
  });

  thinButton.addEventListener("click", () => {
    lineThickness = 3;
    currentSticker = null;
    setSelectedTool(thinButton);
  });

  thickButton.addEventListener("click", () => {
    lineThickness = 10;
    currentSticker = null;
    setSelectedTool(thickButton);
  });

  customStickerButton.addEventListener("click", () => {
    const userEmoji = prompt("Enter your custom sticker:", "🍎");
    if (userEmoji) {
      stickers.push({ emoji: userEmoji, label: "Custom Sticker" });
      createStickerButtons();
      currentSticker = userEmoji;
      setSelectedTool(customStickerButton);
    }
  });

  exportButton.addEventListener("click", () => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;

    const exportContext = exportCanvas.getContext("2d");
    if (exportContext) {
      exportContext.fillStyle = "white";
      exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      exportContext.scale(2.56, 2.56);

      actions.forEach((action) => action.display(exportContext));

      const anchor = document.createElement("a");
      anchor.href = exportCanvas.toDataURL("image/png");
      anchor.download = "sketchpad.png";
      anchor.click();
    }
  });
}
