

// Go home button
enyo.kind({
	name: "Abcd.HomeButton",
	kind: enyo.Control,
	components: [
		{name: "home", kind: "Image", src: "images/home.png", classes: "standardButton backButton", ontap: "goHome"},
	],

	// Constructor
	rendered: function() {
		this.inherited(arguments);
	},

	// Go back home
	goHome: function() {
		Abcd.goHome();
	}
});


// Switch case button
var caseVisibilityTab = [
	{switchToLower: false, switchToUpper: true, switchToScript: false},
	{switchToLower: false, switchToUpper: false, switchToScript: true},
	{switchToLower: true, switchToUpper: false, switchToScript: false}
];

enyo.kind({
	name: "Abcd.CaseButton",
	kind: enyo.Control,
	classes: "switchCase",
	components: [
		{name: "switchToUpper", kind: "Image", src: "images/case0.png", classes: "standardButton switchCaseButton", ontap: "localUpper"},
		{name: "switchToScript", kind: "Image", src: "images/case1.png", showing: false, classes: "standardButton switchCaseButton", ontap: "localScript"},
		{name: "switchToLower", kind: "Image", src: "images/case2.png", showing: false, classes: "standardButton switchCaseButton", ontap: "localLower"},
	],

	// Constructor
	rendered: function() {
		this.inherited(arguments);
		Abcd.changeVisibility(this, caseVisibilityTab[Abcd.context.casevalue]);
	},

	// Change current case
	localUpper: function() {
		Abcd.changeVisibility(this, caseVisibilityTab[1]);
		Abcd.setCase(1);
	},

	localLower: function() {
		Abcd.changeVisibility(this, caseVisibilityTab[0]);
		Abcd.setCase(0);
	},

	localScript: function() {
		Abcd.changeVisibility(this, caseVisibilityTab[2]);
		Abcd.setCase(2);
	}
});



// Switch language button
enyo.kind({
	name: "Abcd.LanguageButton",
	kind: enyo.Control,
	classes: "switchLang",
	components: [
		{name: "switchToFrench", kind: "Image", src: "images/us.png", showing: false, classes: "standardButton switchLangButton", ontap: "localFrench"},
		{name: "switchToSpanish", kind: "Image", src: "images/fr.png", classes: "standardButton switchLangButton", ontap: "localSpanish"},
        {name: "switchToEnglish", kind: "Image", src: "images/es.png", showing: false, classes: "standardButton switchLangButton", ontap: "localEnglish"},
        {name: "switchToPortuguese", kind: "Image", src: "images/pt.png", showing: false, classes: "standardButton switchLangButton", ontap: "localPortuguese"}
	],

	// Constructor
	rendered: function() {
		this.inherited(arguments);
		if (Abcd.context.lang == 'en')
			Abcd.changeVisibility(this, {switchToEnglish: false, switchToFrench: true, switchToSpanish: false, switchToPortuguese: false});
		else if (Abcd.context.lang == 'fr')
			Abcd.changeVisibility(this, {switchToEnglish: false, switchToFrench: false, switchToSpanish: true, switchToPortuguese: false});
		else if (Abcd.context.lang == 'pt')
			Abcd.changeVisibility(this, {switchToEnglish: true, switchToFrench: false, switchToSpanish: false, switchToPortuguese: false});
		else
			Abcd.changeVisibility(this, {switchToEnglish: false, switchToFrench: false, switchToSpanish: false, switchToPortuguese: true});
	},

	// Change current language
	localEnglish: function() {
		Abcd.changeVisibility(this, {switchToEnglish: false, switchToFrench: true, switchToSpanish: false, switchToPortuguese: false});
		Abcd.setLocale("en");
	},

	localFrench: function() {
        Abcd.changeVisibility(this, {switchToEnglish: false, switchToFrench: false, switchToSpanish: true, switchToPortuguese: false});
		Abcd.setLocale("fr");
	},

    localSpanish: function() {
        Abcd.changeVisibility(this, {switchToEnglish: false, switchToFrench: false, switchToSpanish: false, switchToPortuguese: true});
        Abcd.setLocale("es");
	},

    localPortuguese: function() {
        Abcd.changeVisibility(this, {switchToEnglish: true, switchToFrench: false, switchToSpanish: false, switchToPortuguese: false});
        Abcd.setLocale("pt");
	}
});


// Play type button
enyo.kind({
	name: "Abcd.PlayTypeButton",
	published: { from: "", to: "", theme: null },
	classes: "play-type-button",
	components: [
		{ name: "contentBox", components: [
			{ name: "imageFrom", classes: "playtypeImageFrom", kind: "Image" },
			{ name: "imageArrow", classes: "playtypeImageArrow", kind: "Image", src: "images/arrow.png" },
			{ name: "imageTo", classes: "playtypeImageTo", kind: "Image" }
		]}
	],

	// Constructor
	rendered: function() {
		this.inherited(arguments);

		if (this.theme != null)
			this.$.contentBox.addClass(this.theme);
		this.fromChanged();
		this.toChanged();
	},

	// Case changed
	setCase: function() {
		if (this.from.substr(0, 6) == "letter") {
			this.from = "letter" + Abcd.context.casevalue;
			this.fromChanged();
		}
		if (this.to.substr(0, 6) == "letter") {
			this.to = "letter" + Abcd.context.casevalue;
			this.toChanged();
		}
	},

	// Image source setup
	fromChanged: function() {
		var src = "images/"+this.from+".png";
		this.$.imageFrom.setAttribute("src", src);
	},

	toChanged: function() {
		var src = "images/"+this.to+".png";
		this.$.imageTo.setAttribute("src", src);
	}
});
