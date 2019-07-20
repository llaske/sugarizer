
// Main app class
enyo.kind({
	name: "VideoViewer.App",
	kind: "FittableRows",
	published: {
		activity: null,
		filter: null
	},
	components: [
		{name: "spinner", kind: "Image", src: "images/spinner-light.gif", classes: "mainspinner", showing: false },
		{name: "cloudwarning", kind: "Image", src: "images/cloud-warning.svg", classes: "cloudwarning", showing: false },
		{name: "content", kind: "Scroller", fit: true, classes: "main-content", onresize: "resize",
		components: [
			{name: "items", classes: "items", components: [
			]}
		]},
		{name: "footer", classes: "viewer-footer toolbar", fit: false, components: [
			{name: "previousbutton", kind: "Button", classes: "toolbutton previous-button pull-left", title:"Previous", ontap: "showPrevious", showing: false},
			{name: "pagecount", content: "0/0", classes: "page-count"},
			{name: "nextbutton", kind: "Button", classes: "toolbutton next-button pull-right", title:"Next", ontap: "showNext", showing: false}
		]},
		{name: "libraryDialog", kind: "VideoViewer.LibraryDialog", onHide: "librariesHidden"},
		{name: "addLibraryDialog", kind: "VideoViewer.AddLibraryDialog"},
		{name: "videoDialog", kind: "VideoViewer.VideoDialog"}
	],

	// Constructor
	create: function() {
		app = this;
		this.inherited(arguments);
		this.collection = [];
		this.index = 0;
		this.computeSize();
		this.favorite = false;
		document.getElementById("exportvideo-button").addEventListener("click", enyo.bind(this, "clickExportVideo"));
		var that = this;
		requirejs(["sugar-web/env","sugar-web/datastore"], function(env,datastore) {
			env.getEnvironment(function(err, environment) {
				that.$.content.applyStyle("background-color", environment.user.colorvalue.fill);
				that.datastore = datastore;
			});
		});
	},

	loadLibraries: function() {
		var that = this;
		Util.loadLibraries(
			function() {
				app.showLibraries();
			},
			function(sender) {
				that.$.spinner.setShowing(false);
				that.$.cloudwarning.setShowing(true);
				console.log("Error loading library on '"+sender.url+"'");
			}
		);
	},

	loadDatabase: function() {
		var that = this;
		this.$.spinner.setShowing(true);
		Util.loadDatabase(function(response) {
			that.index = 0;
			that.collection = response;
			that.$.spinner.setShowing(false);
			that.$.cloudwarning.setShowing(false);
			that.draw();
		}, function(sender) {
			that.$.spinner.setShowing(false);
			that.$.cloudwarning.setShowing(true);
			console.log("Error loading database on '"+sender.url+"'");
		});
	},

	computeSize: function() {
		var toolbar = document.getElementById("main-toolbar");
		var toolbaroffset = !Util.onSugar() ? toolbar.offsetHeight : 37.5;
		var canvas = document.getElementById("body");
		var canvas_height = canvas.offsetHeight;
		this.$.content.applyStyle("height", (canvas_height-(toolbaroffset*2))+"px");
	},

	resize: function() {
		if (!Util.onSugar()) {
			this.computeSize();
			this.draw();
		}
	},

	// Draw screen
	draw: function() {
		// Remove items
		var items = [];
		enyo.forEach(this.$.items.getControls(), function(item) { items.push(item); });
		for (var i = 0 ; i < items.length ; i++) { items[i].destroy();	}

		// Display items
		var collection = this.collection;
		var len = collection.length;
		var exportButton = document.getElementById("exportvideo-button");
		for(var i = 0 ; i < constant.pageCount && this.index+i < len ; i++ ) {
			this.$.items.createComponent(
				{
					kind: "VideoViewer.Item",
					code: collection[this.index+i].id,
					title: collection[this.index+i].title,
					category: collection[this.index+i].category,
					isFavorite: Util.getFavorite(collection[this.index+i].id),
					image: collection[this.index+i].image,
					onVideoPlayed: "showVideo",
					tojournal: exportButton.classList.contains("active")
				},
				{ owner: this }
			).render();
		}

		// Display button
		this.$.previousbutton.setShowing(this.index-constant.pageCount >= 0);
		var currentPage = (len?1:0)+Math.ceil(this.index/constant.pageCount);
		var lastPage = Math.ceil(len/constant.pageCount);
		this.$.pagecount.setContent(currentPage+"/"+lastPage);
		this.$.nextbutton.setShowing(currentPage < lastPage);
	},

	putItemsJournalModeTo: function(tojournal) {
		if (tojournal) {
			document.getElementById("exportvideo-button").classList.add("active");
		} else {
			document.getElementById("exportvideo-button").classList.remove("active");
		}
		enyo.forEach(this.$.items.getControls(), function(item) {
			item.tojournal = tojournal;
			item.tojournalChanged();
		});
	},

	// Page event
	showPrevious: function() {
		this.index -= constant.pageCount;
		this.saveContext();
		this.draw();
	},

	showNext: function() {
		this.index += constant.pageCount;
		this.saveContext();
		this.draw();
	},

	showVideo: function(item) {
		if (item.tojournal) {
			this.putItemsJournalModeTo(false);
			return;
		}
		this.$.videoDialog.show();
		this.$.videoDialog.setItem(item);
	},

	showLibraries: function() {
		this.$.libraryDialog.reload();
		this.$.libraryDialog.show();
	},

	hideLibraries: function() {
		this.$.libraryDialog.hide();
	},

	librariesHidden: function() {
		if (Util.getLibrary() == null)
			this.showLibraries();
	},

	setFilter: function(filter) {
		Util.setFilter(filter);
	},

	filterChanged: function(index) {
		this.collection = Util.getCollection();
		this.index = (index !== undefined ? index : 0);
		this.saveContext();
		this.draw();
	},

	clickExportVideo: function() {
		var exportButton = document.getElementById("exportvideo-button");
		var tojournal;
		tojournal = !exportButton.classList.contains("active");
		this.putItemsJournalModeTo(tojournal);
	},

	saveContext: function() {
		Util.setIndex(this.index);
		Util.saveContext();
	}
});
