// Entry component with image and sound
enyo.kind({
	name: "VideoViewer.Item",
	kind: enyo.Control,
	published: {
		code: "",
		title: "",
		category: "",
		isFavorite: false,
		image: "",
		tojournal: false
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
		this.tojournalChanged();
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

	tojournalChanged: function() {
		if (this.tojournal) {
			this.$.itemPlay.setSrc("icons/tojournal.svg");
		} else {
			this.$.itemPlay.setSrc("images/play.svg");
		}
		this.$.itemPlay.render();
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

	exportToVideo: function() {
		// Load file
		var url =this.videoURL();
		var mimetype = (constant.videoType=="mp4"?"video/mp4":"video/webm");
		var request = new XMLHttpRequest();
		request.open("GET",url,true);
		request.setRequestHeader("Content-type",mimetype);
		request.responseType = "arraybuffer";
		var that = this;
		request.onload = function() {
			if (request.status == 200 || request.status == 0) {
				var blob = new Uint8Array(this.response);
				var base64 = "data:"+mimetype+";base64,"+Util.toBase64(blob);
				var metadata = {
					mimetype: mimetype,
					title: that.title+"."+constant.videoType,
					activity: "org.olpcfrance.MediaViewerActivity",
					timestamp: new Date().getTime(),
					creation_time: new Date().getTime(),
					file_size: 0
				};
				app.datastore.create(metadata, function() {
					console.log("video '"+that.title+"' saved in journal.");
				}, base64);
			}
		};
		request.send();
	},

	// Handle event
	showVideo: function() {
		if (this.tojournal) {
			this.exportToVideo();
		}
		this.doVideoPlayed();

	}
});
