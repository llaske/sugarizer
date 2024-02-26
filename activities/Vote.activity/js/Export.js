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
				:exportingDoc="exporting == 'doc'"
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
			stringUsers: '',
			stringVotes: '',
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

			for (let i = this.history.length - 1; i >= 0; i--) {
				let poll = this.history[i];
				let dateString = new Date(poll.endTime).toLocaleString();
				csvContent += `"${poll.type}"`;
				csvContent += `,"${poll.question}"`;
				csvContent += `,"${this.l10n.stringUsers}"`;
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
						csvContent += `"${this.l10n.stringNo}","${data[0]}"`;
						csvContent += `,"${poll.results.counts.usersCount}"`;
						csvContent += `,"${dateString}"`;
						csvContent += `\n`;
						csvContent += `"${this.l10n.stringYes}","${data[1]}"`;
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
							let separateItems = item.split(',');
							for (let separateItem of separateItems) {
								let modifiedItem = separateItem.trim().toLowerCase();
								if (!counts[modifiedItem]) {
									counts[modifiedItem] = 1;
								} else {
									counts[modifiedItem]++;
								}
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
				title: this.$root.$refs.SugarL10n.get('ExportFileName', { userName: this.currentUser.name }) + '.txt',
				activity: "org.olpcfrance.Vote",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			var vm = this;
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
					var metadata = {
						mimetype: 'application/vnd.oasis.opendocument.text',
						title: this.$root.$refs.SugarL10n.get('ExportFileName', { userName: this.currentUser.name }) + '.odt',
						activity: "org.olpcfrance.Vote",
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
						vm.addHistoryToODT(odt)
							.then(xmlData => {
								xml += xmlData;
								resolve(odt.header + odt.styles + odt.getAutomaticStyles() + odt.automaticStylesEnd + xml + odt.footer);
							});
					});
			});
		},

		addHistoryToODT(odt) {
			let vm = this;
			let xmlData = '';
			return new Promise(async (resolve, reject) => {
				// Add buddy colors to styles list
				let colors = {
					fill: this.currentUser.colorvalue.fill,
					stroke: this.currentUser.colorvalue.stroke
				}
				odt.addBuddyStyles(colors);

				for (let i = vm.history.length - 1; i >= 0; i--) {
					let poll = vm.history[i];
					let pageData = "";
					pageData += odt.addQuestion(poll.question);

					// Chart
					let dataURL = document.querySelector(`#export-${i} #stats`).toDataURL("image/png");
					let chartFrame = odt.addChartFrame(dataURL);

					let legendsFrames = "";
					let avgRatingFrame = "";

					//Average Rating
					if (poll.typeVariable == 'Rating') {
						let avg = 0;
						for (let answer of poll.results.answers) {
							avg += answer;
						}
						avg = Math.round((avg / poll.results.answers.length * 10)) / 10;
						avgRatingFrame = odt.addAvgRatingFrame(avg);
					}

					// Image legends
					if (poll.typeVariable == 'ImageMCQ') {
						let imageWidth = 2.7;  				// in cm for ODT
						for (let j = 0; j < poll.options.length; j++) {
							let res = await vm.canvasToImage(poll.options[j]);
							let imageHeight = imageWidth * (res.height / res.width);
							let color = vm.getLegendColor(i, j);
							let legendObj = {
								text: parseInt(j) + 1,
								color: color.hex,
								imageURL: res.dataURL,
								width: imageWidth,
								height: imageHeight
							}
							legendsFrames += odt.addLegendFrame(legendObj);
						}
					}

					let chartInfoFrame = odt.addToChartInfoFrame(chartFrame + avgRatingFrame + legendsFrames);
					pageData += odt.addToMainContainer(chartInfoFrame);
					pageData = odt.addToPageContainer(pageData);

					let stats = {
						answersCount: poll.results.counts.answersCount,
						usersCount: poll.results.counts.usersCount,
						timestamp: new Date(poll.endTime).toLocaleString()
					}
					pageData += odt.addStatsFrame(stats);

					xmlData += pageData;
				}
				resolve(xmlData);
			});
		},

		generateDOC() {
			console.log('Exporting DOC...');
			var vm = this;
			this.$nextTick(() => {
				var content = "";
				for (let i = this.history.length - 1; i >= 0; i--) {
					content += document.getElementById(`export-${i}`).innerHTML;
				}
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
					title: this.$root.$refs.SugarL10n.get('ExportFileName', { userName: this.currentUser.name }) + '.doc',
					activity: "org.olpcfrance.Vote",
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
					// Create Journal Entry
					var metadata = {
						mimetype: 'application/pdf',
						title: this.$root.$refs.SugarL10n.get('ExportFileName', { userName: this.currentUser.name }) + '.pdf',
						activity: "org.olpcfrance.Vote",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0
					};
					vm.$root.$refs.SugarJournal.createEntry(doc.output('dataurlstring'), metadata)
						.then(() => {
							vm.$root.$refs.SugarPopup.log(this.$root.$refs.SugarL10n.get('ExportTo', { format: 'PDF' }));
							console.log('Export to PDF complete');
							vm.$emit('export-completed');
						});
				})
		},

		addHistoryToPDF(doc) {
			let vm = this;
			return new Promise(async (resolve, reject) => {
				let firstPoll = true;
				var splitTitle;
				var y = 10, x = 10;
				for (let i = vm.history.length - 1; i >= 0; i--) {
					let poll = vm.history[i];
					if (!firstPoll) {
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
					doc.addImage(dataURL, x + 12, y, 168, 120);

					y += 130;

					// Average Rating
					if (poll.typeVariable == "Rating") {
						let avg = 0;
						for (let answer of poll.results.answers) {
							avg += answer;
						}
						avg = Math.round((avg / poll.results.answers.length * 10)) / 10;
						doc.setFontSize(12);
						doc.setFontStyle("normal");
						doc.setTextColor(this.currentUser.colorvalue.stroke);
						splitTitle = doc.splitTextToSize(vm.l10n.stringAvgRating, 180);
						dim = doc.getTextDimensions(splitTitle);
						doc.text(x + 100, y + 15, splitTitle, { align: "center" });
						doc.setFontSize(36);
						doc.setFontStyle("bold");
						doc.setTextColor(this.currentUser.colorvalue.fill);
						splitTitle = doc.splitTextToSize("" + avg, 180);
						doc.text(x + 100, y + 5, splitTitle, { align: "center" });
					}

					// Image MCQs legends
					if (poll.typeVariable == "ImageMCQ") {
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
							} else if (y + imageHeight + 10 > 281) {
								doc.addPage();
								x = 10;
								y = 10;
							}
							maxHeight = Math.max(maxHeight, imageHeight);

							doc.addImage(res.dataURL, x, y + 2, imageWidth, imageHeight);
							doc.setFontSize(10);
							doc.setTextColor('#838383');
							doc.text(x + imageWidth / 4, y, "" + (parseInt(j) + 1), { align: "center" });
							let color = this.getLegendColor(i, j);
							doc.setFillColor(color.r, color.g, color.b);
							doc.rect(x + imageWidth / 4 + 3.5, y - 2.5, 8, 2.5, 'F');
							doc.setFontSize(12);
							doc.setTextColor('#000000');
							x += imageWidth + 10;
						}
					}

					// Stats
					if (y + 40 > 280) {
						doc.addPage();
						y = 30;
					} else {
						y = 280 - 30;
					}
					x = 95;

					doc.setFontSize(12);
					doc.setFontStyle("normal");
					doc.setTextColor(this.currentUser.colorvalue.stroke);
					splitTitle = doc.splitTextToSize(vm.l10n.stringVotes, 180);
					dim = doc.getTextDimensions(splitTitle);
					doc.text(x, y + 10, splitTitle, { align: "center" });
					doc.setFontSize(36);
					doc.setFontStyle("bold");
					doc.setTextColor(this.currentUser.colorvalue.fill);
					splitTitle = doc.splitTextToSize("" + poll.results.counts.answersCount, 180);
					doc.text(x, y, splitTitle, { align: "center" });

					x += dim.w + 15;

					doc.setFontSize(12);
					doc.setFontStyle("normal");
					doc.setTextColor(this.currentUser.colorvalue.stroke);
					splitTitle = doc.splitTextToSize(vm.l10n.stringUsers, 180);
					dim = doc.getTextDimensions(splitTitle);
					doc.text(x, y + 10, splitTitle, { align: "center" });
					doc.setFontSize(36);
					doc.setFontStyle("bold");
					doc.setTextColor(this.currentUser.colorvalue.fill);
					splitTitle = doc.splitTextToSize("" + poll.results.counts.usersCount, 180);
					doc.text(x, y, splitTitle, { align: "center" });
					doc.setFontStyle("normal");

					x = 108;
					y += 25;

					doc.setFontSize(16);
					doc.setTextColor('#1e1e1e');
					splitTitle = doc.splitTextToSize(new Date(poll.endTime).toLocaleString(), 180);
					doc.text(x, y, splitTitle, { align: "center" });
					doc.setFontSize(12);
				}
				resolve();
			});
		},

		rgbToHex(r, g, b) {
			return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		},

		getLegendColor(pollIndex, legendId) {
			let rbgString = this.$refs[`export-${pollIndex}`][0].statsData.datasets[0].hoverBackgroundColor[legendId];
			let result = rbgString.match(/\d+/g);
			return {
				r: parseInt(result[0]),
				g: parseInt(result[1]),
				b: parseInt(result[2]),
				hex: this.rgbToHex(parseInt(result[0]), parseInt(result[1]), parseInt(result[2]))
			}
		},

		// Unused; Only here to download file quickly while debugging
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
