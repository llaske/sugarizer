/* Bucker mode will fill an area with a color */
define([], function() {

  function initGui() {
    PaintApp.elements.bucketButton = document.getElementById('bucket-button');
    PaintApp.paletteModesButtons.push(PaintApp.elements.bucketButton);
    PaintApp.elements.bucketButton.addEventListener('click', function() {
      PaintApp.paletteRemoveActiveClass();
      PaintApp.addActiveClassToElement(PaintApp.elements.bucketButton);
      PaintApp.switchMode('Bucket');
    });
  }

  //Floodfill functions
  function floodfill(x, y, fillcolor, ctx, width, height, tolerance) {
    var img = ctx.getImageData(0, 0, width, height);
    var data = img.data;
    var length = data.length;
    var Q = [];
    var i = (x + y * width) * 4;
    var e = i,
      w = i,
      me, mw, w2 = width * 4;
    var targetcolor = [
      data[i],
      data[i + 1],
      data[i + 2],
      data[i + 3]
    ];
    var targettotal = data[i] + data[i + 1] + data[i + 2] + data[i + 3];
    if (!pixelCompare(i, targetcolor, targettotal, fillcolor, data, length, tolerance)) {
      return false;
    }
    Q.push(i);
    while (Q.length) {
      i = Q.pop();
      if (pixelCompareAndSet(i, targetcolor, targettotal, fillcolor, data, length, tolerance)) {
        e = i;
        w = i;
        mw = parseInt(i / w2) * w2;
        me = mw + w2;
        while (mw < (w -= 4) && pixelCompareAndSet(w, targetcolor, targettotal, fillcolor, data, length, tolerance));
        while (me > (e += 4) && pixelCompareAndSet(e, targetcolor, targettotal, fillcolor, data, length, tolerance));
        for (var j = w; j < e; j += 4) {
          if (j - w2 >= 0 && pixelCompare(j - w2, targetcolor, targettotal, fillcolor, data, length, tolerance))
            Q.push(j - w2);
          if (j + w2 < length && pixelCompare(j + w2, targetcolor, targettotal, fillcolor, data, length, tolerance))
            Q.push(j + w2);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  //Floodfill functions
  function pixelCompare(i, targetcolor, targettotal, fillcolor, data, length, tolerance) {
    if (i < 0 || i >= length)
      return false;
    if (data[i + 3] === 0)
      return true;
    if (targetcolor[3] === fillcolor.a && targetcolor[0] === fillcolor.r && targetcolor[1] === fillcolor.g && targetcolor[2] === fillcolor.b)
      return false;
    if (targetcolor[3] === data[i + 3] && targetcolor[0] === data[i] && targetcolor[1] === data[i + 1] && targetcolor[2] === data[i + 2])
      return true;
    if (Math.abs(targetcolor[3] - data[i + 3]) <= 255 - tolerance && Math.abs(targetcolor[0] - data[i]) <= tolerance && Math.abs(targetcolor[1] - data[i + 1]) <= tolerance && Math.abs(targetcolor[2] - data[i + 2]) <= tolerance)
      return true;
    return false;
  }

  //Floodfill functions
  function pixelCompareAndSet(i, targetcolor, targettotal, fillcolor, data, length, tolerance) {
    if (pixelCompare(i, targetcolor, targettotal, fillcolor, data, length, tolerance)) {
      data[i] = fillcolor.r;
      data[i + 1] = fillcolor.g;
      data[i + 2] = fillcolor.b;
      data[i + 3] = 255;
      return true;
    }
    return false;
  }

  var Bucket = {
    initGui: initGui,
    lock: false,
    onMouseDown: function(event) {
      if (PaintApp.modes.Bucket.lock) {
        return;
      }
      var ctx = PaintApp.elements.canvas.getContext('2d');

      /* Transformation of the color used inside the palette to match with the bucket fill functions prototypes */
      var fillColor = { a: 255, r: 255, g: 0, b: 0 };
      var colorStr = PaintApp.data.color.fill;

      if (colorStr.indexOf('rgb') === 0) {
        var parts = colorStr.slice(colorStr.indexOf('(') + 1, colorStr.indexOf(')')).split(',');
        fillColor.r = parseInt(parts[0]);
        fillColor.g = parseInt(parts[1]);
        fillColor.b = parseInt(parts[2]);
      } else if (colorStr.indexOf('#') === 0) {
        if (colorStr.length === 4) {
          fillColor.r = parseInt(colorStr[1] + colorStr[1], 16);
          fillColor.g = parseInt(colorStr[2] + colorStr[2], 16);
          fillColor.b = parseInt(colorStr[3] + colorStr[3], 16);
        } else {
          fillColor.r = parseInt(colorStr.slice(1, 3), 16);
          fillColor.g = parseInt(colorStr.slice(3, 5), 16);
          fillColor.b = parseInt(colorStr.slice(5, 7), 16);
        }
      }

      /* Getting the clicked point */
      var pr = window.devicePixelRatio || 1;
      var p = ctx.getImageData(parseInt(event.point.x * pr), parseInt(event.point.y * pr), 1, 1).data;

      /* If the color of the point is too close to the required color we stop the process */
      /* We can't do a strict equality because browsers will auto change a few colors and we cannot prevent it... */
      if (Math.abs(p[0] - fillColor.r) <= 10 && Math.abs(p[1] - fillColor.g) <= 10 && Math.abs(p[2] - fillColor.b) <= 10) {
        PaintApp.modes.Bucket.lock = false;
        return;
      }
      /* Proceed with the bucket fill on the visible canvas */
      floodfill(parseInt(event.point.x * window.devicePixelRatio), parseInt(event.point.y * window.devicePixelRatio), fillColor, ctx, ctx.canvas.width, ctx.canvas.height, 5);

      /* Stretch the bucket-filled canvas across the entire masterCanvas so that the
         fill color covers the full screen-sized buffer. saveCanvas will then re-sync
         the small in-bounds region at 1:1 scale on top. */
      var pr = window.devicePixelRatio || 1;
      var screenW = Math.ceil(screen.width * pr);
      var screenH = Math.ceil(screen.height * pr);

      if (!PaintApp.data.masterCanvas) {
        PaintApp.data.masterCanvas = document.createElement('canvas');
        PaintApp.data.masterCanvas.width = Math.max(PaintApp.elements.canvas.width, screenW);
        PaintApp.data.masterCanvas.height = Math.max(PaintApp.elements.canvas.height, screenH);
        var mCtxInit = PaintApp.data.masterCanvas.getContext('2d');
        mCtxInit.fillStyle = "#ffffff";
        mCtxInit.fillRect(0, 0, PaintApp.data.masterCanvas.width, PaintApp.data.masterCanvas.height);
      }

      if (PaintApp.data.masterCanvas) {
        var mc = PaintApp.data.masterCanvas;

        // Explicitly ensuring masterCanvas covers the screen before stretching
        if (mc.width < screenW || mc.height < screenH) {
          var expandW = Math.max(mc.width, screenW);
          var expandH = Math.max(mc.height, screenH);
          var tmp = document.createElement('canvas');
          tmp.width = mc.width; tmp.height = mc.height;
          tmp.getContext('2d').drawImage(mc, 0, 0);
          mc.width = expandW; mc.height = expandH;
          var mcCtx = mc.getContext('2d');
          mcCtx.fillStyle = "#ffffff";
          mcCtx.fillRect(0, 0, expandW, expandH);
          mcCtx.drawImage(tmp, 0, 0);
        }
        var mCtx = PaintApp.data.masterCanvas.getContext('2d');
        mCtx.drawImage(
          PaintApp.elements.canvas,
          0, 0, PaintApp.elements.canvas.width, PaintApp.elements.canvas.height,
          0, 0, PaintApp.data.masterCanvas.width, PaintApp.data.masterCanvas.height
        );
      }

      PaintApp.saveCanvas();
      PaintApp.modes.Bucket.lock = false;

      /* If inside a shared activity, send the new image to everyone */
      if (PaintApp.data.isShared) {
        try {
          PaintApp.collaboration.sendMessage({
            action: 'toDataURL',
            data: {
              width: PaintApp.elements.canvas.width / window.devicePixelRatio,
              height: PaintApp.elements.canvas.height / window.devicePixelRatio,
              src: PaintApp.collaboration.compress(PaintApp.elements.canvas.toDataURL())
            }
          })
        } catch (e) {}
      }
    },
    onMouseDrag: function(event) {},
    onMouseUp: function(event) {}
  };
  return Bucket;
});