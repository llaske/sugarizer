

// Minimum number of entries to allow filtering
var minFilterEntries = 3;


// Filter popup
enyo.kind({
	name: "Abcd.FilterPopup",
	kind: "onyx.Popup",
	classes: "filter-popup",
	centered: true,
	modal: true,
	floating: true, 
	published: {
		filter: null,
	},
	events: {
		onFilterChanged: ""
	},	
	components: [
		{name: "box", classes: "filterBox", components: [
		]},
		{name: "trash", kind: "Image", src: "images/trashcan.png", classes: "trashButton", ontap: "trashTaped"},		
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.filterChanged();
	},
	
	rendered: function() {
		this.displayThemes();
	},
	
	filterChanged: function() {
		this.render();
	},
	
	// Display themes and letters
	displayThemes: function() {
		// Clean all
		this.cleanBox();
		
		// Display themes
		var length = Abcd.themes.length;
		var theme = -1;
		if (this.filter != null && this.filter.kind == "Abcd.Collection")
			theme = Abcd.collections[this.filter.index].theme;
		for (var i = 0 ; i < length ; i++) {
			this.$.box.createComponent(
				{ kind: "Abcd.Theme", index: i, selected: (i == theme), ontap: "displayCollections" },
				{ owner: this }
			).render();
		}
		
		// Display letters
		for (var i = 0 ; i < 26 ; i++) {
			var letter = String.fromCharCode(65+i).toLowerCase();
			this.$.box.createComponent(
				{ kind: "Abcd.Letter", letter: letter,
				  selected: (this.filter != null&&this.filter.letter == letter), ontap: "filterOnLetter" },
				{ owner: this }
			).render();			
		}
	},
	
	// Display filter, recompute each time
	display: function(filter) {
		this.filter = filter;
		this.render();
		this.show();
	},
	
	// Display all collection
	displayCollections: function(inSender, inEvent) {
		var theme = inSender.index;	
		var length = Abcd.collections.length;
		this.cleanBox();
		for (var i = 0 ; i < length ; i++) {
			if (Abcd.collections[i].theme != theme) continue;
			this.$.box.createComponent({ kind: "Abcd.Collection", index: i, 
				selected: (this.filter != null&&this.filter.index == i),
				ontap: "filterOnCollection"}, {owner: this}).render();
		}
	},
	
	// Trash taped, remove filter
	trashTaped: function() {
		this.hide();
		this.filter = null;
		this.doFilterChanged();
	},
	
	// Tap on a letter, filter on this letter
	filterOnLetter: function(l, e) {
		if (!Abcd.letters.hasOwnProperty(l.letter) || Abcd.letters[l.letter].length < minFilterEntries)
			return;
		this.hide();
		this.filter = l;
		this.doFilterChanged();
	},
	
	// Tap on a collection, filter on this collection
	filterOnCollection: function(c, e) {
		var index = c.index;		
		var collection = Abcd.collections[index];
		var length = collection.entries.length;
		var count = 0;
		for (var i = 0 ; i < length ; i++) {
			var entry = collection.entries[i];
			if (Abcd.entries[entry][Abcd.context.lang] == 1)
				count++;
		}
		if (count < minFilterEntries)
			return;
		this.hide();
		this.filter = c;
		this.doFilterChanged();
	},
	
	cleanBox: function() {
		// Delete all
		var items = [];
		enyo.forEach(this.$.box.getControls(), function(item) {
			items.push(item);
		});		
		for (var i = 0 ; i < items.length ; i++) {
			items[i].destroy();
		}
	}
});