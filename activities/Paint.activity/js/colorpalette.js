define(["sugar-web/graphics/palette", "mustache"],
       function (palette, mustache) {

    var colorpalette = {};

    colorpalette.ColorPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        this.colorChangeEvent = new CustomEvent(
            "colorChange",
            {
                detail: {
                    color: "#ed2529"
                },
                bubbles: true,
                cancelable: true
            }
        );

        this.template =
            '<tbody>' +
            '{{#rows}}' +
              '<tr>' +
                '{{#.}}' +
                '<td>' +
                  '<button style="background-color: {{ color }}"></button>' +
                '</td>' +
                '{{/.}}' +
              '</tr>' +
            '{{/rows}}' +
            '</tbody>';

        var colorsElem = document.createElement('table');
        colorsElem.className = "colors";
        var colorsData = {rows: [[{color: "#ed2529"},
                                 {color: "#69bc47"},
                                 {color: "#3c54a3"}],
                                 [{color: "#f57f25"},
                                  {color: "#0b6b3a"},
                                  {color: "#00a0c6"}],
                                 [{color: "#f6eb1a"},
                                  {color: "#b93f94"},
                                  {color: "#5b4a9c"}],
                                 [{color: "#000000"},
                                  {color: "#919496"},
                                  {color: "#ffffff"}]]};

        colorsElem.innerHTML = mustache.render(this.template, colorsData);
        this.setContent([colorsElem]);

        // Pop-down the palette when a item in the menu is clicked.

        this.buttons = colorsElem.querySelectorAll('button');

        var that = this;

        function popDownOnButtonClick(event) {
            that.colorChangeEvent.detail.color =
                event.target.style.backgroundColor;
            that.getPalette().dispatchEvent(that.colorChangeEvent);
            that.popDown();
        }

        for (var i = 0; i < this.buttons.length; i++) {
            this.buttons[i].addEventListener('click', popDownOnButtonClick);
        }

    };

    var setColor = function (index) {
        // Click the nth button
        var event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        this.buttons[index].dispatchEvent(event);
    }

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    }

    colorpalette.ColorPalette.prototype =
        Object.create(palette.Palette.prototype, {
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
