define([
	"sugar-web/graphics/palette",
	"text!activity/palettes/templatepalette.html",
	"l10n"
], function (palette, template, l10n) {
	var templatepalette = {};

	templatepalette.TemplatePalette = function (invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "template-palette";
		var containerElem = document.createElement("div");
		containerElem.innerHTML = template;
		this.setContent([containerElem]);

		// event listeners for template buttons
		var self = this;
		
		// Function to localize template buttons
		var localizeTemplateButtons = function() {
			var runButton = self.getPalette().querySelector("#run-button");
			var boxingButton = self.getPalette().querySelector("#boxing-button");
			var dance1Button = self.getPalette().querySelector("#dance1-button");
			var dance2Button = self.getPalette().querySelector("#dance2-button");

			// Localize button text and titles
			if (runButton) {
				var runText = l10n.get("Run") || "Run";
				var runTitle = l10n.get("RunTemplate") || "Run template";
				runButton.querySelector("span").textContent = runText;
				runButton.title = runTitle;
			}

			if (boxingButton) {
				var boxingText = l10n.get("Boxing") || "Boxing";
				var boxingTitle = l10n.get("BoxingTemplate") || "Boxing template";
				boxingButton.querySelector("span").textContent = boxingText;
				boxingButton.title = boxingTitle;
			}

			if (dance1Button) {
				var dance1Text = l10n.get("Dance1") || "Dance 1";
				var dance1Title = l10n.get("Dance1Template") || "Dance 1 template";
				dance1Button.querySelector("span").textContent = dance1Text;
				dance1Button.title = dance1Title;
			}

			if (dance2Button) {
				var dance2Text = l10n.get("Dance2") || "Dance 2";
				var dance2Title = l10n.get("Dance2Template") || "Dance 2 template";
				dance2Button.querySelector("span").textContent = dance2Text;
				dance2Button.title = dance2Title;
			}
		};

		// Initial localization
		setTimeout(function () {
			localizeTemplateButtons();
			
			// Set up event listeners after localization
			var runButton = self.getPalette().querySelector("#run-button");
			var boxingButton = self.getPalette().querySelector("#boxing-button");
			var dance1Button = self.getPalette().querySelector("#dance1-button");
			var dance2Button = self.getPalette().querySelector("#dance2-button");

			function setActiveButton(activeButton) {
				[runButton, boxingButton, dance1Button, dance2Button].forEach(button => {
					if (button) button.classList.remove('active');
				});
				if (activeButton) activeButton.classList.add('active');
			}

			if (runButton) {
				runButton.addEventListener("click", function () {
					document.dispatchEvent(new CustomEvent('template-selected', {
						detail: { template: 'run' }
					}));
					setActiveButton(runButton);
					self.popDown();
				});
			}

			if (boxingButton) {
				boxingButton.addEventListener("click", function () {
					document.dispatchEvent(new CustomEvent('template-selected', {
						detail: { template: 'boxing' }
					}));
					setActiveButton(boxingButton);
					self.popDown();
				});
			}

			if (dance1Button) {
				dance1Button.addEventListener("click", function () {
					document.dispatchEvent(new CustomEvent('template-selected', {
						detail: { template: 'dance1' }
					}));
					setActiveButton(dance1Button);
					self.popDown();
				});
			}

			if (dance2Button) {
				dance2Button.addEventListener("click", function () {
					document.dispatchEvent(new CustomEvent('template-selected', {
						detail: { template: 'dance2' }
					}));
					setActiveButton(dance2Button);
					self.popDown();
				});
			}
		}, 100);

		// Expose localization function for external calls
		this.localizeTemplateButtons = localizeTemplateButtons;
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	templatepalette.TemplatePalette.prototype = Object.create(
		palette.Palette.prototype,
		{
			addEventListener: {
				value: addEventListener,
				enumerable: true,
				configurable: true,
				writable: true,
			},
		}
	);

	return templatepalette;
});