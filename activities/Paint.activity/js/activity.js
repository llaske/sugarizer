/* Start of the app, we require everything that is needed */
define(["sugar-web/activity/activity", "tutorial", "l10n", "sugar-web/env", "activity/paint-activity", "activity/paint-app", "sugar-web/graphics/presencepalette", "activity/palettes/color-palette", "activity/palettes/stamp-palette", "activity/palettes/text-palette", "activity/palettes/drawings-palette", "activity/palettes/filters-palette", "activity/buttons/size-button", "activity/buttons/clear-button", "activity/buttons/undo-button", "activity/buttons/redo-button", "activity/modes/modes-pen", "activity/modes/modes-eraser", "activity/modes/modes-bucket", "activity/modes/modes-text", "activity/modes/modes-stamp", "activity/modes/modes-copy", "activity/modes/modes-paste", "activity/collaboration", "activity/buttons/insertimage-button"], function (activity, tutorial, l10n, env, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21) {
  window.PaintApp = p2;

  PaintApp.libs.activity = activity;

  /* Fetching and storing of the palettes */
  PaintApp.palettes.presencePalette = p3;
  PaintApp.palettes.colorPalette = p4;
  PaintApp.palettes.stampPalette = p5;
  PaintApp.palettes.textPalette = p6;
  PaintApp.palettes.drawingsPalette = p7;
  PaintApp.palettes.filtersPalette = p8;

  /* Fetching and storing of the buttons */
  PaintApp.buttons.sizeButton = p9;
  PaintApp.buttons.clearButton = p10;
  PaintApp.buttons.undoButton = p11;
  PaintApp.buttons.redoButton = p12;
  PaintApp.buttons.insertImageButton = p21;

  /* Fetching and storing of the modes */
  PaintApp.modes.Pen = p13;
  PaintApp.modes.Eraser = p14;
  PaintApp.modes.Bucket = p15;
  PaintApp.modes.Text = p16;
  PaintApp.modes.Stamp = p17;
  PaintApp.modes.Copy = p18;
  PaintApp.modes.Paste = p19;

  PaintApp.collaboration = p20;

  requirejs(['domReady!', 'sugar-web/datastore', 'paper-core', 'mustache', 'lzstring', 'humane'], function (doc, datastore, _paper, mustache, lzstring, humane) {

    /* Fetching and storing libraries */
    PaintApp.libs.mustache = mustache;
    PaintApp.libs.humane = humane;
    PaintApp.libs.lzstring = lzstring;

    //Setup of the activity
    activity.setup();

    /* Fetch and store UI elements */
    initGui();
    var currentenv;
    env.getEnvironment(function (err, environment) {
      currentenv = environment;
      // Set current language to Sugarizer
      var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
      var language = environment.user ? environment.user.language : defaultLanguage;
      l10n.init(language);

    });

    // Export as PNG image
    document.getElementById("save-image-button").addEventListener('click', function () {
      var mimetype = 'image/png';
      var inputData = document.getElementById("paint-canvas").toDataURL(mimetype, 1);
      var metadata = {
        mimetype: mimetype,
        title: l10n.get("PaintBy", { name: currentenv.user.name }),
        activity: "org.olpcfrance.MediaViewerActivity",
        timestamp: new Date().getTime(),
        creation_time: new Date().getTime(),
        file_size: 0
      };
      datastore.create(metadata, function () {
        humane.log(l10n.get('PaintImageSaved'))
        console.log("export done.")
      }, inputData);
    });

    document.getElementById("stop-button").addEventListener('click', function (event) {
      var data = {
        width: PaintApp.elements.canvas.width / window.devicePixelRatio,
        height: PaintApp.elements.canvas.height / window.devicePixelRatio,
        src: PaintApp.collaboration.compress(PaintApp.elements.canvas.toDataURL())
      }

      var jsonData = JSON.stringify(data);

      activity.getDatastoreObject().setDataAsText(jsonData);
      activity.getDatastoreObject().save(function (error) { });
    });

    document.getElementById("help-button").addEventListener('click', function (e) {
      tutorial.start();
    });

    //Fetch of the history if not starting shared
    if (!window.top.sugar || !window.top.sugar.environment || !window.top.sugar.environment.sharedId) {
      activity.getDatastoreObject().loadAsText(function (error, metadata, jsonData) {
        if (jsonData == null) {
          return;
        }
        var data = JSON.parse(jsonData);
        PaintApp.clearCanvas();
        img = new Image();
        img.onload = function () {
          PaintApp.elements.canvas.getContext('2d').drawImage(img, 0, 0, data.width, data.height);
          PaintApp.saveCanvas();
        };
        img.src = PaintApp.collaboration.decompress(data.src);
        //DISPLAY
      });
    }

    // If starting in shared mode, we disable undo/redo
    if (window.top && window.top.sugar && window.top.sugar.environment && window.top.sugar.environment.sharedId) {
      PaintApp.data.isHost = false;
      PaintApp.buttons.undoButton.hideGui();
      PaintApp.buttons.redoButton.hideGui();
      PaintApp.displayUndoRedoButtons();
      PaintApp.collaboration.shareActivity();
    }

    // Fix: Resize canvas when window size changes
    var resizeBaseCanvas = null;
    var resizeTimeout = null;
    window.addEventListener("resize", function () {
      if (!PaintApp || !PaintApp.elements || !PaintApp.elements.canvas) {
        return;
      }

      var canvas = PaintApp.elements.canvas;
      var ctx = canvas.getContext("2d");

      // 1. Save current content synchronously in a temporary off-screen canvas at the START of resize
      if (!resizeBaseCanvas) {
        resizeBaseCanvas = document.createElement('canvas');
        resizeBaseCanvas.width = canvas.width;
        resizeBaseCanvas.height = canvas.height;
        resizeBaseCanvas.getContext('2d').drawImage(canvas, 0, 0);
      }

      // 2. Compute new size
      var newWidth = window.innerWidth;
      var newHeight = window.innerHeight - 55;

      // 3. Update Paper.js view size (this automatically resizes the canvas buffer)
      if (typeof paper !== 'undefined' && paper.view) {
        paper.view.viewSize = new paper.Size(newWidth, newHeight);
        // Prevent Paper.js from clearing the canvas since we use manual drawing
        paper.view.autoUpdate = false;
      }

      // 4. Update CSS size
      canvas.style.width = newWidth + "px";
      canvas.style.height = newHeight + "px";

      // 6. Reset transform and enable high-quality smoothing
      // This prevents the "zoom" effect and ensures any future scaling is smooth
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.mozImageSmoothingEnabled = true;
      ctx.webkitImageSmoothingEnabled = true;
      ctx.msImageSmoothingEnabled = true;

      // 7. Fill with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 8. Restore content from the BASE canvas and scale to fit the new size
      // This ensures the drawing stretches to fill the window while staying sharp
      ctx.drawImage(resizeBaseCanvas, 0, 0, canvas.width, canvas.height);

      // 9. Reset the base canvas after a period of inactivity (resize finished)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(function () {
        resizeBaseCanvas = null;
      }, 500);
    });
  });
});
