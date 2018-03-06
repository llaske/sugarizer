// Theme component
enyo.kind({
	name: "Abcd.Theme",
	kind: "Abcd.Item",
	published: { index: "" },
	classes: "theme",
	components: [	
		{ name: "spinner", kind: "Image", src: "images/spinner-light.gif", classes: "spinner"},	
		{ name: "contentBox", showing: false, components: [		
			{ name: "itemImage", classes: "themeImage", kind: "Image", onload: "imageLoaded", onerror: "imageError" },
			{ name: "itemText", classes: "themeText" }
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
		var theme = Abcd.themes[this.index];
		var entry = Abcd.entries[theme.img];
		var image = Abcd.context.getDatabase()+"images/database/"+entry.code+".png";
		var text = __$FC(theme.text);
		console.log(text);
		if (Abcd.context.casevalue == 1)
			text = text.toUpperCase();
		this.$.itemImage.setAttribute("src", image);
		this.$.itemText.removeClass("themeText0");
		this.$.itemText.removeClass("themeText1");
		this.$.itemText.removeClass("themeText2");
		this.$.itemText.addClass("themeText"+Abcd.context.casevalue);		
		this.$.itemText.setContent(text);
		this.addClass("themeColor"+this.index);
	}
});	