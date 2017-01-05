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
			{ name: "cac", classes: "credit-title" },
			{ content: "Lionel Laské", classes: "credit-name" },
			{ kind: "Image", src: "images/tank_blue_2.png", classes: "credit-image-tank" },
			{ name: "arts", classes: "credit-title" },
			{ name: "vicki", classes: "credit-name" },
			{ name: "tux", classes: "credit-name" },
			{ name: "mister", classes: "credit-name" },
			{ name: "none", classes: "credit-name" },
			{ kind: "Image", src: "images/helo_blue_2.png", classes: "credit-image-helo" },
			{ name: "music", classes: "credit-title" },
			{ name: "valkyries", classes: "credit-name" },
			{ kind: "Image", src: "images/soldier_blue_2.png", classes: "credit-image-soldier" },
			{ name: "sounds", classes: "credit-title" },
			{ name: "fridobeck", classes: "credit-name" },
			{ name: "joshfeed", classes: "credit-name" },
			{ name: "danipenet", classes: "credit-name" },
			{ name: "juskiddink", classes: "credit-name" }
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
	},

	rendered: function() {
		this.$.cac.setContent(l10n.get("CaC"));
		this.$.arts.setContent(l10n.get("Arts"));
		this.$.vicki.setContent(l10n.get("Vicki"));
		this.$.tux.setContent(l10n.get("Tux"));
		this.$.mister.setContent(l10n.get("Mister"));
		this.$.none.setContent(l10n.get("None"));
		this.$.music.setContent(l10n.get("Music"));
		this.$.valkyries.setContent(l10n.get("Valkyries"));
		this.$.sounds.setContent(l10n.get("Sounds"));
		this.$.fridobeck.setContent(l10n.get("Fridobeck"));
		this.$.joshfeed.setContent(l10n.get("Joshfeed"));
		this.$.danipenet.setContent(l10n.get("Danipenet"));
		this.$.juskiddink.setContent(l10n.get("Juskiddink"));
	}
});
