requirejs(["sugar-web/activity/activity","../lib/webL10n"], function (activity, l10n) {
	
	l10n.language.code = language_code; //defined in settings.js

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
				{content: l10n.get("Start"), classes: "start-button-text no-select-content"}
			]},
			
			// Credit
			{kind: "Image", classes: "credit-button no-select-content", src: "images/credit.png", ontap: "showCredit"},
			{name: "creditsPopup", kind: "TankOp.CreditsPopup"},		
			
			// Next mission
			{classes: "mission-description no-select-content", components: [
				{components: [
					{content: l10n.get("NextMission"), classes: "mission-header mission-line"},
					{content: ":", classes: "mission-dot mission-line"}
				]},
				{classes: "go-arrow go-left mission-line", ontap: "previousMission"},
				{name: "mission", content: " ", classes: "mission-text mission-line"},			
				{classes: "go-arrow go-right mission-line", ontap: "nextMission"}		
			]},
			
			{classes: "mission-status no-select-content", components: [
				{components: [
					{content: l10n.get("Completed"), classes: "mission-header mission-line"},
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
			this.$.mission.setContent(settings.levels[this.currentlevel].name);
			
			this.init();
		},
		
		// Draw screen
		init: function() {
			// Play theme
			sound.play("audio/soundtrack", true);
			
			// Draw completed mission
			var items = [];
			enyo.forEach(this.$.stars.getControls(), function(item) { items.push(item); });		
			for (var i = 0 ; i < items.length ; i++) { items[i].destroy(); };		
			for (var i = 0 ; i < settings.levels.length ; i++) {
				this.$.stars.createComponent({
						classes: (settings.levels[i].completed ? "mission mission-completed mission-line" : "mission mission-tocomplete mission-line")
					},
					{owner: this}).render();		
			}
		},
		
		// Select mission
		previousMission: function() {
			this.currentlevel--;
			if (this.currentlevel < 0)
				this.currentlevel = settings.levels.length-1;
			this.$.mission.setContent(settings.levels[this.currentlevel].name);			
		},
		
		nextMission: function() {
			this.currentlevel++;
			if (this.currentlevel == settings.levels.length)
				this.currentlevel = 0;
			this.$.mission.setContent(settings.levels[this.currentlevel].name);	
		},
		
		// Show credit
		showCredit: function() {
			this.$.creditsPopup.show();	
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
			var datastoreObject = this.activity.getDatastoreObject();
			var currentthis = this;
			datastoreObject.loadAsText(function (error, metadata, data) {
				var data = JSON.parse(data);
				settings.setState(data);
				currentthis.init();
			});	
		},
		
		// Save game in datastore
		save: function(count) {
			var datastoreObject = this.activity.getDatastoreObject();
			var jsonData = JSON.stringify(settings.getState());
			datastoreObject.setDataAsText(jsonData);
			datastoreObject.save(function() {});
		}

		
	});
});