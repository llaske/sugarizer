define([
	"sugar-web/graphics/palette",
	"text!activity/palettes/settingspalette.html",
], function (palette, template) {
	var settingspalette = {};
	settingspalette.SettingsPalette = function (invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "settings-palette";
		var containerElem = document.createElement("div");
		containerElem.innerHTML = template;
		this.setContent([containerElem]);

		// Add event listeners for mode buttons
		var self = this;
		setTimeout(function () {
			var paintButton = self.getPalette().querySelector("#paint-button");
			var tourButton = self.getPalette().querySelector("#tour-button");
			var doctorButton = self.getPalette().querySelector("#doctor-button");
			var settingsButton = document.getElementById("settings-button");

			var allButtons = [paintButton, tourButton, doctorButton];

			function updateSettingsIcon(iconName) {
				settingsButton.style.backgroundImage = `url(icons/mode-${iconName}.svg)`;
			}

			function setActiveButton(activeButton) {
				// Remove active class from all buttons
				allButtons.forEach(button => {
					if (button) button.classList.remove('active');
				});
				// Add active class to clicked button
				if (activeButton) activeButton.classList.add('active');
			}

			// Check if in shared mode and not host
			var isSharedNonHost = window.sharedActivity && !window.isHost;

			if (isSharedNonHost) {
				// Disable all mode buttons for non-host users
				allButtons.forEach(button => {
					if (button) {
						button.disabled = true;
						button.style.opacity = "0.5";
						button.style.cursor = "not-allowed";
					}
				});

				// Don't pop down the palette automatically
				self.autoPopDown = false;

				// Listen for mode changes from host
				document.addEventListener('mode-changed', function (event) {
					var modeIndex = event.detail.mode;
					var modeIcons = {
						0: 'paint',
						1: 'compass',
						2: 'doctor'
					};
					updateSettingsIcon(modeIcons[modeIndex] || 'paint');

					// Update active button in palette
					var buttons = {
						0: paintButton,
						1: tourButton,
						2: doctorButton
					};
					setActiveButton(buttons[modeIndex]);
				});
			} else {
				// Set paint mode as default active mode for host/local users
				updateSettingsIcon('paint');
				setActiveButton(paintButton);
				// Dispatch mode-selected event for paint mode
				document.dispatchEvent(new CustomEvent('mode-selected', {
					detail: { mode: 0 }
				}));
			}

			if (paintButton && !isSharedNonHost) {
				paintButton.addEventListener("click", function () {
					document.dispatchEvent(new CustomEvent('mode-selected',
						{ detail: { mode: 0 } }
					));
					updateSettingsIcon('paint');
					setActiveButton(paintButton);
					self.popDown();
				});
			}

			if (tourButton && !isSharedNonHost) {
				tourButton.addEventListener("click", function () {
					document.dispatchEvent(new CustomEvent('mode-selected',
						{ detail: { mode: 1 } }
					));
					updateSettingsIcon('compass');
					setActiveButton(tourButton);
					self.popDown();
				});
			}

			if (doctorButton && !isSharedNonHost) {
				doctorButton.addEventListener("click", function () {
					document.dispatchEvent(new CustomEvent('mode-selected',
						{ detail: { mode: 2 } }
					));
					updateSettingsIcon('doctor');
					setActiveButton(doctorButton);
					self.popDown();
				});
			}
		}, 100);
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	settingspalette.SettingsPalette.prototype = Object.create(
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

	return settingspalette;
});