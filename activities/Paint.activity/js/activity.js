/* Start of the app, we require everything that is needed */
define(["sugar-web/activity/activity","activity/paint-activity","activity/paint-app","sugar-web/graphics/presencepalette","activity/palettes/color-palette","activity/palettes/stamp-palette","activity/palettes/text-palette","activity/palettes/drawings-palette","activity/palettes/filters-palette","activity/buttons/size-button","activity/buttons/clear-button","activity/buttons/undo-button","activity/buttons/redo-button","activity/modes/modes-pen","activity/modes/modes-eraser","activity/modes/modes-bucket","activity/modes/modes-text","activity/modes/modes-stamp","activity/modes/modes-copy","activity/modes/modes-paste","activity/collaboration","activity/buttons/insertimage-button"], function (activity,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20,p21) {
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

  require(['domReady!', 'sugar-web/datastore', 'paper-core', 'mustache', 'lzstring', 'humane'], function(doc, datastore, _paper, mustache, lzstring, humane) {

    /* Fetching and storing libraries */
    PaintApp.libs.mustache = mustache;
    PaintApp.libs.humane = humane;
    PaintApp.libs.lzstring = lzstring;

    //Setup of the activity
    activity.setup();

    /* Fetch and store UI elements */
    initGui();

    document.getElementById("stop-button").addEventListener('click', function(event) {
      var data = {
        width: PaintApp.elements.canvas.width / window.devicePixelRatio,
        height: PaintApp.elements.canvas.height / window.devicePixelRatio,
        src: PaintApp.collaboration.compress(PaintApp.elements.canvas.toDataURL())
      }

      var jsonData = JSON.stringify(data);

      activity.getDatastoreObject().setDataAsText(jsonData);
      activity.getDatastoreObject().save(function(error) {});
    });

    //Fetch of the history if not starting shared
    if (!window.top.sugar || !window.top.sugar.environment || !window.top.sugar.environment.sharedId) {
      activity.getDatastoreObject().loadAsText(function(error, metadata, jsonData) {
        if (jsonData == null) {
          return;
        }
        var data = JSON.parse(jsonData);
        PaintApp.clearCanvas();
        img = new Image();
        img.onload = function() {
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

  });

});
