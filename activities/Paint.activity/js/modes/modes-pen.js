/* Pen mode is made to draw points and lines */

define([], function() {

  function initGui() {
    PaintApp.elements.penButton = document.getElementById('pen-button');
    PaintApp.paletteModesButtons.push(PaintApp.elements.penButton);
    PaintApp.elements.penButton.addEventListener('click', function() {
      PaintApp.paletteRemoveActiveClass();
      PaintApp.addActiveClassToElement(PaintApp.elements.penButton);
      PaintApp.switchMode('Pen');
    });
  }

  var Pen = {
    initGui: initGui,
    point: undefined,

    onMouseDown: function(event) {
      PaintApp.modes.Pen.point = event.point;
      var ctx = PaintApp.elements.canvas.getContext('2d');
      var worldCanvas = PaintApp.data.worldCanvas;
      var ctxs = [ctx];
      if (worldCanvas) {
        ctxs.push(worldCanvas.getContext('2d'));
      }

      /* We draw a single point on mouse down */
      ctxs.forEach(function (c) {
        c.beginPath();
        c.strokeStyle = PaintApp.data.color.fill;
        c.lineCap = 'round';
        c.lineWidth = PaintApp.data.size;
        c.moveTo(event.point.x + 1, event.point.y + 1);
        c.lineTo(event.point.x, event.point.y);
        c.stroke();
      });

      /* If the activity is shared, we send the point to everyone */
      if (PaintApp.data.isShared) {
        PaintApp.collaboration.sendMessage({
          action: 'path',
          data: {
            lineWidth: PaintApp.data.size,
            lineCap: 'round',
            strokeStyle: PaintApp.data.color.fill,
            from: {
              x: event.point.x + 1,
              y: event.point.y + 1
            },
            to: {
              x: event.point.x,
              y: event.point.y
            }
          }
        });
      }
    },

    onMouseDrag: function(event) {
      if (!PaintApp.modes.Pen.point) {
        return;
      }

      var ctx = PaintApp.elements.canvas.getContext('2d');
      var worldCanvas = PaintApp.data.worldCanvas;
      var ctxs = [ctx];
      if (worldCanvas) {
        ctxs.push(worldCanvas.getContext('2d'));
      }

      /* We draw the move between points on mouse drag */
      ctxs.forEach(function (c) {
        c.beginPath();
        c.strokeStyle = PaintApp.data.color.fill;
        c.lineWidth = PaintApp.data.size;
        c.moveTo(PaintApp.modes.Pen.point.x, PaintApp.modes.Pen.point.y);
        c.lineTo(event.point.x, event.point.y);
        c.stroke();
      });

      /* If the activity is shared, we send the move to everyone */
      if (PaintApp.data.isShared) {
        PaintApp.collaboration.sendMessage({
          action: 'path',
          data: {
            lineWidth: PaintApp.data.size,
            lineCap: 'round',
            strokeStyle: PaintApp.data.color.fill,
            from: {
              x: PaintApp.modes.Pen.point.x,
              y: PaintApp.modes.Pen.point.y
            },
            to: {
              x: event.point.x,
              y: event.point.y
            }
          }
        });
      }
      PaintApp.modes.Pen.point = event.point;
    },

    onMouseUp: function(event) {
      PaintApp.saveCanvas();
    }
  };
  return Pen;
});
