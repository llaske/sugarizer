var Export = {
	/*html*/
	template: `
		<div></div>
	`,
	props: ['categories', 'user', 'levels', 'notationLevel', 'currentenv', 'achievements'],
	data: function() {
		return {
			l10n: {
				stringTitle: '',
				stringDateOfAcquisition: '',
				stringMediaUploaded: '',
				stringCurriculumReportBy: '',
				stringStatistics: '',
				stringRewards: ''
			}
		}
	},
	computed: {
		totalSkills: function () {
			var count = 0;
			this.categories.forEach(function (cat) {
				count += cat.skills.length;
			});
			return count;
		},
		levelWiseAcquired: function () {
			var levelWiseAcquired = {};
			for (var key in this.levels[this.notationLevel]) {
				levelWiseAcquired[key] = 0
			};
			for (var catId in this.user.skills) {
				for (var skillId in this.user.skills[catId]) {
					levelWiseAcquired[this.user.skills[catId][skillId].acquired]++;
				}
			}
			return levelWiseAcquired;
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
				title: `${this.l10n.stringCurriculumReportBy} ${this.currentenv.user.name}.txt`,
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
			
			this.addCoverToPDF(doc);
			// doc.save(`${this.l10n.stringCurriculumReportBy} ${this.currentenv.user.name}.pdf`);
		},
		
		addCoverToPDF(doc) {
			doc.setFontStyle("bold");
			doc.setFontSize(20);
			doc.text(105, 100, this.currentenv.user.name, { align: "center" });
			var vm = this;
			this.$root.$refs.SugarIcon.generateIconWithColors("../icons/owner-icon.svg", this.currentenv.user.colorvalue, function(src) {
				var img = new Image();
				img.src = src;
				img.onload = function() {
					var canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					canvas.getContext("2d").drawImage(img, 0, 0);
					var pngData = canvas.toDataURL("image/png");
					doc.addImage(pngData, 90, 110, 30, 30);
					// Next section
					vm.addStatsToPDF(doc);
				}
				// doc.save(`${vm.l10n.stringCurriculumReportBy} ${vm.currentenv.user.name}.pdf`);
			});			
			doc.setFontSize(16);
			doc.setFontStyle("normal");
		},
		
		addStatsToPDF(doc) {
			doc.addPage();
			var x = 10, y = 15;
			// Statistics
			doc.setFontStyle("bold");
			doc.text(x, y, this.l10n.stringStatistics);		
			doc.setFontStyle("normal");
			y += 15;

			doc.setFontSize(12);
			var totalWidth = 120;
			for(var level in this.levels[this.notationLevel]) {
				var percent = Math.round((this.levelWiseAcquired[level]/this.totalSkills*100)*100)/100;
				doc.setTextColor('#000000');
				doc.text(x+35, y, this.levels[this.notationLevel][level].text, { align: "right" });
				doc.setDrawColor(this.levels[this.notationLevel][level].colors.stroke);
				doc.rect(x+40, y-4, totalWidth, 6);
				doc.setFillColor(this.levels[this.notationLevel][level].colors.fill == '#FFFFFF' ? '#838383' : this.levels[this.notationLevel][level].colors.fill);
				doc.setTextColor(this.levels[this.notationLevel][level].colors.fill == '#FFFFFF' ? '#838383' : this.levels[this.notationLevel][level].colors.fill);
				doc.rect(x+40, y-4, percent*totalWidth/100, 6, 'FD');
				doc.text(x+totalWidth+45, y, percent + '%');
				y += 10;
			}
			y += 10;
			doc.setTextColor('#000000');
			doc.setFontSize(16);

			// Rewards
			doc.setFontStyle("bold");
			doc.text(x, y, this.l10n.stringRewards);		
			doc.setFontStyle("normal");
			y += 10;

			doc.setFontSize(12);
			var vm = this;
			this.$root.$refs.SugarIcon.generateIconWithColors("../icons/trophy-large.svg", this.currentenv.user.colorvalue, function(src) {
				var img = new Image();
				img.src = src;
				img.onload = function() {
					var canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					canvas.getContext("2d").drawImage(img, 0, 0);
					var trophyIcon = canvas.toDataURL("image/png");

					for(var key in vm.user.achievements) {
						if(vm.user.achievements[key].timestamp != null) {
							doc.addImage(trophyIcon, x, y, 30, 30);
							var index = vm.achievements.findIndex(function(a) {
								return a.id == key;
							});
							// Achievement info
							doc.setFontSize(10);
							doc.setTextColor('#ffffff');
							doc.setFontStyle('bold');
							doc.text(x+15, y+8, vm.achievements[index].info.text, { align: "center" });
							doc.setFontStyle('normal');
							doc.setTextColor('#000000');
							doc.setFontSize(12);
							var icon = new Image();
							icon.src = `icons/${vm.achievements[index].info.icon}`;
							canvas.width = icon.width;
							canvas.height = icon.height;
							canvas.getContext("2d").drawImage(icon, 0, 0);
							var iconData = canvas.toDataURL("image/png");
							doc.addImage(iconData, x+13, y+9, 4, 4);
							// Achievement Title
							var splitTitle = doc.splitTextToSize(vm.achievements[index].title, 30);
							doc.text(x+15, y+40, splitTitle, { align: "center" });
							var dim = doc.getTextDimensions(splitTitle);
							// Achievement Date
							doc.setFontSize(10);
							doc.setTextColor('#838383');
							doc.text(x+15, y+42+dim.h, new Date(vm.user.achievements[key].timestamp).toLocaleDateString(), { align: "center" });
							doc.setFontSize(12);
							doc.setTextColor('#000000');
							x += 35;
						}
					}
					// Next section
					vm.addCategoriesToPDF(doc);
				}
			});
		},

		addCategoriesToPDF(doc) {
			var splitTitle;
			var y = 10, x = 10;
			for(var category of this.categories) {
				doc.addPage();
				x = y = 10;
				// Category Title
				doc.setFontSize(16);
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
					splitTitle = doc.splitTextToSize(skill.title, 100);
					doc.text(x + imgWidth + 10, y, splitTitle);
					dim = doc.getTextDimensions(splitTitle);
					// Skill level
					doc.setTextColor(this.user.skills[category.id][skill.id].acquired == 0 ? '#838383' : this.levels[this.notationLevel][this.user.skills[category.id][skill.id].acquired].colors.fill);
					doc.setFontStyle('bold');
					doc.setFontSize(10);
					// if(this.user.skills[category.id][skill.id].acquired > 0) {
					// 	doc.text(200, y+dim.h-2, this.levels[this.notationLevel][this.user.skills[category.id][skill.id].acquired].text, { align: "right" });
					// } else {
						doc.text(200, y, this.levels[this.notationLevel][this.user.skills[category.id][skill.id].acquired].text, { align: "right" });
					// }
					doc.setTextColor('#000000');
					doc.setFontStyle('normal');
					doc.setFontSize(12);
					// Skill acquired date
					if(this.user.skills[category.id][skill.id].timestamp) {
						doc.setFontSize(10);
						doc.setTextColor('#838383');
						doc.text(200, y+dim.h+5, new Date(this.user.skills[category.id][skill.id].timestamp).toLocaleDateString(), { align: "right" });
						doc.setFontSize(12);
						doc.setTextColor('#000000');
					}
					// Underline
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
			}
			// Download the PDF
			// doc.save(`${this.l10n.stringCurriculumReportBy} ${this.currentenv.user.name}.pdf`);
			// Create Journal Entry
			var metadata = {
				mimetype: 'application/pdf',
				title: `${this.l10n.stringCurriculumReportBy} ${this.currentenv.user.name}.pdf`,
				activity: "org.olpcfrance.Curriculum",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			var vm = this;
			this.$root.$refs.SugarJournal.createEntry(doc.output('dataurlstring'), metadata, function() {
				vm.$root.$refs.SugarPopup.log('Export to PDF complete');
				console.log('Export to PDF complete');
			});
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