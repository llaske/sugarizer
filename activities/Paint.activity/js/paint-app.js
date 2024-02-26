/* PaintApp is a big object containing UI stuff, libraries and helpers */
define([], function() {
  /* Function to disable all active class inside the toolbar */
  function paletteRemoveActiveClass() {
    for (var i = 0; i < PaintApp.paletteModesButtons.length; i++) {
      PaintApp.paletteModesButtons[i].className = PaintApp.paletteModesButtons[i].className.replace(/(?:^|\s)active(?!\S)/g, '');
    }
  }

  /* Function to add active class to a specific element */
  function addActiveClassToElement(element) {
    element.className += ' active';
  }

  /* Switch current drawing mode */
  function switchMode(newMode) {
    saveCanvas();

    PaintApp.data.mode = newMode;
    PaintApp.handleCurrentFloatingElement();

    PaintApp.data.tool.onMouseDown = PaintApp.modes[newMode].onMouseDown;
    PaintApp.data.tool.onMouseDrag = PaintApp.modes[newMode].onMouseDrag;
    PaintApp.data.tool.onMouseUp = PaintApp.modes[newMode].onMouseUp;
  }

  /* Clear the canvas */
  function clearCanvas() {
    var ctx = PaintApp.elements.canvas.getContext('2d');
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, parseInt(PaintApp.elements.canvas.style.width), parseInt(PaintApp.elements.canvas.style.height));
    PaintApp.saveCanvas();
  }

  /* Trigger undo click, undo using the history */
  function undoCanvas() {
    //Removing any floating element
    PaintApp.handleCurrentFloatingElement();
    if (PaintApp.data.history.undo.length < 2) {
      return;
    }

    PaintApp.modes.Pen.point = undefined;
    var canvas = PaintApp.elements.canvas;
    var ctx = canvas.getContext('2d');
    var img = new Image();
    var imgSrc = PaintApp.data.history.undo[PaintApp.data.history.undo.length - 2];
    var imgSrc2 = PaintApp.data.history.undo[PaintApp.data.history.undo.length - 1];

    /* Loading of the image stored in history */
    img.onload = function() {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      /* If the activity is shared, will send the instruction to everyone */
      if (PaintApp.data.isShared) {
        try {
          PaintApp.collaboration.sendMessage({
            action: 'toDataURL',
            data: {
              width: PaintApp.elements.canvas.width / window.devicePixelRatio,
              height: PaintApp.elements.canvas.height / window.devicePixelRatio,
              src: PaintApp.collaboration.compress(PaintApp.elements.canvas.toDataURL())
            }
          });
        } catch (e) {
          return;
        }
      }

    };
    img.src = imgSrc;

    PaintApp.data.history.redo.push(imgSrc2);
    PaintApp.data.history.undo.pop();

    /* Update the availability of undo/redo */
    displayUndoRedoButtons();

    return imgSrc;
  }

  /* Trigger redo click, undo using the history */
  function redoCanvas() {
    //Removing any floating element
    handleCurrentFloatingElement();
    if (PaintApp.data.history.redo.length === 0) {
      return;
    }

    PaintApp.modes.Pen.point = undefined;
    var canvas = PaintApp.elements.canvas;
    var ctx = canvas.getContext('2d');
    var img = new Image();
    var imgSrc = PaintApp.data.history.redo[PaintApp.data.history.redo.length - 1];

    /* Loading of the image stored in history */
    img.onload = function() {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      /* If the activity is shared, will send the instruction to everyone */
      if (PaintApp.data.isShared) {
        try {
          PaintApp.collaboration.sendMessage({
            action: 'toDataURL',
            data: {
              width: PaintApp.elements.canvas.width / window.devicePixelRatio,
              height: PaintApp.elements.canvas.height / window.devicePixelRatio,
              src: PaintApp.collaboration.compress(PaintApp.elements.canvas.toDataURL())
            }
          });
        } catch (e) {}
      }
    };
    img.src = imgSrc;

    PaintApp.data.history.undo.push(imgSrc);
    PaintApp.data.history.redo.pop();

    /* Update the availability of undo/redo */
    displayUndoRedoButtons();

    return imgSrc;
  }

  /* Update the availability of undo/redo */
  function displayUndoRedoButtons() {
    var notAvailableOpacity = '0.4';
    var availableOpacity = '1';

    /* If activity is shared and we are not the host we cannot do undo/redo */
    if (PaintApp.data.isShared && !PaintApp.data.isHost) {
      PaintApp.elements.redoButton.style.opacity = notAvailableOpacity;
      PaintApp.elements.undoButton.style.opacity = notAvailableOpacity;
      return;
    }

    /* Check of the ability to use redo */
    if (PaintApp.data.history.redo.length === 0) {
      PaintApp.elements.redoButton.style.opacity = notAvailableOpacity;
    } else {
      PaintApp.elements.redoButton.style.opacity = availableOpacity;
    }

    /* Check of the ability to do use undo */
    if (PaintApp.data.history.undo.length <= 1) {
      PaintApp.elements.undoButton.style.opacity = notAvailableOpacity;
    } else {
      PaintApp.elements.undoButton.style.opacity = availableOpacity;
    }
  }

  /* Storing canvas onto history */
  function saveCanvas() {
    var canvas = PaintApp.elements.canvas;
    try {
      var image = canvas.toDataURL();
    } catch (e) {}

    /* If doing a new action, setting redo to an empty list */
    if ((PaintApp.data.history.undo.length > 0 && PaintApp.data.history.undo[PaintApp.data.history.undo.length - 1] !== image) || (PaintApp.data.history.undo.length === 0)) {
      PaintApp.data.history.undo.push(image);
      PaintApp.data.history.redo = [];
    }

    /* Limiting history size*/
    if (PaintApp.data.history.redo.length > PaintApp.data.history.limit) {
      PaintApp.data.history.redo = PaintApp.data.history.redo.slice(1);
    }

    /* Limiting history size*/
    if (PaintApp.data.history.undo.length > PaintApp.data.history.limit) {
      PaintApp.data.history.undo = PaintApp.data.history.undo.slice(1);
    }

    /* Refreshing undo / redo */
    displayUndoRedoButtons();

    /* If sharedActivity and not the host, tell the host to save his copy of the canvas */
    if (PaintApp.data.isShared && !PaintApp.data.isHost) {
      PaintApp.collaboration.sendMessage({
        action: 'saveCanvas'
      });
    }
  }

  /* Removing floating elements used by copy/paste, stamps, text */
  function handleCurrentFloatingElement() {
    if (PaintApp.data.currentElement !== undefined) {
      if (PaintApp.data.currentElement.type != 'copy/paste') {
        PaintApp.data.currentElement.element.parentElement.removeChild(PaintApp.data.currentElement.element);
        PaintApp.data.currentElement = undefined;
      } else {
        if (PaintApp.data.mode != 'Copy' && PaintApp.data.mode != 'Paste') {
          PaintApp.data.currentElement.element.parentElement.removeChild(PaintApp.data.currentElement.element);
          PaintApp.data.currentElement = undefined;
        }
      }
    }
  }


  /* PaintApp, contains the context of the application */
  var PaintApp = {
    libs: {},
    palettes: {},
    elements: {},
    buttons: {},
    paletteModesButtons: [],
    data: {
      isCompressEnabled: true,
      isHost: true,
      history: {
        limit: 15,
        undo: [],
        redo: []
      },
      size: 5,
      color: {
        stroke: '#1500A7',
        fill: '#ff0000'
      },
      tool: undefined
    },
    modes: {},
    switchMode: switchMode,
    undoCanvas: undoCanvas,
    redoCanvas: redoCanvas,
    displayUndoRedoButtons: displayUndoRedoButtons,
    saveCanvas: saveCanvas,
    clearCanvas: clearCanvas,
    paletteRemoveActiveClass: paletteRemoveActiveClass,
    addActiveClassToElement: addActiveClassToElement,
    handleCurrentFloatingElement: handleCurrentFloatingElement
  };
  return PaintApp;
});
