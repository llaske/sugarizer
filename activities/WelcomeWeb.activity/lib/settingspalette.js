define(["sugar-web/graphics/palette","text!settingspalette.html", "mustache"], function (palette, template, mustache) {

    'use strict';

    var settingspalette = {};

    settingspalette.SettingsPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

		this.selectItemEvent = document.createEvent("CustomEvent");
		this.selectItemEvent.initCustomEvent('selectItem', true, true, {
			'item': undefined	
		});

        var menuElem = document.createElement('ul');
        menuElem.className = "menu";
        menuElem.innerHTML = template;
        this.setContent([menuElem]);

    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    settingspalette.SettingsPalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

    return settingspalette;
});