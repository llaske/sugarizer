// Entry component with image and sound
enyo.kind({
	name: "VideoViewer.Item",
	kind: enyo.Control,
	published: {
		code: "",
		title: "",
		category: "",
		isFavorite: false,
		image: ""
	},
	events: {
		onVideoPlayed: ""
	},
	classes: "item",
	components: [
		{ name: "spinner", kind: "Image", src: "images/spinner-dark.gif", classes: "spinner" },
		{ name: "background", classes: "itemImage", kind: "Image", src: "images/notloaded.png" },
		{ name: "itemImage", classes: "itemImage", kind: "Image", showing: false, onload: "imageLoaded", onerror: "defaultImage", ontap: "showVideo" },
		{ name: "itemPlay", classes: "itemPlay", kind: "Image", showing: false, src: "icons/play.svg", ontap: "showVideo" },
		{ name: "itemFavorite", classes: "itemFavorite", kind: "Image", src: "icons/notfavorite.svg", showing: false, ontap: "showVideo" },
		{ name: "itemOverlay", classes: "itemOverlay" },
		{ name: "itemTitle", classes: "itemTitle", content: "" }
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.nameChanged();
		this.titleChanged();
		this.isFavoriteChanged();
	},

	// Item setup
	nameChanged: function() {
		var image = this.image ? this.image : "";
		var imgurl = this.replaceValues(Util.getImages());
		if (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
			// HACK: When in Chrome App image should be load using a XmlHttpRequest
			var xhr = new XMLHttpRequest();
			var that = this;
			xhr.open('GET', imgurl, true);
			xhr.responseType = 'blob';
			xhr.onload = function(e) {
				that.$.itemImage.setAttribute("src", window.URL.createObjectURL(this.response));
			};
			xhr.send();
		} else {
			this.$.itemImage.setAttribute("src", imgurl);
		}
	},

	titleChanged: function() {
		this.$.itemTitle.setContent(this.title);
	},

	isFavoriteChanged: function() {
		this.$.itemFavorite.setShowing(this.isFavorite);
	},

	imageLoaded: function() {
		this.$.itemImage.setShowing(true);
		this.$.itemPlay.setShowing(true);
		this.$.spinner.setShowing(false);
		this.$.background.setShowing(false);
	},

	defaultImage: function() {
		this.$.itemImage.setAttribute("src", "images/notloaded.png");
		this.$.itemImage.setShowing(true);
		this.$.itemPlay.setShowing(true);
		this.$.spinner.setShowing(false);
		this.$.background.setShowing(false);
	},

	replaceValues: function(template) {
		// Remplace values in the template
		var output = template;
		output = output.replace(new RegExp("%id%", "g"),this.code);
		output = output.replace(new RegExp("%image%", "g"), this.image);
		output = output.replace(new RegExp("%category%", "g"), this.category);
		output = output.replace(new RegExp("%title%", "g"), this.title);
		return output;
	},
	
	videoURL: function() {
		return this.replaceValues(Util.getVideos())+"."+constant.videoType;

	},

	// Handle event
	showVideo: function() {
		this.doVideoPlayed();
	}
});