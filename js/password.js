// Class for a password field: let user choose into a bunch of small images
enyo.kind({
	name: "Sugar.Password",
	kind: enyo.Control,
	published: {
		label: '',
		password: '',
	},
	events: { onEnter: "" },
	classes: "password-class",
	components: [
		{name: "line", classes: "password-line", components: [
			{name: "text", content: "xxx", classes: "password-label"},
			{classes: "password-input", components: [
				{name: "pass", classes: "password-value", content: "", allowHtml: true},
				{name: "cancel", classes: "password-iconcancel", showing: false, ontap: "cancelClicked"},
			]},
			{components:[
				{name: "emojis", classes: "password-emojis", components: [
					{components: [
						{name: "emoji0", kind: "Sugar.Emoji", index: 0, ontap: "emojiClicked", selected: true},
						{name: "emoji1", kind: "Sugar.Emoji", index: 1, ontap: "emojiClicked", selected: true},
						{name: "emoji2", kind: "Sugar.Emoji", index: 2, ontap: "emojiClicked", selected: true},
						{name: "emoji3", kind: "Sugar.Emoji", index: 3, ontap: "emojiClicked", selected: true},
						{name: "emoji4", kind: "Sugar.Emoji", index: 4, ontap: "emojiClicked", selected: true},
					]},
					{components: [
						{name: "emoji5", kind: "Sugar.Emoji", index: 5, ontap: "emojiClicked", selected: true},
						{name: "emoji6", kind: "Sugar.Emoji", index: 6, ontap: "emojiClicked", selected: true},
						{name: "emoji7", kind: "Sugar.Emoji", index: 7, ontap: "emojiClicked", selected: true},
						{name: "emoji8", kind: "Sugar.Emoji", index: 8, ontap: "emojiClicked", selected: true},
						{name: "emoji9", kind: "Sugar.Emoji", index: 9, ontap: "emojiClicked", selected: true},
					]},
				]},
				{classes: "password-emojis-category", components: [
					{name: "category0", kind: "Sugar.Emoji", classes: "emoji-category", ontap: "category0Clicked", index: 0, letter: false, size: 15, selected: true},
					{name: "category1", kind: "Sugar.Emoji", classes: "emoji-category", ontap: "category1Clicked", index: 10, letter: false, size: 15},
					{name: "category2", kind: "Sugar.Emoji", classes: "emoji-category", ontap: "category2Clicked", index: 20, letter: false, size: 15}
				]}
			]}
		]},
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.labelChanged();
		this.listen = false;
		this.password = "";
		var that = this;
		document.addEventListener('keydown', function(event) {
			if (that.listen) {
				if (event.keyCode === 13) {
					that.doEnter();
					return true;
				} else if (event.keyCode == 8) {
					that.removeCharacter();
					return true;
				} else {
					that.addCharacter(event.key);
					return true;
				}
				return false;
			}
			return false;
		});
	},

	startInputListening: function() {
		this.listen = true;
	},

	stopInputListening: function() {
		this.listen = false;
	},

	// Property changed
	labelChanged: function() {
		this.$.text.setContent(this.label);
	},

	passwordChanged: function() {
		this.drawPassword();
		if (this.password.length == 0) {
			this.$.cancel.setShowing(false);
		}
	},

	// Event handling
	emojiClicked: function(emoji) {
		emoji.animate();
		this.addCharacter(constant.emojis[emoji.getIndex()].letter);
	},

	category0Clicked: function(category) {
		if (category.getSelected()) {
			return;
		}
		var categoryIndex = category.index;
		if (categoryIndex - 10 >= 0) {
			// Scroll categories
			this.$.category0.setIndex(categoryIndex-10);
			this.$.category1.setIndex(categoryIndex);
			this.$.category2.setIndex(categoryIndex+10);
			category = this.$.category1;
		}
		this.changeCategory(category);
	},

	category1Clicked: function(category) {
		if (category.getSelected()) {
			return;
		}
		this.changeCategory(category);
	},

	category2Clicked: function(category) {
		if (category.getSelected()) {
			return;
		}
		var categoryIndex = category.index;
		if (categoryIndex + 10 < constant.emojis.length) {
			// Scroll categories
			this.$.category0.setIndex(categoryIndex-10);
			this.$.category1.setIndex(categoryIndex);
			this.$.category2.setIndex(categoryIndex+10);
			category = this.$.category1;
		}
		this.changeCategory(category);
	},

	changeCategory: function(category) {
		this.$.category0.setSelected(false);
		this.$.category1.setSelected(false);
		this.$.category2.setSelected(false);
		category.setSelected(true);
		var startIndex = category.index;
		this.$.emoji0.setIndex(startIndex++);
		this.$.emoji1.setIndex(startIndex++);
		this.$.emoji2.setIndex(startIndex++);
		this.$.emoji3.setIndex(startIndex++);
		this.$.emoji4.setIndex(startIndex++);
		this.$.emoji5.setIndex(startIndex++);
		this.$.emoji6.setIndex(startIndex++);
		this.$.emoji7.setIndex(startIndex++);
		this.$.emoji8.setIndex(startIndex++);
		this.$.emoji9.setIndex(startIndex++);
	},

	cancelClicked: function() {
		this.password = "";
		this.drawPassword();
		this.$.cancel.setShowing(false);
	},

	// Handle password changed
	drawPassword: function() {
		var html = "";
		for (var i = 0 ; i < this.password.length ; i++) {
			for (var j = 0 ; j < constant.emojis.length ; j++) {
				if (constant.emojis[j].letter == this.password[i]) {
					html += "&#x"+constant.emojis[j].value+";";
				}
			}
		}
		this.$.pass.setContent(html);
	},

	addCharacter: function(char) {
		if (this.password.length == 8) {
			return;
		}
		var len = constant.emojis.length;
		for (var i = 0 ; i < len ; i++) {
			if (char == constant.emojis[i].letter) {
				break;
			}
		}
		if (i == len) {
			return;
		}
		this.password += char;
		this.$.cancel.setShowing(true);
		this.drawPassword();
	},

	removeCharacter: function() {
		var len = this.password.length;
		if (len == 0) {
			return;
		}
		this.password = this.password.substr(0, len-1);
		if (this.password.length == 0) {
			this.$.cancel.setShowing(false);
		}
		this.drawPassword();
	}
});


// Class for an emoji
enyo.kind({
	name: "Sugar.Emoji",
	kind: enyo.Control,
	published: {
		index: null,
		letter: true,
		size: null,
		selected: false
	},
	classes: "emoji",
	components: [
		{name: "icon", content: "", allowHtml: true, classes: "emoji-icon"},
		{name: "letter", content: "", showing: true, classes: "emoji-letter"}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.indexChanged();
		this.letterChanged();
		this.sizeChanged();
		this.selectedChanged();
	},

	rendered: function() {
		this.inherited(arguments);
		if (this.size) {
			document.getElementById(this.$.icon.id).style = "font-size: "+this.size+"pt";
		}
	},

	// Property changed
	indexChanged: function() {
		if (this.index >= 0 && this.index < constant.emojis.length) {
			var emoji = constant.emojis[this.index];
			this.$.icon.setContent("&#x"+emoji.value+";");
			this.$.letter.setContent(emoji.letter);
		}
	},

	letterChanged: function() {
		this.$.letter.setShowing(this.letter);
	},

	sizeChanged: function() {
	},

	selectedChanged: function() {
		this.removeClass("emoji-selected");
		this.removeClass("emoji-unselected");
		if (this.selected) {
			this.addClass("emoji-selected");
		} else {
			this.addClass("emoji-unselected");
		}
	},

	// Do a small animation to show a click
	animate: function() {
		var that = this;
		that.addClass("emoji-flash");
		window.setTimeout(function() {
			that.removeClass("emoji-flash");
		}, 500);
	}
});
