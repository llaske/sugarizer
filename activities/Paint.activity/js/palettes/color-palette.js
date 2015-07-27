/* Color palette to choose the primary and secondary color */

define([
  'sugar-web/graphics/palette',
  'mustache'
], function(palette, mustache) {
  var colorpalette = {};

  function parseColor(input) {
    return input.split("(")[1].split(")")[0].split(",");
  }

  function initGui() {
    /* Init of the two palettes for primary and secondary primary */
    function onColorChangeFill(event) {
      PaintApp.data.color.fill = event.detail.color;
      colorsButtonFill.style.backgroundColor = event.detail.color;
      colorInvokerFill.style.backgroundColor = event.detail.color;

      var color = parseColor(event.detail.color);

      fillSliderRed.value = parseInt(color[0])
      fillSliderGreen.value = parseInt(color[1])
      fillSliderBlue.value = parseInt(color[2])
    }

    function onColorChangeStroke(event) {
      PaintApp.data.color.stroke = event.detail.color;
      colorsButtonStroke.style.backgroundColor = event.detail.color;
      colorInvokerStroke.style.backgroundColor = event.detail.color;

      var color = parseColor(event.detail.color);

      strokeSliderRed.value = parseInt(color[0])
      strokeSliderGreen.value = parseInt(color[1])
      strokeSliderBlue.value = parseInt(color[2])
    }

    var colorsButtonFill = document.getElementById('colors-button-fill');
    var colorPaletteFill = new PaintApp.palettes.colorPalette.ColorPalette(colorsButtonFill, undefined, "fill");


    var colorsButtonStroke = document.getElementById('colors-button-stroke');
    var colorPaletteStroke = new PaintApp.palettes.colorPalette.ColorPalette(colorsButtonStroke, undefined, "stroke");


    var fillSliderRed = document.getElementById('slider-fill-red');
    var fillSliderBlue = document.getElementById('slider-fill-blue');
    var fillSliderGreen = document.getElementById('slider-fill-green');

    var strokeSliderRed = document.getElementById('slider-stroke-red');
    var strokeSliderBlue = document.getElementById('slider-stroke-blue');
    var strokeSliderGreen = document.getElementById('slider-stroke-green');

    function generateColorFillSlider() {
      return {
        detail: {
          color: "rgb(" + fillSliderRed.value + "," + fillSliderGreen.value + "," + fillSliderBlue.value + ")"
        }
      }
    }

    function generateColorStrokeSlider() {
      return {
        detail: {
          color: "rgb(" + strokeSliderRed.value + "," + strokeSliderGreen.value + "," + strokeSliderBlue.value + ")"
        }
      }
    }

    fillSliderRed.onchange = function(e) {
      onColorChangeFill(generateColorFillSlider())
    }
    fillSliderBlue.onchange = function(e) {
      onColorChangeFill(generateColorFillSlider())
    }
    fillSliderGreen.onchange = function(e) {
      onColorChangeFill(generateColorFillSlider())
    }

    strokeSliderRed.onchange = function(e) {
      onColorChangeStroke(generateColorStrokeSlider())
    }
    strokeSliderBlue.onchange = function(e) {
      onColorChangeStroke(generateColorStrokeSlider())
    }
    strokeSliderGreen.onchange = function(e) {
      onColorChangeStroke(generateColorStrokeSlider())
    }

    colorPaletteFill.addEventListener('colorChange', onColorChangeFill);
    var colorInvokerFill = colorPaletteFill.getPalette().querySelector('.palette-invoker');
    colorPaletteFill.setColor(0);

    colorPaletteStroke.addEventListener('colorChange', onColorChangeStroke);
    var colorInvokerStroke = colorPaletteStroke.getPalette().querySelector('.palette-invoker');
    colorPaletteStroke.setColor(2);


  }

  colorpalette.initGui = initGui;

  /* We setup the palette with Sugar colors */
  colorpalette.ColorPalette = function(invoker, primaryText, type) {
    palette.Palette.call(this, invoker, primaryText);
    this.colorChangeEvent = document.createEvent('CustomEvent');
    this.colorChangeEvent.initCustomEvent('colorChange', true, true, {
      'color': '#ed2529'
    });
    this.template = '\
      <div style="width:370px;">\
          <div style="float:left; width: 190px;">\
          <table>\
            <tbody>\
              {{#rows}}\
                <tr>\
                  {{#.}}\
                    <td>\
                      <button style="background-color: {{ color }}"></button>\
                    </td>\
                  {{/.}}\
                </tr>\
              {{/rows}}\
            </tbody>\
            </table>\
          </div>\
\
          <div style="float:left; width: 150px; padding-top:10px">\
          Red\
          <input id="slider-' + type + '-red" type="range"  min="0" max="255" />\
\
          <br/>\
          <br/>\
          Green\
          <input id="slider-' + type + '-green" type="range"  min="0" max="255" />\
\
          <br/>\
          <br/>\
          Blue\
          <input id="slider-' + type + '-blue" type="range"  min="0" max="255" />\
\
          </div>\
\
      </div>'

      // this.template = '<tbody>' + '{{#rows}}' + '<tr>' + '{{#.}}' + '<td>' + '<button style="background-color: {{ color }}"></button>' + '</td>' + '{{/.}}' + '</tr>' + '{{/rows}}' + '</tbody>';
    var colorsElem = document.createElement('div');
    colorsElem.className = 'colors';
    var colorsData = {
      rows: [
        [{
          color: '#FF2B34'
        }, {
          color: '#00EA11'
        }, {
          color: '#005FE4'
        }],
        [{
          color: '#FF8F00'
        }, {
          color: '#008009'
        }, {
          color: '#00A0FF'
        }],
        [{
          color: '#FFFA00'
        }, {
          color: '#A700FF'
        }, {
          color: '#5E008C'
        }],
        [{
          color: '#000000'
        }, {
          color: '#919496'
        }, {
          color: '#ffffff'
        }]
      ]
    };
    colorsElem.innerHTML = mustache.render(this.template, colorsData);
    this.setContent([colorsElem]);
    //colorsElem.parentNode.style.width = '180px';
    colorsElem.parentNode.style.height = '225px';
    colorsElem.parentNode.style.overflowY = 'auto';
    colorsElem.parentNode.style.overflowX = 'hidden';

    // Pop-down the palette when a item in the menu is clicked.
    this.buttons = colorsElem.querySelectorAll('button');
    var that = this;

    function popDownOnButtonClick(event) {
      that.colorChangeEvent.detail.color = event.target.style.backgroundColor;
      that.getPalette().dispatchEvent(that.colorChangeEvent);
      that.popDown();
    }
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].addEventListener('click', popDownOnButtonClick);
    }
  };

  var setColor = function(index) {
    // Click the nth button
    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    this.buttons[index].dispatchEvent(event);
  };

  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  colorpalette.ColorPalette.prototype = Object.create(palette.Palette.prototype, {
    setColor: {
      value: setColor,
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
  return colorpalette;
});
