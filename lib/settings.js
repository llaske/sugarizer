

// Settings handling
define(["sugar-web/datastore"], function (datastore) {
	var settings = {};

	// Default value
	settings.init = function() {
		this.name = "<No name>";
		this.color = 22;
		this.colorvalue = null;
		this.activities = [];
		this.view = 0;
		this.language = "en";
		var navigatorLanguage = navigator.language;
		if (navigatorLanguage) {
			if (navigatorLanguage.indexOf("fr") != -1)
				this.language = "fr";
			else if (navigatorLanguage.indexOf("es") != -1)
				this.language = "es";
			else if (navigatorLanguage.indexOf("de") != -1)
				this.language = "de";
			else if (navigatorLanguage.indexOf("ar") != -1)
				this.language = "ar";
			else if (navigatorLanguage.indexOf("ja") != -1)
				this.language = "ja";
			else if (navigatorLanguage.indexOf("pl") != -1)
				this.language = "pl";
			else if (navigatorLanguage.indexOf("pt") != -1)
				this.language = "pt";
		}
		this.options = {stats: true, sync: true};
		this.connected = false;
		this.server = null;
		this.networkId = null;
		this.privateJournal = null;
		this.sharedJournal = null;
		this.genericActivity = {directory: "icons", icon: "application-x-generic.svg"};
		this.token = null;
		this.histoy = null;
	}
	settings.init();

	// Load settings from local storage
	settings.load = function(then) {
		// Load settings
		var that = this;
		datastore.localStorage.load(function() {
			that.history = datastore.localStorage.getValue('sugar_history');
			var preferences = datastore.localStorage.getValue('sugar_settings');
			if (preferences == null || preferences.name === undefined) {
				if (then) {
					then(false);
				}
				return;
			}
			that.name = preferences.name;
			that.color = preferences.color;
			that.colorvalue = preferences.colorvalue;
			that.view = preferences.view;
			if (preferences.language !== undefined) {
				that.language = preferences.language;
			}
			if (preferences.connected !== undefined) {
				that.connected = preferences.connected;
			}
			if (preferences.server !== undefined) {
				that.server = preferences.server;
			}
			if (preferences.networkId !== undefined) {
				that.networkId = preferences.networkId;
			}
			if (preferences.privateJournal !== undefined) {
				that.privateJournal = preferences.privateJournal;
			}
			if (preferences.sharedJournal !== undefined) {
				that.sharedJournal = preferences.sharedJournal;
			}
			if (preferences.token !== undefined) {
				that.token = preferences.token;
			}
			if (preferences.options !== undefined) {
				that.options = preferences.options;
			}

			// Set language
			l10n.language.code = that.language;

			// Load activities
			that.activities = preferences.activities;

			// Load datastore entries for each activity
			that.updateEntries();
			if (then) {
				then(true);
			}
		});
	};

	// Update entries for each activity
	settings.updateEntries = function() {
		var length = this.activities ? this.activities.length : 0;
		for (var i = 0 ; i < length ; i++) {
			var activity = this.activities[i];
			activity.instances = datastore.find(activity.id);
			activity.instances.sort(function(e0, e1) {
				return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp);
			});
		}
	};

	// Save settings to local storage
	settings.save = function() {
		datastore.localStorage.setValue('sugar_settings', {
			name: this.name,
			color: this.color,
			options: this.options,
			colorvalue: xoPalette.colors[this.color],
			activities: this.activities,
			view: app.getView(),
			language: this.language,
			connected: this.connected,
			server: this.server,
			networkId: this.networkId,
			privateJournal: this.privateJournal,
			sharedJournal: this.sharedJournal,
			token: this.token
		});
	};

	// Save settings to the server
	settings.saveToServer = function(remoteserver, then, error) {
		if (this.networkId != null) {
			var that = this;
			remoteserver.putUser(
				this.networkId,
				{
					name: that.name,
					color: xoPalette.colors[that.color],
					language: that.language,
					options: that.options,
					favorites: that.getFavoritesActivitiesName()
				},
				function(inSender, inResponse) {
					if (then) {
						then();
					}
				},
				function(inResponse, inCode) {
					console.log("WARNING: Error updating network user");
					if (error) {
						error(inResponse, inCode);
					}
				}
			);
		}
		else {
			if (then) {
				then();
			}
		}
	};

	// Merge current settings with the one in parameter
	settings.merge = function(preferences) {
		var changed = false;
		if (preferences.name !== undefined && preferences.name != this.name) { this.name = preferences.name; changed = true; }
		if (this.colorvalue == null || preferences.color !== undefined && (preferences.color.fill != this.colorvalue.fill || preferences.color.stroke != this.colorvalue.stroke)) {
			this.colorvalue = preferences.color;
			this.color = util.getColorIndex(this.colorvalue);
			changed = true;
		}
		if (preferences.language !== undefined && preferences.language != this.language) { this.language = preferences.language; changed = true; }
		if (preferences.favorites !== undefined) {
			var favoriteCount = 0;
			for(var i = 0 ; i < this.activities.length ; i++) {
				var wasfavorite = this.activities[i].favorite;
				this.activities[i].favorite = false;
				for (var j = 0 ; j < preferences.favorites.length ; j++) {
					if (preferences.favorites[j] == this.activities[i].id) {
						this.activities[i].favorite = true;
					}
				}
				changed = changed || (wasfavorite != this.activities[i].favorite);
			}
		}
		if (preferences.server !== undefined && preferences.server != this.server) { this.server = preferences.server; changed = true; }
		if (preferences.networkId !== undefined && preferences.networkId != this.networkId) { this.networkId = preferences.networkId; changed = true; }
		if (preferences.private_journal !== undefined && preferences.private_journal != this.privateJournal) { this.privateJournal = preferences.private_journal; }
		if (preferences.shared_journal !== undefined && preferences.shared_journal != this.sharedJournal) { this.sharedJournal = preferences.shared_journal; }
		if (preferences.options !== undefined && this.options !== undefined) {
			for(var prop in preferences.options) {
				if (!this.options.hasOwnProperty(prop) || (this.options[prop] != preferences.options[prop])) {
					this.options[prop] = preferences.options[prop];
					changed = true;
				}
			}
		}
		return changed;
	};

	// Reset settings
	settings.reset = function(full) {
		datastore.localStorage.removeValue('sugar_settings');
		if (full) {
			datastore.localStorage.removeValue('sugar_history');
			datastore.localStorage.removeValue('sugar_stats');
		}
	};

	// Get properties
	settings.getName = function() {
		return this.name;
	};
	settings.getColor = function() {
		return xoPalette.colors[this.color];
	};
	settings.getView = function() {
		return this.view;
	};
	settings.getLanguage = function() {
		return this.language;
	};
	settings.getActivities = function() {
		return this.activities;
	};
	settings.getActivitiesByName = function(name) {
		if (name === undefined || name == null || name.length == 0) {
			return this.activities;
		}
		var activities = this.activities;
		var matching = [];
		for (var i = 0 ; i < activities.length ; i++) {
			if (activities[i].name.toLowerCase().indexOf(name) != -1) {
				matching.push(activities[i]);
			}
		}
		return matching;
	};
	settings.getActivity = function(id) {
		for(var i = 0 ; i < this.activities.length ; i++) {
			if (this.activities[i].id == id) {
				return this.activities[i];
			}
		}
		return this.genericActivity;
	};
	settings.getFavoritesActivities = function() {
		var favorites = [];
		for(var i = 0 ; i < this.activities.length ; i++) {
			if (this.activities[i].favorite) {
				favorites.push(this.activities[i]);
			}
		}
		return favorites;
	};
	settings.getFavoritesActivitiesName = function() {
		var favorites = this.getFavoritesActivities();
		var names = [];
		for(var i = 0 ; i < favorites.length ; i++) {
			names.push(favorites[i].id);
		}
		return names;
	};
	settings.isConnected = function() {
		return this.connected || util.getClientType() == constant.webAppType;
	};
	settings.getServer = function() {
		return this.server;
	};
	settings.getNetworkId = function() {
		var token = this.token;
		if (!token || !token.x_key) {
			return null;
		}
		return token.x_key;
	};
	settings.getPrivateJournal = function() {
		return this.privateJournal;
	};
	settings.getSharedJournal = function() {
		return this.sharedJournal;
	};
	settings.getToken = function() {
		return this.token;
	};
	settings.getHistory = function() {
		return this.history;
	};
	settings.getOptions = function(name) {
		if (!this.options) return undefined;
		return this.options[name];
	}

	// Set properties
	settings.setName = function(newname) {
		this.name = newname;
	};
	settings.setColor = function(newcolor) {
		if (newcolor >= 0 && newcolor < xoPalette.colors.length) {
			this.color = newcolor;
		}
	};
	settings.setLanguage = function(newlanguage) {
		this.language = newlanguage;
	};
	settings.setActivities = function(list) {
		this.activities = [];
		for(var i = 0 ; i < list.length ; i++) {
			if (list[i].isNative && !window.sugarizerOS) {
				continue;
			}
			this.activities.push(list[i]);
		}
	};
	settings.setConnected = function(connected) {
		this.connected = connected;
	};
	settings.setServer = function(server) {
		this.server = server;
	};
	settings.setNetworkId = function(nid) {
		this.networkId = nid;
	};
	settings.setPrivateJournal = function(privateJournal) {
		this.privateJournal = privateJournal;
	};
	settings.setSharedJournal = function(sharedJournal) {
		this.sharedJournal = sharedJournal;
	};
	settings.setToken = function(token) {
		this.token = token;
	};
	settings.setOptions = function(optionName, optionValue) {
		if (!this.options) { this.options = {} }
		this.options[optionName] = optionValue;
	};
	settings.addUserInHistory = function() {
		var user = { name: this.name, color: this.color, server: this.server };
		var history = !this.history ? [] : this.history;
		for (var i = 0 ; i < history.length ; i++) {
			if (this.name.toLowerCase() == history[i].name.toLowerCase() &&
					((this.server == null && history[i].server == null) ||
					(this.server && this.server.url && history[i].server && history[i].server.url && this.server.url == history[i].server.url))
				) {
				history[i] = history[history.length-1];
				history[history.length-1] = user;
				datastore.localStorage.setValue('sugar_history', history)
				return;
			}
		}
		history.push(user);
		if (history.length > constant.maxUserHistory) {
			var newHistory = [];
			for (var i = 0 ; i < history.length-1 ; i++) {
				newHistory.push(history[i+1]);
			}
			history = newHistory;
		}
		datastore.localStorage.setValue('sugar_history', history);
	};

	// Update activities
	settings.updateActivities = function(list) {
		// Some activities updated, update it
		var updated = false;
		var seen = 0;
		for (var i = 0 ; i < list.length ; i++) {
			var found = false;
			for (var j = 0 ; !found && j < this.activities.length ; j++) {
				if (list[i].id == this.activities[j].id) {
					found = true;
					seen++;
					if (this.activities[j].version != list[i].version) {
						this.activities[j].name = list[i].name;
						this.activities[j].version = list[i].version;
						this.activities[j].directory = list[i].directory;
						this.activities[j].icon = list[i].icon;
						updated = true;
					}
				}
			}
			if (!found) {
				this.activities.push(list[i]);
				updated = true;
			}
		}

		// Some activities disappeared, remove it
		if (seen != this.activities.length) {
			updated = true;
			var newactivities = [];
			for (var i = 0 ; i < this.activities.length ; i++) {
				var found = false;
				for (var j = 0 ; !found && j < list.length ; j++) {
					if (this.activities[i].id == list[j].id || this.activities[i].type == "native") {
						found = true;
						newactivities.push(this.activities[i]);
					}
				}
			}
			this.activities = newactivities;
		}
		return updated;
	};

	// Color playing
	settings.nextColor = function() {
		this.color = (this.color+1)%xoPalette.colors.length;
	};

	// Activity handling
	settings.runActivity = function(activity, objectId, name, sharedId, help) {
		if (activity.type != null && activity.type == "native") {
			if (sugarizerOS) {
				sugarizerOS.runActivity(activity.id);
				sugarizerOS.addApplicationToJournal(sugarizerOS.log, activity, datastore);
				return;
			}
			console.log("No sugarizerOS instance found");
		}
		if (activity.activityId == null) {
			activity.activityId = datastore.createUUID();
		}
		this.save();
		var location = activity.directory+"/index.html?aid="+activity.activityId+"&a="+activity.id;
		if (objectId === undefined) {
			if (activity.instances != null && activity.instances.length > 0) {
				objectId = activity.instances[0].objectId;
				location = location + "&o="+objectId + "&n="+activity.instances[0].metadata.title;
			} else {
				location = location + "&n=" +activity.name;
			}
		} else if (objectId != null) {
			location = location + "&o=" + objectId + "&n="+name;
		} else {
			location = location + "&n=" +activity.name;
		}
		if (sharedId) {
			location = location + "&s=" + sharedId;
		}
		if (help) {
			location = location + "&h=1";
		}
		stats.trace(constant.viewNames[app.getView()], (objectId ? 're' : '') + 'launch_activity', activity.id, objectId);
		window.location = location;
	};
	settings.switchFavoriteActivity = function(activity) {
		activity.favorite = !activity.favorite;
		return activity.favorite;
	};
	return settings;
});
