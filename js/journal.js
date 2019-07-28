

// Listview view
enyo.kind({
	name: "Sugar.Journal",
	published: { journal: null },
	kind: "FittableRows",
	components: [
		{name: "warningbox", kind: "Sugar.GenericDialogBox", showing: false, classes: "journal-dialogbox", onCancel: "dialogSelectedCancel", onOk: "dialogSelectedOk"},
		{name: "content", kind: "Scroller", fit: true, classes: "journal-content", onresize: "draw", onScroll: "onscroll", components: [
			{name: "empty", classes: "journal-empty", showing: true},
			{name: "message", classes: "journal-message", showing: true},
			{name: "nofilter", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-cancel.svg"}, classes: "listview-button", ontap: "nofilter", showing: false},
			{name: "journalList", classes: "journal-list", kind: "Repeater", onSetupItem: "setupItem", components: [
				{name: "item", classes: "journal-list-item", components: [
					{name: "check", kind: "Input", type: "checkbox", classes: "toggle journal-check", onchange: "switchCheck"},
					{name: "favorite", kind: "Sugar.Icon", x: 40, y: 4, size: constant.iconSizeLargeFavorite, ontap: "switchFavorite"},
					{name: "activity", kind: "Sugar.Icon", x: 100, y: 5, size: constant.iconSizeList, colorized: true, ontap: "runActivity"},
					{name: "title", showing: true, classes: "journal-title", ontap: "titleEditStart"},
					{name: "titleEdit", showing: false, kind: "enyo.Input", classes: "journal-title-edit", onblur:"titleEditEnd"},
					{name: "time", classes: "journal-time"},
					{name: "goright", kind: "Sugar.Icon", classes: "journal-goright", size: constant.iconSizeFavorite, ontap: "runActivity"}
				]}
			]},
			{name: "activityPopup", kind: "Sugar.Popup", showing: false}
		]},
		{name: "footer", classes: "journal-footer toolbar", showing: false, components: [
			{name: "journalbutton", kind: "Button", classes: "toolbutton view-localjournal-button active", title:"Journal", ontap: "showLocalJournal"},
			{name: "cloudonebutton", kind: "Button", classes: "toolbutton view-cloudone-button", title:"Private", ontap: "showPrivateCloud"},
			{name: "cloudallbutton", kind: "Button", classes: "toolbutton view-cloudall-button", title:"Shared", ontap: "showSharedCloud"},
			{name: "syncgear", classes: "sync-button sync-gear sync-gear-journal", showing: false},
			{name: "syncbutton", kind: "Button", classes: "toolbutton sync-button sync-journal", title:"Sync", ontap: "syncJournal"},
			{name: "pageup", kind: "Button", classes: "toolbutton page-up", showing: false, title:"Previous", ontap: "pagePrevious"},
			{name: "pagecount", content: "99/99", classes: "page-count", showing: false},
			{name: "pagedown", kind: "Button", classes: "toolbutton page-down", showing: false, title:"Next", ontap: "pageNext"}
		]}
	],

	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.toolbar = null;
		this.empty = (this.journal.length == 0);
		this.realLength = 0;
		this.loadResult = {};
		this.loadingError = false;
		this.journalType = constant.journalLocal;
		this.smallTime = false;
		this.dialogAction = -1;
		this.journalChanged();
		this.$.footer.setShowing(preferences.getNetworkId() != null && preferences.getPrivateJournal() != null && preferences.getSharedJournal() != null);
		if (l10n.language.direction == "rtl") {
			this.$.message.addClass("rtl-10");
		}
		this.draw();
	},

	// Render
	rendered: function() {
		this.inherited(arguments);

		// Colorizer footer icons
		iconLib.colorize(this.$.journalbutton.hasNode(), preferences.getColor(), function() {});
		iconLib.colorize(this.$.cloudonebutton.hasNode(), preferences.getColor(), function() {});
		iconLib.colorize(this.$.cloudallbutton.hasNode(), preferences.getColor(), function() {});

		this.$.syncbutton.setNodeProperty("title", l10n.get("Synchronize"));
		this.$.pageup.setNodeProperty("title", l10n.get("Back"));
		this.$.pagedown.setNodeProperty("title", l10n.get("Next"));
		this.journalChanged();
	},

	// Handle scroll to lazy display on local content
	onscroll: function(inSender, inEvent) {
		var scrollBounds = inEvent.scrollBounds;
		var scrollAtBottom = ((scrollBounds.maxTop - scrollBounds.top) < constant.journalScrollLimit);
		var currentCount = this.$.journalList.get("count");
		if (this.journalType == constant.journalLocal && !this.getToolbar().hasFilter() && scrollAtBottom && this.realLength > currentCount) {
			var selection = this.getSelection();
			var length = Math.min(currentCount + constant.journalStepCount, this.journal.length);
			humane.log(l10n.get("Loading"));
			this.$.journalList.set("count", length, true);
			this.setSelection(selection);
			this.updateSelectionCount();
		}
	},

	// Load next remote page in Journal
	pageNext: function() {
		var result = this.loadResult;
		if ((result.offset+result.limit) < result.total) {
			this.getToolbar().setMultiselectToolbarVisibility(false);
			this.$.warningbox.setShowing(false);
			var journalId = (this.journalType == constant.journalRemotePrivate ) ? preferences.getPrivateJournal() : preferences.getSharedJournal();
			var offset = result.offset + result.limit;
			if (result.total - offset < result.limit) {
				offset = result.total - result.limit;
			}
			humane.log(l10n.get("Loading"));
			if (!this.getToolbar().hasFilter()) {
				this.loadRemoteJournal(journalId, offset);
			} else {
				this.filterEntries(this.request.name, this.request.favorite, this.request.typeactivity, this.request.stime, offset);
			}
		}
	},

	// Load previous remote page in Journal
	pagePrevious: function() {
		var result = this.loadResult;
		if (result.offset > 0) {
			this.getToolbar().setMultiselectToolbarVisibility(false);
			this.$.warningbox.setShowing(false);
			var journalId = (this.journalType == constant.journalRemotePrivate ) ? preferences.getPrivateJournal() : preferences.getSharedJournal();
			var offset = result.offset - result.limit;
			if (offset < result.limit) {
				offset = 0;
			}
			humane.log(l10n.get("Loading"));
			if (!this.getToolbar().hasFilter()) {
				this.loadRemoteJournal(journalId, offset);
			} else {
				this.filterEntries(this.request.name, this.request.favorite, this.request.typeactivity, this.request.stime, offset);
			}
		}
	},

	// Show/hide remote page button
	showPageButton: function() {
		var result = this.loadResult;
		if (this.journalType == constant.journalLocal || !result) {
			this.$.pagedown.setShowing(false);
			this.$.pageup.setShowing(false);
			this.$.pagecount.setShowing(false);
			return;
		}

		var up = (result.offset > 0);
		this.$.pageup.setShowing(up);

		var down = (result.offset+result.limit) < result.total;
		this.$.pagedown.setShowing(down);

		var currentPage = (result.total?1:0)+Math.ceil(result.offset/result.limit);
		var lastPage = Math.ceil(result.total/result.limit);
		this.$.pagecount.setContent(currentPage+"/"+lastPage);
		this.$.pagecount.setShowing(down || up);
	},

	// Get linked toolbar
	getToolbar: function() {
		if (this.toolbar == null) {
			this.toolbar = new Sugar.JournalToolbar();
		}
		return this.toolbar;
	},

	// Draw screen
	draw: function() {
		// Resize content and set Journal empty in the middle
		var canvas_center = util.getCanvasCenter();
		var footer_size = this.$.footer.getShowing() ? 55 : 0;   // HACK: 55 is the footer height
		this.smallTime = (canvas_center.dx < 660);
		var android_gap = (enyo.platform.android ? 3 : 0);
		this.$.content.applyStyle("height", (canvas_center.dy-footer_size-android_gap)+"px");
		this.$.empty.applyStyle("margin-left", (canvas_center.x-constant.sizeEmpty/4)+"px");
		var margintop = (canvas_center.y-constant.sizeEmpty/4-80);
		this.$.empty.applyStyle("margin-top", margintop+"px");
		this.$.message.setContent(l10n.get("JournalEmpty"));
		if (preferences.getNetworkId() != null && preferences.getPrivateJournal() != null && preferences.getSharedJournal() != null) {
			tutorial.setElement("journalbutton", this.$.journalbutton.getAttribute("id"));
			tutorial.setElement("cloudonebutton", this.$.cloudonebutton.getAttribute("id"));
			tutorial.setElement("cloudallbutton", this.$.cloudallbutton.getAttribute("id"));
		}
	},

	updateNetworkBar: function() {
		this.$.footer.setShowing(preferences.getNetworkId() != null && preferences.getPrivateJournal() != null && preferences.getSharedJournal() != null);
		this.draw();
	},

	// Property changed
	journalChanged: function() {
		if (!this.$.empty) {
			return;
		}
		this.$.empty.show();
		this.$.message.show();
		this.$.nofilter.show();
		var noFilter = !this.getToolbar().hasFilter();
		var isLocalJournal = (this.journalType == constant.journalLocal);
		this.empty = (noFilter && !this.loadingError && this.journal.length == 0);
		if (this.journal != null && this.journal.length > 0) {
			var length = (isLocalJournal && noFilter && this.journal.length > constant.journalInitCount) ? constant.journalInitCount : this.journal.length;
			this.realLength = this.journal.length;
			this.$.journalList.set("count", length, true);
			this.$.empty.hide();
			this.$.message.hide();
			this.$.nofilter.hide();
		} else {
			this.$.journalList.set("count", 0, true);
			if (this.empty) {
				// Journal empty
				this.$.message.setContent(l10n.get("JournalEmpty"));
				this.$.nofilter.hide();
			} else if (this.loadingError) {
				// Loading error
				this.$.message.setContent(l10n.get("ErrorLoadingRemote"));
				this.$.nofilter.setText(l10n.get("Retry"));
				this.$.nofilter.setIcon({directory: "icons", icon: "system-restart.svg"});
			} else {
				// Filtering return no result
				this.$.message.setContent(l10n.get("NoMatchingEntries"));
				this.$.nofilter.setText(l10n.get("ClearSearch"));
				this.$.nofilter.setIcon({directory: "icons", icon: "dialog-cancel.svg"});
			}
		}
		this.showPageButton();
	},

	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		var entry = this.journal[inEvent.index];
		if (entry.metadata.buddy_color) {
			inEvent.item.$.activity.setColorizedColor(entry.metadata.buddy_color);
		}
		var activityIcon = preferences.getActivity(entry.metadata.activity);
		if (activityIcon == preferences.genericActivity) {
			if (entry.metadata.mimetype == "text/plain") {
				activityIcon = {directory: "icons", icon: "application-x-txt.svg"};
			} else if (entry.metadata.mimetype == "application/pdf") {
				activityIcon = {directory: "icons", icon: "application-x-pdf.svg"};
			} else if (entry.metadata.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
				activityIcon = {directory: "icons", icon: "application-x-doc.svg"};
			}
		}
		inEvent.item.$.activity.setIcon(activityIcon);
		inEvent.item.$.favorite.setIcon({directory: "icons", icon: "emblem-favorite-large.svg"});
		var keep = entry.metadata.keep;
		inEvent.item.$.favorite.setColorized(keep !== undefined && keep == 1);
		inEvent.item.$.title.setContent(entry.metadata.title);
		var sortfield = this.getToolbar().getSortType();
		if (sortfield == 1) {
			inEvent.item.$.time.setContent(util.timestampToElapsedString(entry.metadata.creation_time, 2, this.smallTime));
		} else if (sortfield == 2) {
			inEvent.item.$.time.setContent(util.formatSize(entry.metadata.textsize || 0));
		} else {
			inEvent.item.$.time.setContent(util.timestampToElapsedString(entry.metadata.timestamp, 2, this.smallTime));
		}
		inEvent.item.$.goright.setIcon({directory: "icons", icon: "go-right.svg"});
		inEvent.item.$.activity.setPopupShow(enyo.bind(this, "showActivityPopup"));
		inEvent.item.$.activity.setPopupHide(enyo.bind(this, "hideActivityPopup"));
		inEvent.item.$.activity.setData(entry);
		if (l10n.language.direction == "rtl") {
			inEvent.item.$.title.addClass("rtl-14");
			inEvent.item.$.titleEdit.addClass("rtl-14");
			inEvent.item.$.time.addClass("rtl-14");
		}
		if (inEvent.index == 0) {
			tutorial.setElement("checkitem", inEvent.item.$.check.getAttribute("id"));
			tutorial.setElement("activityitem", inEvent.item.$.activity.getAttribute("id"));
			tutorial.setElement("titleitem", inEvent.item.$.title.getAttribute("id"));
			tutorial.setElement("timeitem", inEvent.item.$.time.getAttribute("id"));
			tutorial.setElement("favoriteitem", inEvent.item.$.favorite.getAttribute("id"));
		}
	},

	// Switch favorite value for clicked line
	switchFavorite: function(inSender, inEvent) {
		var objectId = this.journal[inEvent.index].objectId;
		var keep = this.journal[inEvent.index].metadata.keep;
		if (keep === undefined) {
			this.journal[inEvent.index].metadata.keep = 1;
		} else {
			this.journal[inEvent.index].metadata.keep = (keep + 1) % 2;
		}
		stats.trace(constant.viewNames[app.getView()], 'switch_favorite', objectId, null);
		var ds = new datastore.DatastoreObject(objectId);
		ds.setMetadata(this.journal[inEvent.index].metadata);
		ds.save();
		inEvent.dispatchTarget.container.setColorized(this.journal[inEvent.index].metadata.keep == 1);
		inEvent.dispatchTarget.container.render();
	},

	// Check/uncheck an item Checkbox
	switchCheck: function(inSender, inEvent) {
		this.$.warningbox.setShowing(false);
		this.getToolbar().setMultiselectToolbarVisibility(this.updateSelectionCount() > 0);
	},

	updateSelectionCount: function() {
		var selection = this.getSelection();
		this.getToolbar().setSelectedCount(selection.length, this.$.journalList.get("count"));
		return selection.length;
	},

	getSelection: function() {
		var selection = [];
		var length = this.$.journalList.get("count");
		for (var i = 0 ; i < length ; i++) {
			if (this.$.journalList.children[i].$.check.getNodeProperty("checked")) {
				selection.push(i);
			}
		}
		return selection;
	},

	setSelection: function(selection) {
		var length = selection.length;
		for (var i = 0 ; i < length ; i++) {
			var index = selection[i];
			this.$.journalList.children[index].$.check.setNodeProperty("checked", true);
		}
	},

	selectAll: function() {
		var length = this.$.journalList.get("count");
		for (var i = 0 ; i < length ; i++) {
			this.$.journalList.children[i].$.check.setNodeProperty("checked", true);
		}
		this.getToolbar().setSelectedCount(length, length);
	},

	unselectAll: function() {
		var length = this.$.journalList.get("count");
		for (var i = 0 ; i < length ; i++) {
			this.$.journalList.children[i].$.check.setNodeProperty("checked", false);
		}
		this.getToolbar().setMultiselectToolbarVisibility(false);
	},

	removeSelected: function() {
		this.dialogAction = constant.journalRemove;
		this.$.warningbox.setTitle(l10n.get("Erase"));
		var length = this.getSelection().length;
		this.$.warningbox.setMessage(length == 1 ? l10n.get("Erase_one",{count:length}) : l10n.get("Erase_other",{count:length}));
		this.$.warningbox.setOkText(l10n.get("Ok"));
		this.$.warningbox.setCancelText(l10n.get("Cancel"));
		this.$.warningbox.setShowing(true);
	},

	copySelected: function(dest) {
		this.dialogAction = dest;
		var title = ["CopyToLocal", "CopyToPrivate", "CopyToShared", "", "CopyToDevice"];
		this.$.warningbox.setTitle(l10n.get(title[dest]));
		var length = this.getSelection().length;
		this.$.warningbox.setMessage(length == 1 ? l10n.get(title[dest]+"_one",{count:length}) : l10n.get(title[dest]+"_other",{count:length}));
		this.$.warningbox.setOkText(l10n.get("Ok"));
		this.$.warningbox.setCancelText(l10n.get("Cancel"));
		this.$.warningbox.setShowing(true);
	},

	dialogSelectedOk: function() {
		this.$.warningbox.setShowing(false);
		this.getToolbar().setMultiselectToolbarVisibility(false);
		var selection = this.getSelection();
		var toProcess = [];
		for (var i = 0 ; i < selection.length ; i++) {
			toProcess.push(this.journal[selection[i]]);
		}
		var that = this;
		var isMultiple = (this.dialogAction == constant.journalDevice && util.getClientType() == constant.appType && enyo.platform.electron);
		if (!isMultiple) {
			humane.log(l10n.get(this.dialogAction == constant.journalRemove ? "Erasing" : "Copying"));
		}
		window.setTimeout(function() {
			if (!isMultiple) {
				// Do action on each entry
				for (var i = 0 ; i < toProcess.length ; i++) {
					if (that.dialogAction == constant.journalDevice) {
						that.copyToDevice(toProcess[i]);
					} else if (that.dialogAction == constant.journalRemove) {
						that.removeEntry(toProcess[i], {isLast: (i==toProcess.length-1)});
					} else if (that.dialogAction == constant.journalLocal) {
						that.copyToLocal(toProcess[i]);
					} else {
						that.copyToRemote(toProcess[i], (that.dialogAction == constant.journalRemotePrivate ? preferences.getPrivateJournal() : preferences.getSharedJournal()));
					}
				}
			} else {
				// Do action on all entries
				that.copyMultipleToDevice(toProcess);
			}
			that.unselectAll();
		}, 100);
	},

	dialogSelectedCancel: function() {
		this.$.warningbox.setShowing(false);
		this.getToolbar().setMultiselectToolbarVisibility(true);
	},

	// Run activity from icon or from the popup menu
	runActivity: function(inSender, inEvent) {
		this.runCurrentActivity(this.journal[inEvent.index]);
	},
	runCurrentActivity: function(activity) {
		// Generic activity type, try to open as a document
		var activityInstance = preferences.getActivity(activity.metadata.activity);
		if (activityInstance == preferences.genericActivity) {
			if (activity.metadata.mimetype == "application/pdf") {
				var that = this;
				this.loadEntry(activity, function(err, metadata, text) {
					that.$.activityPopup.hidePopup();
					util.openAsDocument(metadata, text);
					return;
				});
			}
			return;
		}

		// Load text content
		var that = this;
		this.loadEntry(activity, function(err, metadata, text) {
			// Remote entry, copy in the local journal first
			if (that.journalType != constant.journalLocal) {
				// Create the entry with same oid - or update the entry if already there
				var ds = new datastore.DatastoreObject(activity.objectId);
				ds.setMetadata(metadata);
				ds.setDataAsText(text);
				ds.save(function() {
					// Run updated local entry
					preferences.runActivity(
						activityInstance,
						activity.objectId,
						metadata.title);
				});
				return;
			}

			// Run local entry
			preferences.runActivity(
				activityInstance,
				activity.objectId,
				metadata.title);
		});
	},

	// Filter entries handling
	filterEntries: function(name, favorite, typeactivity, timeperiod, offset) {
		// Filter remote entries
		var sortfield = this.getToolbar().getSortType();
		if (this.journalType != constant.journalLocal) {
			var journalId = (this.journalType == constant.journalRemotePrivate ) ? preferences.getPrivateJournal() : preferences.getSharedJournal();
			var that = this;
			var sort = '-timestamp';
			if (sortfield == 1) {
				sort = '-creation_time';
			} else if (sortfield == 2) {
				sort = '-textsize';
			}
			var request = {
				typeactivity: typeactivity,
				title: (name !== undefined) ? name : undefined,
				stime: (timeperiod !== undefined ? timeperiod : undefined),
				favorite: favorite,
				field: constant.fieldMetadata,
				limit: constant.pageJournalSize,
				sort: sort,
				offset: (offset !== undefined ? offset : 0)
			}
			myserver.getJournal(journalId, request,
				function(inSender, inResponse) {
					that.loadResult = {offset: inResponse.offset, total: inResponse.total, limit: inResponse.limit};
					that.request = request;
					that.journal = inResponse.entries;
					that.empty = (!that.getToolbar().hasFilter() && !this.loadingError && that.journal.length == 0);
					that.loadingError = false;
					that.journalChanged();
				},
				function() {
					console.log("WARNING: Error filtering journal "+journalId);
					that.loadResult = {};
					that.request = {};
					that.journal = [];
					that.loadingError = true;
					that.journalChanged();
				}
			);
			return;
		}

		// Filter local entries
		this.journal = datastore.find(typeactivity);
		this.loadingError = false;
		this.journal = this.journal.filter(function(activity) {
			return (favorite !== undefined ? activity.metadata.keep : true)
				&& (name.length != 0 ? activity.metadata.title.toLowerCase().indexOf(name.toLowerCase()) != -1 : true)
				&& (timeperiod !== undefined ? activity.metadata.timestamp >= timeperiod : true);
		});
		var that = this;
		this.journal = this.journal.sort(function(e0, e1) {
			if (sortfield == 1) {
				return parseInt(e1.metadata.creation_time) - parseInt(e0.metadata.creation_time);
			} else if (sortfield == 2) {
				return parseInt(e1.metadata.textsize || 0) - parseInt(e0.metadata.textsize || 0);
			} else {
				return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp);
			}
		});
		this.journalChanged();
	},

	nofilter: function() {
		this.toolbar.removeFilter();
		this.filterEntries("", undefined, undefined, undefined, undefined);
	},

	// Activity popup
	showActivityPopup: function(icon) {
		// Create popup
		if (!icon.owner) {
			return;
		}
		var activity = icon.icon; // HACK: activity is stored as an icon
		var entry = icon.getData();
		var title = null;
		if (this.journalType != constant.sharedJournal) {
			if (entry.metadata.textsize && entry.metadata.textsize > constant.minimumSizeDisplay) {
				title = util.formatSize(entry.metadata.textsize);
			}
		} else if (entry.metadata.buddy_name) {
			title = l10n.get("ByUser", {user:entry.metadata.buddy_name});
		}
		this.$.activityPopup.setHeader({
			icon: icon.icon,
			colorized: true,
			colorizedColor: (entry.metadata.buddy_color ? entry.metadata.buddy_color : null),
			name: entry.metadata.title,
			title: title,
			action: enyo.bind(this, "runCurrentActivity"),
			data: [entry, null]
		});
		this.$.activityPopup.setItems(null);
		var items = [];
		items.push({
			icon: {directory: "icons", icon: "activity-start.svg"},
			colorized: false,
			name: l10n.get("RestartActivity"),
			action: enyo.bind(this, "runCurrentActivity"),
			disable: (preferences.getActivity(entry.metadata.activity) == preferences.genericActivity && entry.metadata.mimetype != "application/pdf"),
			data: [entry, null]
		});
		items.push({
			icon: {directory: "icons", icon: "copy-journal.svg"},
			colorized: false,
			name: l10n.get("CopyToLocal"),
			action: enyo.bind(this, "copyToLocal"),
			data: [entry, null],
			disable: this.journalType == constant.journalLocal
		});
		items.push({
			icon: {directory: "icons", icon: "copy-cloud-one.svg"},
			colorized: false,
			name: l10n.get("CopyToPrivate"),
			action: enyo.bind(this, "copyToRemote"),
			data: [entry, preferences.getPrivateJournal()],
			disable: !preferences.isConnected() || this.journalType == constant.journalRemotePrivate
		});
		items.push({
			icon: {directory: "icons", icon: "copy-cloud-all.svg"},
			colorized: false,
			name: l10n.get("CopyToShared"),
			action: enyo.bind(this, "copyToRemote"),
			data: [entry, preferences.getSharedJournal()],
			disable: !preferences.isConnected() || this.journalType == constant.journalRemoteShared
		});
		items.push({
			icon: {directory: "icons", icon: "copy-to-device.svg"},
			colorized: false,
			name: l10n.get("CopyToDevice"),
			action: enyo.bind(this, "copyToDevice"),
			data: [entry, null]
		});
		items.push({
			icon: {directory: "icons", icon: "list-remove.svg"},
			colorized: false,
			name: l10n.get("Erase"),
			action: enyo.bind(this, "removeEntry"),
			data: [entry, null]
		});
		this.$.activityPopup.setFooter(items);

		// Show popup
		this.$.activityPopup.setMargin({left: 0, top: (icon.owner.index*60)+20-mouse.position.y});
		this.$.activityPopup.showPopup();
	},
	hideActivityPopup: function(icon) {
		if (!this.$.activityPopup) {
			return true;
		}
		if (this.$.activityPopup.cursorIsInside() || icon.cursorIsInside()) {
			return false;
		}
		this.$.activityPopup.hidePopup();
		return true;
	},

	// Copy activity content to the local journal
	copyToLocal: function(entry) {
		var that = this;
		stats.trace(constant.viewNames[app.getView()], 'copy_to_local', entry.objectId, null);
		this.loadEntry(entry, function(err, metadata, text) {
			var ds = new datastore.DatastoreObject(entry.objectId);
			ds.setMetadata(metadata);
			ds.setDataAsText(text);
			ds.save();
			that.$.activityPopup.hidePopup();
		});
	},

	// Copy activity content into a file on the device
	copyToDevice: function(entry, directory) {
		var that = this;
		that.$.activityPopup.hidePopup();
		this.loadEntry(entry, function(err, metadata, text) {
			util.writeFile(directory, metadata, text, function(err, filename) {
				if (err) {
					humane.log(l10n.get("ErrorWritingFile"));
				} else {
					humane.log(l10n.get("FileWroteTo",{file:filename}));
				}
			});
		});
	},

	// Copy a set of entries on the device: ask directory, then copy each entry
	copyMultipleToDevice: function(entries) {
		var that = this;
		util.askDirectory(function(directory) {
			for (var i = 0 ; i < entries.length ; i++) {
				that.copyToDevice(entries[i], directory);
			}
		});
	},

	// Copy activity content to a remote journal
	copyToRemote: function(entry, journalId) {
		stats.trace(constant.viewNames[app.getView()], 'copy_to_remote', entry.objectId, journalId);
		this.loadEntry(entry, function(err, metadata, text) {
			var dataentry = {metadata: metadata, text: text, objectId: entry.objectId};
			myserver.putJournalEntry(journalId, entry.objectId, dataentry,
				function() {},
				function() {
					console.log("WARNING: Error writing journal "+journalId);
				}
			);
		});
		this.$.activityPopup.hidePopup();
	},

	// Load local journal
	loadLocalJournal: function() {
		this.journal = datastore.find();
		this.journal = this.journal.sort(function(e0, e1) {
			return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp);
		});
		this.journalChanged();
	},

	// Load a remote journal
	loadRemoteJournal: function(journalId, offset) {
		var that = this;
		var request = {
			field: constant.fieldMetadata,
			limit: constant.pageJournalSize,
			offset: (offset !== undefined ? offset : 0),
			sort: '-timestamp'
		}
		var sortfield = this.getToolbar().getSortType();
		if (sortfield == 1) {
			request.sort = '-creation_time';
		} else if (sortfield == 2) {
			request.sort = '-textsize';
		}
		myserver.getJournal(journalId, request,
			function(inSender, inResponse) {
				that.loadResult = {offset: inResponse.offset, total: inResponse.total, limit: inResponse.limit};
				that.journal = inResponse.entries;
				that.empty = (!that.getToolbar().hasFilter() && !this.loadingError && that.journal.length == 0);
				that.loadingError = false;
				that.journalChanged();
			},
			function() {
				console.log("WARNING: Error reading journal "+journalId);
				that.loadResult = {};
				that.journal = [];
				that.loadingError = true;
				that.journalChanged();
			}
		);
	},

	// Load entry in the journal
	loadEntry: function(entry, callback) {
		if (this.journalType == constant.journalLocal) {
			var dataentry = new datastore.DatastoreObject(entry.objectId);
			dataentry.loadAsText(function(err, metadata, text) {
				callback(err, metadata, text);
			});
		} else {
			var journalId;
			if (this.journalType == constant.journalRemotePrivate) {
				journalId = preferences.getPrivateJournal();
			} else if (this.journalType == constant.journalRemoteShared) {
				journalId = preferences.getSharedJournal();
			}
			myserver.getJournalEntry(journalId, entry.objectId,
				function(inSender, inResponse) {
					callback(null, inResponse.entries[0].metadata, inResponse.entries[0].text);
				},
				function() {
					console.log("WARNING: Error loading entry "+objectId+" in journal "+journalId);
				}
			);
		}
	},

	// Remove an entry in the journal
	removeEntry: function(entry, multiple) {
		// Remove from local journal
		if (this.journalType == constant.journalLocal) {
			// Delete in datastore
			stats.trace(constant.viewNames[app.getView()], 'remove_entry', entry.objectId, null);
			datastore.remove(entry.objectId);

			// If connected and in sync, try remove also the matching remote entry
			if (preferences.isConnected() && preferences.getOptions("sync")) {
				var journalId = preferences.getPrivateJournal();
				var objectId = entry.objectId;
				myserver.deleteJournalEntry(journalId, objectId,
					function(inSender, inResponse) {},
					function() {
						console.log("WARNING: Error removing entry "+objectId+" in journal "+journalId);
					}
				);
			}

			// Test if refresh
			var refresh = (!multiple || multiple.isLast);
			if (refresh) {
				// Refresh screen
				this.toolbar.removeFilter();
				this.loadLocalJournal();

				// Refresh home screen: activity menu, journal content
				preferences.updateEntries();
				app.journal = this.journal;
				app.redraw();
			}
		} else {
			// Remove from remote journal
			var journalId = (this.journalType == constant.journalRemotePrivate ) ? preferences.getPrivateJournal() : preferences.getSharedJournal();
			var objectId = entry.objectId;
			var that = this;
			this.toolbar.removeFilter();
			stats.trace(constant.viewNames[app.getView()], 'remove_entry', objectId, journalId);
			myserver.deleteJournalEntry(journalId, objectId,
				function(inSender, inResponse) {
					that.loadRemoteJournal(journalId);
					that.$.activityPopup.hidePopup();
				},
				function() {
					console.log("WARNING: Error removing entry "+objectId+" in journal "+journalId);
					that.loadRemoteJournal(journalId);
					that.$.activityPopup.hidePopup();
				}
			);
			return;
		}
		this.$.activityPopup.hidePopup();
	},

	// Handle entry title update
	titleEditStart: function(inSender, inEvent) {
		var line = inEvent.dispatchTarget.owner.$;
		line.title.setShowing(false);
		line.titleEdit.setValue(line.title.getContent());
		line.titleEdit.setShowing(true);
		line.titleEdit.focus();
	},

	titleEditEnd: function(inSender, inEvent) {
		var line = inEvent.dispatchTarget.owner.$;
		line.title.setShowing(true);
		line.titleEdit.setShowing(false);
		var newtitle = line.titleEdit.getValue();
		if (newtitle == line.title.getContent()) {
			return;
		}
		var objectId = this.journal[inEvent.index].objectId;

		// Update local journal
		var that = this;
		this.loadEntry(this.journal[inEvent.index], function(err, metadata, text) {
			if (that.journalType == constant.journalLocal) {
				// Update metadata
				metadata.title = newtitle;
				stats.trace(constant.viewNames[app.getView()], 'rename_entry', objectId, 'local');

				// Update datastore
				var ds = new datastore.DatastoreObject(objectId);
				ds.setMetadata(metadata);
				ds.setDataAsText(text);
				ds.save();

				// Refresh screen
				that.loadLocalJournal();

				// Refresh home screen: activity menu, journal content
				preferences.updateEntries();
				app.journal = that.journal;
				app.redraw();
			}

			// Update remote journal
			else {
				// Update metadata
				metadata.title = newtitle;

				// Update remote journal
				var journalId = (that.journalType == constant.journalRemotePrivate ) ? preferences.getPrivateJournal() : preferences.getSharedJournal();
				var dataentry = {metadata: metadata, text: text, objectId: objectId};
				stats.trace(constant.viewNames[app.getView()], 'rename_entry', objectId, journalId);
				myserver.putJournalEntry(journalId, objectId, dataentry,
					function() {
						that.loadRemoteJournal(journalId);
					},
					function() {
						console.log("WARNING: Error updating journal "+journalId);
						that.loadRemoteJournal(journalId);
					}
				);
			}
		});
	},

	// Switch journal
	showLocalJournal: function() {
		this.changeJournalType(constant.journalLocal);
		stats.trace(constant.viewNames[app.getView()], 'show_journal', 'local', null);
		this.loadLocalJournal();
	},

	showPrivateCloud: function() {
		stats.trace(constant.viewNames[app.getView()], 'show_journal', 'private', null);
		this.changeJournalType(constant.journalRemotePrivate);
		this.loadRemoteJournal(preferences.getPrivateJournal());
	},

	showSharedCloud: function() {
		stats.trace(constant.viewNames[app.getView()], 'show_journal', 'shared', null);
		this.changeJournalType(constant.journalRemoteShared);
		this.loadRemoteJournal(preferences.getSharedJournal());
	},

	// Sync local journal with remote journal
	syncJournal: function() {
		var that = this;
		autosync.synchronizeJournal(
			function(count) {
				if (count) {
					humane.log(l10n.get("RetrievingJournal"));
					that.$.syncbutton.setShowing(false);
					that.$.syncgear.setShowing(true);
				}
			},
			function(locale, remote, error) {
				// Display button
				if (!that.$.syncbutton) {
					return;
				}
				that.$.syncbutton.setShowing(true);
				that.$.syncgear.setShowing(false);
				// Locale has changed, update display
				if (locale && that.journalType == constant.journalLocal) {
					that.loadLocalJournal();
					app.journal = that.journal;
					preferences.updateEntries();
					app.draw();
				}
				// Remote has changed, update display
				if (remote && that.journalType == constant.journalRemotePrivate) {
					that.loadRemoteJournal(preferences.getPrivateJournal());
				}
			}
		);
	},

	changeJournalType: function(newType) {
		this.journalType = newType;
		this.$.journalbutton.addRemoveClass('active', newType == constant.journalLocal);
		this.$.cloudonebutton.addRemoveClass('active', newType == constant.journalRemotePrivate);
		this.$.cloudallbutton.addRemoveClass('active', newType == constant.journalRemoteShared);
		this.getToolbar().removeFilter();
		this.getToolbar().setMultiselectToolbarVisibility(false);
		this.$.warningbox.setShowing(false);
	},

	getJournalType: function() {
		return this.journalType;
	}
});





// Class for journal toolbar
enyo.kind({
	name: "Sugar.JournalToolbar",
	kind: enyo.Control,
	components: [
		{name: "unselallbutton", showing: false, kind: "Sugar.Icon", classes: "journal-unselectall", x: 0, y: 0, icon: {directory: "icons", icon: "select-none.svg"}, size: constant.iconSizeList, disabledBackground: "#282828", ontap: "unselectAll"},
		{name: "selallbutton", showing: false, kind: "Sugar.Icon", classes: "journal-selectall", x: 0, y: 0, icon: {directory: "icons", icon: "select-all.svg"}, size: constant.iconSizeList, disabledBackground: "#282828", ontap: "selectAll"},
		{name: "split1", showing: false, classes: "splitbar"},
		{name: "copyjournalbutton", showing: false, kind: "Sugar.Icon", classes: "journal-copy", x: 0, y: 0, icon: {directory: "icons", icon: "copy-journal.svg"}, size: constant.iconSizeList, disabledBackground: "#282828", ontap: "copySelected"},
		{name: "copycloudonebutton", showing: false, kind: "Sugar.Icon", classes: "journal-copy", x: 0, y: 0, icon: {directory: "icons", icon: "copy-cloud-one.svg"}, size: constant.iconSizeList, disabledBackground: "#282828", ontap: "copySelected"},
		{name: "copycloudallbutton", showing: false, kind: "Sugar.Icon", classes: "journal-copy", x: 0, y: 0, icon: {directory: "icons", icon: "copy-cloud-all.svg"}, size: constant.iconSizeList, disabledBackground: "#282828", ontap: "copySelected"},
		{name: "copydevicebutton", showing: false, kind: "Sugar.Icon", classes: "journal-copy", x: 0, y: 0, icon: {directory: "icons", icon: "copy-to-device.svg"}, size: constant.iconSizeList, disabledBackground: "#282828", ontap: "copySelected"},
		{name: "removebutton", showing: false, kind: "Sugar.Icon", classes: "journal-remove", x: 0, y: 0, icon: {directory: "icons", icon: "list-remove.svg"}, size: constant.iconSizeList, disabledBackground: "#282828", ontap: "removeSelected"},
		{name: "split2", showing: false, classes: "splitbar"},
		{name: "selectcount", showing: false, classes: "journal-selectcount"},
		{name: "favoritebutton", kind: "Sugar.Icon", classes: "journal-filter-favorite", x: 0, y: 4, icon: {directory: "icons", icon: "emblem-favorite.svg"}, size: constant.iconSizeList, ontap: "filterFavorite"},
		{name: "journalsearch", kind: "Sugar.SearchField", onTextChanged: "filterEntries", classes: "journal-filter-text"},
		{name: "radialbutton", kind: "Button", classes: "toolbutton view-desktop-button", title:"Home", ontap: "gotoDesktop"},
		{name: "typepalette", kind: "Sugar.Palette", ontap: "showTypePalette", icon: {directory: "icons", icon: "view-type.svg"}, size: constant.iconSizeList, classes: "journal-filtertype-palette", contentsClasses: "journal-filtertype-content", contents: []},
		{name: "datepalette", kind: "Sugar.Palette", ontap: "showDatePalette", icon: {directory: "icons", icon: "view-created.svg"}, size: constant.iconSizeList, classes: "journal-filterdate-palette", contentsClasses: "journal-filterdate-content", contents: []},
		{name: "sortpalette", kind: "Sugar.Palette", ontap: "showSortPalette", icon: {directory: "icons", icon: "view-lastedit.svg"}, size: constant.iconSizeList, classes: "journal-sort-palette", contentsClasses: "journal-sort-content", contents: []},
		{name: "split3", classes: "splitbar journal-split split3"},
		{name: "fromdevicebutton", kind: "Sugar.Icon", x: 0, y: 0, icon: {directory: "icons", icon: "copy-from-device.svg"}, classes: "journal-fromdevice", size: constant.iconSizeList, ontap: "fromDeviceSelected"},
		{name: "split4", classes: "splitbar journal-split split4"},
		{name: "helpbutton", kind: "Button", classes: "toolbutton help-button-journal", title:"Help", ontap: "startTutorial"}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
		this.localize();
		this.typeselected = 0;
		this.dateselected = 0;
		this.sortfield = 0;
		if (util.getClientType() == constant.webAppType || (util.getClientType() == constant.appType && !enyo.platform.android && !enyo.platform.androidChrome && !enyo.platform.ios && !enyo.platform.electron)) {
			this.createComponent({name: "file", kind: "Input", type: "file", showing: false, onchange: "fileSelected"}, {owner: this});
		}
	},

	rendered: function() {
		this.inherited(arguments);
		this.localize();
	},

	localize: function() {
		// Localize items
		this.$.favoritebutton.setNodeProperty("title", l10n.get("FilterFavorites"));
		this.$.radialbutton.setNodeProperty("title", l10n.get("Home"));
		this.$.helpbutton.setNodeProperty("title", l10n.get("Tutorial"));
		this.$.unselallbutton.setNodeProperty("title", l10n.get("UnselectAll"));
		this.$.selallbutton.setNodeProperty("title", l10n.get("SelectAll"));
		this.$.removebutton.setNodeProperty("title", l10n.get("Erase"));
		this.$.copyjournalbutton.setNodeProperty("title", l10n.get("CopyToLocal"));
		this.$.copycloudonebutton.setNodeProperty("title", l10n.get("CopyToPrivate"));
		this.$.copycloudallbutton.setNodeProperty("title", l10n.get("CopyToShared"));
		this.$.copydevicebutton.setNodeProperty("title", l10n.get("CopyToDevice"));
		this.$.journalsearch.setPlaceholder(l10n.get("SearchJournal"));
		this.$.typepalette.setText(l10n.get("AllType"));
		this.$.datepalette.setText(l10n.get("Anytime"));

		// Set time selectbox content
		this.dates = [l10n.get("Anytime"), l10n.get("Today"), l10n.get("SinceYesterday"), l10n.get("PastWeek"), l10n.get("PastMonth")];
		var items = [];
		this.$.datepalette.setHeader(l10n.get("SelectFilter"));
		for(var i = 0 ; i < this.dates.length ; i++) {
			items.push({id: ""+(i+1), classes: "journal-filterdate-line", components:[
				{classes: "journal-filterdate-item", content: this.dates[i]}
			], ontap: "tapDate"});
		}
		this.$.datepalette.setItems(items);

		// Set type selectbox content
		items = [];
		this.$.typepalette.setHeader(l10n.get("SelectFilter"));
		items.push({id: "0", classes: "journal-filtertype-line", components:[
			{kind: "Sugar.Icon", icon: {directory: "icons", icon: "application-x-generic.svg"}, x: 5, y: 3, size: constant.iconSizeFavorite},
			{classes: "item-name", content: l10n.get("AllType")}
		], ontap: "tapLine"});
		var activities = preferences.getActivities();
		var unsortedItems = [];
		for(var i = 0 ; i < activities.length ; i++) {
			unsortedItems.push({id: ""+(i+1), classes: "journal-filtertype-line", components:[
				{kind: "Sugar.Icon", icon: activities[i], x: 5, y: 3, size: constant.iconSizeFavorite},
				{classes: "item-name", content: activities[i].name}
			], ontap: "tapLine"});
		}
		unsortedItems.sort(function(a,b) {
			var ca = a.components[1].content, cb = b.components[1].content;
			if (ca > cb) { return 1; }
			else if (ca < cb) { return -1; }
			else return 0;
		});
		for (var i = 0 ; i < unsortedItems.length ; i++) {
			items.push(unsortedItems[i]);
		}
		this.$.typepalette.setItems(items);

		// Set sort selectbox content
		this.sorts = [{text: l10n.get("SortByUpdated"), icon:"view-lastedit.svg"}, {text: l10n.get("SortByCreated"), icon:"view-created.svg"}, {text: l10n.get("SortBySize"), icon:"view-size.svg"}];
		var items = [];
		this.$.sortpalette.setHeader(l10n.get("SortDisplay"));
		for(var i = 0 ; i < this.sorts.length ; i++) {
			items.push({id: ""+(i+1), classes: "journal-sort-line", components:[
				{kind: "Sugar.Icon", icon: {directory: "icons", icon: this.sorts[i].icon}, x: 5, y: 3, size: constant.iconSizeFavorite},
				{classes: "journal-sort-item", content: this.sorts[i].text}
			], ontap: "tapSort"});
		}
		this.$.sortpalette.setItems(items);
	},

	// Event handling
	gotoDesktop: function() {
		util.vibrate();
		app.showView(constant.radialView);
	},

	filterFavorite: function() {
		this.$.favoritebutton.setColorized(!this.$.favoritebutton.getColorized());
		this.$.favoritebutton.render();
		this.filterEntries();
	},

	showTypePalette: function() {
		this.$.typepalette.switchPalette(app.otherview);
	},

	tapLine: function(e, s) {
		var activities = preferences.getActivities();
		var generic = {directory: "icons", icon: "application-x-generic.svg"};
		this.typeselected = e.getId();
		this.$.typepalette.setIcon((this.typeselected == 0 ? generic : activities[this.typeselected-1]));
		this.$.typepalette.setText((this.typeselected == 0 ? l10n.get("AllType") : activities[this.typeselected-1].name));
		this.filterEntries();
		this.$.typepalette.switchPalette(app.otherview);
	},

	showDatePalette: function() {
		this.$.datepalette.switchPalette(app.otherview);
	},

	tapDate: function(e, s) {
		this.dateselected = e.getId()-1;
		this.$.datepalette.setText(this.dates[this.dateselected]);
		this.filterEntries();
		this.$.datepalette.switchPalette(app.otherview);
	},

	showSortPalette: function() {
		this.$.sortpalette.switchPalette(app.otherview);
	},

	tapSort: function(e, s) {
		this.sortfield = e.getId()-1;
		this.$.sortpalette.setIcon({directory: "icons", icon: this.sorts[this.sortfield].icon});
		this.filterEntries();
		this.$.sortpalette.switchPalette(app.otherview);
	},

	selectAll: function() {
		if (this.$.selallbutton.getDisabled()) {
			return;
		}
		app.otherview.selectAll();
	},

	unselectAll: function() {
		if (this.$.unselallbutton.getDisabled()) {
			return;
		}
		app.otherview.unselectAll();
	},

	setSelectedCount: function(count, total) {
		if (count <= 1) {
			this.$.selectcount.setContent(l10n.get("Selected_one", {count: count, total: total}));
		} else {
			this.$.selectcount.setContent(l10n.get("Selected_other", {count: count, total: total}));
		}
	},

	removeSelected: function() {
		if (this.$.removebutton.getDisabled()) {
			return;
		}
		this.disableMultiselectToolbarVisibility();
		app.otherview.removeSelected();
	},

	copySelected: function(e, s) {
		if (e.getDisabled()) {
			return;
		}
		this.disableMultiselectToolbarVisibility();
		var dest;
		if (e.name == "copydevicebutton") {
			dest = constant.journalDevice;
		} else if (e.name == "copycloudonebutton") {
			dest = constant.journalRemotePrivate;
		} else if (e.name == "copycloudallbutton") {
			dest = constant.journalRemoteShared;
		} else {
			dest = constant.journalLocal;
		}
		app.otherview.copySelected(dest);
	},

	fromDeviceSelected: function() {
		if (util.getClientType() == constant.webAppType || (util.getClientType() == constant.appType && !enyo.platform.android && !enyo.platform.androidChrome && !enyo.platform.ios && !enyo.platform.electron)) {
			this.$.file.setNodeProperty("accept", ".png,.jpg,.wav,.webm,.json,.mp3,.mp4,.pdf,.txt,.docx");
			this.$.file.setNodeProperty("multiple", "true");
			this.$.file.hasNode().click();
		} else {
			util.askFiles(function(file, err, metadata, text) {
				if (err) {
					humane.log(l10n.get("ErrorLoadingFile",{file:file}));
					return;
				}
				metadata.timestamp = new Date().getTime();
				metadata.creation_time = new Date().getTime();
				datastore.create(metadata, function(err) {
					if (err) {
						humane.log(l10n.get("ErrorLoadingFile",{file:file}));
						return;
					}
					app.otherview.loadLocalJournal();
				}, text);
			});
		}
	},

	fileSelected: function() {
		var files = this.$.file.getNodeProperty("files");
		for (var i = 0 ; i < files.length ; i++) {
			util.loadFile(files[i], function(file, err, metadata, text) {
				if (err) {
					humane.log(l10n.get("ErrorLoadingFile",{file:file}));
					return;
				}
				metadata.timestamp = new Date().getTime();
				metadata.creation_time = new Date().getTime();
				datastore.create(metadata, function() {
					app.otherview.loadLocalJournal();
				}, text);
			});
		}
	},

	// Compute filter
	hasFilter: function() {
		return this.$.journalsearch.getText() != ""
			|| this.$.favoritebutton.getColorized()
			|| this.typeselected > 0
			|| this.dateselected > 0;
	},

	getSortType: function() {
		return this.sortfield;
	},

	filterEntries: function() {
		var text = this.$.journalsearch.getText();
		var favorite = this.$.favoritebutton.getColorized() ? true : undefined;
		var selected = this.typeselected;
		var typeselected = (selected <= 0 ? undefined : preferences.getActivities()[selected-1].id);
		selected = this.dateselected;
		var timeselected = (selected <= 0 ? undefined : util.getDateRange(selected).min);
		var filtertext = 'q=' + text;
		if (favorite) filtertext += '&favorite=true';
		if (typeselected) filtertext += '&type=' + typeselected;
		if (timeselected) filtertext += '&time=' + timeselected;
		stats.trace(constant.viewNames[app.getView()], 'search', filtertext, null);
		app.otherview.filterEntries(text, favorite, typeselected, timeselected, undefined, this.sortfield);
	},

	removeFilter: function() {
		this.typeselected = 0;
		this.$.typepalette.setIcon({directory: "icons", icon: "application-x-generic.svg"});
		this.dateselected = 0;
		this.sortfield = 0;
		this.$.sortpalette.setIcon({directory: "icons", icon: "view-lastedit.svg"})
		this.$.favoritebutton.setColorized(false);
		this.$.journalsearch.setText("");
		this.render();
	},

	setMultiselectToolbarVisibility: function(shown) {
		if (this.$.typepalette.isOpen()) {
			this.$.typepalette.switchPalette(app.otherview);
		}
		if (this.$.datepalette.isOpen()) {
			this.$.datepalette.switchPalette(app.otherview);
		}
		if (this.$.sortpalette.isOpen()) {
			this.$.sortpalette.switchPalette(app.otherview);
		}
		var journalType = app.otherview.getJournalType();
		this.$.favoritebutton.setShowing(!shown);
		this.$.journalsearch.setShowing(!shown);
		this.$.radialbutton.setShowing(!shown);
		this.$.typepalette.setShowing(!shown);
		this.$.datepalette.setShowing(!shown);
		this.$.sortpalette.setShowing(!shown);
		this.$.split3.setShowing(!shown && journalType == constant.journalLocal);
		this.$.fromdevicebutton.setShowing(!shown && journalType == constant.journalLocal);
		this.$.split4.setShowing(!shown);
		this.$.helpbutton.setShowing(!shown);

		this.$.unselallbutton.setShowing(shown);
		this.$.selallbutton.setShowing(shown);
		this.$.split1.setShowing(shown);
		this.$.removebutton.setShowing(shown);
		this.$.copyjournalbutton.setShowing(shown && journalType != constant.journalLocal);
		this.$.copycloudonebutton.setShowing(shown && journalType != constant.journalRemotePrivate && preferences.isConnected());
		this.$.copycloudallbutton.setShowing(shown && journalType != constant.journalRemoteShared && preferences.isConnected());
		this.$.copydevicebutton.setShowing(shown);
		this.$.split2.setShowing(shown);
		this.$.selectcount.setShowing(shown);

		this.$.unselallbutton.setDisabled(!shown);
		this.$.selallbutton.setDisabled(!shown);
		this.$.removebutton.setDisabled(!shown);
		this.$.copyjournalbutton.setDisabled(!shown);
		this.$.copycloudonebutton.setDisabled(!shown);
		this.$.copycloudallbutton.setDisabled(!shown);
		this.$.copydevicebutton.setDisabled(!shown);
		this.$.selectcount.addRemoveClass("journal-selectcount-disabled", !shown);
	},

	disableMultiselectToolbarVisibility: function() {
		this.$.unselallbutton.setDisabled(true);
		this.$.selallbutton.setDisabled(true);
		this.$.removebutton.setDisabled(true);
		this.$.copyjournalbutton.setDisabled(true);
		this.$.copycloudonebutton.setDisabled(true);
		this.$.copycloudallbutton.setDisabled(true);
		this.$.copydevicebutton.setDisabled(true);
		this.$.selectcount.addRemoveClass("journal-selectcount-disabled", true);
	},

	startTutorial: function() {
		tutorial.setElement("favoritebutton", this.$.favoritebutton.getAttribute("id"));
		tutorial.setElement("searchtext", this.$.journalsearch.getAttribute("id"));
		tutorial.setElement("typeselect", this.$.typepalette.getAttribute("id"));
		tutorial.setElement("timeselect", this.$.datepalette.getAttribute("id"));
		tutorial.setElement("sortselect", this.$.sortpalette.getAttribute("id"));
		tutorial.setElement("fromdevicebutton", this.$.fromdevicebutton.getAttribute("id"));
		tutorial.setElement("radialbutton", this.$.radialbutton.getAttribute("id"));
		stats.trace(constant.viewNames[app.getView()], 'tutorial', 'start', null);
		tutorial.start();
	}
});
