// Library dialog
enyo.kind({
	name: "VideoViewer.LibraryDialog",
	kind: enyo.Popup,
	classes: "library-dialog",
	centered: false,
	modal: false,
	floating: true,
	components: [
		{name: "scroller", kind: "Scroller", components: [
			{name: "items", classes: "library-content", kind: "Repeater", onSetupItem: "setupItem", components: [
				{ classes: "library", components: [
					{ name: "itemImage", classes: "libraryImage", kind: "Image", onerror: "defaultImage", ontap: "selectLibrary" },
					{ name: "itemOverlay", classes: "libraryOverlay", ontap: "selectLibrary" },
					{ name: "itemTitle", classes: "libraryTitle", content: "", ontap: "selectLibrary" },
					{ name: "itemIcon", classes: "libraryIcon", kind: "Image", src: "icons/library.svg", ontap: "selectLibrary" },
					{ name: "itemRemove", classes: "libraryRemove", kind: "Image", src: "icons/list-remove.svg", ontap: "removeLibrary" }
				]}
			]},
		]},
		{ name: "itemAdd", classes: "libraryAdd", kind: "Image", src: "icons/list-add.svg", ontap: "addLibrary" }
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
	},
	
	render: function() {
		this.inherited(arguments);
		this.draw();
	},

	draw: function() {
		this.$.items.applyStyle("height", document.getElementById(app.$.content.id).style.height);
		this.$.items.setCount(Util.context.libraries.length);	
	},
	
	reload: function() {
		this.$.items.setCount(Util.context.libraries.length);
	},

	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		var imgurl = Util.context.libraries[inEvent.index].image;
		if (imgurl.startsWith("http://", 0) && typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
			// HACK: When in Chrome App image should be load using a XmlHttpRequest
			var xhr = new XMLHttpRequest();
			var that = inEvent.item;
			xhr.open('GET', imgurl, true);
			xhr.responseType = 'blob';
			xhr.onload = function(e) {
				that.$.itemImage.setAttribute("src", window.URL.createObjectURL(this.response));
			};
			xhr.send();
		} else {
			inEvent.item.$.itemImage.setAttribute("src", imgurl);
		}
		inEvent.item.$.itemTitle.setContent(Util.context.libraries[inEvent.index].title);
	},
	
	// Process events
	closeDialog: function() {
		this.hide();
	},

	defaultImage: function(inSender, inEvent) {
		inEvent.dispatchTarget.setAttribute("src", "images/nolibrary.png");
	},
	
	selectLibrary: function(inSender, inEvent) {
		Util.setLibrary(Util.context.libraries[inEvent.index]);
		Util.saveContext();
		app.loadDatabase();
		this.closeDialog();
	},
	
	removeLibrary: function(inSender, inEvent) {
		Util.removeLibrary(Util.context.libraries[inEvent.index]);
		Util.saveContext();
		this.draw();
	},
	
	addLibrary: function() {
		app.$.addLibraryDialog.show();
	}
});


// Video dialog
enyo.kind({
	name: "VideoViewer.VideoDialog",
	kind: enyo.Popup,
	classes: "video-dialog",
	centered: false,
	modal: true,
	floating: true,
	published: {
		item: null
	},
	components: [
		{name: "header", classes: "video-header toolbar", components: [
			{name: "favoritebutton", kind: "Button", classes: "toolbutton video-favorite-button pull-left", title: "Favorite", ontap: "setFavorite"},
			{name: "title", classes: "video-title", content: ""},
			{name: "closebutton", kind: "Button", classes: "toolbutton video-close-button pull-right", title: "Close", ontap: "closeDialog"}
		]},
		{name: "video", classes: "video-item", kind: "enyo.Video", fitToWindow: false, autoplay: true, showControls: true, poster: "images/notloaded.png"},
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.itemChanged();
	},

	rendered: function() {
		if (this.item != null) {
			this.$.favoritebutton.applyStyle("background-image", "url(icons/"+(!this.item.isFavorite?"not":"")+"favorite.svg)");
			if (!this.init) {
				this.init = true;
				var time = Util.getReadTime(this.item.code);
				if (time)
					this.$.video.setCurrentTime(time);
			}
		}
	},

	itemChanged: function() {
		this.init = false;
		if (this.item != null) {
			this.$.title.setContent(this.item.title);
			this.$.video.setSrc(this.item.videoURL());
			this.render();
		}
	},

	// Process events
	closeDialog: function() {
		this.$.video.pause();
		Util.setReadTime(this.item.code, this.$.video.getCurrentTime());
		this.$.video.unload();
		this.item = null;
		Util.saveContext();
		this.hide();
		if (Util.onSugar()) {
			// HACK: Force refresh screen on Sugar to avoid video issue
			Util.sugar.sendMessage("refresh-screen", Util.context);
		}
	},

	setFavorite: function() {
		this.item.setIsFavorite(!this.item.isFavorite);
		Util.setFavorite(this.item.code, this.item.isFavorite);
		this.rendered();
	}
});


// Add library dialog
enyo.kind({
	name: "VideoViewer.AddLibraryDialog",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: true,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", classes: "module-icon"},
			{name: "text", content: "Add library", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},		
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{content: "Library description URL:", classes: "server-message"},
		{name: "content", classes: "server-content", components: [
			{content: "http://", classes: "server-httplabel"},
			{name: "servername", kind: "Input", classes: "server-servername", onkeydown: "enterclick"}
		]}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.init();
	},
	
	init: function() {
	},
	
	rendered: function() {
	},
	
	// Event handling
	cancel: function() {
		this.hide();
	},
	
	ok: function() {
		this.hide();
		var ajax = new enyo.Ajax({
			url: "http://"+this.$.servername.getValue(),
			method: "GET",
			handleAs: "json"
		});
		var that = this;
		ajax.response(function(inSender, inResponse) {
			if (!inResponse.name || !inResponse.image || !inResponse.title || !inResponse.database || !inResponse.images) {
				console.log("Incorrect format for library 'http://"+that.$.servername.getValue()+"'");
				return;
			}
			Util.addLibrary(inResponse);
			Util.saveContext();
			app.$.libraryDialog.draw();
		});
		ajax.error(function() {
			console.log("Unable to load 'http://"+that.$.servername.getValue()+"'");
		});
		ajax.go();
	},
	
	enterclick: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			this.ok();
			return true;
		}
	}
});