/**
A list that provides a pull-to-refresh feature, which allows new data to be
retrieved and updated in the list.

PulldownList provides the onPullRelease event to allow an application to start
retrieving new data.  The onPullComplete event indicates that the pull is
complete and it's time to update the list with the new data.

	{name: "list", kind: "PulldownList", onSetupItem: "setupItem",
		onPullRelease: "pullRelease", onPullComplete: "pullComplete",
		components: [
			{name: "item"}
		]}

	pullRelease: function() {
		this.search();
	},
	processSearchResults: function(inRequest, inResponse) {
		this.results = inResponse.results;
		this.$.list.setCount(this.results.length);
		this.$.list.completePull();
	},
	pullComplete: function() {
		this.$.list.reset();
	}
*/
enyo.kind({
	name: "enyo.PulldownList",
	kind: "List",
	touch: true,
	pully: null,
	pulldownTools: [
		{name: "pulldown", classes: "enyo-list-pulldown", components: [
			{name: "puller", kind: "Puller"}
		]}
	],
	events: {
		onPullStart: "",
		onPullCancel: "",
		onPull: "",
		onPullRelease: "",
		onPullComplete: ""
	},
	handlers: {
		onScrollStart: "scrollStartHandler",
		onScroll: "scrollHandler",
		onScrollStop: "scrollStopHandler",
		ondragfinish: "dragfinish"
	},
	//
	pullingMessage: "Pull down to refresh...",
	pulledMessage: "Release to refresh...",
	loadingMessage: "Loading...",
	//
	pullingIconClass: "enyo-puller-arrow enyo-puller-arrow-down",
	pulledIconClass: "enyo-puller-arrow enyo-puller-arrow-up",
	loadingIconClass: "",
	//* @protected
	create: function() {
		var p = {kind: "Puller", showing: false, text: this.loadingMessage, iconClass: this.loadingIconClass, onCreate: "setPully"};
		this.listTools.splice(0, 0, p);
		this.inherited(arguments);
		this.setPulling();
	},
	initComponents: function() {
		this.createChrome(this.pulldownTools);
		this.accel = enyo.dom.canAccelerate();
		this.translation = this.accel ? "translate3d" : "translate";
		this.inherited(arguments);
	},
	setPully: function(inSender, inEvent) {
		this.pully = inEvent.originator;
	},
	scrollStartHandler: function() {
		this.firedPullStart = false;
		this.firedPull = false;
		this.firedPullCancel = false;
	},
	scrollHandler: function(inSender) {
		if (this.completingPull) {
			this.pully.setShowing(false);
		}
		var s = this.getStrategy().$.scrollMath;
		var over = s.y;
		if (s.isInOverScroll() && over > 0) {
			enyo.dom.transformValue(this.$.pulldown, this.translation, "0," + over + "px" + (this.accel ? ",0" : ""));
			if (!this.firedPullStart) {
				this.firedPullStart = true;
				this.pullStart();
				this.pullHeight = this.$.pulldown.getBounds().height;
			}
			if (over > this.pullHeight && !this.firedPull) {
				this.firedPull = true;
				this.firedPullCancel = false;
				this.pull();
			}
			if (this.firedPull && !this.firedPullCancel && over < this.pullHeight) {
				this.firedPullCancel = true;
				this.firedPull = false;
				this.pullCancel();
			}
		}
	},
	scrollStopHandler: function() {
		if (this.completingPull) {
			this.completingPull = false;
			this.doPullComplete();
		}
	},
	dragfinish: function() {
		if (this.firedPull) {
			var s = this.getStrategy().$.scrollMath;
			s.setScrollY(s.y - this.pullHeight);
			this.pullRelease();
		}
	},
	//* @public
	//* To signal that the list should execute pull completion.  This usually be called after the application has received the new data.
	completePull: function() {
		this.completingPull = true;
		this.$.strategy.$.scrollMath.setScrollY(this.pullHeight);
		this.$.strategy.$.scrollMath.start();
	},
	//* @protected
	pullStart: function() {
		this.setPulling();
		this.pully.setShowing(false);
		this.$.puller.setShowing(true);
		this.doPullStart();
	},
	pull: function() {
		this.setPulled();
		this.doPull();
	},
	pullCancel: function() {
		this.setPulling();
		this.doPullCancel();
	},
	pullRelease: function() {
		this.$.puller.setShowing(false);
		this.pully.setShowing(true);
		this.doPullRelease();
	},
	setPulling: function() {
		this.$.puller.setText(this.pullingMessage);
		this.$.puller.setIconClass(this.pullingIconClass);
	},
	setPulled: function() {
		this.$.puller.setText(this.pulledMessage);
		this.$.puller.setIconClass(this.pulledIconClass);
	}
});

enyo.kind({
	name: "enyo.Puller",
	classes: "enyo-puller",
	published: {
		text: "",
		iconClass: ""
	},
	events: {
		onCreate: ""
	},
	components: [
		{name: "icon"},
		{name: "text", tag: "span", classes: "enyo-puller-text"}
	],
	create: function() {
		this.inherited(arguments);
		this.doCreate();
		this.textChanged();
		this.iconClassChanged();
	},
	textChanged: function() {
		this.$.text.setContent(this.text);
	},
	iconClassChanged: function() {
		this.$.icon.setClasses(this.iconClass);
	}
});