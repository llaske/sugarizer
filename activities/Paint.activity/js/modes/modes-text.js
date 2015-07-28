/* Text mode will paste a text onto the canvas */
define([], function () {

  function initGui() {
    PaintApp.elements.textButton = document.getElementById('text-button');
    PaintApp.paletteModesButtons.push(PaintApp.elements.textButton);
    new PaintApp.palettes.textPalette.TextPalette(PaintApp.elements.textButton, undefined);
    PaintApp.elements.textFontSelect = document.getElementById('text-font-select');
    PaintApp.elements.textInput = document.getElementById('text-input');
    PaintApp.elements.textButton.addEventListener('click', function () {
      PaintApp.paletteRemoveActiveClass();
      PaintApp.addActiveClassToElement(PaintApp.elements.textButton);
      PaintApp.switchMode('Text');
    });
  }

  var Text = {
    initGui: initGui,
    defaultSize: 25,
    fontFamily: 'Arial',

    onMouseDown: function (event) {
      PaintApp.handleCurrentFloatingElement();
      text = PaintApp.elements.textInput.value;
      if (!text) {
        return;
      }

      /* We create a floating element with the text where the user clicked */
      var element = document.createElement('span');
      element.innerHTML = text;
      element.style.position = 'absolute';
      element.style.padding = '0px';
      element.size = text.length + 1;
      element.style.whiteSpace = 'nowrap';
      element.style.fontFamily = PaintApp.modes.Text.fontFamily;
      element.style.width = 'auto';
      element.style.lineHeight = PaintApp.modes.Text.lineHeight;
      element.style.fontSize = PaintApp.modes.Text.defaultSize + 'px';
      element.style.opacity = '0.5';
      element.style.borderRadius = '0px';
      element.style.border = '5px dotted #500';
      element.style.color = PaintApp.data.color.fill;
      var left = event.point.x + 'px';
      var top = event.point.y + 55 + 'px';
      element.style.left = left;
      element.style.top = top;
      element.style.verticalAlign = 'bottom';
      document.body.appendChild(element);
      element.style.left = parseInt(left) - element.getBoundingClientRect().width / 2 + 'px';
      element.style.top = parseInt(top) - element.getBoundingClientRect().height / 2 + 'px';

      /* Storing a floating element */
      PaintApp.data.currentElement = {
        type: 'text',
        element: element,
        startPoint: {
          x: parseInt(element.style.left) + element.getBoundingClientRect().width / 2,
          y: parseInt(element.style.top) + element.getBoundingClientRect().height / 2
        }
      };
    },

    onMouseDrag: function (event) {
      if (!PaintApp.data.currentElement) {
        return;
      }

      /* We change the size of the text with the mouse drag*/

      var distanceX = Math.abs(event.point.x - PaintApp.data.currentElement.startPoint.x);
      var distanceY = Math.abs(event.point.y - PaintApp.data.currentElement.startPoint.y + 55);
      if (distanceX > distanceY) {
        distance = distanceX;
      } else {
        distance = distanceY;
      }

      PaintApp.data.currentElement.element.style.fontSize = PaintApp.modes.Text.defaultSize + distance + 'px';
      PaintApp.data.currentElement.element.style.left = PaintApp.data.currentElement.startPoint.x - PaintApp.data.currentElement.element.getBoundingClientRect().width / 2 + 'px';
      PaintApp.data.currentElement.element.style.top = PaintApp.data.currentElement.startPoint.y - PaintApp.data.currentElement.element.getBoundingClientRect().height / 2 + 'px';
    },

    onMouseUp: function (event) {
      if (!PaintApp.data.currentElement) {
        return;
      }

      var txt = PaintApp.data.currentElement.element.innerHTML;
      var top = PaintApp.data.currentElement.element.getBoundingClientRect().top - 55 + PaintApp.data.currentElement.element.getBoundingClientRect().height;

      /* We draw the text inside the canvas */
      var ctx = PaintApp.elements.canvas.getContext('2d');
      ctx.font = PaintApp.data.currentElement.element.style.fontSize + ' ' + PaintApp.modes.Text.fontFamily;
      ctx.fillStyle = PaintApp.data.color.fill;
      ctx.textAlign = 'start';
      ctx.fillText(txt, 5 + PaintApp.data.currentElement.element.getBoundingClientRect().left, top);

      /* If the activity is shared we send the element to everyone */
      if (PaintApp.data.isShared) {
        PaintApp.collaboration.sendMessage({
            action: 'text',
            data: {
              font: PaintApp.data.currentElement.element.style.fontSize + ' ' + PaintApp.modes.Text.fontFamily,
              fillStyle: PaintApp.data.color.fill,
              textAlign: 'start',
              text: txt,
              left: 5 + PaintApp.data.currentElement.element.getBoundingClientRect().left,
              top: top
          }
        });
      }

      PaintApp.data.currentElement.element.parentElement.removeChild(PaintApp.data.currentElement.element);
      PaintApp.data.currentElement = undefined;
      PaintApp.saveCanvas();
    }
  };
  return Text;
});
