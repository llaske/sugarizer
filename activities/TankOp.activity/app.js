
// Main app class
enyo.kind({
	name: "TankOp.App",
	kind: enyo.Control,
	published: {activity: null},
	classes: "home",
	components: [
		// Image
		{kind: "Image", classes: "home-image no-select-content", src: "images/home.png"},

		// Popup
		{classes: "start-button", ontap: "play", components: [
			{kind: "Image", classes: "start-button-image no-select-content", src: "images/button.png"},
			{name: "start", classes: "start-button-text no-select-content"}
		]},

		// Credit
		{kind: "Image", classes: "credit-button no-select-content", src: "images/credit.png", ontap: "showCredit"},
		{name: "creditsPopup", kind: "TankOp.CreditsPopup"},

		// Next mission
		{classes: "mission-description no-select-content", components: [
			{components: [
				{name: "nextmission", classes: "mission-header mission-line"},
				{content: ":", classes: "mission-dot mission-line"}
			]},
			{classes: "go-arrow go-left mission-line", ontap: "previousMission"},
			{name: "mission", content: " ", classes: "mission-text mission-line"},
			{classes: "go-arrow go-right mission-line", ontap: "nextMission"}
		]},

		{classes: "mission-status no-select-content", components: [
			{components: [
				{name: "completed", classes: "mission-header mission-line"},
				{content: ":", classes: "mission-dot mission-line"}
			]},
			{name: "stars", components: [
				{classes: "mission mission-completed mission-line"},
				{classes: "mission mission-tocomplete mission-line"},
				{classes: "mission mission-tocomplete mission-line"},
				{classes: "mission mission-tocomplete mission-line"},
				{classes: "mission mission-tocomplete mission-line"},
				{classes: "mission mission-tocomplete mission-line"},
				{classes: "mission mission-tocomplete mission-line"},
				{classes: "mission mission-tocomplete mission-line"},
				{classes: "mission mission-tocomplete mission-line"},
				{classes: "mission mission-tocomplete mission-line"},
				{classes: "mission mission-tocomplete mission-line"},
				{classes: "mission mission-tocomplete mission-line"}
			]}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.currentlevel = 0;
		this.$.mission.setContent(preferences.levels[this.currentlevel].name);

		this.init();
	},

	// Draw screen
	init: function() {
		this.setLocale();

		// Draw completed mission
		var items = [];
		enyo.forEach(this.$.stars.getControls(), function(item) { items.push(item); });
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy(); };
		for (var i = 0 ; i < preferences.levels.length ; i++) {
			this.$.stars.createComponent({
					classes: (preferences.levels[i].completed ? "mission mission-completed mission-line" : "mission mission-tocomplete mission-line")
				},
				{owner: this}).render();
		}
	},

	// Localization, changed update UI and missions
	setLocale: function() {
		this.$.start.setContent(l10n.get("Start"));
		this.$.nextmission.setContent(l10n.get("NextMission"));
		this.$.completed.setContent(l10n.get("Completed"));
		this.$.mission.setContent(preferences.levels[this.currentlevel].name = l10n.get(preferences.levels[this.currentlevel].id));
		for (var i = 0 ; i < preferences.levels.length ; i++) {
			preferences.levels[i].name = l10n.get(preferences.levels[i].id);
		}
	},

	// Select mission
	previousMission: function() {
		this.currentlevel--;
		if (this.currentlevel < 0)
			this.currentlevel = preferences.levels.length-1;
		this.$.mission.setContent(preferences.levels[this.currentlevel].name);
	},

	nextMission: function() {
		this.currentlevel++;
		if (this.currentlevel == preferences.levels.length)
			this.currentlevel = 0;
		this.$.mission.setContent(preferences.levels[this.currentlevel].name);
	},

	// Show credit
	showCredit: function() {
		this.$.creditsPopup.show();
	},

	// Play theme
	playTheme: function() {
		sound.play("audio/soundtrack", true);
	},

	// Play game
	play: function() {
		// Stop sound
		sound.pause();

		// Start game
		new TankOp.Play({level: this.currentlevel}).renderInto(document.getElementById("board"));
	},

	// Load game from datastore
	load: function() {
		this.playTheme();
		var datastoreObject = this.activity.getDatastoreObject();
		var currentthis = this;
		datastoreObject.loadAsText(function (error, metadata, data) {
			var data = JSON.parse(data);
			preferences.setState(data);
			currentthis.init();
		});
	},

	// Save game in datastore
	save: function(count) {
		var datastoreObject = this.activity.getDatastoreObject();
		var jsonData = JSON.stringify(preferences.getState());
		datastoreObject.setDataAsText(jsonData);
		datastoreObject.save(function() {});
	}

});
