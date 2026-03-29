/* Initialization of the UI */
function initGui() {
  /* Fetching and init of the painting zone */
  PaintApp.elements.canvas = document.getElementById('paint-canvas');
  PaintApp.elements.canvas.style.height = parseInt(window.innerHeight) - 55 + "px";
  PaintApp.elements.canvas.style.width = parseInt(window.innerWidth) + "px";
  paper.setup(PaintApp.elements.canvas);

  /* We are using paper.Tool to register to onMouseDown / onMouseDrag / onMouseUp */
  PaintApp.data.tool = new paper.Tool();
  PaintApp.data.tool.distanceThreshold = 0;

  /* Calling initGui of our modes */
  PaintApp.modes.Text.initGui();
  PaintApp.modes.Eraser.initGui();
  PaintApp.modes.Pen.initGui();
  PaintApp.modes.Bucket.initGui();
  PaintApp.modes.Stamp.initGui();
  PaintApp.modes.Copy.initGui();
  PaintApp.modes.Paste.initGui();

  /* Calling initGui of our palettes */
  PaintApp.palettes.filtersPalette.initGui();
  PaintApp.palettes.drawingsPalette.initGui();
  PaintApp.palettes.colorPalette.initGui();

  /* Enabling the presence palette */
  initPresencePalette();

  /* Calling initGui of our buttons */
  PaintApp.buttons.sizeButton.initGui();
  PaintApp.buttons.clearButton.initGui();
  PaintApp.buttons.undoButton.initGui();
  PaintApp.buttons.redoButton.initGui();
  PaintApp.buttons.insertImageButton.initGui();

  /* Refreshing undo / redo */
  PaintApp.displayUndoRedoButtons();
  /* Selecting the pen tool */
  PaintApp.elements.penButton.click();
  PaintApp.switchMode("Pen");

  /* Scrolling top prevent any overflow */
  window.scrollTo(0, -1000);
  PaintApp.clearCanvas();

  
  /* Created a World Canvas As Big As the screen to Keep track of Drawings outside the Window When Resized*/
  PaintApp.prevScreenWidth=parseInt(window.innerWidth);
  PaintApp.prevScreenHeight=parseInt(window.innerHeight) - 55;

  const worldCanvas = document.createElement('canvas');
  worldCanvas.width = screen.width
  worldCanvas.height = screen.height
  PaintApp.data.worldCanvas = worldCanvas;

}

/* The initial drawing is transferred to a world canvas, from which only the visible portion is rendered onto the main canvas. */
function canvasResize() {
  const canvas=PaintApp.elements.canvas
  const worldCanvas=PaintApp.data.worldCanvas
  const newWidth = parseInt(window.innerWidth);
  const newHeight = parseInt(window.innerHeight) - 55;
  worldCanvas.getContext('2d').drawImage(canvas, 0, 0,PaintApp.prevScreenWidth,PaintApp.prevScreenHeight);
  paper.view.viewSize = new paper.Size(newWidth, newHeight);
  PaintApp.prevScreenHeight = parseInt(window.innerHeight) - 55;
  PaintApp.prevScreenWidth = parseInt(window.innerWidth);
  canvas.style.width = newWidth+"px";
  canvas.style.height = newHeight+"px";
     PaintApp.elements.canvas.width=newWidth;
   PaintApp.elements.canvas.height=newHeight;
   PaintApp.elements.canvas.getContext('2d').drawImage(worldCanvas,0,0,newWidth,newHeight,0,0,newWidth,newHeight);
}
window.addEventListener("resize", canvasResize);

/* Initialization of the presence palette */
function initPresencePalette() {
  var networkButton = document.getElementById("network-button");
  presencepalette = new PaintApp.palettes.presencePalette.PresencePalette(networkButton, undefined);
  presencepalette.addEventListener('shared', PaintApp.collaboration.shareActivity);

  // Launched with a shared id, activity is already shared
  if (window.top && window.top.sugar && window.top.sugar.environment && window.top.sugar.environment.sharedId) {
    PaintApp.collaboration.shareActivity();
    presencepalette.setShared(true);
  }
}
