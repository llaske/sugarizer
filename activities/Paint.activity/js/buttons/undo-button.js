/* Undo button will undo the canvas using the history */
define([], function() {
  function undo() {
    var data = PaintApp.undoCanvas();
  }

  function initGui() {
    var undoButton = document.getElementById('undo-button');
    PaintApp.elements.undoButton = undoButton;
    undoButton.addEventListener('click', undo);
  }

  function hideGui() {
    var undoButton = document.getElementById('undo-button');
    PaintApp.elements.undoButton = undoButton;
    PaintApp.elements.undoButton.disabled = true;
  }

  var undoButton = {
    initGui: initGui,
    hideGui: hideGui
  };

  return undoButton;
});
