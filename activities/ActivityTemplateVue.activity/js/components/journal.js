var Journal = {
  data: {
		parent: null,
	},
  mounted() {
		this.parent = this.$parent;
    
    let vm = this;
    requirejs(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {
			env.getEnvironment(function (err, environment) {
				
				// Load context
				if (environment.objectId) {
					console.log("Existing instance");
					activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
						if (error == null && data != null) {
							let context = JSON.parse(data);
							vm.parent.pawns = context.pawns;
							vm.parent.drawPawns();
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
    onStop: function () {
			console.log("stopping and saving journal");
			// Save current library in Journal on Stop
			var vm = this;
			requirejs(["sugar-web/activity/activity"], function (activity) {
				console.log("writing...");

				let context = {
					pawns: vm.parent.pawns
				};
				var jsonData = JSON.stringify(context);
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function (error) {
					if (error === null) {
						console.log("write done.");
					} else {
						console.log("write failed.");
					}
				});
			});
    }
  }
}