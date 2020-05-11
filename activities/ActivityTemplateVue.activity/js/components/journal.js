var Journal = {
	props: {
		activity: Object
	},
  methods: {
		loadData: function(callback) {
			this.activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
				if (error == null && data != null) {
					var dataObj = JSON.parse(data);
					callback(dataObj, metadata);
				} else {
					console.log("Error loading from journal");
				}
			});
		},

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