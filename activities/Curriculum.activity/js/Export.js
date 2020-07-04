var ImageURL = {
	/*html*/
	template: `
		<img :src="imageURL" v-bind="$attrs">
	`,
	props: ['path', 'colors'],
	data: () => ({
		imageURL: ''
	}),
	created() {
		let vm = this;
		if (this.colors) {
			this.$root.$refs.SugarIcon.generateIconWithColors('../' + this.path, this.colors)
				.then(src => {
					var img = new Image();
					img.src = src;
					img.onload = function () {
						var canvas = document.createElement("canvas");
						canvas.width = img.width;
						canvas.height = img.height;
						canvas.getContext("2d").drawImage(img, 0, 0);
						vm.imageURL = canvas.toDataURL("image/png");
						vm.$emit('loaded');
					}
				});
		} else {
			this.canvasToImage(this.path)
				.then(res => {
					vm.imageURL = res.dataURL;
					vm.$emit('loaded');
				});
		}
	},
	methods: {
		canvasToImage(path) {
			if(path.indexOf('data:image/png') != -1) {
				return Promise.resolve(path);
			}
			return new Promise((resolve, reject) => {
				var img = new Image();
				img.src = path;
				img.onload = () => {
					var canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					canvas.getContext("2d").drawImage(img, 0, 0);
					resolve({
						dataURL: canvas.toDataURL("image/png"),
						width: img.width,
						height: img.height
					});
				}
			});
		},
	}
}

var Export = {
	/*html*/
	template: `
		<div class="doc-container">
			<div id="doc">
				<br><br><br><br><br><br><br><br><br><br><br><br><br>
				<h1 style="text-align: center">{{ templateTitle }}</h1>
				<div style="display: inline-block; width: fit-content; text-align: center; margin: auto">
					<ImageURL 
						path="icons/owner-icon.svg"
						:colors="currentenv.user.colorvalue"
						:style="{ width: '150px' }"
						@loaded="loadedImages++"
					/>
				</div>
				<h1 style="text-align: center">{{ currentenv.user.name }}</h1>
				<br><br><br><br><br><br><br><br><br><br><br><br><br>
				<br><br><br><br><br><br><br><br><br><br><br><br><br>
				
				<div class="stats-container">
					<h1>{{ l10n.stringStatistics }}</h1>
					<table class="stats-table">
						<tr v-for="(level, key) in levels[notationLevel]" :key="key">
							<td style="text-align: right; padding: 5px;	white-space:nowrap;">{{ levels[notationLevel][levels[notationLevel].length-1-key].text }}:</td>
							<td class="bar-container">
								<p style="margin: 0" :style="{ color: levels[notationLevel].length-1-key == 0 ? '#838383' : levels[notationLevel][levels[notationLevel].length-1-key].colors.fill }">
									{{ Math.round(levelWiseAcquired[levels[notationLevel].length-1-key]/totalSkills*100 *100)/100 + '%' }}
								</p>
							</td>
						</tr>
					</table>
					<br><br><br><br>
					<h1>{{ l10n.stringRewards }}</h1>
					<table class="stats-table">
						<tr v-for="(achievement, i) in achievements" :key="i" v-if="user.achievements[achievement.id].timestamp">
							<td style="text-align: right; padding: 5px;	white-space:nowrap;">{{ achievement.title }}:</td>
							<td class="bar-container">
								<p style="margin: 0" :style="{ color: '#838383' }">
									{{ new Date(user.achievements[achievement.id].timestamp).toLocaleDateString() }}
								</p>
							</td>
						</tr>
					</table>
				</div>
				<br><br><br><br><br><br><br><br>

				<div class="doc-categories">
					<div class="doc-category" v-for="category in categories" :key="category.id">
						<br><br><br><br>
						<h1 :style="{ color: category.color, borderBottom: 'solid 10px ' + category.color }">{{ category.title }}</h1>
						<div class="doc-skills">
							<div class="doc-skill" v-for="skill in category.skills" :key="skill.id">
								<ImageURL 
									:path="skill.image"
									style="margin: 10px 0;"
									:style="{ width: '300px' }"
									@loaded="loadedImages++"
								/>
								<h3 style="font-size: 1.5em; margin: 5px 0">{{ skill.title }}</h3>
								<div>
									<span :style="{ color: user.skills[category.id][skill.id].acquired == 0 ? '#838383' : levels[notationLevel][user.skills[category.id][skill.id].acquired].colors.fill, fontWeight: 600 }">
										{{ levels[notationLevel][user.skills[category.id][skill.id].acquired].text }}
									</span>	
									<span style="color: #838383">
										{{ user.skills[category.id][skill.id].timestamp ? ' - ' + new Date(user.skills[category.id][skill.id].timestamp).toLocaleDateString() : '' }}
									</span>
								</div>
								<hr style="border-color: #d3d3d3" />
								<div class="doc-uploads" style="border: solid 1px #d3d3d3">
									<div class="doc-upload" style="display: inline-block; width: fit-content; text-align: center; margin: 10px" v-for="(upload, i) in getUploads(category.id, skill.id)" :key="i">
										<ImageURL 
											:path="getUploadedPath(upload)"
											:style="{ width: '150px' }"
											@loaded="loadedImages++"
										/>
										<p>{{ new Date(upload.timestamp).toLocaleDateString() }}</p>
									</div>
								</div>
								<br><br><br><br>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
	components: {
		'ImageURL': ImageURL
	},
	props: ['categories', 'user', 'levels', 'notationLevel', 'templateTitle', 'currentenv', 'achievements', 'exporting'],
	data: () => ({
		totalImages: 0,
		loadedImages: 0,
		l10n: {
			stringTitle: '',
			stringDateOfAcquisition: '',
			stringMediaUploaded: '',
			stringBy: '',
			stringStatistics: '',
			stringRewards: ''
		}
	}),
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
		},
		imagesLoaded() {
			return this.totalImages == this.loadedImages;
		}
	},
	watch: {
		imagesLoaded: function (newVal, oldVal) {
			if (newVal) {
				switch (this.exporting) {
					case "doc":
						this.generateDOC();
						break;
					case "odt":
						this.generateODT();
						break;
				}
			}
		}
	},
	created() {
		// Buddy icon
		this.totalImages++;
		// Skill and media images
		for (var cat of this.categories) {
			this.totalImages += cat.skills.length;
			for (var skill of cat.skills) {
				for (var type in this.user.skills[cat.id][skill.id].media) {
					this.totalImages += this.user.skills[cat.id][skill.id].media[type].length;
				}
			}
		}
	},
	mounted: function () {
		this.$root.$refs.SugarL10n.localize(this.l10n);
		switch (this.exporting) {
			case 'pdf':
				this.generatePDF();
				break;
			case 'csv':
				this.generateCSV();
				break;
		}
	},
	methods: {
		getUploads: function (categoryId, skillId) {
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

		getUploadedPath(upload) {
			if (upload.type == 'audio') {
				return 'images/audio-preview.jpg';
			} else if (upload.type == 'video') {
				return 'images/video-preview.jpg';
			}
			return upload.data;
		},

		canvasToImage(path) {
			if(path.indexOf('data:image/png') != -1) {
				return Promise.resolve(path);
			}
			return new Promise((resolve, reject) => {
				var img = new Image();
				img.src = path;
				img.onload = () => {
					var canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					canvas.getContext("2d").drawImage(img, 0, 0);
					resolve({
						dataURL: canvas.toDataURL("image/png"),
						width: img.width,
						height: img.height
					});
				}
			});
		},

		generateCSV: function () {
			console.log('Exporting CSV...');
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

			var metadata = {
				mimetype: 'text/plain',
				title: `${this.templateTitle} ${this.l10n.stringBy} ${this.currentenv.user.name}.txt`,
				activity: "org.olpcfrance.Curriculum",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			var vm = this;
			this.$root.$refs.SugarJournal.createEntry(csvContent, metadata)
				.then(() => {
					vm.$root.$refs.SugarPopup.log('Export to CSV complete');
					console.log('Export to CSV complete');
					vm.$emit('export-completed');
				});
		},

		generateODT() {
			console.log('Exporting ODT...');
			var data = document.getElementById("doc");
			var xml = traverse(data);
			var mimetype = 'application/vnd.oasis.opendocument.text';
			var inputData = 'data:application/vnd.oasis.opendocument.text;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(xml)));

			var metadata = {
				mimetype: mimetype,
				title: `${this.templateTitle} ${this.l10n.stringBy} ${this.currentenv.user.name}.odt`,
				activity: "org.olpcfrance.Curriculum",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			var vm = this;
			this.$root.$refs.SugarJournal.createEntry(inputData, metadata)
				.then(() => {
					vm.$root.$refs.SugarPopup.log('Export to ODT complete');
					console.log('Export to ODT complete');
					vm.$emit('export-completed');
				});
		},

		generateDOC() {
			console.log('Exporting DOC...');
			var vm = this;
			this.$nextTick(() => {
				var content = document.getElementById("doc").innerHTML;
				var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
					"xmlns:w='urn:schemas-microsoft-com:office:word' " +
					"xmlns='http://www.w3.org/TR/REC-html40'>" +
					"<head><meta charset='utf-8'></head><body>";
				var footer = "</body></html>";
				var sourceHTML = header + content + footer;
				var inputData = 'data:application/vnd.ms-word;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(sourceHTML)));
				var mimetype = 'application/msword';
				var metadata = {
					mimetype: mimetype,
					title: `${vm.templateTitle} ${vm.l10n.stringBy} ${vm.currentenv.user.name}.doc`,
					activity: "org.olpcfrance.Curriculum",
					timestamp: new Date().getTime(),
					creation_time: new Date().getTime(),
					file_size: 0
				};
				vm.$root.$refs.SugarJournal.createEntry(inputData, metadata)
					.then(() => {
						vm.$root.$refs.SugarPopup.log('Export to DOC complete');
						console.log('Export to DOC complete');
						vm.$emit('export-completed');
					});
			});
		},

		generatePDF() {
			console.log('Exporting PDF...');
			var doc = new jsPDF();
			let vm = this;
			this.addCoverToPDF(doc)
				.then(() => {
					this.addStatsToPDF(doc)
						.then(() => {
							this.addCategoriesToPDF(doc)
								.then(() => {
									// Download the PDF
									// doc.save(`${vm.l10n.stringCurriculumReportBy} ${vm.currentenv.user.name}.pdf`);
									// Create Journal Entry
									var metadata = {
										mimetype: 'application/pdf',
										title: `${vm.templateTitle} ${vm.l10n.stringBy} ${vm.currentenv.user.name}.pdf`,
										activity: "org.olpcfrance.Curriculum",
										timestamp: new Date().getTime(),
										creation_time: new Date().getTime(),
										file_size: 0
									};
									vm.$root.$refs.SugarJournal.createEntry(doc.output('dataurlstring'), metadata)
										.then(() => {
											vm.$root.$refs.SugarPopup.log('Export to PDF complete');
											console.log('Export to PDF complete');
											vm.$emit('export-completed');
										});
								})
						});
				});
		},

		addCoverToPDF(doc) {
			let vm = this;
			return new Promise((resolve, reject) => {
				doc.setFontStyle("bold");
				doc.setFontSize(20);
				doc.text(105, 100, vm.templateTitle, { align: "center" });
				vm.$root.$refs.SugarIcon.generateIconWithColors("../icons/owner-icon.svg", vm.currentenv.user.colorvalue)
					.then(src => {
						vm.canvasToImage(src)
							.then(res => {
								doc.addImage(res.dataURL, 90, 110, 30, 30);
								// Next section
								resolve();
							});
					});
				doc.text(105, 150, vm.currentenv.user.name, { align: "center" });
				doc.setFontSize(16);
				doc.setFontStyle("normal");
			})
		},

		addStatsToPDF(doc) {
			let vm = this;
			return new Promise((resolve, reject) => {
				doc.addPage();
				var x = 10, y = 15;
				// Statistics
				doc.setFontStyle("bold");
				doc.text(x, y, this.l10n.stringStatistics);
				doc.setFontStyle("normal");
				y += 15;

				doc.setFontSize(12);
				var totalWidth = 120;
				for (var level = this.levels[this.notationLevel].length - 1; level >= 0; level--) {
					var percent = Math.round((this.levelWiseAcquired[level] / this.totalSkills * 100) * 100) / 100;
					doc.setTextColor('#000000');
					doc.text(x + 35, y, this.levels[this.notationLevel][level].text, { align: "right" });
					doc.setDrawColor(this.levels[this.notationLevel][level].colors.stroke);
					doc.rect(x + 40, y - 4, totalWidth, 6);
					doc.setFillColor(this.levels[this.notationLevel][level].colors.fill == '#FFFFFF' ? '#838383' : this.levels[this.notationLevel][level].colors.fill);
					doc.setTextColor(this.levels[this.notationLevel][level].colors.fill == '#FFFFFF' ? '#838383' : this.levels[this.notationLevel][level].colors.fill);
					doc.rect(x + 40, y - 4, percent * totalWidth / 100, 6, 'FD');
					doc.text(x + totalWidth + 45, y, percent + '%');
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
				this.$root.$refs.SugarIcon.generateIconWithColors("../icons/trophy-large.svg", this.currentenv.user.colorvalue)
					.then(src => {
						vm.canvasToImage(src)
							.then(async function(res) {
								var trophyIcon = res.dataURL;
								for (var achievement of vm.achievements) {
									if (vm.user.achievements[achievement.id].timestamp != null) {
										doc.addImage(trophyIcon, x, y, 30, 30);
										// Achievement info
										doc.setFontSize(10);
										doc.setTextColor('#ffffff');
										doc.setFontStyle('bold');
										doc.text(x + 15, y + 8, achievement.info.text, { align: "center" });
										doc.setFontStyle('normal');
										doc.setTextColor('#000000');
										doc.setFontSize(12);
										// Trophy center icon
										var res = await vm.canvasToImage(`icons/${achievement.info.icon}`);
										doc.addImage(res.dataURL, x + 13, y + 9, 4, 4);
										// Achievement Title
										var splitTitle = doc.splitTextToSize(achievement.title, 30);
										doc.text(x + 15, y + 40, splitTitle, { align: "center" });
										var dim = doc.getTextDimensions(splitTitle);
										// Achievement Date
										doc.setFontSize(10);
										doc.setTextColor('#838383');
										doc.text(x + 15, y + 42 + dim.h, new Date(vm.user.achievements[achievement.id].timestamp).toLocaleDateString(), { align: "center" });
										doc.setFontSize(12);
										doc.setTextColor('#000000');
										x += 35;
									}
								}
								// Next section
								resolve();
							});
					});
			});
		},

		addCategoriesToPDF(doc) {
			let vm = this;
			return new Promise(async (resolve, reject) => {
				var splitTitle;
				var y = 10, x = 10;
				for (var category of vm.categories) {
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
					doc.rect(0, y + dim.h, 220, 3, 'F');

					y += dim.h + 15;

					doc.setFontSize(12);
					for (var skill of category.skills) {
						// Skill Image
						let res = await vm.canvasToImage(skill.image);
						var imgWidth = 50;
						var imgHeight = 30;
						imgHeight = imgWidth * (res.height / res.width);
						if (y + imgHeight > 280) {
							doc.addPage();
							y = 10;
						}
						doc.addImage(res.dataURL, x, y, imgWidth, imgHeight);

						// Skill Title
						splitTitle = doc.splitTextToSize(skill.title, 100);
						doc.text(x + imgWidth + 10, y, splitTitle);
						dim = doc.getTextDimensions(splitTitle);
						// Skill level
						doc.setTextColor(vm.user.skills[category.id][skill.id].acquired == 0 ? '#838383' : vm.levels[vm.notationLevel][vm.user.skills[category.id][skill.id].acquired].colors.fill);
						doc.setFontStyle('bold');
						doc.setFontSize(10);
						doc.text(200, y, vm.levels[vm.notationLevel][vm.user.skills[category.id][skill.id].acquired].text, { align: "right" });
						doc.setTextColor('#000000');
						doc.setFontStyle('normal');
						doc.setFontSize(12);
						// Skill acquired date
						if (vm.user.skills[category.id][skill.id].timestamp) {
							doc.setFontSize(10);
							doc.setTextColor('#838383');
							doc.text(200, y + dim.h + 5, new Date(vm.user.skills[category.id][skill.id].timestamp).toLocaleDateString(), { align: "right" });
							doc.setFontSize(12);
							doc.setTextColor('#000000');
						}
						// Underline
						doc.line(x + imgWidth + 10, y + dim.h, 200, y + dim.h);

						// Media
						var uploads = vm.getUploads(category.id, skill.id);
						var maxHeight = 0;
						x = imgWidth + 20;
						for (var upload of uploads) {
							var uploadWidth = 20;
							var uploadHeight = 20;
							let res = await vm.canvasToImage(vm.getUploadedPath(upload));
							if (upload.type == "image") {
								uploadWidth = 30;
								uploadHeight = uploadWidth * (res.height / res.width);
							}

							if (x + uploadWidth > 200) {
								x = imgWidth + 20;
								y += maxHeight + 10;
								maxHeight = 0;

								if (y + 10 > 280) {
									doc.addPage();
									y = 10;
								}
							} else if (y + uploadHeight + 10 > 280) {
								doc.addPage();
								x = imgWidth + 20;
								y = 10;
							}
							maxHeight = Math.max(maxHeight, uploadHeight);

							doc.addImage(res.dataURL, x, y + 10, uploadWidth, uploadHeight);
							doc.setFontSize(10);
							doc.setTextColor('#838383');
							doc.text(x + uploadWidth/2, y + uploadHeight + 15, new Date(upload.timestamp).toLocaleDateString(), { align: "center" });
							doc.setFontSize(12);
							doc.setTextColor('#000000');
							x += uploadWidth + 10;
						}

						x = 10;
						y += Math.max(Math.max(imgHeight, dim.h), maxHeight) + 25;   // Max of (Max of Skill Image&Skill title height) & Media height
					}
					doc.setFontSize(16);
				}
				resolve();
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