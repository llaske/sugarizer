var Export = {
	/*html*/
	template: `
		<div></div>
	`,
	props: ['categories', 'user', 'levels', 'notationLevel', 'userColors'],
	data: function() {
		return {
			l10n: {
				stringTitle: '',
				stringDateOfAcquisition: '',
				stringMediaUploaded: '',
				stringCurriculumReportBy: ''
			}
		}
	},
	mounted: function() {
		this.$root.$refs.SugarL10n.localize(this.l10n);
	},
	methods: {
		getUploads: function(categoryId, skillId) {
			var uploads = [];
			var mediaObj = this.user.skills[categoryId][skillId].media;
			for (var key in mediaObj) {
				mediaObj[key].forEach(function (item) {
					item.type = key;
					uploads.push(item);
				});
			}
			uploads.sort(function (a, b) {
				return b.timestamp - a.timestamp;
			});
			return uploads;
		},

		exportCSV: function () {
			// var csvContent = "data:text/csv;charset=utf-8,";
			var csvContent = "";

			// Adding headers
			csvContent += `"${this.l10n.stringTitle}"`;
			var levels = this.levels[this.notationLevel];
			for (var level of levels) {
				csvContent += `,"${level.text}"`;
			}
			csvContent += `,"${this.l10n.stringDateOfAcquisition}"`;
			csvContent += `,"${this.l10n.stringMediaUploaded}"`;
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
				title: `${this.l10n.stringCurriculumReportBy} ${this.$root.currentenv.user.name}.txt`,
				activity: "org.olpcfrance.Curriculum",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			var vm = this;
			this.$root.$refs.SugarJournal.createEntry(csvContent, metadata, function() {
				vm.$root.$refs.SugarPopup.log('Export to CSV complete');
				console.log('Export to CSV complete');
			});
			// this.download(csvContent, "Curriculum Report.csv", "text/csv");
		},

		generatePDF() {
			var doc = new jsPDF();
			var splitTitle;
			var firstPage = true;
			var y = 10, x = 10;
			for(var category of this.categories) {
				if(!firstPage) {
					doc.addPage();
					x = y = 10;
				}
				firstPage = false;
				// Category Title
				doc.setFontStyle("bold");
				splitTitle = doc.splitTextToSize(category.title, 180);
				doc.text(x, y, splitTitle);
				doc.setFontStyle("normal");
				var dim = doc.getTextDimensions(splitTitle);
				//Underline
				doc.setFillColor(category.color);
				doc.rect(0, y+dim.h, 220, 3, 'F');

				y += dim.h + 15;

				doc.setFontSize(12);
				for(var skill of category.skills) {
					// Skill Image
					var img = new Image();
					img.src = skill.image;
					var imgWidth = 50;
					var imgHeight = 30;
					if(img.width != 0) {
						imgHeight = imgWidth*(img.height/img.width);
					}
					if(y+imgHeight > 280) {
						doc.addPage();
						y = 10;
					}
					doc.addImage(img, x, y, imgWidth, imgHeight);

					// Skill Title
					splitTitle = doc.splitTextToSize(category.title, 100);
					doc.text(x + imgWidth + 10, y, splitTitle);
					dim = doc.getTextDimensions(splitTitle);
					// Skill level
					doc.setTextColor(this.user.skills[category.id][skill.id].acquired == 0 ? '#838383' : this.levels[this.notationLevel][this.user.skills[category.id][skill.id].acquired].colors.fill);
					doc.setFontStyle('bold');
					doc.setFontSize(10);
					doc.text(200, y, this.levels[this.notationLevel][this.user.skills[category.id][skill.id].acquired].text, { align: "right" });
					doc.setTextColor('#000000');
					doc.setFontStyle('normal');
					doc.setFontSize(12);
					//Underline
					doc.line(x + imgWidth + 10, y + dim.h, 200, y + dim.h);

					// Media
					var uploads = this.getUploads(category.id, skill.id);
					var maxHeight = 0;
					x = imgWidth + 20;
					for(var upload of uploads) {
						var img = new Image();
						var uploadWidth = 20;
						var uploadHeight = 20;
						if(upload.type == "image") {
							img.src = upload.data;
							uploadWidth = 30;
							if(img.width != 0) {
								uploadHeight = uploadWidth*(img.height/img.width);
							}
						} else if(upload.type == "audio") {
							img.src = "images/audio-preview.jpg";
						} else if(upload.type == "video") {
							img.src = "images/video-preview.jpg";
						}
						
						if(x+uploadWidth > 200) {
							x = imgWidth + 20;
							y += maxHeight+10;

							console.log(y);
							if(y+10 > 280) {
								doc.addPage();
								y = 10;
							}
						} else if(y+uploadHeight+10 > 280) {
							doc.addPage();
							x = imgWidth + 20;
							y = 10;
						}
						maxHeight = Math.max(maxHeight, uploadHeight);

						doc.addImage(img, x, y+10, uploadWidth, uploadHeight);
						x += uploadWidth+10;
					}

					x = 10;
					y += Math.max(imgHeight, dim.h) + 15;
				}
				doc.setFontSize(16);
				// y += 20;
				// if(y > 280) {
				// 	y = 10;
				// 	doc.addPage();
				// }
			}
			doc.save(`${this.l10n.stringCurriculumReportBy} ${this.$root.currentenv.user.name}.pdf`);
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