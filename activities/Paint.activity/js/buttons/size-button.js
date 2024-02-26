/* Size button will change the size of the drawings for pencil and eraser */
define([], function() {

  /* onClick change size and icon */
  function onSizeClick() {
    var sizeSVG = '1';
    var size = PaintApp.data.size;

    switch (size) {
      case 5:
        size = 10;
        sizeSVG = '2';
        break;
      case 10:
        size = 15;
        sizeSVG = '3';
        break;
      case 15:
        size = 20;
        sizeSVG = '4';
        break;
      case 20:
        size = 5;
        sizeSVG = '1';
        break;
    }

    PaintApp.data.size = size;
    PaintApp.elements.sizeButton.style.backgroundImage = 'url(icons/size-' + sizeSVG + '.svg)';
  }

  function initGui() {
    var sizeButtonElement = document.getElementById('size-button');
    PaintApp.elements.sizeButton = sizeButtonElement;
    sizeButtonElement.addEventListener('click', onSizeClick);
  }

  var sizeButton = {
    initGui: initGui
  };

  return sizeButton;
});
