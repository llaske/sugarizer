/* Copy mode will also to copy an area, this mode is intended to work with the paste made */
define([], function() {

  function initGui() {
    PaintApp.elements.copyButton = document.getElementById('copy-button');
    PaintApp.paletteModesButtons.push(PaintApp.elements.copyButton);
    PaintApp.elements.copyButton.addEventListener('click', function() {
      PaintApp.paletteRemoveActiveClass();
      PaintApp.addActiveClassToElement(PaintApp.elements.copyButton);
      PaintApp.switchMode('Copy');
    });
  }

  var Copy = {
    initGui: initGui,
    begin: undefined,
    end: undefined,
    onMouseDown: function(event) {
      if (PaintApp.data.currentElement) {
        PaintApp.data.currentElement.element.parentElement.removeChild(PaintApp.data.currentElement.element);
        PaintApp.data.currentElement = undefined;
      }

      begin = event.point;
      var left = event.point.x + 'px';
      var top = event.point.y + 55 + 'px';

      /* We are creating a floating div where the user clicked */

      var element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.padding = '0px';
      element.style.width = '1px';
      element.style.height = '1px';
      element.style.opacity = '0.5';
      element.style.pointerEvents = 'none';
      element.style.borderRadius = '0px';
      element.style.border = '5px dotted #500';
      element.style.left = left;
      element.style.top = top;
      element.style.verticalAlign = 'bottom';

      document.body.appendChild(element);
      /* Left and top relies on getBoundingClientRect so we need to set values after the DOM append */

      element.style.left = parseInt(left) - element.getBoundingClientRect().width / 2 + 'px';
      element.style.top = parseInt(top) - element.getBoundingClientRect().height / 2 + 'px';

      /* We store the currentElement */
      PaintApp.data.currentElement = {
        type: 'copy/paste',
        element: element,
        startPoint: {
          x: parseInt(element.style.left) + element.getBoundingClientRect().width / 2,
          y: parseInt(element.style.top) + element.getBoundingClientRect().height / 2
        }
      };
    },

    onMouseDrag: function(event) {
      /* We resize the floating element with the user drag */

      var end = event.point;
      if (begin.x <= end.x) {
        PaintApp.data.currentElement.element.style.width = end.x - begin.x + 'px';
      } else {
        PaintApp.data.currentElement.element.style.width = 0 + 'px';
      }
      if (begin.y <= end.y) {
        PaintApp.data.currentElement.element.style.height = Math.abs(begin.y - end.y) + 'px';
      } else {
        PaintApp.data.currentElement.element.style.height = 0 + 'px';
      }
    },

    onMouseUp: function(event) {
      /* When the user stops clicking we will do a calculation of the selected area */

      var end = event.point;
      end.y = end.y + 55;
      var width = parseInt(PaintApp.data.currentElement.element.style.width);
      var height = parseInt(PaintApp.data.currentElement.element.style.height);
      var canvas = PaintApp.elements.canvas;
      var ctx = PaintApp.elements.canvas.getContext('2d');

      if (begin.x < end.x && begin.y < end.y) {
        /* We save the whole canvas and then cut the selection corresponding to the floating selection */
        try {
          PaintApp.modes.Paste.data = canvas.toDataURL();
        } catch (e) {
          return;
        }
        var imgData = ctx.getImageData(begin.x * window.devicePixelRatio, begin.y * window.devicePixelRatio, width * window.devicePixelRatio, height * window.devicePixelRatio);
        canvas = document.createElement('canvas');
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.getContext('2d').putImageData(imgData, 0, 0);
        try {
          imgData = canvas.toDataURL();
        } catch (e) {
          return;
        }

        /* We fill the paste mode with the image, width and height and then switch to paste mode */
        PaintApp.modes.Paste.dataImage = {
          width: width / window.devicePixelRatio,
          height: height / window.devicePixelRatio,
          data: imgData
        };
        PaintApp.elements.pasteButton.click();
      }
    }
  };
  return Copy;
});
