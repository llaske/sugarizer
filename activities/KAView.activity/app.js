
// Main app class
enyo.kind({
	name: "KAView.App",
	kind: "FittableRows",
	published: {activity: null},
	components: [
		{name: "content", kind: "Scroller", fit: true, classes: "main-content", onresize: "resize", 
		components: [
			{name: "items", classes: "items", components: [
			]}
		]},
		{name: "footer", classes: "viewer-footer toolbar", fit: false, components: [
			{name: "previousbutton", kind: "Button", classes: "toolbutton previous-button pull-left", title:"Previous", ontap: "showPrevious", showing: false},
			{name: "pagecount", content: "99/99", classes: "page-count"},
			{name: "nextbutton", kind: "Button", classes: "toolbutton next-button pull-right", title:"Next", ontap: "showNext", showing: false}
		]},
		{name: "videoDialog", kind: "KAView.VideoDialog"},
		{name: "remoteDialog", kind: "KAView.RemoteDialog"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.computeSize();
		this.localeChanged();
		this.favorite = false;
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
		for(var i = 0 ; i < constant.pageCount && this.index+i < len ; i++ ) {
			this.$.items.createComponent(
				{
					kind: "KAView.Item",
					code: collection[this.index+i].id,
					title: collection[this.index+i].title,
					isLocal: collection[this.index+i].local,
					isFavorite: Util.getFavorite(collection[this.index+i].id),
					onVideoPlayed: "showVideo"
				},
				{ owner: this }
			).render();
		}
		
		// Display button
		this.$.previousbutton.setShowing(this.index-constant.pageCount >= 0);
		this.$.pagecount.setContent((len?1:0)+Math.ceil(this.index/constant.pageCount)+"/"+Math.ceil(len/constant.pageCount));
		this.$.nextbutton.setShowing(this.index+constant.pageCount <= len);
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
		this.$.videoDialog.show();
		this.$.videoDialog.setItem(item);
	},
	
	localeChanged: function(index) {
		this.collection = Util.getCollection(this.favorite);
		this.index = (index !== undefined ? index : 0);
		this.saveContext();
		this.draw();	
	},
	
	remotePopUp: function() {
		this.$.remoteDialog.init();
		this.$.remoteDialog.show();
	},
	
	remoteChanged: function() {
		this.draw();
	},
	
	favoriteChanged: function(favorite) {
		this.favorite = favorite;
		this.collection = Util.getCollection(this.favorite);
		this.index = 0;
		this.saveContext();
		this.draw();	
	},
	
	saveContext: function() {
		Util.setIndex(this.index);
		Util.saveContext();
	}
});
