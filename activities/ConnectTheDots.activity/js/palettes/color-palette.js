define([
  'sugar-web/graphics/palette',
  'mustache'
], function(palette, mustache) {
  var colorpalette = {};

  function parseColor(input) {
    return input.split("(")[1].split(")")[0].split(",");
  }

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

    // Sliders handling
    var sliderRed = colorsElem.querySelector('#slider-' + type + '-red');
    var sliderGreen = colorsElem.querySelector('#slider-' + type + '-green');
    var sliderBlue = colorsElem.querySelector('#slider-' + type + '-blue');

    function onSliderChange() {
      that.colorChangeEvent.detail.color = "rgb(" + sliderRed.value + ", " + sliderGreen.value + ", " + sliderBlue.value + ")";
      that.getPalette().dispatchEvent(that.colorChangeEvent);
    }

    if (sliderRed && sliderGreen && sliderBlue) {
      sliderRed.addEventListener('change', onSliderChange);
      sliderGreen.addEventListener('change', onSliderChange);
      sliderBlue.addEventListener('change', onSliderChange);

      // Also listen to input for real-time updates while dragging
      sliderRed.addEventListener('input', onSliderChange);
      sliderGreen.addEventListener('input', onSliderChange);
      sliderBlue.addEventListener('input', onSliderChange);

      that.getPalette().addEventListener('colorChange', function(e) {
        var color = e.detail.color;
        if (color && color.indexOf('rgb') !== -1) {
          var parts = parseColor(color);
          if (parts && parts.length === 3) {
            sliderRed.value = parseInt(parts[0]);
            sliderGreen.value = parseInt(parts[1]);
            sliderBlue.value = parseInt(parts[2]);
          }
        }
      });
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
