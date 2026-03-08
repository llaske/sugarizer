/* Initialization of the UI */
function initGui() {
  /* Fetching and init of the painting zone */
  PaintApp.elements.canvas = document.getElementById('paint-canvas');
  PaintApp.elements.canvas.style.height = parseInt(window.innerHeight) - 55 + "px";
  PaintApp.elements.canvas.style.width = parseInt(window.innerWidth) + "px";
  PaintApp.data.baseWidth = parseInt(window.innerWidth);
  PaintApp.data.baseHeight = parseInt(window.innerHeight) - 55;
  var pixelRatio = window.devicePixelRatio || 1;
  PaintApp.elements.canvas.width = (parseInt(window.innerWidth)) * pixelRatio;
  PaintApp.elements.canvas.height = (parseInt(window.innerHeight) - 55) * pixelRatio;
  paper.setup(PaintApp.elements.canvas);

  /* Catch mouseup events that occur outside the canvas to ensure saveCanvas fires */
  window.addEventListener('mouseup', function (e) {
    if (e.target !== PaintApp.elements.canvas) {
      PaintApp.saveCanvas();
    }
  });

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
  /* Handle window resize */
  var _resizeRAF = null;
  var onResize = function () {
    var toolbar = document.getElementById("main-toolbar");
    var toolbarHeight = (toolbar && toolbar.offsetHeight > 0) ? toolbar.offsetHeight : 55;

    // Retrieve pixel ratio correctly to prevent blur
    var pixelRatio = window.devicePixelRatio || 1;
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight - toolbarHeight;

    // 1. Validate Source (Master > Canvas)
    var sourceCanvas = PaintApp.data.masterCanvas;
    if (!sourceCanvas) {
      sourceCanvas = PaintApp.elements.canvas;
    }

    // 2. Expand masterCanvas BEFORE Paper.js touches anything (masterCanvas is off-screen, safe)
    if (PaintApp.data.masterCanvas) {
      var mc = PaintApp.data.masterCanvas;
      if (newWidth * pixelRatio > mc.width || newHeight * pixelRatio > mc.height) {
        var expandW = Math.max(mc.width, newWidth * pixelRatio);
        var expandH = Math.max(mc.height, newHeight * pixelRatio);
        var tmp = document.createElement('canvas');
        tmp.width = mc.width; tmp.height = mc.height;
        tmp.getContext('2d').drawImage(mc, 0, 0);

        var edgePixel = tmp.getContext('2d').getImageData(tmp.width - 1, tmp.height - 1, 1, 1).data;
        var bgColor = (edgePixel[3] > 0) ? 'rgba(' + edgePixel[0] + ',' + edgePixel[1] + ',' + edgePixel[2] + ',' + (edgePixel[3] / 255) + ')' : "#ffffff";

        mc.width = expandW; mc.height = expandH;
        var mcCtx = mc.getContext('2d');
        mcCtx.fillStyle = bgColor;
        mcCtx.fillRect(0, 0, expandW, expandH);
        mcCtx.drawImage(tmp, 0, 0);
      }
    }

    // 3. Update Paper.js View — this schedules an async redraw that will clear the canvas
    if (paper.view) {
      paper.view.viewSize = new paper.Size(newWidth, newHeight);
    }

    // 4. Force Standard Resize using correct Pixel Ratio logic to override Paper.js CSS scaling
    PaintApp.elements.canvas.width = newWidth * pixelRatio;
    PaintApp.elements.canvas.height = newHeight * pixelRatio;
    PaintApp.elements.canvas.style.width = newWidth + "px";
    PaintApp.elements.canvas.style.height = newHeight + "px";
    PaintApp.elements.canvas.style.marginLeft = "0px";
    PaintApp.elements.canvas.style.marginTop = "0px";

    // Set the persistent scale for the context to match the high-DPI physical backing store.
    // This is critical for Paper.js coordinate mapping.
    var ctx = PaintApp.elements.canvas.getContext('2d');
    ctx.scale(pixelRatio, pixelRatio);

    // 5. Defer canvas restoration to AFTER Paper.js finishes its async redraw.
    //    Paper.js schedules a redraw via requestAnimationFrame when viewSize changes,
    //    which would overwrite any drawing we do here synchronously. By deferring our
    //    drawing to the NEXT animation frame, we ensure it happens after Paper.js.
    if (_resizeRAF) {
      cancelAnimationFrame(_resizeRAF);
    }
    _resizeRAF = requestAnimationFrame(function () {
      _resizeRAF = null;
      var ctx = PaintApp.elements.canvas.getContext('2d');

      // Determine background color from source canvas edge
      var mainBgColor = "#ffffff";
      var src = PaintApp.data.masterCanvas || PaintApp.elements.canvas;
      if (src && src.width > 0 && src.height > 0) {
        try {
          var tmpC = document.createElement('canvas');
          tmpC.width = 1; tmpC.height = 1;
          tmpC.getContext('2d').drawImage(src, src.width - 1, src.height - 1, 1, 1, 0, 0, 1, 1);
          var ep = tmpC.getContext('2d').getImageData(0, 0, 1, 1).data;
          if (ep[3] > 0) {
            mainBgColor = 'rgba(' + ep[0] + ',' + ep[1] + ',' + ep[2] + ',' + (ep[3] / 255) + ')';
          }
        } catch (e) { }
      }

      // Fill background
      ctx.save();
      // Reset transform to physical pixels (1:1) to draw the masterCanvas correctly.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = mainBgColor;
      ctx.fillRect(0, 0, PaintApp.elements.canvas.width, PaintApp.elements.canvas.height);

      // Draw masterCanvas content on top
      if (src && src.width > 0 && src.height > 0 && src !== PaintApp.elements.canvas) {
        ctx.drawImage(src, 0, 0);
      }
      ctx.restore(); // Restores the pixelRatio scale for Paper.js
    });
  };
  window.addEventListener('resize', onResize);
  PaintApp.onResize = onResize;
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