define(["sugar-web/graphics/palette",
        "text!sugar-web/graphics/helppalette.html"], function (palette, template) {

    'use strict';

    var helppalette = {};

    helppalette.HelpPalette = function (activityButton,
        datastoreObject) {

        palette.Palette.call(this, activityButton);

        var activityTitle;
        var descriptionLabel;
        var descriptionBox;

        this.getPalette().id = "help-palette";

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

    };

    helppalette.HelpPalette.prototype =
        Object.create(palette.Palette.prototype, {
            setTitleDescription: {
                value: "Help Palette:",
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

    return helppalette;
});
