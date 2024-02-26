/* Color palette to choose the primary and secondary color */

define([
    'sugar-web/graphics/palette',
    'mustache'
], function (palette, mustache) {
    var colorpalette = {};

    function parseColor(input) {
        var colors = input.split("(")[1].split(")")[0].split(",");
        for (var i = 0; i < colors.length; i++) {
            colors[i] = parseInt(colors[i]);
        }

        return colors;
    }

    function initGui() {
        /* Init of the two palettes for primary and secondary primary */
        function onColorChangeFill(event) {
            PaintApp.data.color.fill = event.detail.color;
        }

        function onColorChangeStroke(event) {
            PaintApp.data.color.stroke = event.detail.color;
        }

        var colorsButtonFill = document.getElementById('colors-button-fill');
        var colorPaletteFill = new PaintApp.palettes.colorPalette.ColorPalette(colorsButtonFill, undefined);

        var colorsButtonStroke = document.getElementById('colors-button-stroke');
        var colorPaletteStroke = new PaintApp.palettes.colorPalette.ColorPalette(colorsButtonStroke, undefined);

        colorPaletteFill.addEventListener('colorChange', onColorChangeFill);
        var colorInvokerFill = colorPaletteFill.getPalette().querySelector('.palette-invoker');
        colorPaletteFill.setColor(0);

        colorPaletteStroke.addEventListener('colorChange', onColorChangeStroke);
        var colorInvokerStroke = colorPaletteStroke.getPalette().querySelector('.palette-invoker');
        colorPaletteStroke.setColor(2);
    }

    colorpalette.initGui = initGui;


    /* We setup the palette with Sugar colors */
    colorpalette.ColorPalette = function (invoker, primaryText) {
		this.invoker = invoker;
        palette.Palette.call(this, invoker, primaryText);
		this.getPalette().className += " colorpalette";
        this.colorChangeEvent = document.createEvent('CustomEvent');
        this.colorChangeEvent.initCustomEvent('colorChange', true, true, {
            'color': '#ed2529'
        });
        this.template = '\
        <style>\
            @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {\
                input[type=range] {\
                    width:100px;\
                    background-color: transparent !important; /* Hides the slider so custom styles can be added */\
                }\
                }\
        </style>\
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
          <input class="multiplatformInputSlider" type="range"  min="0" max="255" />\
\
          <br/>\
          <br/>\
          Green\
          <input class="multiplatformInputSlider" type="range"  min="0" max="255" />\
\
          <br/>\
          <br/>\
          Blue\
          <input class="multiplatformInputSlider" type="range"  min="0" max="255" />\
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
        colorsElem.parentNode.style.backgroundColor = 'black';
        colorsElem.parentNode.parentNode.style.maxWidth = '400px';
        colorsElem.parentNode.style.width = '330px';
        colorsElem.parentNode.style.height = '225px';
        colorsElem.parentNode.style.overflowY = 'auto';
        colorsElem.parentNode.style.overflowX = 'hidden';

        function updateSliders(color) {
            colors = parseColor(color);
            that.inputSliders[0].value = colors[0];
            that.inputSliders[1].value = colors[1];
            that.inputSliders[2].value = colors[2];
        }

        function popDownOnButtonClick(event, close, shouldUpdateSliders) {
            invoker.style.backgroundColor = event.target.style.backgroundColor;
            that.colorChangeEvent.detail.color = event.target.style.backgroundColor;
            that.getPalette().dispatchEvent(that.colorChangeEvent);
            that.getPalette().querySelector('.palette-invoker').style.backgroundColor = event.target.style.backgroundColor;
            if (close === null || close === undefined || close === true) {
                that.popDown();
            }
            if (shouldUpdateSliders === null || shouldUpdateSliders === undefined || shouldUpdateSliders === true) {
                updateSliders(that.colorChangeEvent.detail.color)
            }
        }


        function handleSliderChange() {
            popDownOnButtonClick({
                    target: {
                        style: {
                            backgroundColor: "rgb(" + that.inputSliders[0].value + "," + that.inputSliders[1].value + "," + that.inputSliders[2].value + ")"
                        }
                    }
                }, false, false
            )
        }

        // Pop-down the palette when a item in the menu is clicked.
        this.buttons = colorsElem.querySelectorAll('button');
        var that = this;
        that.colorsElem = colorsElem;
        var inputSliders = colorsElem.querySelectorAll("input[type=range]");
        that.inputSliders = inputSliders;
        for (var i = 0; i < inputSliders.length; i++) {
            inputSliders[i].onchange = function (e) {
                handleSliderChange();
            }
        }


        for (var i = 0; i < this.buttons.length; i++) {
            this.buttons[i].addEventListener('click', popDownOnButtonClick);
        }
    };

    var setColor = function (color) {
		// Look for matching button
		for (var i = 0 ; i < this.buttons.length ; i++) {
			if (this.buttons[i].style.backgroundColor == color) {
				var event = document.createEvent('MouseEvents');
				event.initEvent('click', true, true);
				this.buttons[i].dispatchEvent(event);
				break;
			}
		}
		
		// Set sliders values
		var colors = parseColor(color);
		this.inputSliders[0].value = colors[0];
		this.inputSliders[1].value = colors[1];
		this.inputSliders[2].value = colors[2];
		this.getPalette().querySelector('.palette-invoker').style.backgroundColor = color;
		this.invoker.style.backgroundColor = color;
    };

    var addEventListener = function (type, listener, useCapture) {
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
})
;
