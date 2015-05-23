// Video dialog
enyo.kind({
	name: "KAView.VideoDialog",
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


// Computer dialog
enyo.kind({
	name: "KAView.RemoteDialog",
	kind: "enyo.Popup",
	classes: "module-dialog",
	centered: true,
	modal: true,
	floating: true,
	autoDismiss: false,
	components: [
		{name: "toolbar", classes: "toolbar", components: [
			{name: "icon", classes: "module-icon"},
			{name: "text", content: "Server settings", classes: "module-text"},
			{name: "cancelbutton", kind: "Button", classes: "toolbutton module-cancel-button", ontap: "cancel"},		
			{name: "okbutton", kind: "Button", classes: "toolbutton module-ok-button", ontap: "ok"}
		]},
		{name: "content", classes: "server-content", components: [
			{components:[
				{name: "khan", kind: "Checkbox", classes: "toggle khan-checkbox", onActivate: "switchConnection"},
				{content: "Khan Academy server", classes: "server-message"}
			]},
			{components:[			
				{name: "local", kind: "Checkbox", classes: "toggle local-checkbox", onActivate: "switchConnection"},
				{content: "Local server", classes: "server-message"},
				{content: "http://", classes: "server-httplabel"},
				{name: "servername", kind: "Input", classes: "server-servername"},
				{content: "in .../videos and .../images", classes: "server-notice"}
			]},		
		]}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.init();
	},
	
	init: function() {
		if (Util.isKhanServer()) {
			this.$.khan.setChecked(true);
			this.$.local.setChecked(false);
			this.$.servername.setValue("");
		} else {
			this.$.khan.setChecked(false);
			this.$.local.setChecked(true);
			var servername = Util.getServer();
			if (servername.indexOf("http://") == 0)
				servername = servername.substr(7);
			this.$.servername.setValue(servername);
		}
	},
	
	rendered: function() {
	},
	
	// Event handling
	cancel: function() {
		this.hide();
	},
	
	ok: function() {
		this.hide();
		if (this.$.khan.getChecked()) {
			Util.setServer(constant.khanServer);
		} else {
			var servername = this.$.servername.getValue();
			if (servername.length == 0)
				return;
			if (servername[servername.length-1] == '/')
				servername = servername.substr(0, servername.length-1);
			Util.setServer("http://" + servername);
		}
		app.remoteChanged();
	},
	
	switchConnection: function(s) {
		if (s.name == "khan" && this.$.khan.getChecked()) {
			this.$.local.setChecked(false);
			this.$.servername.setDisabled(true);
		} else if (s.name == "local" && this.$.local.getChecked()) {
			this.$.khan.setChecked(false);
			this.$.servername.setDisabled(false);
		}
	}
});