/* Paste mode will paste the selection made with the copy mode */
define([], function() {

  function initGui() {
    PaintApp.elements.pasteButton = document.getElementById('paste-button');
    PaintApp.paletteModesButtons.push(PaintApp.elements.pasteButton);
    PaintApp.elements.pasteButton.addEventListener('click', function() {
      PaintApp.paletteRemoveActiveClass();
      PaintApp.addActiveClassToElement(PaintApp.elements.pasteButton);
      PaintApp.switchMode('Paste');
    });
  }

  var Copy = {
    dataImage: undefined,
    initGui: initGui,

    onMouseDown: function(event) {
      return function() {

        /* We hide the floating element */
        if (PaintApp.data.currentElement) {
          PaintApp.data.currentElement.element.parentElement.removeChild(PaintApp.data.currentElement.element);
          PaintApp.data.currentElement = undefined;
        }

        /* Check for paste data */
        if (!PaintApp.modes.Paste.dataImage) {
          return;
        }

        PaintApp.modes.Paste.releasedFinger = false;
        PaintApp.handleCurrentFloatingElement();

        var left = event.point.x - PaintApp.modes.Paste.dataImage.width / 2 + 'px';
        var top = event.point.y + 55 - PaintApp.modes.Paste.dataImage.height / 2 + 'px';
        var ctx = PaintApp.elements.canvas.getContext('2d');
        var p = event.point;

        /* We create an img dom element where the user clicked */
        var element = document.createElement('img');
        element.src = PaintApp.modes.Paste.dataImage.data;
        element.style.width = PaintApp.modes.Paste.dataImage.width + 'px';
        element.style.height = PaintApp.modes.Paste.dataImage.height + 'px';
        element.style.position = 'absolute';
        element.style.left = left;
        element.style.padding = '0px';
        element.style.border = '5px dotted #500';
        element.style.top = top;

        document.body.appendChild(element);

        /* We store the floating element */
        PaintApp.data.currentElement = {
          type: 'paste',
          element: element,
          startPoint: {
            x: parseInt(element.style.left) + element.getBoundingClientRect().width / 2,
            y: parseInt(element.style.top) + element.getBoundingClientRect().height / 2
          }
        };

        /* This will prevent bugs for mobile platforms if the user just do a single tap we won't get onMouseDrag and onMouseUp correctly*/
        if (PaintApp.modes.Paste.releasedFinger) {
          ctx = PaintApp.elements.canvas.getContext('2d');

          /* We draw the copied area to the canvas where the user clicked */
          ctx.drawImage(PaintApp.data.currentElement.element, 5 + PaintApp.data.currentElement.element.getBoundingClientRect().left, PaintApp.data.currentElement.element.getBoundingClientRect().top - 55 + 5);

          /* If the activity is shared we send the element to everyone */
          if (PaintApp.data.isShared) {
            var drawImage = {
              src: PaintApp.collaboration.compress(PaintApp.data.currentElement.element.src),
              left: PaintApp.data.currentElement.element.getBoundingClientRect().left,
              top: PaintApp.data.currentElement.element.getBoundingClientRect().top - 55 + 5,
              width: PaintApp.data.currentElement.element.getBoundingClientRect().width,
              height: PaintApp.data.currentElement.element.getBoundingClientRect().height
            };
            PaintApp.collaboration.sendMessage({
              action: 'drawImage',
              data: drawImage
            })
          }
          PaintApp.data.currentElement.element.parentElement.removeChild(PaintApp.data.currentElement.element);
          PaintApp.data.currentElement = undefined;
          PaintApp.saveCanvas();
        }
      }();
    },

    onMouseDrag: function(event) {
      if (!PaintApp.data.currentElement) {
        return;
      }

      /* We move the floating pasting where the mouse is dragged */
      var left = event.point.x - PaintApp.modes.Paste.dataImage.width / 2 + 'px';
      var top = event.point.y + 55 - PaintApp.modes.Paste.dataImage.height / 2 + 'px';
      PaintApp.data.currentElement.element.style.left = left;
      PaintApp.data.currentElement.element.style.top = top;
    },

    onMouseUp: function(event) {
      PaintApp.modes.Paste.releasedFinger = true;
      if (!PaintApp.data.currentElement) {
        return;
      }
      var ctx = PaintApp.elements.canvas.getContext('2d');

      /* We draw the copied area to the canvas where the user clicked */
      ctx.drawImage(PaintApp.data.currentElement.element, PaintApp.data.currentElement.element.getBoundingClientRect().left, PaintApp.data.currentElement.element.getBoundingClientRect().top - 55, PaintApp.data.currentElement.element.getBoundingClientRect().width, PaintApp.data.currentElement.element.getBoundingClientRect().height);

      /* If the activity is shared we send the element to everyone */
      if (PaintApp.data.isShared) {
        var drawImage = {
          src: PaintApp.data.currentElement.element.src,
          left: PaintApp.data.currentElement.element.getBoundingClientRect().left,
          top: PaintApp.data.currentElement.element.getBoundingClientRect().top - 55,
          width: PaintApp.data.currentElement.element.getBoundingClientRect().width,
          height: PaintApp.data.currentElement.element.getBoundingClientRect().height
        };
        PaintApp.collaboration.sendMessage({
          action: 'drawImage',
          data: drawImage
        })
      }

      PaintApp.data.currentElement.element.parentElement.removeChild(PaintApp.data.currentElement.element);
      PaintApp.data.currentElement = undefined;
      PaintApp.saveCanvas();
    }
  };
  return Copy;
});
