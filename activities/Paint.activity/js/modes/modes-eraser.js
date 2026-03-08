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

      /* We draw a single point on mouse down */
      ctx.beginPath();
      ctx.strokeStyle = '#fff';
      ctx.lineCap = 'round';
      ctx.lineWidth = PaintApp.data.size;
      ctx.moveTo(event.point.x + 1, event.point.y + 1);
      ctx.lineTo(event.point.x, event.point.y);
      ctx.stroke();

      /* Mirror erase stroke to masterCanvas with pixelRatio scaling, expanding masterCanvas if needed */
      if (PaintApp.data.masterCanvas) {
        var pr = window.devicePixelRatio || 1;
        var px = event.point.x * pr;
        var py = event.point.y * pr;
        var mc = PaintApp.data.masterCanvas;
        var neededW = Math.ceil(px + PaintApp.data.size * pr + 10);
        var neededH = Math.ceil(py + PaintApp.data.size * pr + 10);
        if (neededW > mc.width || neededH > mc.height) {
          var expandW = Math.max(mc.width, neededW, Math.ceil(screen.width * pr));
          var expandH = Math.max(mc.height, neededH, Math.ceil(screen.height * pr));
          var tmp = document.createElement('canvas');
          tmp.width = mc.width; tmp.height = mc.height;
          tmp.getContext('2d').drawImage(mc, 0, 0);
          mc.width = expandW; mc.height = expandH;
          var newMc = mc.getContext('2d');
          newMc.fillStyle = '#ffffff'; newMc.fillRect(0, 0, expandW, expandH);
          newMc.drawImage(tmp, 0, 0);
        }
        var mCtx = mc.getContext('2d');
        mCtx.beginPath();
        mCtx.strokeStyle = '#fff';
        mCtx.lineCap = 'round';
        mCtx.lineWidth = PaintApp.data.size * pr;
        mCtx.moveTo((event.point.x + 1) * pr, (event.point.y + 1) * pr);
        mCtx.lineTo(px, py);
        mCtx.stroke();
      }

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

      /* We draw the move between points on mouse drag */
      ctx.beginPath();
      ctx.strokeStyle = '#fff';
      ctx.lineCap = 'round';
      ctx.lineWidth = PaintApp.data.size;
      ctx.moveTo(PaintApp.modes.Eraser.point.x, PaintApp.modes.Eraser.point.y);
      ctx.lineTo(event.point.x, event.point.y);
      ctx.stroke();

      /* Mirror erase stroke to masterCanvas with pixelRatio scaling, expanding masterCanvas if needed */
      if (PaintApp.data.masterCanvas) {
        var pr = window.devicePixelRatio || 1;
        var px = event.point.x * pr;
        var py = event.point.y * pr;
        var mc = PaintApp.data.masterCanvas;
        var neededW = Math.ceil(Math.max(PaintApp.modes.Eraser.point.x * pr, px) + PaintApp.data.size * pr + 10);
        var neededH = Math.ceil(Math.max(PaintApp.modes.Eraser.point.y * pr, py) + PaintApp.data.size * pr + 10);
        if (neededW > mc.width || neededH > mc.height) {
          var expandW = Math.max(mc.width, neededW, Math.ceil(screen.width * pr));
          var expandH = Math.max(mc.height, neededH, Math.ceil(screen.height * pr));
          var tmp = document.createElement('canvas');
          tmp.width = mc.width; tmp.height = mc.height;
          tmp.getContext('2d').drawImage(mc, 0, 0);
          mc.width = expandW; mc.height = expandH;
          var newMc = mc.getContext('2d');
          newMc.fillStyle = '#ffffff'; newMc.fillRect(0, 0, expandW, expandH);
          newMc.drawImage(tmp, 0, 0);
        }
        var mCtx = mc.getContext('2d');
        mCtx.beginPath();
        mCtx.strokeStyle = '#fff';
        mCtx.lineCap = 'round';
        mCtx.lineWidth = PaintApp.data.size * pr;
        mCtx.moveTo(PaintApp.modes.Eraser.point.x * pr, PaintApp.modes.Eraser.point.y * pr);
        mCtx.lineTo(px, py);
        mCtx.stroke();
      }

      /* If the activity is shared, we send the move to everyone */
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
      PaintApp.modes.Eraser.point = event.point;
    },
    onMouseUp: function(event) {
      PaintApp.saveCanvas();
    }
  };
  return Eraser;
});