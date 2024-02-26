// Entry component with image and sound
enyo.kind({
	name: "TamTam.Collection",
	kind: enyo.Control,
	published: { name: "", selection: false },
	classes: "collection",
	components: [
		{ name: "collectionImage", classes: "collectionImage", kind: "Image" }
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.nameChanged();
		this.selectionChanged();
	},
	
	// Collection setup
	nameChanged: function() {
		if (this.selection || currentPianoMode === this.name)
			this.$.collectionImage.setAttribute("src", "images/database/"+this.name+"sel.png");
		else
			this.$.collectionImage.setAttribute("src", "images/database/"+this.name+".png");
	},
	
	selectionChanged: function() {
		this.nameChanged();
	}
});