define(["sugar-web/bus", "sugar-web/env"], function(bus, env) {

	'use strict';

	var datastore = {};

	var html5storage = {};
	var html5indexedDB = {};
	var datastorePrefix = 'sugar_datastore_';
	var filestoreName = 'sugar_filestore';
	var initialized = false;

	//- Utility function

	// Get parameter from query string
	datastore.getUrlParameter = function(name) {
		var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
		return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	};

	// Create a uuid
	datastore.createUUID = function() {
		var s = [];
		var hexDigits = "0123456789abcdef";
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4";
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
		s[8] = s[13] = s[18] = s[23] = "-";

		var uuid = s.join("");
		return uuid;
	};

	// Callback checker
	datastore.callbackChecker = function(callback) {
		if (callback === undefined || callback === null) {
			callback = function() {};
		}
		return callback;
	};


	//- Static Datastore methods

	// Create a new datastore entry
	datastore.create = function(metadata, callback, text) {
		var callback_c = datastore.callbackChecker(callback);
		var objectId = datastore.createUUID();
		if (text !== undefined) {
			metadata["textsize"] = text.length;
		}
		var sugar_settings = html5storage.getValue("sugar_settings");
		if (sugar_settings) {
			metadata["buddy_name"] = sugar_settings.name;
			metadata["buddy_color"] = sugar_settings.colorvalue;
		}
		if (html5storage.setValue(datastorePrefix + objectId, {
			metadata: metadata,
			text: (text === undefined) ? null : { link: objectId }
		})) {
			if (text !== undefined) {
				html5indexedDB.setValue(objectId, text, function(err) {
					if (err) {
						callback_c(-1, null);
					} else {
						callback_c(null, objectId);
					}
				});
			} else {
				callback_c(null, objectId);
			}
		} else {
			callback_c(-1, null);
		}
	}

	// Find entries matching an activity type
	datastore.find = function(id) {
		var results = [];
		if (!html5storage.test())
			return results;
		for (var key in html5storage.getAll()) {
			if (key.substr(0, datastorePrefix.length) == datastorePrefix) {
				var entry = html5storage.getValue(key);
				entry.objectId = key.substr(datastorePrefix.length);
				if (id === undefined || entry.metadata.activity == id) {
					results.push(entry);
				}
			}
		}

		return results;
	}

	// Remove an entry in the datastore
	datastore.remove = function(objectId, then) {
		html5storage.removeValue(datastorePrefix + objectId);
		html5indexedDB.removeValue(objectId, then);
	}

	//- Instance datastore methods
	function DatastoreObject(objectId) {
		this.objectId = objectId;
		this.newMetadata = {};
		this.newDataAsText = null;
		this.toload = false;

		// Init environment from query string values
		if (!initialized) {
			env.getEnvironment(function() {
				initialized = true;
			});
		}

		// Init or create objectId if need
		var that = this;
		if (this.objectId === undefined) {
			var env_objectId = window.top.sugar.environment.objectId;
			if (env_objectId != null) {
				this.objectId = env_objectId;
				this.toload = true;
			}
		}
	}

	// Load metadata
	DatastoreObject.prototype.getMetadata = function(callback) {
		var callback_c = datastore.callbackChecker(callback);
		var result = html5storage.getValue(datastorePrefix + this.objectId);
		if (result != null) {
			this.setMetadata(result.metadata);
			this.toload = false;
			callback_c(null, result.metadata);
		}
	};

	// Load text
	DatastoreObject.prototype.loadAsText = function(callback) {
		var callback_c = datastore.callbackChecker(callback);
		var that = this;
		var result = html5storage.getValue(datastorePrefix + that.objectId);
		if (result != null) {
			that.setMetadata(result.metadata);
			var text = null;
			if (result.text) {
				html5indexedDB.getValue(that.objectId, function(err, text) {
					if (err) {
						callback_c(-1, null, null);
					} else {
						that.setDataAsText(text);
						that.toload = false;
						callback_c(null, result.metadata, text);
					}
				});
			} else {
				that.toload = false;
				callback_c(null, result.metadata, text);
			}
		}
	};

	// Set metadata
	DatastoreObject.prototype.setMetadata = function(metadata) {
		for (var key in metadata) {
			this.newMetadata[key] = metadata[key];
		}
	};

	// Set text
	DatastoreObject.prototype.setDataAsText = function(text) {
		this.newDataAsText = text;
	};

	// Save data
	DatastoreObject.prototype.save = function(callback, dontupdatemetadata) {
		if (this.objectId === undefined) {
			var that = this;
			this.newMetadata["timestamp"] = this.newMetadata["creation_time"] = new Date().getTime();
			this.newMetadata["file_size"] = 0;
			datastore.create(this.newMetadata, function(error, oid) {
				if (error == null) {
					that.objectId = oid;
				}
			});
		} else {
			if (this.toload) {
				this.getMetadata(null);
				this.toload = false;
			}
		}
		var callback_c = datastore.callbackChecker(callback);
		if (!dontupdatemetadata) {
			this.newMetadata["timestamp"] = new Date().getTime();
		}
		var sugar_settings = html5storage.getValue("sugar_settings");
		if (sugar_settings && !dontupdatemetadata) {
			this.newMetadata["buddy_name"] = sugar_settings.name;
			this.newMetadata["buddy_color"] = sugar_settings.colorvalue;
		}
		if (this.newDataAsText != null) {
			if (!dontupdatemetadata) {
				this.newMetadata["textsize"] = this.newDataAsText.length;
			};
		}
		var that = this;
		if (html5storage.setValue(datastorePrefix + this.objectId, {
			metadata: this.newMetadata,
			text: (this.newDataAsText === undefined) ? null : { link: this.objectId }
		})) {
			if (this.newDataAsText != null) {
				html5indexedDB.setValue(that.objectId, this.newDataAsText, function(err) {
					if (err) {
						callback_c(-1, null, null);
					} else {
						callback_c(null, that.newMetadata, that.newDataAsText);
					}
				});
			} else {
				callback_c(null, this.newMetadata, this.newDataAsText);
			}
		} else {
			callback_c(-1, null);
		}
	};

	datastore.DatastoreObject = DatastoreObject;

	datastore.localStorage = html5storage;
	datastore.indexedDB = html5indexedDB;


	// -- HTML5 local storage handling

	// Load storage - Need for Chrome App
	html5storage.load = function(then) {
		if (then) {
			then();
		}
	};
	html5storage.load();

	// Test if HTML5 storage is available
	html5storage.test = function() {
		return (typeof(Storage) !== "undefined" && typeof(window.localStorage) !== "undefined");
	};

	// Set a value in the storage
	html5storage.setValue = function(key, value) {
		if (this.test()) {
			try {
				window.localStorage.setItem(key, JSON.stringify(value));
				return true;
			} catch (err) {
				console.log("ERROR: Unable to update local storage");
				return false;
			}
		}
	};

	// Get a value in the storage
	html5storage.getValue = function(key) {
		if (this.test()) {
			try {
				return JSON.parse(window.localStorage.getItem(key));
			} catch (err) {
				return null;
			}
		}
		return null;
	};

	// Remove a value in the storage
	html5storage.removeValue = function(key) {
		if (this.test()) {
			try {
				window.localStorage.removeItem(key);
			} catch (err) {}
		}
	};

	// Get all values
	html5storage.getAll = function() {
		if (this.test()) {
			try {
				return window.localStorage;
			} catch (err) {
				return null;
			}
		}
		return null;
	};


	// -- HTML5 IndexedDB handling

	// Test indexedDB support
	html5indexedDB.test = function() {
		return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	}

	// Load database or create database on first launch
	html5indexedDB.load = function(then) {
		if (!html5indexedDB.test()) {
			if (then) {
				then(-1);
			}
			return;
		}
		html5indexedDB.db = null;
		var request = window.indexedDB.open(filestoreName, 1);
		request.onerror = function(event) {
			if (then) {
				then(request.errorCode);
			}
		};
		request.onsuccess = function(event) {
			html5indexedDB.db = request.result;
			if (then) {
				then(null);
			}
		};
		request.onupgradeneeded = function(event) {
			html5indexedDB.db = event.target.result;
			var objectStore = html5indexedDB.db.createObjectStore(filestoreName, {keyPath: "objectId"});
			objectStore.createIndex("objectId", "objectId", { unique: true });
		};
	}
	html5indexedDB.load();

	// Set a value in the database
	html5indexedDB.setValue = function(key, value, then) {
		var transaction = html5indexedDB.db.transaction([filestoreName], "readwrite");
		var objectStore = transaction.objectStore(filestoreName);
		var request = objectStore.put({objectId: key, text: value});
		request.onerror = function(event) {
			if (then) {
				then(request.errorCode);
			}
		};
		request.onsuccess = function(event) {
			if (then) {
				then(null);
			}
		};
	};

	// Get a value from the database
	html5indexedDB.getValue = function(key, then) {
		var transaction = html5indexedDB.db.transaction([filestoreName], "readonly");
		var objectStore = transaction.objectStore(filestoreName);
		var request = objectStore.get(key);
		request.onerror = function(event) {
			if (then) {
				then(request.errorCode, null);
			}
		};
		request.onsuccess = function(event) {
			if (then) {
				then(null, request.result?request.result.text:undefined);
			}
		};
	};

	// Get all existing keys in the database
	html5indexedDB.getAll = function(then) {
		var transaction = html5indexedDB.db.transaction([filestoreName], "readonly");
		var objectStore = transaction.objectStore(filestoreName);
		var request = objectStore.openCursor();
		var keys = [];
		request.onerror = function(event) {
			if (then) {
				then(request.errorCode, null);
			}
		};
		request.onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
				keys.push(cursor.key);
				cursor.continue();
			} else {
				if (then) {
					then(null, keys);
				}
			}
		};
	};

	// Remove a value from the database
	html5indexedDB.removeValue = function(key, then) {
		var transaction = html5indexedDB.db.transaction([filestoreName], "readwrite");
		var objectStore = transaction.objectStore(filestoreName);
		var request = objectStore.delete(key);
		request.onerror = function(event) {
			if (then) {
				then(request.errorCode);
			}
		};
		request.onsuccess = function(event) {
			if (then) {
				then(null);
			}
		};
	};

	return datastore;
});
