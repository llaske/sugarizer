
// Listview view
enyo.kind({
	name: "Sugar.Journal",
	kind: "Scroller",
	published: { journal: null },
	components: [
		{name: "empty", classes: "journal-empty", showing: true},
		{name: "message", classes: "journal-message", showing: true},
		{name: "journalList", classes: "journal-list", kind: "Repeater", onSetupItem: "setupItem", components: [
			{name: "item", classes: "journal-list-item", components: [
				{name: "favorite", kind: "Sugar.ActivityIcon", x: 10, y: 14, size: constant.iconSizeFavorite, onclick: "switchFavorite"},			
				{name: "activity", kind: "Sugar.ActivityIcon", x: 60, y: 5, size: constant.iconSizeList, colorized: true, onclick: "runActivity"},
				{name: "title", classes: "journal-title"},
				{name: "time", classes: "journal-time"},
				{name: "goright", kind: "Sugar.ActivityIcon", classes: "journal-goright", size: constant.iconSizeFavorite, onclick: "runActivity"}
			]}
		]}
	],
  
	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.journalChanged();
		this.draw();
	},
		
	// Draw screen
	draw: function() {
		// Set Journal empty
		var canvas_center = util.getCanvasCenter();
		this.$.empty.applyStyle("margin-left", (canvas_center.x-constant.sizeEmpty/4)+"px");
		var margintop = (canvas_center.y-constant.sizeEmpty/4);
		this.$.empty.applyStyle("margin-top", margintop+"px");
		this.$.message.setContent("Your journal is empty");
	},
	
	// Property changed
	journalChanged: function() {
		this.$.empty.show();
		this.$.message.show();	
		if (this.journal != null && this.journal.length > 0) {
			this.$.journalList.setCount(this.journal.length);
			this.$.empty.hide();
			this.$.message.hide();	
		} else {
			this.$.journalList.setCount(0);			
		}
	},

	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		inEvent.item.$.activity.setActivity(preferences.getActivity(this.journal[inEvent.index].metadata.activity_id));
		inEvent.item.$.favorite.setActivity({directory: "icons", icon: "emblem-favorite.svg"});
		var keep = this.journal[inEvent.index].metadata.keep;
		inEvent.item.$.favorite.setColorized(keep !== undefined && keep == 1);		
		inEvent.item.$.title.setContent(this.journal[inEvent.index].metadata.title);	
		inEvent.item.$.time.setContent(util.timestampToElapsedString(this.journal[inEvent.index].metadata.timestamp, 2));
		inEvent.item.$.goright.setActivity({directory: "icons", icon: "go-right.svg"});
	},
	
	// Switch favorite value for clicked line
	switchFavorite: function(inSender, inEvent) {
		var objectId = this.journal[inEvent.index].objectId;
		var keep = this.journal[inEvent.index].metadata.keep;
		if (keep === undefined)
			this.journal[inEvent.index].metadata.keep = 1;
		else
			this.journal[inEvent.index].metadata.keep = (keep + 1) % 2;
		var ds = new datastore.DatastoreObject(objectId);
		ds.setMetadata(this.journal[inEvent.index].metadata);
		ds.setDataAsText(this.journal[inEvent.index].text);
		ds.save();
		inSender.setColorized(this.journal[inEvent.index].metadata.keep == 1);
		this.render();
	},
	
	// Run activity
	runActivity: function(inSender, inEvent) {
		preferences.runActivity(
			preferences.getActivity(this.journal[inEvent.index].metadata.activity_id),
			this.journal[inEvent.index].objectId,
			this.journal[inEvent.index].metadata.title)	
	}
});
