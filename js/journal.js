
// Listview view
enyo.kind({
	name: "Sugar.Journal",
	published: { journal: null },
	components: [
		{name: "content", kind: "Scroller", classes: "journal-content", onresize: "draw", components: [
			{name: "empty", classes: "journal-empty", showing: true},
			{name: "message", classes: "journal-message", showing: true},
			{name: "nofilter", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "dialog-cancel.svg"}, classes: "listview-button", ontap: "nofilter", onclick: "clickToTap", showing: false},
			{name: "journalList", classes: "journal-list", kind: "Repeater", onSetupItem: "setupItem", components: [
				{name: "item", classes: "journal-list-item", components: [
					{name: "favorite", kind: "Sugar.Icon", x: 10, y: 14, size: constant.iconSizeFavorite, ontap: "switchFavorite", onclick: "clickToTap"},			
					{name: "activity", kind: "Sugar.Icon", x: 60, y: 5, size: constant.iconSizeList, colorized: true, ontap: "runActivity", onclick: "clickToTap"},
					{name: "title", showing: true, classes: "journal-title", ontap: "titleEditStart", onclick: "clickToTap"},
					{name: "titleEdit", showing: false, kind: "enyo.Input", classes: "journal-title-edit", onblur:"titleEditEnd"},					
					{name: "time", classes: "journal-time"},
					{name: "goright", kind: "Sugar.Icon", classes: "journal-goright", size: constant.iconSizeFavorite, ontap: "runActivity", onclick: "clickToTap"}
				]}
			]},
			{name: "activityPopup", kind: "Sugar.Popup", showing: false}
		]},
		{name: "footer", classes: "journal-footer toolbar", showing: false, components: [
			{name: "journalbutton", kind: "Button", classes: "toolbutton view-localjournal-button active", title:"Journal", ontap: "showLocalJournal", onclick: "clickToTap"},
			{name: "cloudonebutton", kind: "Button", classes: "toolbutton view-cloudone-button", title:"Private", ontap: "showPrivateCloud", onclick: "clickToTap"},
			{name: "cloudallbutton", kind: "Button", classes: "toolbutton view-cloudall-button", title:"Shared", ontap: "showSharedCloud", onclick: "clickToTap"}
		]}
	],
  
	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.toolbar = null;
		this.empty = (this.journal.length == 0);
		this.loadingError = false;
		this.journalType = constant.journalLocal;
		this.smallTime = false;
		this.journalChanged();
		this.$.footer.setShowing(preferences.getNetworkId() != null && preferences.getPrivateJournal() != null && preferences.getSharedJournal() != null);		
		this.draw();
	},

	// Render
	rendered: function() {
		// Colorized list
		this.$.journalList.render();
		
		// Colorizer footer icons
		iconLib.colorize(this.$.journalbutton.hasNode(), preferences.getColor(), function() {});
		iconLib.colorize(this.$.cloudonebutton.hasNode(), preferences.getColor(), function() {});
		iconLib.colorize(this.$.cloudallbutton.hasNode(), preferences.getColor(), function() {});
	},
	
	// Get linked toolbar
	getToolbar: function() {
		if (this.toolbar == null)
			this.toolbar = new Sugar.Journal.Toolbar();
		return this.toolbar;
	},
	
	// Draw screen
	draw: function() {
		// Resize content and set Journal empty in the middle
		var canvas_center = util.getCanvasCenter();	
		var footer_size = this.$.footer.getShowing() ? 55 : 0;   // HACK: 55 is the footer height
		this.smallTime = (canvas_center.dx < 660);
		this.$.content.applyStyle("height", (canvas_center.dy-footer_size)+"px");
		this.$.empty.applyStyle("margin-left", (canvas_center.x-constant.sizeEmpty/4)+"px");
		var margintop = (canvas_center.y-constant.sizeEmpty/4-80);
		this.$.empty.applyStyle("margin-top", margintop+"px");
		this.$.message.setContent(l10n.get("JournalEmpty"));
	},

	updateNetworkBar: function() {
		this.$.footer.setShowing(preferences.getNetworkId() != null && preferences.getPrivateJournal() != null && preferences.getSharedJournal() != null);		
		this.draw();
	},
	
	// Property changed
	journalChanged: function() {
		this.$.empty.show();
		this.$.message.show();	
		this.$.nofilter.show();
		this.empty = (!this.getToolbar().hasFilter() && !this.loadingError && this.journal.length == 0);
		if (this.journal != null && this.journal.length > 0) {
			this.$.journalList.setCount(this.journal.length);
			this.$.empty.hide();
			this.$.message.hide();	
			this.$.nofilter.hide();
		} else {
			this.$.journalList.setCount(0);
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
	},

	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		var entry = this.journal[inEvent.index];
		if (entry.metadata.buddy_color)
			inEvent.item.$.activity.setColorizedColor(entry.metadata.buddy_color);
		inEvent.item.$.activity.setIcon(preferences.getActivity(entry.metadata.activity));
		inEvent.item.$.favorite.setIcon({directory: "icons", icon: "emblem-favorite.svg"});
		var keep = entry.metadata.keep;
		inEvent.item.$.favorite.setColorized(keep !== undefined && keep == 1);		
		inEvent.item.$.title.setContent(entry.metadata.title);	
		inEvent.item.$.time.setContent(util.timestampToElapsedString(entry.metadata.timestamp, 2, this.smallTime));
		inEvent.item.$.goright.setIcon({directory: "icons", icon: "go-right.svg"});
		inEvent.item.$.activity.setPopupShow(enyo.bind(this, "showActivityPopup"));
		inEvent.item.$.activity.setPopupHide(enyo.bind(this, "hideActivityPopup"));
		inEvent.item.$.activity.setData(entry);
	},
	
	// Switch favorite value for clicked line
	switchFavorite: function(inSender, inEvent) {
		var objectId = this.journal[inEvent.index].objectId;
		var keep = this.journal[inEvent.index].metadata.keep;
		if (keep === undefined)
			this.journal[inEvent.index].metadata.keep = 1;
		else
			this.journal[inEvent.index].metadata.keep = (keep + 1) % 2;
		var ds = new datastore.DatastoreObject(objectId);
		ds.setMetadata(this.journal[inEvent.index].metadata);
		ds.setDataAsText(this.journal[inEvent.index].text);
		ds.save();
		inSender.setColorized(this.journal[inEvent.index].metadata.keep == 1);
		this.render();
	},
	
	// Run activity from icon or from the popup menu
	runActivity: function(inSender, inEvent) {
		this.runCurrentActivity(this.journal[inEvent.index]);
	},
	runCurrentActivity: function(activity) {
		// Generic
		var activityInstance = preferences.getActivity(activity.metadata.activity);
		if (activityInstance == preferences.genericActivity)
			return;

		// Remote entry, copy in the local journal first
		if (this.journalType != constant.journalLocal) {
			datastore.create(activity.metadata, function(error, oid) {
				preferences.runActivity(
					activityInstance,
					oid,
					activity.metadata.title);
			}, activity.text);
			return;
		}
		
		// Run local entry
		preferences.runActivity(
			activityInstance,
			activity.objectId,
			activity.metadata.title);
	},
		
	// Filter entries handling
	filterEntries: function(name, favorite, typeactivity, timeperiod) {
		// Filter function
		var that = this;
		var doFilter = function() {
			that.journal = that.journal.filter(function(activity) {
				var range = util.getDateRange(timeperiod);
				return (favorite !== undefined ? activity.metadata.keep : true)
					&& (name.length != 0 ? activity.metadata.title.toLowerCase().indexOf(name.toLowerCase()) != -1 : true)
					&& (timeperiod !== undefined ? activity.metadata.timestamp >= range.min && activity.metadata.timestamp < range.max : true);
			});
			that.journalChanged();
		}
		
		// Filter remote entries
		if (this.journalType != constant.journalLocal) {
			var journalId = (this.journalType == constant.journalRemotePrivate ) ? preferences.getPrivateJournal() : preferences.getSharedJournal();
			var that = this;
			myserver.getJournal(journalId, typeactivity, 
				function(inSender, inResponse) {
					that.journal = inResponse;
					that.empty = (!that.getToolbar().hasFilter() && !this.loadingError && that.journal.length == 0);
					that.loadingError = false;
					doFilter();
				},
				function() {
					console.log("WARNING: Error filtering journal "+journalId);
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
		doFilter();
	},
	
	nofilter: function() {
		toolbar.removeFilter();
		this.filterEntries("", undefined, undefined, undefined);
	},
	
	// Activity popup
	showActivityPopup: function(icon) {
		// Create popup
		var activity = icon.icon; // HACK: activity is stored as an icon	
		var entry = icon.getData();
		this.$.activityPopup.setHeader({
			icon: icon.icon,
			colorized: true,
			colorizedColor: (entry.metadata.buddy_color ? entry.metadata.buddy_color : null),
			name: entry.metadata.title,
			title: ( (entry.metadata.buddy_name && this.journalType != constant.journalLocal) ? l10n.get("ByUser", {user:entry.metadata.buddy_name}): null),
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
			data: [entry, null]
		});
		items.push({
			icon: {directory: "icons", icon: "activity-journal.svg"},
			colorized: false,
			name: l10n.get("CopyToLocal"),
			action: enyo.bind(this, "copyToLocal"),
			data: [entry, null],
			disable: this.journalType == constant.journalLocal
		});		
		items.push({
			icon: {directory: "icons", icon: "cloud-one.svg"},
			colorized: false,
			name: l10n.get("CopyToPrivate"),
			action: enyo.bind(this, "copyToRemote"),
			data: [entry, preferences.getPrivateJournal()],
			disable: this.journalType == constant.journalRemotePrivate
		});
		items.push({
			icon: {directory: "icons", icon: "cloud-all.svg"},
			colorized: false,
			name: l10n.get("CopyToShared"),
			action: enyo.bind(this, "copyToRemote"),
			data: [entry, preferences.getSharedJournal()],
			disable: this.journalType == constant.journalRemoteShared
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
	hideActivityPopup: function() {
		if (this.$.activityPopup.cursorIsInside())
			return false;	
		this.$.activityPopup.hidePopup();
		return true;	
	},
	
	// Copy activity content to the local journal
	copyToLocal: function(entry) {
		datastore.create(entry.metadata, function(error, oid) {
		}, entry.text);
		this.$.activityPopup.hidePopup();
	},
	
	// Copy activity content to a remote journal
	copyToRemote: function(entry, journalId) {
		myserver.postJournalEntry(journalId, entry, 
			function() {},
			function() {
				console.log("WARNING: Error writing journal "+journalId);
			}
		);		
		this.$.activityPopup.hidePopup();
	},
	
	// Load a remote journal
	loadRemoteJournal: function(journalId) {
		var that = this;
		myserver.getJournal(journalId, undefined,
			function(inSender, inResponse) {
				that.journal = inResponse;
				that.empty = (!that.getToolbar().hasFilter() && !this.loadingError && that.journal.length == 0);
				that.loadingError = false;
				that.journalChanged();
			},
			function() {
				console.log("WARNING: Error reading journal "+journalId);
				that.journal = [];
				that.loadingError = true;
				that.journalChanged();
			}
		);
	},
	
	// Remove an entry in the journal
	removeEntry: function(entry) {
		// Remove from local journal
		if (this.journalType == constant.journalLocal) {
			// Delete in datastore
			datastore.remove(entry.objectId);
			
			// Refresh screen
			this.showLocalJournal();
			
			// Refresh home screen: activity menu, journal content
			preferences.updateEntries();
			app.journal = this.journal;
			app.redraw();
		} else {
			// Remove from remote journal
			var journalId = (this.journalType == constant.journalRemotePrivate ) ? preferences.getPrivateJournal() : preferences.getSharedJournal();
			var objectId = entry.objectId;
			var that = this;
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
		inSender.owner.$.title.setShowing(false);
		inSender.owner.$.titleEdit.setValue(inSender.owner.$.title.getContent());
		inSender.owner.$.titleEdit.setShowing(true);
		inSender.owner.$.titleEdit.focus();
	},
	
	titleEditEnd: function(inSender, inEvent) {
		inSender.owner.$.title.setShowing(true);
		inSender.owner.$.titleEdit.setShowing(false);
		var newtitle = inSender.owner.$.titleEdit.getValue();
		if (newtitle == inSender.owner.$.title.getContent())
			return;
		var objectId = this.journal[inEvent.index].objectId;
		
		// Update local journal
		if (this.journalType == constant.journalLocal) {
			// Update metadata
			var metadata = this.journal[inEvent.index].metadata;
			metadata.title = newtitle;
			
			// Update datastore
			var ds = new datastore.DatastoreObject(objectId);
			ds.setMetadata(metadata);
			ds.setDataAsText(this.journal[inEvent.index].text);
			ds.save();
			
			// Refresh screen
			this.showLocalJournal();
			
			// Refresh home screen: activity menu, journal content
			preferences.updateEntries();
			app.journal = this.journal;
			app.redraw();			
		}
		
		// Update remote journal
		else {
			// Update metadata
			var entry = inSender.owner.$.activity.getData();
			entry.metadata.title = newtitle;
			
			// Update remote journal
			var journalId = (this.journalType == constant.journalRemotePrivate ) ? preferences.getPrivateJournal() : preferences.getSharedJournal();
			var that = this;
			myserver.putJournalEntry(journalId, objectId, entry, 
				function() {
					that.loadRemoteJournal(journalId);
				},
				function() {
					console.log("WARNING: Error updating journal "+journalId);
					that.loadRemoteJournal(journalId);
				}
			);
		}
	},
	
	// Switch journal
	showLocalJournal: function() {
		this.changeJournalType(constant.journalLocal);
		this.journal = datastore.find();
		this.journal = this.journal.sort(function(e0, e1) {
			return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp); 
		});		
		this.journalChanged();
	},

	showPrivateCloud: function() {
		this.changeJournalType(constant.journalRemotePrivate);
		this.loadRemoteJournal(preferences.getPrivateJournal());
	},

	showSharedCloud: function() {
		this.changeJournalType(constant.journalRemoteShared);
		this.loadRemoteJournal(preferences.getSharedJournal());		
	},
	
	changeJournalType: function(newType) {
		this.journalType = newType;	
		this.$.journalbutton.addRemoveClass('active', newType == constant.journalLocal);
		this.$.cloudonebutton.addRemoveClass('active', newType == constant.journalRemotePrivate);	
		this.$.cloudallbutton.addRemoveClass('active', newType == constant.journalRemoteShared);	
		this.getToolbar().removeFilter();
	},
	
	clickToTap: function(inSender, inEvent) {
		util.clickToTap(this, inSender, inEvent);
	}	
});





// Class for journal toolbar
enyo.kind({
	name: "Sugar.Journal.Toolbar",
	kind: enyo.Control,
	components: [
		{name: "favoritebutton", kind: "Sugar.Icon", classes: "journal-filter-favorite", x: 0, y: 4, icon: {directory: "icons", icon: "emblem-favorite.svg"}, size: constant.iconSizeList, ontap: "filterFavorite", onclick: "clickToTap"},
		{name: "journalsearch", kind: "Sugar.SearchField", onTextChanged: "filterEntries", classes: "journal-filter-text"},
		{name: "radialbutton", kind: "Button", classes: "toolbutton view-desktop-button", title:"Home", title:"Home", ontap: "gotoDesktop", onclick: "clickToTap"},
		{name: "typeselect", kind: "Sugar.SelectBox", classes: "journal-filter-type", onIndexChanged: "filterEntries"},
		{name: "timeselect", kind: "Sugar.SelectBox", classes: "journal-filter-time", onIndexChanged: "filterEntries"}	
	],
	
	// Constructor
	create: function() {
		// Localize items
		this.inherited(arguments);		
		this.$.journalsearch.setPlaceholder(l10n.get("SearchJournal"));
		
		// Set time selectbox content
		this.$.timeselect.setItems([
			{icon: null, name: l10n.get("Anytime")},
			{icon: null, name: l10n.get("Today")},
			{icon: null, name: l10n.get("SinceYesterday")},
			{icon: null, name: l10n.get("PastWeek")},
			{icon: null, name: l10n.get("PastMonth")},
			{icon: null, name: l10n.get("PastYear")}
		]);
		
		// Set type selectbox content
		var items = [];
		items.push({icon: null, name: l10n.get("Anything")});
		var activities = preferences.getActivities();
		for(var i = 0 ; i < activities.length ; i++)
			items.push({icon: activities[i], name: activities[i].name});
		this.$.typeselect.setItems(items);
	},
	
	rendered: function() {
		this.$.favoritebutton.setNodeProperty("title", l10n.get("FilterFavorites"));
		this.$.radialbutton.setNodeProperty("title", l10n.get("Home"));	
	},

	// Event handling
	gotoDesktop: function() {
		app.showView(constant.radialView);
	},
	
	filterFavorite: function() {
		this.$.favoritebutton.setColorized(!this.$.favoritebutton.getColorized());
		this.$.favoritebutton.render();
		this.filterEntries();
	},
	
	// Compute filter
	hasFilter: function() {
		return this.$.journalsearch.getText() != ""
			|| this.$.favoritebutton.getColorized()
			|| this.$.typeselect.getSelected() > 0
			|| this.$.timeselect.getSelected() > 0;
	},
	
	filterEntries: function() {
		var text = this.$.journalsearch.getText();
		var favorite = this.$.favoritebutton.getColorized() ? true : undefined;
		var selected = this.$.typeselect.getSelected();
		var typeselected = (selected <= 0 ? undefined : preferences.getActivities()[selected-1].id);
		selected = this.$.timeselect.getSelected();
		var timeselected = (selected <= 0 ? undefined : selected);
		app.otherview.filterEntries(text, favorite, typeselected, timeselected);
	},
	
	removeFilter: function() {
		this.$.typeselect.setSelected(0);
		this.$.timeselect.setSelected(0);
		this.$.favoritebutton.setColorized(false);
		this.$.journalsearch.setText("");
		this.render();
	},
	
	clickToTap: function(inSender, inEvent) {
		util.clickToTap(this, inSender, inEvent);
	}	
});
