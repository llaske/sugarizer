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
      var mCtx = PaintApp.data.masterCanvas ? PaintApp.data.masterCanvas.getContext('2d') : null;

      /* We draw a single point on mouse down */
      ctx.beginPath();
      ctx.strokeStyle = PaintApp.data.color.fill;
      ctx.lineCap = 'round';
      ctx.lineWidth = PaintApp.data.size;
      ctx.moveTo(event.point.x + 1, event.point.y + 1);
      ctx.lineTo(event.point.x, event.point.y);
      ctx.stroke();

      /* Mirror stroke to masterCanvas with pixelRatio scaling, expanding masterCanvas if needed */
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
        mCtx.strokeStyle = PaintApp.data.color.fill;
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

      /* We draw the move between points on mouse drag */
      ctx.beginPath();
      ctx.strokeStyle = PaintApp.data.color.fill;
      ctx.lineWidth = PaintApp.data.size;
      ctx.moveTo(PaintApp.modes.Pen.point.x, PaintApp.modes.Pen.point.y);
      ctx.lineTo(event.point.x, event.point.y);
      ctx.stroke();

      /* Mirror stroke to masterCanvas with pixelRatio scaling, expanding masterCanvas if needed */
      if (PaintApp.data.masterCanvas) {
        var pr = window.devicePixelRatio || 1;
        var px = event.point.x * pr;
        var py = event.point.y * pr;
        var mc = PaintApp.data.masterCanvas;
        var neededW = Math.ceil(Math.max(PaintApp.modes.Pen.point.x * pr, px) + PaintApp.data.size * pr + 10);
        var neededH = Math.ceil(Math.max(PaintApp.modes.Pen.point.y * pr, py) + PaintApp.data.size * pr + 10);
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
        mCtx.strokeStyle = PaintApp.data.color.fill;
        mCtx.lineCap = 'round';
        mCtx.lineWidth = PaintApp.data.size * pr;
        mCtx.moveTo(PaintApp.modes.Pen.point.x * pr, PaintApp.modes.Pen.point.y * pr);
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