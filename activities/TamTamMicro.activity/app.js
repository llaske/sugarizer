// Main app class
enyo.kind({
	name: "TamTam.App",
	kind: "FittableRows",
	published: {activity: null},
	components: [
		{name: "content", kind: "Scroller", fit: true, classes: "maincontent", onresize: "resize",
		components: [
			{name: "collections", classes: "collections", components: [
			]},
			{name: "items", classes: "items", components: [
			]}
		]}
	],
	openItems: {},
	handlers: {
		onSelectionChange: "updateItem",
	},

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.collection = 0;
		this.computeSize();
		var that = this;
		requirejs(["sugar-web/env"], function(env) {
			env.getEnvironment(function(err, environment) {
				that.userColor = environment.user.colorvalue;
				that.draw();
			});
		});
	},

	computeSize: function() {
		var toolbar = document.getElementById("main-toolbar");
		var canvas = document.getElementById("body");
		var canvas_height = canvas.offsetHeight;
		this.$.content.applyStyle("height", (canvas_height-toolbar.offsetHeight)+"px");
	},

	resize: function() {
		this.computeSize();
		this.draw();
	},

	// Draw screen
	draw: function() {
		// Remove collections
		var collections = [];
		enyo.forEach(this.$.collections.getControls(), function(item) { collections.push(item); });

		// Remove items
		var items = [];
		enyo.forEach(this.$.items.getControls(), function(item) { items.push(item); });

		for (var i = 0; i < collections.length; i++) {
			collections[i].destroy();
		}
		for (var i = 0; i < items.length; i++) {
			items[i].destroy();
		}

		if(pianoMode) {
			document.getElementById("body").style.backgroundColor = '#ffffff';
			this.$.collections.applyStyle("background-color", '#ffffff');

			if(currentPianoMode !== null) {
				var item = this.$.items.createComponent(
					{ kind: "TamTam.Item", name: currentPianoMode},
					{ owner: this }
				).render();
				item.applyStyle("background-color", this.userColor.stroke);
				item.render();
			}

			this.$.items.createComponent(
				{ kind: "TamTam.Piano"},
				{ owner: this }
			).render();

		} else {
			// Display collections
			document.getElementById("body").style.backgroundColor = this.userColor.fill;
			this.$.collections.applyStyle("background-color", this.userColor.fill);
			var len = TamTam.collections.length;
			for(var i = 0 ; i < len ; i++ ) {
				this.$.collections.createComponent(
					{ kind: "TamTam.Collection", name: TamTam.collections[i].name, selection: (i == this.collection), ontap: "changeCollection" },
					{ owner: this }
				).render();
			}

			// Display items
			var collection = TamTam.collections[this.collection];
			var len = collection.content.length;
			for(var i = 0 ; i < len ; i++ ) {
				this.openItems[collection.content[i]] = this.$.items.createComponent(
					{ kind: "TamTam.Item", name: collection.content[i] },
					{ owner: this }
				);
				this.openItems[collection.content[i]].applyStyle("background-color", this.userColor.stroke);
				this.openItems[collection.content[i]].render();
			}
		}
	},

	updateItem: function(sender, event) {
		if(this.openItems[event.toChange] !== undefined) {
			this.openItems[event.toChange].deselect();
		}
	},

	// Handle event
	changeCollection: function(s, e) {
		// Select the collection
		var len = TamTam.collections.length;
		for(var i = 0 ; i < len ; i++) {
			if (TamTam.collections[i].name == s.name) {
				this.collection = i;
				this.draw();
				return;
			}
		}
	},

	changePianoMode: function(e) {
		pianoMode = !pianoMode;
		if(pianoMode) {
			document.getElementById('piano-button').classList.add('active');
		} else {
			document.getElementById('piano-button').classList.remove('active');
		}
		this.draw();
	}
});
