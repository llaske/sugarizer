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
			if (path.indexOf('data:image/png') != -1) {
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
		<div class="export-container">
			<poll-stats 
				v-for="(poll, i) in history" 
				:key="i"
				:ref="'export-' + i"
				:id="'export-' + i" 
				:activePoll="poll" 
				:current-user="currentUser" 
				isResult 
				isHistory
				@animation-complete="loadedStats++"
			></poll-stats>
		</div>
	`,
	components: {
		'ImageURL': ImageURL,
		'poll-stats': PollStats
	},
	props: ['history', 'currentUser', 'exporting'],
	data: () => ({
		totalStats: 0,
		loadedStats: 0,
		l10n: {
			stringTotalUsers: '',
			stringTotalVotes: '',
			stringDate: '',
			stringYes: '',
			stringNo: '',
			stringAvgRating: '',
		}
	}),
	computed: {
		statsLoaded() {
			return this.totalStats == this.loadedStats;
		}
	},
	watch: {
		statsLoaded: function (newVal, oldVal) {
			if (newVal) {
				switch (this.exporting) {
					case "doc":
						this.generateDOC();
						break;
					case "odt":
						this.generateODT();
						break;
					case "pdf":
						this.generatePDF();
				}
			}
		}
	},
	created() {
		this.totalStats = this.history.length;
	},
	mounted: function () {
		this.$root.$refs.SugarL10n.localize(this.l10n);
		switch (this.exporting) {
			case 'csv':
				this.generateCSV();
				break;
		}
	},
	methods: {
		canvasToImage(path) {
			return new Promise((resolve, reject) => {
				var img = new Image();
				img.src = path;
				img.onload = () => {
					if (path.indexOf('data:image/png') != -1) {
						resolve({
							dataURL: path,
							width: img.width,
							height: img.height,
							canvas: null
						});
						return;
					}
					var canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					canvas.getContext("2d").drawImage(img, 0, 0);
					resolve({
						dataURL: canvas.toDataURL("image/png"),
						width: img.width,
						height: img.height,
						canvas: canvas
					});
				}
			});
		},

		generateCSV: function () {
			console.log('Exporting CSV...');
			var csvContent = "";

			for (let poll of this.history) {
				let dateString = new Date(poll.endTime).toLocaleString();
				csvContent += `"${poll.type}"`;
				csvContent += `,"${poll.question}"`;
				csvContent += `,"${this.l10n.stringTotalUsers}"`;
				csvContent += `,"${this.l10n.stringDate}"`;
				csvContent += `\n`;
				let data;
				switch (poll.typeVariable) {
					case 'YesNo':
						data = new Array(2);
						data.fill(0);
						for (let answer of poll.results.answers) {
							data[answer ? 1 : 0]++;
						}
						csvContent += `"${l10n.stringNo}","${data[0]}"`;
						csvContent += `,"${poll.results.counts.usersCount}"`;
						csvContent += `,"${dateString}"`;
						csvContent += `\n`;
						csvContent += `"${l10n.stringYes}","${data[1]}"`;
						csvContent += `,"${poll.results.counts.usersCount}"`;
						csvContent += `,"${dateString}"`;
						csvContent += `\n`;
						break;
					case 'Rating':
						data = new Array(5);
						data.fill(0);
						for (let answer of poll.results.answers) {
							data[answer - 1]++;
						}
						for (let i = 1; i <= 5; i++) {
							csvContent += `"${i}","${data[i - 1]}"`;
							csvContent += `,"${poll.results.counts.usersCount}"`;
							csvContent += `,"${dateString}"`;
							csvContent += `\n`;
						}
						break;
					case 'Text':
						let counts = {};
						for (let item of poll.results.answers) {
							if (!counts[item]) {
								counts[item] = 1;
							} else {
								counts[item]++;
							}
						}
						for (let key in counts) {
							csvContent += `"${key}","${counts[key]}"`;
							csvContent += `,"${poll.results.counts.usersCount}"`;
							csvContent += `,"${dateString}"`;
							csvContent += `\n`;
						}
						break;
					case 'MCQ':
						data = new Array(poll.options.length);
						data.fill(0);
						for (let answer of poll.results.answers) {
							data[answer]++;
						}
						for (let i in poll.options) {
							csvContent += `"${poll.options[i]}","${data[i]}"`;
							csvContent += `,"${poll.results.counts.usersCount}"`;
							csvContent += `,"${dateString}"`;
							csvContent += `\n`;
						}
						break;
					case 'ImageMCQ':
						data = new Array(poll.options.length);
						data.fill(0);
						for (let answer of poll.results.answers) {
							data[answer]++;
						}
						for (let i in poll.options) {
							csvContent += `"${parseInt(i) + 1}","${data[i]}"`;
							csvContent += `,"${poll.results.counts.usersCount}"`;
							csvContent += `,"${dateString}"`;
							csvContent += `\n`;
						}
						break;
				}
				csvContent += `\n`;
			}

			var metadata = {
				mimetype: 'text/plain',
				title: this.$root.$refs.SugarL10n.get('ExportFileName', { userName: this.currentUser.name }) + '.pdf',
				activity: "org.olpcfrance.Vote",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			var vm = this;
			// this.download(csvContent, "votes.csv", "text/csv");
			this.$root.$refs.SugarJournal.createEntry(csvContent, metadata)
				.then(() => {
					vm.$root.$refs.SugarPopup.log(this.$root.$refs.SugarL10n.get('ExportTo', { format: 'CSV' }));
					console.log('Export to CSV complete');
					vm.$emit('export-completed');
				});
		},

		generateODT() {
			console.log('Exporting ODT...');
			this.constructODT()
				.then(result => {
					var inputData = 'data:application/vnd.oasis.opendocument.text;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(result)));
					// vm.download(result, "test.fodt", "application/vnd.oasis.opendocument.text");
					var metadata = {
						mimetype: 'application/vnd.oasis.opendocument.text',
						title: this.$root.$refs.SugarL10n.get('ExportFileName', { templateTitle: this.templateTitle, userName: this.currentenv.user.name }) + '.odt',
						activity: "org.olpcfrance.Curriculum",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0
					};
					var vm = this;
					this.$root.$refs.SugarJournal.createEntry(inputData, metadata)
						.then(() => {
							vm.$root.$refs.SugarPopup.log(this.$root.$refs.SugarL10n.get('ExportTo', { format: 'ODT' }));
							console.log('Export to ODT complete');
							vm.$emit('export-completed');
						});
				});
		},

		loadODT() {
			return new Promise((resolve, reject) => {
				requirejs(['js/odtHelper.js'], function (odt) {
					resolve(odt);
				});
			})
		},

		constructODT() {
			let vm = this;
			return new Promise((resolve, reject) => {
				vm.loadODT()
					.then(async (odt) => {
						let xml = odt.xml;
						vm.addCoverToODT(odt)
							.then(xmlData => {
								xml += xmlData;
								vm.addStatsToODT(odt)
									.then(xmlData => {
										xml += xmlData;
										vm.addCategoriesToODT(odt)
											.then(xmlData => {
												xml += xmlData;
												resolve(odt.header + odt.styles + odt.getAutomaticStyles() + odt.automaticStylesEnd + xml + odt.footer);
											});
									});
							});
					});
			});
		},

		addCoverToODT(odt) {
			let vm = this;
			let xmlData = '';
			return new Promise((resolve, reject) => {
				vm.$root.$refs.SugarIcon.generateIconWithColors("../icons/owner-icon.svg", vm.currentenv.user.colorvalue)
					.then(src => {
						vm.canvasToImage(src)
							.then(res => {
								xmlData += odt.addCover(vm.templateTitle, res.dataURL, vm.currentenv.user.name)
								resolve(xmlData);
							});
					});
			})
		},

		addStatsToODT(odt) {
			let vm = this;
			let xmlData = '';
			return new Promise((resolve, reject) => {
				// Stats
				odt.addLevelStyles(vm.levels[vm.notationLevel]);
				let levels = [];
				for (let key in vm.levels[vm.notationLevel]) {
					levels.push({
						text: vm.levels[vm.notationLevel][key].text,
						percent: Math.round(vm.levelWiseAcquired[key] / vm.totalSkills * 100 * 100) / 100
					});
				}
				xmlData += odt.addStatsTable(levels);

				//Rewards
				vm.$root.$refs.SugarIcon.generateIconWithColors("../icons/trophy-large.svg", vm.currentenv.user.colorvalue)
					.then(src => {
						vm.canvasToImage(src)
							.then(async function (trophyIcon) {
								let achievementsToAdd = [];
								for (var achievement of vm.achievements) {
									if (vm.user.achievements[achievement.id].timestamp != null) {
										var canvas = document.createElement('canvas');
										canvas.width = trophyIcon.width;
										canvas.height = trophyIcon.height;
										var ctx = canvas.getContext("2d");
										ctx.drawImage(trophyIcon.canvas, 0, 0);

										// Trophy center icon
										var centerIcon = await vm.canvasToImage(`icons/${achievement.info.icon}`);
										ctx.drawImage(centerIcon.canvas, (trophyIcon.width / 2) - 10, trophyIcon.height / 3.5, 20, 20);
										// Achievement Title
										ctx.font = "bold 14px Arial";
										ctx.fillStyle = "white";
										ctx.textAlign = "center";
										ctx.fillText(achievement.info.text, trophyIcon.width / 2, trophyIcon.height / 4);
										let achievementObj = {
											imageURL: canvas.toDataURL("image/png"),
											title: achievement.title,
											time: new Date(vm.user.achievements[achievement.id].timestamp).toLocaleDateString()
										}
										achievementsToAdd.push(achievementObj);
									}
								}
								xmlData += odt.addRewards(achievementsToAdd);
								resolve(xmlData);
							});
					});
			});
		},

		addCategoriesToODT(odt) {
			let vm = this;
			let xmlData = '';
			return new Promise(async (resolve, reject) => {
				for (let category of vm.categories) {
					let catObj = {
						id: category.id,
						title: category.title,
						color: category.color
					}
					xmlData += odt.addCategoryTitle(catObj);

					for (let skill of category.skills) {
						let skillContent = '';
						// SKill image
						let res = await vm.canvasToImage(skill.image);
						let imgWidth = 6.392;
						let imgHeight = imgWidth * (res.height / res.width);
						let imgFrame = odt.addImage(res.dataURL, imgWidth, imgHeight);
						// Skill level
						let levelObj = {
							text: vm.levels[vm.notationLevel][vm.user.skills[category.id][skill.id].acquired].text,
							level: vm.user.skills[category.id][skill.id].acquired
						}
						let skillLevel = odt.addSkillLevel(levelObj);
						// Skill title
						skillContent = skillLevel + imgFrame;
						skillContent = odt.addSkillTitle(skill.title, skillContent);
						// Skill timestamp
						if (vm.user.skills[category.id][skill.id].timestamp) {
							skillContent += odt.addSkillTimestamp(new Date(vm.user.skills[category.id][skill.id].timestamp).toLocaleDateString());
						}

						// Media
						var mediaFrame = '';
						var uploads = vm.getUploads(category.id, skill.id);
						for (var upload of uploads) {
							let res = await vm.canvasToImage(vm.getUploadedPath(upload));
							let uploadWidth = 4.269;
							let uploadHeight = uploadWidth * (res.height / res.width);
							let mediaObj = {
								imageURL: res.dataURL,
								time: new Date(upload.timestamp).toLocaleDateString(),
								width: uploadWidth,
								height: uploadHeight
							}
							mediaFrame += odt.addMediaFrame(mediaObj);
						}
						mediaFrame = odt.addToMediaContainerFrame(mediaFrame);
						skillContent += mediaFrame;
						let skillFrame = odt.addToSkillFrame(skillContent);
						xmlData += skillFrame;
					}
				}
				resolve(xmlData);
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
					title: this.$root.$refs.SugarL10n.get('ExportFileName', { templateTitle: this.templateTitle, userName: this.currentenv.user.name }) + '.doc',
					activity: "org.olpcfrance.Curriculum",
					timestamp: new Date().getTime(),
					creation_time: new Date().getTime(),
					file_size: 0
				};
				vm.$root.$refs.SugarJournal.createEntry(inputData, metadata)
					.then(() => {
						vm.$root.$refs.SugarPopup.log(this.$root.$refs.SugarL10n.get('ExportTo', { format: 'DOC' }));
						console.log('Export to DOC complete');
						vm.$emit('export-completed');
					});
			});
		},

		generatePDF() {
			console.log('Exporting PDF...');
			var doc = new jsPDF();
			let vm = this;
			vm.addHistoryToPDF(doc)
				.then(() => {
					// Download the PDF
					doc.save(`Vote.pdf`);
					// Create Journal Entry
					var metadata = {
						mimetype: 'application/pdf',
						// title: this.$root.$refs.SugarL10n.get('ExportFileName', { templateTitle: this.templateTitle, userName: this.currentenv.user.name }) + '.pdf',
						activity: "org.olpcfrance.Vote",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0
					};
					// vm.$root.$refs.SugarJournal.createEntry(doc.output('dataurlstring'), metadata)
					// 	.then(() => {
					// 		vm.$root.$refs.SugarPopup.log(this.$root.$refs.SugarL10n.get('ExportTo', { format: 'PDF' }));
					// 		console.log('Export to PDF complete');
					// 		vm.$emit('export-completed');
					// 	});
				})
		},

		addCoverToPDF(doc) {
			let vm = this;
			return new Promise((resolve, reject) => {
				doc.setFontStyle("bold");
				doc.setFontSize(20);
				doc.text(105, 100, this.parseString(vm.templateTitle), { align: "center" });
				vm.$root.$refs.SugarIcon.generateIconWithColors("../icons/owner-icon.svg", vm.currentenv.user.colorvalue)
					.then(src => {
						vm.canvasToImage(src)
							.then(res => {
								doc.addImage(res.dataURL, 90, 110, 30, 30);
								// Next section
								resolve();
							});
					});
				doc.text(105, 150, this.parseString(vm.currentenv.user.name), { align: "center" });
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
							.then(async function (res) {
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
										var res2 = await vm.canvasToImage(`icons/${achievement.info.icon}`);
										doc.addImage(res2.dataURL, x + 13, y + 9, 4, 4);
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

		addHistoryToPDF(doc) {
			let vm = this;
			return new Promise(async (resolve, reject) => {
				let firstPoll = true;
				var splitTitle;
				var y = 10, x = 10;
				for (let i in vm.history) {
					let poll = vm.history[i];
					if(!firstPoll) {
						doc.addPage();
					} else {
						firstPoll = false;
					}
					x = y = 10;
					// Poll Question
					splitTitle = doc.splitTextToSize(poll.question, 180);
					var dim = doc.getTextDimensions(splitTitle);
					// Highlight
					doc.setFillColor("#1e1e1e");
					doc.rect(0, 0, 220, 10 + dim.h, 'F');
					doc.setFontSize(16);
					doc.setFontStyle("bold");
					doc.setTextColor(255, 255, 255);
					doc.text(x, y, splitTitle);
					doc.setTextColor(0, 0, 0);
					doc.setFontStyle("normal");
					doc.setFontSize(12);

					y += dim.h + 15;

					let dataURL = document.querySelector(`#export-${i} #stats`).toDataURL("image/png");
					if(poll.typeVariable == "Rating") {
						doc.addImage(dataURL, x+10, y, 120, 120);
						// Average value
						let avg = 0;
						for(let answer of poll.results.answers) {
							avg += answer;
						}
						avg = Math.round((avg / poll.results.answers.length * 10)) / 10;
						doc.setFontSize(12);
						doc.setFontStyle("normal");
						doc.setTextColor(this.currentUser.colorvalue.stroke);
						splitTitle = doc.splitTextToSize(vm.l10n.stringAvgRating, 180);
						dim = doc.getTextDimensions(splitTitle);
						doc.text(x+160, y+10+60, splitTitle, { align: "center" });
						doc.setFontSize(36);
						doc.setFontStyle("bold");
						doc.setTextColor(this.currentUser.colorvalue.fill);
						splitTitle = doc.splitTextToSize("" + avg, 180);
						doc.text(x+160, y+60, splitTitle, { align: "center" });
					} else {
						doc.addImage(dataURL, x + 37, y, 120, 120);
					}

					y += 130;

					// Image MCQs
					if(poll.typeVariable == "ImageMCQ") {
						let maxHeight = 0;
						for (let j in poll.options) {
							let imageWidth = 20;
							let imageHeight = 20;
							let res = await vm.canvasToImage(poll.options[j]);
							imageHeight = imageWidth * (res.height / res.width);

							if (x + imageWidth > 200) {
								x = 10;
								y += maxHeight + 10;
								maxHeight = 0;

								if (y + 10 > 280) {
									doc.addPage();
									y = 10;
								}
							} else if (y + imageHeight + 10 > 280) {
								doc.addPage();
								x = 10;
								y = 10;
							}
							maxHeight = Math.max(maxHeight, imageHeight);

							doc.addImage(res.dataURL, x, y + 2, imageWidth, imageHeight);
							doc.setFontSize(10);
							doc.setTextColor('#838383');
							doc.text(x + imageWidth / 4, y, "" + (parseInt(j)+1), { align: "center" });
							let color = this.getLegendColor(i, j);
							doc.setFillColor(color.r, color.g, color.b);
							doc.rect(x + imageWidth / 4 + 3.5, y - 2.5, 8, 2.5, 'F');
							doc.setFontSize(12);
							doc.setTextColor('#000000');
							x += imageWidth + 10;
							// y += maxHeight + 25;
						}
					}

					// Stats
					if (y + 50 > 280) {
						doc.addPage();
						y = 30;
					} else {
						y += 50;
					}
					x = 90;

					doc.setFontSize(12);
					doc.setFontStyle("normal");
					doc.setTextColor(this.currentUser.colorvalue.stroke);
					splitTitle = doc.splitTextToSize(vm.l10n.stringTotalVotes, 180);
					dim = doc.getTextDimensions(splitTitle);
					doc.text(x, y+10, splitTitle, { align: "center" });
					doc.setFontSize(36);
					doc.setFontStyle("bold");
					doc.setTextColor(this.currentUser.colorvalue.fill);
					splitTitle = doc.splitTextToSize("" + poll.results.counts.answersCount, 180);
					doc.text(x, y, splitTitle, { align: "center" });
					
					x += dim.w + 15;
					
					doc.setFontSize(12);
					doc.setFontStyle("normal");
					doc.setTextColor(this.currentUser.colorvalue.stroke);
					splitTitle = doc.splitTextToSize(vm.l10n.stringTotalUsers, 180);
					dim = doc.getTextDimensions(splitTitle);
					doc.text(x, y+10, splitTitle, { align: "center" });
					doc.setFontSize(36);
					doc.setFontStyle("bold");
					doc.setTextColor(this.currentUser.colorvalue.fill);
					splitTitle = doc.splitTextToSize("" + poll.results.counts.usersCount, 180);
					doc.text(x, y, splitTitle, { align: "center" });
					
					x = 105;
					y += 35;

					// doc.setFontSize(12);
					// doc.setFontStyle("normal");
					// doc.setTextColor(this.currentUser.colorvalue.stroke);
					// splitTitle = doc.splitTextToSize(vm.l10n.stringDate, 180);
					// doc.text(x, y+8, splitTitle, { align: "center" });
					doc.setFontSize(20);
					doc.setFontStyle("bold");
					doc.setTextColor(this.currentUser.colorvalue.fill);
					splitTitle = doc.splitTextToSize(new Date(poll.endTime).toLocaleString(), 180);
					doc.text(x, y, splitTitle, { align: "center" });
					doc.setFontSize(16);
				}
				resolve();
			});
		},

		getLegendColor(pollIndex, legendId) {
			let rbgString = this.$refs[`export-${pollIndex}`][0].statsData.datasets[0].hoverBackgroundColor[legendId];
			let result = rbgString.match(/\d+/g);
			return {
				r: parseInt(result[0]),
				g: parseInt(result[1]),
				b: parseInt(result[2])
			}
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
