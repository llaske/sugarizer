define([
	"sugar-web/graphics/palette",
	"text!activity/palettes/modelpalette.html",
], function (palette, template) {
	var modelpalette = {};

	modelpalette.ModelPalette = function (invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "model-palette";

		var containerElem = document.createElement("div");
		containerElem.innerHTML = template;

		this.setContent([containerElem]);

		// Add event listeners for model buttons after content is set
		this.setupModelButtons();

		// Listen for mode changes to update button states
		var self = this;
		document.addEventListener('mode-changed', function (event) {
			self.updateButtonStates(event.detail.mode);
		});
	};

	// Setup event listeners for model buttons
	modelpalette.ModelPalette.prototype.setupModelButtons = function () {
		var self = this;

		// Use setTimeout to ensure DOM elements are ready
		setTimeout(function () {
			var skeletonButton = document.getElementById('model-skeleton-button');
			var bodyButton = document.getElementById('model-body-button');
			var organsButton = document.getElementById('model-organs-button');

			var buttons = [skeletonButton, bodyButton, organsButton];

			function setActiveButton(activeButton) {
				buttons.forEach(function (btn) {
					if (btn) btn.classList.remove('active');
				});
				if (activeButton) activeButton.classList.add('active');
			}

			// Store reference to setActiveButton for external access
			self.setActiveButton = setActiveButton;
			self.buttons = {
				skeleton: skeletonButton,
				body: bodyButton,
				organs: organsButton
			};
			self.allButtons = buttons;

			// Check current mode and update button states
			self.updateButtonStates(self.getCurrentMode());

			if (skeletonButton) {
				skeletonButton.addEventListener('click', function () {
					if (self.isButtonClickable()) {
						setActiveButton(skeletonButton);
						self.fireEvent('model-selected', { model: 'skeleton' });
						self.popDown();
					}
				});
			}

			if (bodyButton) {
				bodyButton.addEventListener('click', function () {
					if (self.isButtonClickable()) {
						setActiveButton(bodyButton);
						self.fireEvent('model-selected', { model: 'body' });
						self.popDown();
					}
				});
			}

			if (organsButton) {
				organsButton.addEventListener('click', function () {
					if (self.isButtonClickable()) {
						setActiveButton(organsButton);
						self.fireEvent('model-selected', { model: 'organs' });
						self.popDown();
					}
				});
			}
		}, 100);
	};

	// Get current mode (0 = Paint, 1 = Tour, 2 = Doctor)
	modelpalette.ModelPalette.prototype.getCurrentMode = function () {
		// Try to get current mode from global variable or default to 0 (Paint)
		if (typeof window.currentModeIndex !== 'undefined') {
			return window.currentModeIndex;
		}
		// Fallback: check mode text element
		var modeTextElem = document.getElementById("mode-text");
		if (modeTextElem) {
			var modeText = modeTextElem.textContent.toLowerCase();
			if (modeText.includes('tour')) return 1;
			if (modeText.includes('doctor')) return 2;
		}
		return 0; // Default to Paint mode
	};

	// Check if buttons should be clickable based on shared mode and current mode
	modelpalette.ModelPalette.prototype.isButtonClickable = function () {
		var isSharedNonHost = window.sharedActivity && !window.isHost;
		var currentMode = this.getCurrentMode();

		if (!isSharedNonHost) {
			// Host or local user - always can change model
			return true;
		}

		// Non-host user in shared mode
		if (currentMode === 0) {
			// Paint mode - non-host can change model
			return true;
		} else {
			// Tour (1) or Doctor (2) mode - non-host cannot change model
			return false;
		}
	};

	// Update button states based on current mode and user role
	modelpalette.ModelPalette.prototype.updateButtonStates = function (modeIndex) {
		if (!this.allButtons) return;

		var isSharedNonHost = window.sharedActivity && !window.isHost;
		var shouldDisable = isSharedNonHost && (modeIndex === 1 || modeIndex === 2); // Tour or Doctor mode

		this.allButtons.forEach(function (button) {
			if (button) {
				if (shouldDisable) {
					button.disabled = true;
					button.style.opacity = "0.5";
					button.style.cursor = "not-allowed";
					button.style.pointerEvents = "none";
				} else {
					button.disabled = false;
					button.style.opacity = "1";
					button.style.cursor = "pointer";
					button.style.pointerEvents = "auto";
				}
			}
		});
	};

	// update the active button based on current model
	modelpalette.ModelPalette.prototype.updateActiveModel = function (modelName) {
		if (this.setActiveButton && this.buttons && this.buttons[modelName]) {
			this.setActiveButton(this.buttons[modelName]);
		}
	};

	// Fire custom events
	modelpalette.ModelPalette.prototype.fireEvent = function (eventName, data) {
		var event = new CustomEvent(eventName, {
			detail: data,
			bubbles: true,
			cancelable: true
		});

		this.getPalette().dispatchEvent(event);

		// Also dispatch on document for global listening
		document.dispatchEvent(event);
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	modelpalette.ModelPalette.prototype = Object.create(
		palette.Palette.prototype,
		{
			addEventListener: {
				value: addEventListener,
				enumerable: true,
				configurable: true,
				writable: true,
			},
			setupModelButtons: {
				value: modelpalette.ModelPalette.prototype.setupModelButtons,
				enumerable: true,
				configurable: true,
				writable: true,
			},
			updateActiveModel: {
				value: modelpalette.ModelPalette.prototype.updateActiveModel,
				enumerable: true,
				configurable: true,
				writable: true,
			},
			fireEvent: {
				value: modelpalette.ModelPalette.prototype.fireEvent,
				enumerable: true,
				configurable: true,
				writable: true,
			},
			getCurrentMode: {
				value: modelpalette.ModelPalette.prototype.getCurrentMode,
				enumerable: true,
				configurable: true,
				writable: true,
			},
			isButtonClickable: {
				value: modelpalette.ModelPalette.prototype.isButtonClickable,
				enumerable: true,
				configurable: true,
				writable: true,
			},
			updateButtonStates: {
				value: modelpalette.ModelPalette.prototype.updateButtonStates,
				enumerable: true,
				configurable: true,
				writable: true,
			},
		}
	);

	return modelpalette;
});