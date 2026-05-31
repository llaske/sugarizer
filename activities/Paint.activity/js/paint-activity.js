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
}

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
