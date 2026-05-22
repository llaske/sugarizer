/* Eraser mode is like pen mode but with #fff color */
define([], function() {

  function initGui() {
    PaintApp.elements.eraserButton = document.getElementById('eraser-button');
    PaintApp.paletteModesButtons.push(PaintApp.elements.eraserButton);
    PaintApp.elements.eraserButton.addEventListener('click', function() {
      PaintApp.paletteRemoveActiveClass();
      PaintApp.addActiveClassToElement(PaintApp.elements.eraserButton);
      PaintApp.switchMode('Eraser');
    });
  }

  var Eraser = {
    initGui: initGui,
    onMouseDown: function(event) {
      PaintApp.modes.Eraser.point = event.point;
      var ctx = PaintApp.elements.canvas.getContext('2d');
      var worldCanvas = PaintApp.data.worldCanvas;
      var ctxs = [ctx];
      if (worldCanvas) {
        ctxs.push(worldCanvas.getContext('2d'));
      }

      /* We draw a single point on mouse down */
      ctxs.forEach(function (c) {
        c.beginPath();
        c.strokeStyle = '#fff';
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
            strokeStyle: '#fff',
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
      if (!PaintApp.modes.Eraser.point) {
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
        c.strokeStyle = '#fff';
        c.lineCap = 'round';
        c.lineWidth = PaintApp.data.size;
        c.moveTo(PaintApp.modes.Eraser.point.x, PaintApp.modes.Eraser.point.y);
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
            strokeStyle: '#fff',
            /*Use the previously tracked eraser position instead of the current point,
             so collaborators receive correctly connected stroke segments */
            from: {
              x: PaintApp.modes.Eraser.point.x,
              y: PaintApp.modes.Eraser.point.y
            },
            to: {
              x: event.point.x,
              y: event.point.y
            }
          }
        });
      }
      PaintApp.modes.Eraser.point = event.point;
    },
    onMouseUp: function(event) {
      PaintApp.saveCanvas();
    }
  };
  return Eraser;
});
