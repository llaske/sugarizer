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
		}
  }
}