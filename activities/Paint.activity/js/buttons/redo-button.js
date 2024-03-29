/* Redo button will redo the canvas using the history */
define([], function () {
  function redo() {
    var data = PaintApp.redoCanvas();
  }
  function initGui() {
    var redoButton = document.getElementById('redo-button');
    PaintApp.elements.redoButton = redoButton;
    document.querySelector("body").addEventListener("keydown", (event)=> {
      if(event.key == "y" && event.ctrlKey == true) {
        redo();
      }
    })
    redoButton.addEventListener('click', redo);
  }
  function hideGui() {
    var redoButton = document.getElementById('redo-button');
    PaintApp.elements.redoButton = redoButton;
    PaintApp.elements.redoButton.disabled = 'none';
  }
  var redoButton = {
    initGui: initGui,
    hideGui: hideGui
  };
  return redoButton;
});
