/* Drawing palette to display a drawing onto the canvas */

define([
  'sugar-web/graphics/palette',
  'mustache'
], function(palette, mustache) {
  var drawingspalette = {};

  function onDrawingSelect(event) {

    /* Calculation of the drawing url */
    var url = window.location.href.split('/');
    url.pop();
    url = url.join('/') + '/' + event.detail.drawings;

    var ctx = PaintApp.elements.canvas.getContext('2d');

    /* Http request to load the drawing */
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function(e) {
      if (request.status === 200 || request.status === 0) {
        var imgSRC = request.responseText;

        //We load the drawing inside an image element
        var element = document.createElement('img');
        element.src = 'data:image/svg+xml;base64,' + btoa(imgSRC);
        element.onload = function() {

          //We draw the drawing to the canvas
          var ctx = PaintApp.elements.canvas.getContext('2d');
          var imgWidth = element.width;
          var imgHeight = element.height;
          var maxWidth = PaintApp.elements.canvas.getBoundingClientRect().width;
          var maxHeight = PaintApp.elements.canvas.getBoundingClientRect().height;
          var ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
          var newWidth = ratio * imgWidth;
          var newHeight = ratio * imgHeight;
          ctx.clearRect(0, 0, PaintApp.elements.canvas.width, PaintApp.elements.canvas.height);
          ctx.drawImage(element, 0, 0, newWidth, newHeight);

          PaintApp.saveCanvas();

          /* If the activity is shared we send the element to everyone */
          if (PaintApp.data.isShared) {
            try {
              PaintApp.collaboration.sendMessage({
                action: 'toDataURL',
                data: {
                  width: PaintApp.elements.canvas.width / window.devicePixelRatio,
                  height: PaintApp.elements.canvas.height / window.devicePixelRatio,
                  src: PaintApp.collaboration.compress(PaintApp.elements.canvas.toDataURL())
                }
              });
            } catch (e) {}
          }

        };
      }
    };
    request.send(null);
  }

  function initGui() {
    var drawingsButton = document.getElementById('drawings-button');
    var drawingsPalette = new PaintApp.palettes.drawingsPalette.DrawingsPalette(drawingsButton, undefined);
    drawingsPalette.addEventListener('drawingsChange', onDrawingSelect);
  }

  drawingspalette.initGui = initGui;

  /* We setup the palette with drawings */
  drawingspalette.DrawingsPalette = function(invoker, primaryText) {
    palette.Palette.call(this, invoker, primaryText);
    this.drawingsChangeEvent = document.createEvent('CustomEvent');
    this.drawingsChangeEvent.initCustomEvent('drawingsChange', true, true, {
      'drawings': 'icons/size-1.svg'
    });
    this.template = '<tbody>' + '{{#rows}}' + '<tr>' + '{{#.}}' + '<td>' + '<button value="{{drawings}}" style="height:55px; width:55px; background-size: 55px 55px; background-image: url({{ drawings }}); background-repeat: no-repeat; background-position: center; "></button>' + '</td>' + '{{/.}}' + '</tr>' + '{{/rows}}' + '</tbody>';
    var drawingssElem = document.createElement('table');
    drawingssElem.className = 'drawingss';
    var drawingssData = {
      rows: [
        [{
          drawings: 'drawings/woodpecker.svg'
        }, {
          drawings: 'drawings/tortoise.svg'
        }, {
          drawings: 'drawings/manatee.svg'
        }],
        [{
          drawings: 'drawings/dog.svg'
        }, {
          drawings: 'drawings/goldfinch.svg'
        }, {
          drawings: 'drawings/mammoth.svg'
        }]
      ]
    };
    drawingssElem.innerHTML = mustache.render(this.template, drawingssData);
    this.setContent([drawingssElem]);
    // Pop-down the palette when a item in the menu is clicked.
    this.buttons = drawingssElem.querySelectorAll('button');
    var that = this;

    function popDownOnButtonClick(event) {
      that.drawingsChangeEvent.detail.drawings = event.target.value;
      that.getPalette().dispatchEvent(that.drawingsChangeEvent);
      that.popDown();
    }
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].addEventListener('click', popDownOnButtonClick);
    }
  };

  var setdrawings = function(index) {
    // Click the nth button
    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    this.buttons[index].dispatchEvent(event);
  };
  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  drawingspalette.DrawingsPalette.prototype = Object.create(palette.Palette.prototype, {
    setdrawings: {
      value: setdrawings,
      enumerable: true,
      configurable: true,
      writable: true
    },
    addEventListener: {
      value: addEventListener,
      enumerable: true,
      configurable: true,
      writable: true
    }
  });
  return drawingspalette;
});
