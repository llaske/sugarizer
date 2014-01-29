
// Credits popup
enyo.kind({
	name: "Abcd.CreditsPopup",
	kind: "onyx.Popup",
	classes: "credits-popup",
	centered: true,
	modal: true,
	floating: true, 	
	components: [	
		{ kind: "Image", src: "images/class.png", classes: "credit-image" },
		{ content: "concept:", classes: "credit-title" },
		{ content: "Lionel Laské", classes: "credit-name" },
		{ content: "code:", classes: "credit-title" },
		{ content: "Lionel Laské, Joakim Ribier (spanish version)", classes: "credit-name" },
		{ content: "arts:", classes: "credit-title" },
		{ content: "Art4Apps (images)", classes: "credit-name" },
		{ content: "Vicki Wenderlich (letters)", classes: "credit-name" },
		{ content: "TamTam Mini (music instruments)", classes: "credit-name" },
		{ content: "Cursive Standard from dafont.com (cursive font)", classes: "credit-name" },
		{ content: "Nordic factory (flags)", classes: "credit-name" },
		{ content: "Giorgia Guarino from The Noun Project (listen icon)", classes: "credit-name" },
		{ content: "Drew Ellis from The Noun Project (dice icon)", classes: "credit-name" },
		{ content: "jon trillana from The Noun Project (Lego icon)", classes: "credit-name" },
		{ content: "Patrick N. from The Noun Project (funnel icon)", classes: "credit-name" },
		{ content: "John Caserta from The Noun Project (trash can icon)", classes: "credit-name" },
		{ content: "Robert Leonardo from The Noun Project (warning icon)", classes: "credit-name" },
		{ content: "The Noun Project (picture icon)", classes: "credit-name" },
		{ content: "Sugar (network 100% icon)", classes: "credit-name" },
		{ content: "music:", classes: "credit-title" },
		{ content: "Alphabet song French traditional song play by Finale NotePad", classes: "credit-name" },	
		{ content: "sounds effects:", classes: "credit-title" },
		{ content: "Art4apps (voices)", classes: "credit-name" },	
		{ content: "Charel Sytze from freesound (applause)", classes: "credit-name" },	
		{ content: "Unchaz from freesound (disappointment)", classes: "credit-name" },
		{ content: "thanks to:", classes: "credit-title" },
		{ content: "OLPC France team: Antoine, Jonathan, Laura, Pierre, Sandra, François and others", classes: "credit-name" },		
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
	},
	
	rendered: function() {
	}
});