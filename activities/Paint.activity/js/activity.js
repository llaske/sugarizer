/* Start of the app, we require everything that is needed */
define(function(require) {
  var activity = require("sugar-web/activity/activity");

  window.PaintApp = require("activity/paint-app");
  require("activity/paint-activity");

  PaintApp.libs.activity = activity;

  /* Fetching and storing of the palettes */
  PaintApp.palettes.presencePalette = require("sugar-web/graphics/presencepalette");
  PaintApp.palettes.colorPalette = require("activity/palettes/color-palette");
  PaintApp.palettes.stampPalette = require("activity/palettes/stamp-palette");
  PaintApp.palettes.textPalette = require("activity/palettes/text-palette");
  PaintApp.palettes.drawingsPalette = require("activity/palettes/drawings-palette");
  PaintApp.palettes.filtersPalette = require("activity/palettes/filters-palette");

  /* Fetching and storing of the buttons */
  PaintApp.buttons.sizeButton = require("activity/buttons/size-button");
  PaintApp.buttons.clearButton = require("activity/buttons/clear-button");
  PaintApp.buttons.undoButton = require("activity/buttons/undo-button");
  PaintApp.buttons.redoButton = require("activity/buttons/redo-button");

  /* Fetching and storing of the modes */
  PaintApp.modes.Pen = require("activity/modes/modes-pen");
  PaintApp.modes.Eraser = require("activity/modes/modes-eraser");
  PaintApp.modes.Bucket = require("activity/modes/modes-bucket");
  PaintApp.modes.Text = require("activity/modes/modes-text");
  PaintApp.modes.Stamp = require("activity/modes/modes-stamp");
  PaintApp.modes.Copy = require("activity/modes/modes-copy");
  PaintApp.modes.Paste = require("activity/modes/modes-paste");

  PaintApp.collaboration = require("activity/collaboration");

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
