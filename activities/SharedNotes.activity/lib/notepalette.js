/* Color palette to choose note color */

define([
    'sugar-web/graphics/palette',
    'mustache'
], function (palette, mustache) {
    var notepalette = {};

    function parseColor(input) {
        var colors = input.split("(")[1].split(")")[0].split(",");
        for (var i = 0; i < colors.length; i++) {
            colors[i] = parseInt(colors[i]);
        }

        return colors;
    }

    function initGui() {

        function onColorChangeFill(event) {
            PaintApp.data.color.fill = event.detail.color;
        }

        var colorsButtonFill = document.getElementById('colors-button-fill');
        var colorPaletteFill = new PaintApp.palettes.notePalette.NotePalette(colorsButtonFill, undefined);

        colorPaletteFill.addEventListener('colorChange', onColorChangeFill);
        var colorInvokerFill = colorPaletteFill.getPalette().querySelector('.palette-invoker');
        colorPaletteFill.setColor(0);
    }

    notepalette.initGui = initGui;


    /* We setup the palette with Sugar colors */
    notepalette.NotePalette = function (invoker, primaryText) {
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
        <div style="width:140px;">\
          <div style="float:left; width: 100px;">\
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
      </div>'

        // this.template = '<tbody>' + '{{#rows}}' + '<tr>' + '{{#.}}' + '<td>' + '<button style="background-color: {{ color }}"></button>' + '</td>' + '{{/.}}' + '</tr>' + '{{/rows}}' + '</tbody>';
        var colorsElem = document.createElement('div');
        colorsElem.className = 'colors';
        var colorsData = {
            rows: [
                [{
                    color: '#FFF29F'
                }, {
                    color: '#FFCBA6'
                }],
                [{
                    color: '#81FFC4'
                }, {
                    color: '#FFB7F9'
                }],
                [{
                    color: '#C39AFF'
                }, {
                    color: '#9AFAFF'
                }]
            ]
        };
        colorsElem.innerHTML = mustache.render(this.template, colorsData);
        this.setContent([colorsElem]);
        colorsElem.parentNode.style.backgroundColor = 'black';
        colorsElem.parentNode.parentNode.style.minWidth = '120px';
        colorsElem.parentNode.parentNode.style.maxWidth = '120px';
        colorsElem.parentNode.style.width = '120px';
        colorsElem.parentNode.style.height = '170px';
        colorsElem.parentNode.style.overflowY = 'auto';
        colorsElem.parentNode.style.overflowX = 'hidden';

        function popDownOnButtonClick(event, close, shouldUpdateSliders) {
            invoker.style.backgroundColor = event.target.style.backgroundColor;
            that.colorChangeEvent.detail.color = event.target.style.backgroundColor;
            that.getPalette().dispatchEvent(that.colorChangeEvent);
            that.getPalette().querySelector('.palette-invoker').style.backgroundColor = event.target.style.backgroundColor;
            if (close === null || close === undefined || close === true) {
                that.popDown();
            }
        }

        // Pop-down the palette when a item in the menu is clicked.
        this.buttons = colorsElem.querySelectorAll('button');
        var that = this;
        that.colorsElem = colorsElem;


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
		this.getPalette().querySelector('.palette-invoker').style.backgroundColor = color;
		this.invoker.style.backgroundColor = color;
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    notepalette.NotePalette.prototype = Object.create(palette.Palette.prototype, {
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
    return notepalette;
})
;
