var DatastoreObject;

define(["sugar-web/bus", "sugar-web/env"], function(bus, env) {

    'use strict';

    var datastore = {};

    if (env.isSugarizer()) {
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
                callback = function() {};
            }
            return callback;
        };


        //- Static Datastore methods

        // Create a new datastore entry
        datastore.create = function(metadata, callback) {
            var callback_c = datastore.callbackChecker(callback);
            var objectId = datastore.createUUID();
            html5storage.setValue(datastorePrefix + objectId, {
                metadata: metadata,
                text: null
            });
            callback_c(null, objectId);
        }

        // Find entries matching an activity_id
        datastore.find = function(activityId) {
            var results = [];
            if (!html5storage.test())
                return results;
            for (var key in localStorage) {
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
        DatastoreObject = function (objectId) {
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
                this.setDataAsText(result.text);
                this.toload = false;
                callback_c(null, result.metadata);
            }
        };

        // Load text
        DatastoreObject.prototype.loadAsText = function(callback) {
            var callback_c = datastore.callbackChecker(callback);
            var result = html5storage.getValue(datastorePrefix + this.objectId);
            if (result != null) {
                this.setMetadata(result.metadata);
                this.setDataAsText(result.text);
                this.toload = false;
                callback_c(null, result.metadata, result.text);
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
        DatastoreObject.prototype.save = function(callback) {
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
            html5storage.setValue(datastorePrefix + this.objectId, {
                metadata: this.newMetadata,
                text: this.newDataAsText
            });
            callback_c(null, this.newMetadata);
        };

        datastore.DatastoreObject = DatastoreObject;
        datastore.localStorage = html5storage;


        // -- HTML5 local storage handling

        // Test if HTML5 storage is available
        html5storage.test = function() {
            return (typeof(Storage) !== "undefined" && typeof(window.localStorage) !== "undefined");
        };

        // Set a value in the storage
        html5storage.setValue = function(key, value) {
            if (this.test()) {
                try {
                    window.localStorage.setItem(key, JSON.stringify(value));
                } catch (err) {}
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

    } else {
        DatastoreObject = function (objectId) {
            this.objectId = objectId;
            this.newMetadata = {};

            this.ensureObjectId = function(callback) {
                var that = this;

                env.getObjectId(function(objectId) {
                    if (objectId !== null && that.objectId === undefined) {
                        that.objectId = objectId;
                    }
                    callback();
                });
            };

            this.blobToText = function(blob, callback) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    callback(e.target.result);
                };
                reader.readAsText(blob);
            };

            this.blobToArrayBuffer = function(blob, callback) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    callback(e.target.result);
                };
                reader.readAsArrayBuffer(blob);
            };

            this.saveText = function(metadata, callback) {
                var that = this;

                function onSaved(error, outputStream) {
                    var blob = new Blob([that.newDataAsText]);

                    that.blobToArrayBuffer(blob, function(buffer) {
                        outputStream.write(buffer);
                        outputStream.close(callback);
                    });
                }

                datastore.save(this.objectId, metadata, onSaved);
            };

            this.applyChanges = function(metadata, callback) {
                for (var key in this.newMetadata) {
                    metadata[key] = this.newMetadata[key];
                }

                if (this.newDataAsText !== undefined) {
                    this.saveText(metadata, callback);
                } else {
                    datastore.setMetadata(this.objectId, metadata, callback);
                }
            };
        }

        DatastoreObject.prototype.getMetadata = function(callback) {
            var that = this;

            this.ensureObjectId(function() {
                datastore.getMetadata(that.objectId, callback);
            });
        };

        DatastoreObject.prototype.loadAsText = function(callback) {
            var that = this;
            var inputStream = null;
            var arrayBuffers = [];
            var metadata = null;

            function onRead(error, data) {
                if (data.byteLength === 0) {
                    var blob = new Blob(arrayBuffers);

                    that.blobToText(blob, function(text) {
                        callback(null, metadata, text);
                    });

                    inputStream.close();

                    return;
                }

                arrayBuffers.push(data);

                inputStream.read(8192, onRead);
            }

            function onLoad(error, loadedMetadata, loadedInputStream) {
                metadata = loadedMetadata;
                inputStream = loadedInputStream;

                inputStream.read(8192, onRead);
            }

            this.ensureObjectId(function() {
                datastore.load(that.objectId, onLoad);
            });
        };

        DatastoreObject.prototype.setMetadata = function(metadata) {
            for (var key in metadata) {
                this.newMetadata[key] = metadata[key];
            }
        };

        DatastoreObject.prototype.setDataAsText = function(text) {
            this.newDataAsText = text;
        };

        DatastoreObject.prototype.save = function(callback) {
            if (callback === undefined) {
                callback = function() {};
            }

            var that = this;

            function onCreated(error, objectId) {
                that.objectId = objectId;
                that.applyChanges({}, callback);
            }

            function onGotMetadata(error, metadata) {
                that.applyChanges(metadata, callback);
            }

            this.ensureObjectId(function() {
                if (that.objectId === undefined) {
                    datastore.create(that.newMetadata, onCreated);
                } else {
                    datastore.getMetadata(that.objectId, onGotMetadata);
                }
            });
        };

        datastore.DatastoreObject = DatastoreObject;


        datastore.setMetadata = function(objectId, metadata, callback) {
            function onResponseReceived(error, result) {
                if (callback) {
                    if (error === null) {
                        callback(null);
                    } else {
                        callback(error);
                    }
                }
            }

            var params = [objectId, metadata];
            bus.sendMessage("datastore.set_metadata", params, onResponseReceived);
        };

        datastore.getMetadata = function(objectId, callback) {
            function onResponseReceived(error, result) {
                if (error === null) {
                    callback(null, result[0]);
                } else {
                    callback(error, null);
                }
            }

            var params = [objectId];
            bus.sendMessage("datastore.get_metadata", params, onResponseReceived);
        };

        datastore.load = function(objectId, callback) {
            var inputStream = bus.createInputStream();

            inputStream.open(function(error) {
                function onResponseReceived(responseError, result) {
                    if (responseError === null) {
                        callback(null, result[0], inputStream);
                    } else {
                        callback(responseError, null, null);
                    }
                }

                var params = [objectId, inputStream.streamId];
                bus.sendMessage("datastore.load", params, onResponseReceived);
            });
        };

        datastore.create = function(metadata, callback) {
            function onResponseReceived(responseError, result) {
                if (responseError === null) {
                    callback(null, result[0]);
                } else {
                    callback(responseError, null);
                }
            }

            var params = [metadata];
            bus.sendMessage("datastore.create", params, onResponseReceived);
        };

        datastore.save = function(objectId, metadata, callback) {
            var outputStream = bus.createOutputStream();

            outputStream.open(function(error) {
                function onResponseReceived(responseError, result) {
                    if (responseError === null) {
                        callback(null, outputStream);
                    } else {
                        callback(responseError, null);
                    }
                }

                var params = [objectId, metadata, outputStream.streamId];
                bus.sendMessage("datastore.save", params, onResponseReceived);
            });
        };
    }

    return datastore;
});
