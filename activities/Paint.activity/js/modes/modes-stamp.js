/* Stamp mode will paste a stamp onto the canvas */

define([], function() {

  function initGui() {
    PaintApp.elements.stampsButton = document.getElementById('stamps-button');
    PaintApp.paletteModesButtons.push(PaintApp.elements.stampsButton);
    PaintApp.elements.stampsButton.addEventListener('click', function() {
      PaintApp.paletteRemoveActiveClass();
      PaintApp.addActiveClassToElement(PaintApp.elements.stampsButton);
      PaintApp.switchMode('Stamp');
    });

    /* We handle changes from the stamp palette */
    function onStampChange(event) {
      PaintApp.data.stamp = event.detail.stamp;
      PaintApp.data.stampBase = event.detail.stampBase;
      if (event.detail.proportionnal && event.detail.proportionnal === 'true') {
        PaintApp.data.stampProportionnal = true;
      } else {
        PaintApp.data.stampProportionnal = false;
      }
    }
    var stampPalette = new PaintApp.palettes.stampPalette.StampPalette(PaintApp.elements.stampsButton, undefined);
    stampPalette.addEventListener('stampChange', onStampChange);
    var stampInvoker = stampPalette.getPalette().querySelector('.palette-invoker');
    stampPalette.setStamp(0);
  }

  //Handle the coloring of a SVG (specific header required)
  function changeColors(iconData, fillColor, strokeColor) {
    var fillColorRegex = /<!ENTITY fill_color "(.*?)">/g;
    var strokeColorRegex = /<!ENTITY stroke_color "(.*?)">/g;
    iconData = iconData.replace(fillColorRegex, '<!ENTITY fill_color "' + fillColor + '">');
    iconData = iconData.replace(strokeColorRegex, '<!ENTITY stroke_color "' + strokeColor + '">');
    return iconData;
  }

  var Stamp = {
    initGui: initGui,
    changeColors: changeColors,
    defaultSize: 80,
    onMouseDown: function(event) {
      return function() {

        PaintApp.modes.Stamp.releasedFinger = false;
        PaintApp.handleCurrentFloatingElement();

        var width = PaintApp.modes.Stamp.defaultSize;
        var height = PaintApp.modes.Stamp.defaultSize;
        var left = event.point.x - width / 2 + 'px';
        var top = event.point.y + 55 - height / 2 + 'px';

        /* Calculation of the svg url */
        var url = window.location.href.split('/');
        url.pop();
        url = url.join('/') + '/' + PaintApp.data.stamp;


        var ctx = PaintApp.elements.canvas.getContext('2d');
        var p = event.point;

        /* Http request to load the stamp */
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function(e) {
          if (request.status === 200 || request.status === 0) {
            var imgSRC = request.responseText;

            /* We change the color of the stamp to match ours */
            imgSRC = changeColors(imgSRC, PaintApp.data.color.fill, PaintApp.data.color.stroke);

            /* We add a floating element image with the stamp */
            var element = document.createElement('img');
            element.style.backgroundRepeat = 'no-repeat';
            element.style.backgroundSize = 'contain';
            element.src = 'data:image/svg+xml;base64,' + btoa(imgSRC);
            element.style.width = width + 'px';
            element.style.height = height + 'px';
            element.style.position = 'absolute';
            element.style.left = left;
            element.style.padding = '0px';
            element.style.border = '5px dotted #500';
            element.style.resize = 'both';
            element.style.top = top;
            document.body.appendChild(element);

            /* We store the floating element */
            PaintApp.data.currentElement = {
              type: 'stamp',
              element: element,
              proportionnal: PaintApp.data.stampProportionnal,
              startPoint: {
                x: parseInt(element.style.left) + element.getBoundingClientRect().width / 2,
                y: parseInt(element.style.top) + element.getBoundingClientRect().height / 2
              }
            };

            /* This will prevent bugs for mobile platforms if the user just do a single tap we won't get onMouseDrag and onMouseUp correctly*/
            if (PaintApp.modes.Stamp.releasedFinger) {
              var ctx = PaintApp.elements.canvas.getContext('2d');

              /* We draw the stamp to the canvas where the user clicked */
              ctx.drawImage(PaintApp.data.currentElement.element, 5 + PaintApp.data.currentElement.element.getBoundingClientRect().left, PaintApp.data.currentElement.element.getBoundingClientRect().top - 55 + 5);

              /* If the activity is shared we send the element to everyone */
              if (PaintApp.data.isShared) {
                var drawImage = {
                  stampBase: PaintApp.data.stampBase,
                  color: {
                    fill: PaintApp.data.color.fill,
                    stroke: PaintApp.data.color.stroke
                  },
                  left: PaintApp.data.currentElement.element.getBoundingClientRect().left,
                  top: PaintApp.data.currentElement.element.getBoundingClientRect().top - 55 + 5,
                  width: PaintApp.data.currentElement.element.getBoundingClientRect().width,
                  height: PaintApp.data.currentElement.element.getBoundingClientRect().height
                };

                PaintApp.collaboration.sendMessage({
                  action: 'drawStamp',
                  data: drawImage
                });
              }

              PaintApp.data.currentElement.element.parentElement.removeChild(PaintApp.data.currentElement.element);
              PaintApp.data.currentElement = undefined;
              PaintApp.saveCanvas();
            }
          }
        };
        request.send(null);
      }();
    },

    onMouseDrag: function(event) {
      if (!PaintApp.data.currentElement) {
        return;
      }

      /* We will resize the floating element with the mouse drag */

      var distanceX = Math.abs(event.point.x - PaintApp.data.currentElement.startPoint.x);
      var distanceY = Math.abs(event.point.y - PaintApp.data.currentElement.startPoint.y + 55);
      if (distanceX > distanceY) {
        distance = distanceX;
      } else {
        distance = distanceY;
      }

      /* The resize can be kept proportionnal or not (this is configured inside the stamp palette) */
      if (PaintApp.data.stampProportionnal) {
        PaintApp.data.currentElement.element.style.width = PaintApp.modes.Stamp.defaultSize + distance + 'px';
        PaintApp.data.currentElement.element.style.height = PaintApp.modes.Stamp.defaultSize + distance + 'px';
      } else {
        PaintApp.data.currentElement.element.style.width = PaintApp.modes.Stamp.defaultSize + distanceX + 'px';
        PaintApp.data.currentElement.element.style.height = PaintApp.modes.Stamp.defaultSize + distanceY + 'px';
      }

      PaintApp.data.currentElement.element.style.left = PaintApp.data.currentElement.startPoint.x - PaintApp.data.currentElement.element.getBoundingClientRect().width / 2 + 'px';
      PaintApp.data.currentElement.element.style.top = PaintApp.data.currentElement.startPoint.y - PaintApp.data.currentElement.element.getBoundingClientRect().height / 2 + 'px';
    },

    onMouseUp: function(event) {
      PaintApp.modes.Stamp.releasedFinger = true;
      if (!PaintApp.data.currentElement) {
        return;
      }
      var ctx = PaintApp.elements.canvas.getContext('2d');

      /* We draw the stamp to the canvas where the user clicked */
      ctx.drawImage(PaintApp.data.currentElement.element, PaintApp.data.currentElement.element.getBoundingClientRect().left, PaintApp.data.currentElement.element.getBoundingClientRect().top - 55, PaintApp.data.currentElement.element.getBoundingClientRect().width, PaintApp.data.currentElement.element.getBoundingClientRect().height);

      /* If the activity is shared we send the element to everyone */
      if (PaintApp.data.isShared) {
        var drawImage = {
          stampBase: PaintApp.data.stampBase,
          color: {
            fill: PaintApp.data.color.fill,
            stroke: PaintApp.data.color.stroke
          },
          left: PaintApp.data.currentElement.element.getBoundingClientRect().left,
          top: PaintApp.data.currentElement.element.getBoundingClientRect().top - 55,
          width: PaintApp.data.currentElement.element.getBoundingClientRect().width,
          height: PaintApp.data.currentElement.element.getBoundingClientRect().height
        };
        PaintApp.collaboration.sendMessage({
          action: 'drawStamp',
          data: drawImage
        });
      }

      PaintApp.data.currentElement.element.parentElement.removeChild(PaintApp.data.currentElement.element);
      PaintApp.data.currentElement = undefined;
      PaintApp.saveCanvas();
    }
  };
  return Stamp;
});
