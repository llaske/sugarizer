// Collection component
enyo.kind({
	name: "Abcd.Collection",
	kind: "Abcd.Item",
	published: { index: "" },
	classes: "collection",
	components: [
		{ name: "spinner", kind: "Image", src: "images/spinner-light.gif", classes: "spinner-small"},
		{ name: "contentBox", showing: false, components: [
			{ name: "itemImage", classes: "collectionImage", kind: "Image", onload: "imageLoaded", onerror: "imageError" },
			{ name: "itemText", classes: "collectionText" }
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.indexChanged();
	},

	// Display only when image is load
	imageLoaded: function() {
		if (this.index !== "") {
			this.$.spinner.hide();
			this.$.contentBox.show();
		}
	},

	// Error loading image, probably lost connection to database
	imageError: function() {
		Abcd.goHome();
	},

	// Localization changed, update text
	setLocale: function() {
		this.indexChanged();
		this.inherited(arguments);
	},

	// Card setup
	indexChanged: function() {
		var collection = Abcd.collections[this.index];
		var entry = Abcd.entries[collection.img];
		var image = Abcd.context.getDatabase()+"images/database/"+entry.code+".png";
		var text = __$FC(collection.text);
		if (Abcd.context.casevalue == 1)
			text = text.toUpperCase();
		this.$.itemImage.setAttribute("src", image);
		this.$.itemText.removeClass("collectionText0");
		this.$.itemText.removeClass("collectionText1");
		this.$.itemText.removeClass("collectionText2");
		this.$.itemText.addClass("collectionText"+Abcd.context.casevalue);
		this.$.itemText.setContent(text);
		this.addClass("themeColor"+collection.theme);
	}
});
