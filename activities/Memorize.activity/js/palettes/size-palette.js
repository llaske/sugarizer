define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var sizepalette = {};

    sizepalette.SizePalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        this.sharedEvent = document.createEvent("CustomEvent");
        this.sharedEvent.initCustomEvent('size', true, true, {});
        this.buttons = [];

        var div = document.createElement('div');
        for (var i = 4; i <= 6; i++) {
            var button = document.createElement("div");
            button.value = i;
            button.onmouseover = function() {
                this.style.background = "#ccc";
            };

            button.onmouseout = function() {
                this.style.background = "#000";
            };

            button.style.borderRadius = "0";
            button.style.width = "100%";
            if (i != 4) {
                button.style.marginTop = "3px";
            }
            button.innerHTML = "<img style='vertical-align: middle; margin-right:3px;' src='icons/" + i + "x" + i + ".svg'>" + i + " X " + i;
            div.appendChild(button);
            this.buttons.push(button);
        }
        this.setContent([div]);

        var that = this;

        that.getPalette().firstChild.style.backgroundColor = "transparent";
        that.getPalette().firstChild.style.backgroundImage = "";

        function popDownOnButtonClick(event) {
            console.log(event);
            that.popDown();
        }

        for (var i = 0; i < this.buttons.length; i++) {
            var t = this;
            var button = t.buttons[i];

            (function (button) {
                button.addEventListener("click", function () {
                    that.sharedEvent.detail.value = button.value;
                    that.getPalette().dispatchEvent(that.sharedEvent);
                    that.popDown();
                });
            })(button);
            button.addEventListener('size', popDownOnButtonClick);
        }
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    sizepalette.SizePalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

    return sizepalette;
});
