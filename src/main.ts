import "./style.css";

const APP_NAME = "Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

const gameName = "Sketchpad";
const title = document.createElement("h1");
title.innerHTML = gameName;
app.append(title);

const layoutContainer = document.createElement("div");
layoutContainer.classList.add("layout-container");
app.append(layoutContainer);

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 400;
canvas.height = 400;
layoutContainer.append(canvas);

let lineThickness = 4; // Default to "Thin"
let isDrawing = false;
let currentColor = "#000000"; // Default color to black
let currentRotation = 0;

let currentSticker: string | null = null;
const actions: (MarkerLine | Sticker)[] = [];
const redoStack: (MarkerLine | Sticker)[] = [];
let currentPath: MarkerLine | null = null;

const buttonContainer = document.createElement("div");
buttonContainer.classList.add("button-container");
layoutContainer.append(buttonContainer);

const buttonConfigs = [
  { id: "clearButton", text: "Clear" },
  { id: "undoButton", text: "Undo" },
  { id: "redoButton", text: "Redo" },
  { id: "exportButton", text: "Export" },
  { id: "thinButton", text: "Thin" },
  { id: "thickButton", text: "Thick" }
];

const [clearButton, undoButton, redoButton, exportButton, thinButton, thickButton] = createButtons(buttonConfigs, buttonContainer);

const stickerContainer = document.createElement("div");
stickerContainer.id = "sticker-container";
buttonContainer.append(stickerContainer);

const customStickerButton = document.createElement("button");
customStickerButton.id = "customStickerButton";
customStickerButton.textContent = "Custom Sticker";
buttonContainer.append(customStickerButton);

const colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.value = "#000000"; // Default to black
Object.assign(colorPicker.style, {
  width: "120px",
  height: "40px",
  padding: "0",
  border: "none",
  cursor: "pointer"
});
buttonContainer.append(colorPicker);

const context = canvas.getContext("2d");

// Initial set of stickers
let stickers = [
  { emoji: "🦖", label: "Dinosaur" },
  { emoji: "🌸", label: "Sakura Flower" },
  { emoji: "🦭", label: "Seal" },
];

class MarkerLine {
  private points: { x: number; y: number }[];
  private thickness: number;
  private color: string;

  constructor(initialX: number, initialY: number, thickness: number, color: string) {
    this.points = [{ x: initialX, y: initialY }];
    this.thickness = thickness;
    this.color = color;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 0) {
      ctx.strokeStyle = this.color; // Set stroke color
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

class Sticker {
  private x: number;
  private y: number;
  private emoji: string;
  private rotation: number;

  constructor(x: number, y: number, emoji: string, rotation: number) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.rotation = rotation;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.font = "24px Arial";
    ctx.fillStyle = currentColor;
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}

function createButtons(buttonConfigs, container = document.body) {
  return buttonConfigs.map(config => {
    const button = document.createElement("button");
    button.id = config.id;
    button.textContent = config.text;
    container.appendChild(button);
    return button;
  });
}

function createStickerButtons() {
  stickerContainer.innerHTML = "";

  stickers.forEach((sticker) => {
    const button = document.createElement("button");
    button.textContent = sticker.emoji;
    button.title = sticker.label;
    button.addEventListener("click", () => {
      currentSticker = sticker.emoji;
      randomizeToolProperties();
      setSelectedTool(button);
      updateToolPreview();
    });
    stickerContainer.append(button);
  });
}

function setSelectedTool(button: HTMLButtonElement) {
  document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selectedTool"));
  button.classList.add("selectedTool");
}

function randomizeToolProperties() {
  currentColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  currentRotation = Math.floor(Math.random() * 361);
  updateToolPreview();
}

function redrawCanvas() {
  if (context){ 
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    actions.forEach((action) => action.display(context));
    }
}

function updateToolPreview() {
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    redrawCanvas();
    if (currentSticker) {
      context.save();
      context.translate(50, 50);
      context.rotate((currentRotation * Math.PI) / 180);
      context.font = "24px Arial";
      context.fillStyle = currentColor;
      context.fillText(currentSticker, 0, 0);
      context.restore();
    } else {
      context.beginPath();
      context.arc(50, 50, lineThickness, 0, 2 * Math.PI);
      context.fillStyle = currentColor;
      context.fill();
    }
  }
}

colorPicker.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  currentColor = target.value;
});

canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const startX = event.clientX - rect.left;
  const startY = event.clientY - rect.top;

  if (currentSticker) {
    const newSticker = new Sticker(startX, startY, currentSticker, currentRotation);
    actions.push(newSticker);
    redoStack.length = 0;
    redrawCanvas();
  } else {
    isDrawing = true;
    currentPath = new MarkerLine(startX, startY, lineThickness, currentColor);
    actions.push(currentPath);
    redoStack.length = 0;
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

clearButton.addEventListener("click", () => {
  actions.length = 0;
  redoStack.length = 0;
  redrawCanvas();
});

undoButton.addEventListener("click", () => {
  if (actions.length > 0) {
    redoStack.push(actions.pop()!);
    redrawCanvas();
  }
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    actions.push(redoStack.pop()!);
    redrawCanvas();
  }
});

thinButton.addEventListener("click", () => {
  lineThickness = 3;
  currentSticker = null;
  randomizeToolProperties();
  setSelectedTool(thinButton);
});

thickButton.addEventListener("click", () => {
  lineThickness = 10;
  currentSticker = null;
  randomizeToolProperties();
  setSelectedTool(thickButton);
});

customStickerButton.addEventListener("click", () => {
  const userEmoji = prompt("Enter your custom sticker:", "🍎");
  if (userEmoji) {
    stickers.push({ emoji: userEmoji, label: "Custom Sticker" });
    createStickerButtons();
    currentSticker = userEmoji;
    randomizeToolProperties();
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

if (context) {
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

createStickerButtons();
