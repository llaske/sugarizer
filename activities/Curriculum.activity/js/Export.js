var Export = {
	/*html*/
	template: `
		<div></div>
	`,
	props: ['categories', 'user', 'levels', 'notationLevel', 'userColors'],
	data: {},
	methods: {
		exportCSV: function () {
			// var csvContent = "data:text/csv;charset=utf-8,";
			var csvContent = "";

			// Adding headers
			csvContent += `"Title"`;
			var levels = this.levels[this.notationLevel];
			for (var level of levels) {
				csvContent += `,"${level.text}"`;
			}
			csvContent += `,"Date of acquisition"`;
			csvContent += `,"Media Uploaded"`;
			csvContent += `\n`;

			for (var cat of this.categories) {
				// Adding category row
				csvContent += `"${cat.title}"`;
				for (var key in levels) {
					csvContent += `,""`;
				}
				csvContent += `\n`;

				for (var skill of cat.skills) {
					// Adding skill row
					csvContent += `"${skill.title}"`;
					var skillObj = this.user.skills[cat.id][skill.id];
					for (var key in levels) {
						if (key == skillObj.acquired) {
							csvContent += `,"1"`;
						} else {
							csvContent += `,"-"`;
						}
					}
					// Date of aquisition
					if (skillObj.timestamp) {
						csvContent += `,"${new Date(skillObj.timestamp).toLocaleDateString()}"`
					} else {
						csvContent += `,"-"`;
					}
					// Media count
					var count = 0;
					for (var type in skillObj.media) {
						count += skillObj.media[type].length;
					}
					csvContent += `,"${count}"`;
					csvContent += `\n`;
				}
			}

			// var encodedUri = encodeURI(csvContent);
			var metadata = {
				mimetype: 'text/plain',
				title: "Curriculum Report.txt",
				activity: "org.olpcfrance.Curriculum",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			this.$root.$refs.SugarJournal.createEntry(csvContent, metadata, function() {
				console.log('Export to CSV complete');
			});
			// this.download(csvContent, "Curriculum Report.csv", "text/csv");
		},

		download: function (data, filename, type) {
			var file = new Blob([data], { type: type });
			if (window.navigator.msSaveOrOpenBlob) // IE10+
				window.navigator.msSaveOrOpenBlob(file, filename);
			else { // Others
				var a = document.createElement("a"),
					url = URL.createObjectURL(file);
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				setTimeout(function () {
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
				}, 0);
			}
		}
	}
}