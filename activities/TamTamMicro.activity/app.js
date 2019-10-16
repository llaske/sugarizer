
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
		var items = [];
		enyo.forEach(this.$.collections.getControls(), function(item) { items.push(item); });
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy();	}

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

		// Remove items
		var items = [];
		this.$.items.applyStyle("background-color", this.userColor.fill);
		enyo.forEach(this.$.items.getControls(), function(item) { items.push(item); });
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy();	}

		// Display items
		var collection = TamTam.collections[this.collection];
		var len = collection.content.length;
		for(var i = 0 ; i < len ; i++ ) {
			var item = this.$.items.createComponent(
				{ kind: "TamTam.Item", name: collection.content[i] },
				{ owner: this }
			);
			item.applyStyle("background-color", this.userColor.stroke);
			item.render();
		}
	},

	// Handle event
	changeCollection: function(s, e) {
		// Stop sound
		sound.pause();

		// Select the collection
		var len = TamTam.collections.length;
		for(var i = 0 ; i < len ; i++) {
			if (TamTam.collections[i].name == s.name) {
				this.collection = i;
				this.draw();
				return;
			}
		}
	}
});
