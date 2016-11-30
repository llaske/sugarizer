requirejs(["../lib/webL10n"], function (l10n) {
	
	l10n.language.code = language_code; //defined in settings.js

	// Credits popup
	enyo.kind({
		name: "TankOp.CreditsPopup",
		kind: "Popup",
		classes: "credits-popup",
		centered: true,
		modal: true,
		floating: true, 	
		components: [	
			{ kind: "Scroller", classes: "credit-content no-select-content", components: [	
				{ kind: "Image", src: "images/hq_blue.png", classes: "credit-image-hq" },
				{ kind: "Image", src: "images/target.png", classes: "credit-image-target" },
				{ kind: "Image", src: "images/tank_red_0.png", classes: "credit-image-tankred" },
				{ content: l10n.get("CaC"), classes: "credit-title" },
				{ content: "Lionel Laské", classes: "credit-name" },
				{ kind: "Image", src: "images/tank_blue_2.png", classes: "credit-image-tank" },		
				{ content: l10n.get("Arts"), classes: "credit-title" },
				{ content: l10n.get("Vicki"), classes: "credit-name" },
				{ content: l10n.get("Tux"), classes: "credit-name" },
				{ content: l10n.get("Mister"), classes: "credit-name" },		
				{ content: l10n.get("None"), classes: "credit-name" },
				{ kind: "Image", src: "images/helo_blue_2.png", classes: "credit-image-helo" },
				{ content: l10n.get("Music"), classes: "credit-title" },
				{ content: l10n.get("Valkyries"), classes: "credit-name" },	
				{ kind: "Image", src: "images/soldier_blue_2.png", classes: "credit-image-soldier" },		
				{ content: l10n.get("Sounds"), classes: "credit-title" },
				{ content: l10n.get("Fridobeck"), classes: "credit-name" },	
				{ content: l10n.get("Joshfeed"), classes: "credit-name" },	
				{ content: l10n.get("Danipenet"), classes: "credit-name" },	
				{ content: l10n.get("Juskiddink"), classes: "credit-name" }
			]}
		],

		// Constructor
		create: function() {
			this.inherited(arguments);
		},
		
		rendered: function() {
		}
	});
});