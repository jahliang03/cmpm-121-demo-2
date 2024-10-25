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

// Ensure document title is set
document.title = APP_NAME;

// CSS helper function to set selected tool styling
function setSelectedTool(button: HTMLButtonElement) {
  document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selectedTool"));
  button.classList.add("selectedTool");
}

// Set initial line thickness and selected tool
let lineThickness = 2; // Default to "Thin"
setSelectedTool(thinButton); // Set "Thin" as the default tool

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

// Get and set the canvas context
const context = canvas.getContext("2d");

if (context) {
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  let isDrawing = false;
  const paths: MarkerLine[] = [];
  let currentPath: MarkerLine | null = null;
  const redoStack: MarkerLine[] = [];

  canvas.addEventListener("mousedown", (event) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;
    currentPath = new MarkerLine(startX, startY, lineThickness);
    paths.push(currentPath);

    // Clear redo stack when starting a new path
    redoStack.length = 0;
  });

  canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing || !currentPath) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    currentPath.drag(x, y);

    // Dispatch custom event on line extension
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
  });

  // Listen for "drawing-changed" to redraw the paths
  canvas.addEventListener("drawing-changed", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    paths.forEach((path) => {
      path.display(context);
    });
  });

  // Drawing style settings
  context.strokeStyle = "black";

  // Clear button event listener
  clearButton.addEventListener("click", () => {
    paths.length = 0; // Clear all paths
    redoStack.length = 0; // Clear redo stack
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height); // Refill with white background
  });

  // Undo button event listener
  undoButton.addEventListener("click", () => {
    if (paths.length > 0) {
      const lastPath = paths.pop(); // Remove the last path
      if (lastPath) {
        redoStack.push(lastPath); // Add to redo stack

        // Dispatch event
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
      }
    }
  });

  // Redo button event listener
  redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
      const lastRedo = redoStack.pop(); // Remove from redo stack
      if (lastRedo) {
        paths.push(lastRedo); // Add back to paths

        // Dispatch drawing-changed event
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
      }
    }
  });

  // "Thin" tool button event listener
  thinButton.addEventListener("click", () => {
    lineThickness = 2; // Set thin line thickness
    setSelectedTool(thinButton); // Update tool selection styling
  });

  // "Thick" tool button event listener
  thickButton.addEventListener("click", () => {
    lineThickness = 6; // Set thick line thickness
    setSelectedTool(thickButton); // Update tool selection styling
  });
}

