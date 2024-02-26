/* Clear button will clear the canvas */
define([], function() {
  function onClearClick() {
    PaintApp.clearCanvas();

    /* If the activity is shared, will send the instruction to everyone */
    if (PaintApp.data.isShared) {
      PaintApp.collaboration.sendMessage({
        action: 'clearCanvas'
      });
    }
  }

  function initGui() {
    var clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', onClearClick);
  }
  var clearButton = {
    initGui: initGui
  };
  return clearButton;
});
