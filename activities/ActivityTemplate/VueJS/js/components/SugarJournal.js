Vue.component('sugar-journal', {
	data: function () {
		return {
			activity: null,
			LZString: null
		}
	},
	mounted() {
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env", "lz-string"], function (activity, env, LZString) {
			vm.activity = activity;
			vm.LZString = LZString;
			env.getEnvironment(function (err, environment) {
				if (environment.objectId) {
					vm.activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
						if (error == null && data != null) {
							var loadedData = LZString.decompressFromUTF16(data);
							vm.$emit('journal-data-loaded', JSON.parse(loadedData), metadata);
						} else {
							vm.$emit('journal-load-error', error);
						}
					});
				} else {
					vm.$emit('journal-new-instance');
				}
			});
		});
	},
	methods: {
		saveData: function (context) {
			var compressedData = this.LZString.compressToUTF16(JSON.stringify(context));
			this.activity.getDatastoreObject().setDataAsText(compressedData);
			this.activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		},

		turnCompressionOff: function () {
			this.compression = false;
		},

		turnCompressionOn: function () {
			this.compression = true;
		},

		insertFromJournal: function (type, callback) {
			var typeParameters = [null, null, null, null];
			for (var i = 0; i < typeParameters.length; i++) {
				typeParameters[i] = type[i];
			}

			requirejs(["sugar-web/datastore", "sugar-web/graphics/journalchooser"], function (datastore, journalchooser) {
				setTimeout(function () {
					journalchooser.show(function (entry) {
						if (!entry) {
							return;
						}
						var dataentry = new datastore.DatastoreObject(entry.objectId);
						dataentry.loadAsText(function (err, metadata, data) {
							if (!err) {
								callback(data, metadata);
							} else {
								console.error(err);
							}
						});
					}, typeParameters[0], typeParameters[1], typeParameters[2], typeParameters[3]);
				}, 0);
			});
		},

		createEntry: function (data, metadata, callback) {
			requirejs(["sugar-web/datastore"], function (datastore) {
				datastore.create(metadata, callback, data);
			});
		}
	}
});