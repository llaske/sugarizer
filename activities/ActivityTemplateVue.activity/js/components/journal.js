var Journal = {
	data: {
		activity: null
	},
	mounted() {
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {
			vm.activity = activity;
			env.getEnvironment(function (err, environment) {
				if(environment.objectId) {
					console.log("Existing instance");
					vm.activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
						if (error == null && data != null) {
							vm.$emit('journal-data-loaded', JSON.parse(data), metadata);
						} else {
							console.log("Error loading from journal");
						}
					});
				} else {
					console.log("New instance");
				}
			});
		});
	},
  methods: {
		saveData: function(context) {
			var jsonData = JSON.stringify(context);
			this.activity.getDatastoreObject().setDataAsText(jsonData);
			this.activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		},

		insertFromJournal: function(type, callback) {
			var typeParameters = [null, null, null, null];
			if(typeof type != "string") {
				for(var i=0; i<type.length; i++) {
					typeParameters[i] = {};
					typeParameters[i].mimetype = type[i];
				}
			} else {
				typeParameters[0] = { mimetype: type };
			}
			
			requirejs(["sugar-web/datastore", "sugar-web/graphics/journalchooser"], function(datastore, journalchooser) {
				setTimeout(function() {
					journalchooser.show(function(entry) {
						if (!entry) {
							return;
						}
						var dataentry = new datastore.DatastoreObject(entry.objectId);
						dataentry.loadAsText(function(err, metadata, data) {
							if(!err) {
								callback(data, metadata);
							} else {
								console.error(err);
							}
						});
					}, typeParameters[0], typeParameters[1], typeParameters[2], typeParameters[3]);
				}, 0);
			});
		},
  }
}