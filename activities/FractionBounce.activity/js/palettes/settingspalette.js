define(["sugar-web/graphics/palette","text!activity/palettes/settingspalette.html"], function(palette, template) {

	var settingspalette = {};

	settingspalette.SettingsPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		this.getPalette().id = "settings-palette";

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;

		this.setContent([containerElem]);

		this.fractionAddedEvent = document.createEvent('CustomEvent');
		this.fractionAddedEvent.initCustomEvent('fraction-added', true, true, { numerator: 0, denominator: 1 });

		var that = this;
		document.getElementById("add-button").addEventListener('click', function(event) {
			let numerator = document.getElementById('numerator').value;
			let denominator = document.getElementById('denominator').value;
			if(parseInt(numerator) < parseInt(denominator)) {
				that.fractionAddedEvent.numerator = numerator;
				that.fractionAddedEvent.denominator = denominator;
				that.getPalette().dispatchEvent(that.fractionAddedEvent);
			}
			document.getElementById('numerator').value = '';
			document.getElementById('denominator').value = '';
		});
	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	settingspalette.SettingsPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return settingspalette;
});
