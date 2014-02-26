

// Sugar datastore
define(["sugar-web/bus", "sugar-web/env"], function (bus, env) {
    var datastore = {};
	var html5storage = {};
	var datastorePrefix = 'sugar_datastore_';
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
            callback = function () {};
        }
		return callback;
	};

	
	//- Static Datastore methods
	
	// Create a new datastore entry
    datastore.create = function (metadata, callback) {
		var callback_c = datastore.callbackChecker(callback);
		var objectId = datastore.createUUID();		
        html5storage.setValue(datastorePrefix+objectId, {metadata: metadata, text: null});
		callback_c(null, objectId);
    }
	
	// Find entries matching an activity_id
	datastore.find = function (activityId) {
		var results = [];
		if (!html5storage.test())
			return results;
		for (var key in localStorage){
			if (key.substr(0, datastorePrefix.length) == datastorePrefix) {
				var entry = html5storage.getValue(key);
				entry.objectId = key.substr(datastorePrefix.length);
				if (activityId === undefined || entry.metadata.activity_id == activityId) {
					results.push(entry);
				}
			}
		}
		
		return results;
	}
	
	//- Instance datastore methods
    function DatastoreObject(objectId) {
        this.objectId = objectId;
        this.newMetadata = {};
		this.newDataAsText = null;
		this.toload = false;
		
		// Init environment from query string values
		if (!initialized) {
			window.top.sugar.environment.activityId = datastore.getUrlParameter("aid");
			window.top.sugar.environment.activityName = datastore.getUrlParameter("n");
			window.top.sugar.environment.bundleId = datastore.getUrlParameter("a");
			window.top.sugar.environment.objectId = datastore.getUrlParameter("o");
			initialized = true;
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
    DatastoreObject.prototype.getMetadata = function (callback) {
		var callback_c = datastore.callbackChecker(callback);	
		var result = html5storage.getValue(datastorePrefix+this.objectId);
		if (result != null) {
			this.setMetadata(result.metadata);
			this.setDataAsText(result.text);
			this.toload = false;
			callback_c(null, result.metadata);
		}		
    };

	// Load text
    DatastoreObject.prototype.loadAsText = function (callback) {
		var callback_c = datastore.callbackChecker(callback);	
		var result = html5storage.getValue(datastorePrefix+this.objectId);
		if (result != null) {
			this.setMetadata(result.metadata);
			this.setDataAsText(result.text);		
			this.toload = false;
			callback_c(null, result.metadata, result.text);
		}	
    };

	// Set metadata
    DatastoreObject.prototype.setMetadata = function (metadata) {
        for (var key in metadata) {
            this.newMetadata[key] = metadata[key];
        }
    };

	// Set text
    DatastoreObject.prototype.setDataAsText = function (text) {
        this.newDataAsText = text;
    };

	// Save data
    DatastoreObject.prototype.save = function (callback) {
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
		this.newMetadata["timestamp"] = new Date().getTime();		
        html5storage.setValue(datastorePrefix+this.objectId, {metadata: this.newMetadata, text: this.newDataAsText});
		callback_c(null, this.newMetadata);
    };

    datastore.DatastoreObject = DatastoreObject;
	datastore.localStorage = html5storage;
	
	
	// -- HTML5 local storage handling

	// Test if HTML5 storage is available
	html5storage.test = function() {
		return (typeof(Storage)!=="undefined" && typeof(window.localStorage)!=="undefined");
	};
	
	// Set a value in the storage
	html5storage.setValue = function(key, value) {	
		if (this.test()) {
			try {
				window.localStorage.setItem(key, JSON.stringify(value));
			} catch(err) {
			}
		}
	};
	
	// Get a value in the storage
	html5storage.getValue = function(key) {
		if (this.test()) {
			try {	
				return JSON.parse(window.localStorage.getItem(key));
			} catch(err) {
				return null;
			}
		}
		return null;
	};
	
    return datastore;
});



