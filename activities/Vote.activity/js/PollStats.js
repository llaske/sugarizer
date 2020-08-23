var FooterItem = {
	/*html*/
	template: `
		<div class="footer-item" :class="{ answered: user.answer != null }">
			<div ref="hand" class="hand" v-show="user.handRaised"></div>
			<div ref="owner" class="owner" v-show="!user.handRaised"></div>
			<p class="username">{{ user.name }}</p>
		</div>
	`,
	props: ['user'],
	mounted() {
		this.$root.$refs.SugarIcon.colorizeIcon(this.$refs.hand, this.user.colorvalue);
		this.$root.$refs.SugarIcon.colorizeIcon(this.$refs.owner, this.user.colorvalue);
	}
}

var ImageURL = {
	/*html*/
	template: `
		<img :src="imageURL" v-bind="$attrs">
	`,
	props: ['path'],
	data: () => ({
		imageURL: ''
	}),
	created() {
		let vm = this;
		this.canvasToImage(this.path)
			.then(res => {
				vm.imageURL = res.dataURL;
				vm.$emit('loaded');
			});
	},
	methods: {
		canvasToImage(path) {
			return new Promise((resolve, reject) => {
				var img = new Image();
				img.src = path;
				img.onload = () => {
					if (path.indexOf('data:image/png') != -1) {
						resolve({
							dataURL: path
						});
						return;
					}
					var canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					canvas.getContext("2d").drawImage(img, 0, 0);
					resolve({
						dataURL: canvas.toDataURL("image/png")
					});
				}
			});
		}
	}
}

var PollStats = {
	/*html*/
	template: `
		<div class="poll-stats" :id="id" :class="{ 'is-result': isResult, 'is-thumbnail': isThumbnail }">
			<div class="poll-header" v-if="!isThumbnail">
				<button id="go-back" @click="goBack" v-if="!isResult && activePollStatus != 'running'"></button>
				<h2>{{ activePoll.question }}</h2>
				<button id="stop-poll" @click="stopPoll" v-if="!isResult && activePollStatus == 'running'"></button>
			</div>
		
			<div class="poll-stats-container">
				<div class="stats-container">
					<p class="wait-text" v-show="activePoll.typeVariable == 'Text' && answers.length == 0  && !isThumbnail">{{ $root.$refs.SugarL10n.get('WaitingVotes') }}</p>
					<canvas 
						id="stats" 
						width="700" 
						height="500" 
						v-show="(exportingDoc && !canvasLoaded) || (!exportingDoc && (activePoll.typeVariable != 'Text' || answers.length != 0))"
					></canvas>
					<ImageURL v-if="exportingDoc && canvasLoaded" :path="canvasURL" @loaded="loadedImages++" />
					<div class="text-popup" v-if="canvasInfoItem && !isThumbnail">{{ canvasInfoItem[0] }}: {{ canvasInfoItem[1] }}</div>
				</div>
				<div class="stats-legends" v-if="!isThumbnail && activePoll.typeVariable == 'ImageMCQ'">
					<div class="legend-item" v-for="(option, i) in activePoll.options" :key="i">
						<div class="color" :style="{ backgroundColor: statsData.datasets[0].backgroundColor[i] }"></div>
						<span>{{ i+1 }}</span>
						<div class="legend-image">
							<ImageURL :path="option" @loaded="loadedImages++" v-if="exportingDoc" />
							<img :src="option" v-else>
						</div>
					</div>
				</div>
				<div class="stats-cards" v-if="!isThumbnail">
					<div 
						class="stats-card" 
						v-if="activePoll.typeVariable == 'Rating' && answers.length > 0" 
						:style="{ border: 'solid 2px ' + currentUser.colorvalue.fill }"
					>
						<p class="number" :style="{ color: currentUser.colorvalue.fill }">{{ averageRating }}</p>
						<h3 class="title" :style="{ color: currentUser.colorvalue.stroke }">{{ l10n.stringAvgRating }}</h3>
					</div>
					<div class="stats-card"  v-if="isResult" :style="{ border: 'solid 2px ' + currentUser.colorvalue.fill }">
						<p class="number" :style="{ color: currentUser.colorvalue.fill }">{{ activePoll.results.counts.answersCount }}</p>
						<h3 class="title" :style="{ color: currentUser.colorvalue.stroke }">{{ l10n.stringVotes }}</h3>
					</div>
					<div class="stats-card"  v-if="isResult" :style="{ border: 'solid 2px ' + currentUser.colorvalue.fill }">
						<p class="number" :style="{ color: currentUser.colorvalue.fill }">{{ activePoll.results.counts.usersCount }}</p>
						<h3 class="title" :style="{ color: currentUser.colorvalue.stroke }">{{ l10n.stringUsers }}</h3>
					</div>
					<p class="date" v-if="isResult && !exportingDoc">{{ $root.$refs.SugarL10n.localizeTimestamp(activePoll.endTime) }}</p>
					<p class="date" v-if="isResult && exportingDoc">{{ new Date(activePoll.endTime).toLocaleString() }}</p>
				</div>
			</div>
			<hr v-if="exportingDoc">
			
			<div class="poll-footer" v-if="!isResult && !isThumbnail">
				<div class="footer-list">
					<div class="vote-progress">{{ answers.length }}/{{ Object.keys(connectedUsers).length }}</div>
					<footer-item
						v-for="user in sortedUsers"
						:key="user.networkId"
						:user="user"
					></footer-item>
				</div>
			</div>
		</div>
	`,
	components: {
		'footer-item': FooterItem,
		'ImageURL': ImageURL
	},
	props: {
		id: {
			type: String,
			default: "stats-poll"
		},
		activePoll: Object,
		activePollStatus: String,
		connectedUsers: Object,
		currentUser: Object,
		isResult: Boolean,
		isThumbnail: Boolean,
		isHistory: Boolean,
		realTimeResults: Boolean,
		autoStop: Boolean,
		exportingDoc: Boolean
	},
	data: () => ({
		statsChart: null,
		statsData: {
			labels: [],
			datasets: [{
				label: 'Votes',
				data: [],
				backgroundColor: [],
				hoverBackgroundColor: []
			}]
		},
		statsOptions: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				datalabels: {
					display: false,
				}
			}
		},
		statsBarOptions: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						precision: 0
					}
				}]
			}
		},
		colorIndex: 0,
		canvasInfoItem: null,
		l10n: {
			stringYes: '',
			stringNo: '',
			stringVotes: '',
			stringUsers: '',
			stringAvgRating: '',
		},

		//Export
		totalImages: 0,
		loadedImages: 0,
		canvasLoaded: false
	}),
	computed: {
		sortedUsers() {
			let users = [];
			for (let key in this.connectedUsers) {
				if (this.connectedUsers[key].answer != null) {
					users.unshift(this.connectedUsers[key]);
				} else {
					users.push(this.connectedUsers[key]);
				}
			}
			return users;
		},
		answers() {
			if (!this.isResult && !this.isThumbnail) {
				let answers = [];
				for (let key in this.connectedUsers) {
					if (this.connectedUsers[key].answer != null) {
						answers.push(this.connectedUsers[key].answer);
					}
				}
				return answers;
			}
			return this.activePoll.results.answers;
		},
		averageRating() {
			let sum = 0;
			for (let answer of this.answers) {
				sum += answer;
			}
			return Math.round((sum / this.answers.length * 10)) / 10;
		},
		imagesLoaded() {
			return this.totalImages == this.loadedImages;
		},
		canvasURL() {
			return document.querySelector(`#${this.id} #stats`).toDataURL("image/png");
		}
	},
	watch: {
		answers: function (newVal, oldVal) {
			this.updateChart();

			if (this.isResult || this.isThumbnail) return;

			this.updateCounts();
			if (this.autoStop && this.answers.length == Object.keys(this.connectedUsers).length) {
				this.stopPoll();
			}
			if (this.realTimeResults) {
				this.$emit('update-results', this.answers);
			}
		},

		realTimeResults: function (newVal, oldVal) {
			if (newVal) {
				this.$emit('update-results', this.answers);
			}
		},

		connectedUsers: function (newVal, oldVal) {
			if (this.isResult || this.isThumbnail) return;
			this.updateCounts();
		},

		imagesLoaded: function (newVal, oldVal) {
			if(newVal) {
				this.$emit('animation-complete');
			}
		}
	},
	created() {
		this.totalImages = 1;
		if(this.activePoll.typeVariable == 'ImageMCQ') {
			this.totalImages += this.activePoll.options.length;
		}
		this.statsOptions.legend = {
			display: !this.isThumbnail
		}
		this.statsOptions.animation = {
			onComplete: () => {
				if(!this.exportingDoc) {
					this.$emit('animation-complete')
				} else {
					this.canvasLoaded = true;
				}
			}
		}
	},
	mounted() {
		this.$root.$refs.SugarL10n.localize(this.l10n);
		let vm = this;
		let ctx = document.querySelector(`#${this.id} #stats`);
		let labels = [];
		let dataset = {
			label: 'Votes',
			data: [],
			backgroundColor: [],
			hoverBackgroundColor: []
		}
		let color;

		switch (this.activePoll.typeVariable) {
			case "Text":
				// let words = ["Hello", "Hi", "Hey", "Hi", "Hey", "Hello", "Hello", "Hello", "Hello", "Hi", "Hi"]
				let list = this.getWordsList(this.answers);
				WordCloud(ctx, {
					list: list,
					weightFactor: 40 - this.answers.length,
					shrinkToFit: true,
					hover: this.showWordCount
				});
				let drawn = 0;
				ctx.addEventListener('wordclouddrawn', () => {
					drawn++;
					if(drawn == list.length) {
						if(!this.exportingDoc) {
							this.$emit('animation-complete')
						} else {
							this.canvasLoaded = true;
						}
					}
				})
				break;
			case "MCQ":
				for (let option of this.activePoll.options) {
					labels.push(option);
					dataset.data.push(0);
					color = this.getColor();
					dataset.backgroundColor.push(color.background);
					dataset.hoverBackgroundColor.push(color.hover);
				}
				this.$set(this.statsData, 'labels', labels);
				this.$set(this.statsData.datasets, 0, dataset);

				this.statsChart = new Chart(ctx, {
					type: 'pie',
					data: this.statsData,
					options: {
						...this.statsOptions,
						plugins: {
							datalabels: {
								formatter: (value, ctx) => {
									if(value == 0) {
										return "";
									} else {
										let datasets = ctx.chart.data.datasets;
										let sum = datasets[0].data.reduce((a, b) => a + b, 0);
										let percentage = Math.round((value / sum) * 100) + '%';
										return percentage;
									}
								},
								color: '#000000',
								font: {
									size: this.isThumbnail ? '12' : '16',
									weight: this.isThumbnail ? 'normal' : 'bold'
								}
							}
						}
					}
				});
				break;
			case "ImageMCQ":
				for (let i in this.activePoll.options) {
					labels.push(parseInt(i) + 1);
					dataset.data.push(0);
					color = this.getColor();
					dataset.backgroundColor.push(color.background);
					dataset.hoverBackgroundColor.push(color.hover);
				}
				this.$set(this.statsData, 'labels', labels);
				this.$set(this.statsData.datasets, 0, dataset);

				this.statsChart = new Chart(ctx, {
					type: 'bar',
					data: this.statsData,
					options: {
						...this.statsOptions,
						...this.statsBarOptions,
						legend: { display: false },
					}
				});
				break;
			case "Rating":
				for (let i = 1; i <= 5; i++) {
					labels.push(i);
					dataset.data.push(0);
					color = this.getColor();
					dataset.backgroundColor.push(color.background);
					dataset.hoverBackgroundColor.push(color.hover);
				}
				this.$set(this.statsData, 'labels', labels);
				this.$set(this.statsData.datasets, 0, dataset);

				this.statsChart = new Chart(ctx, {
					type: 'bar',
					data: this.statsData,
					options: {
						...this.statsOptions,
						...this.statsBarOptions,
						legend: {
							display: !this.isThumbnail,
							labels: {
								generateLabels: (chart) => {
									return chart.data.labels.map((label, i) => {
										let meta = chart.getDatasetMeta(0);
										let fill = chart.data.datasets[0].backgroundColor[i]
										return {
											text: label,
											fillStyle: fill,
											strokeStyle: '#000000',
											lineWidth: 0,
											hidden: isNaN(chart.data.datasets[0].data[i]) || meta.data[i].hidden,
											index: i
										};
									})
								}
							}
						}
					}
				});
				break;
			case "YesNo":
				labels.push(this.l10n.stringNo);
				dataset.data.push(0);
				color = this.getColor();
				dataset.backgroundColor.push(color.background);
				dataset.hoverBackgroundColor.push(color.hover);

				labels.push(this.l10n.stringYes);
				dataset.data.push(0);
				color = this.getColor();
				dataset.backgroundColor.push(color.background);
				dataset.hoverBackgroundColor.push(color.hover);

				this.$set(this.statsData, 'labels', labels);
				this.$set(this.statsData.datasets, 0, dataset);

				this.statsChart = new Chart(ctx, {
					type: 'pie',
					data: this.statsData,
					options: {
						...this.statsOptions,
						plugins: {
							datalabels: {
								formatter: (value, ctx) => {
									if(value == 0) {
										return "";
									} else {
										let datasets = ctx.chart.data.datasets;
										let sum = datasets[0].data.reduce((a, b) => a + b, 0);
										let percentage = Math.round((value / sum) * 100) + '%';
										return percentage;
									}
								},
								color: '#000000',
								font: {
									size: this.isThumbnail ? '12' : '16',
									weight: this.isThumbnail ? 'normal' : 'bold'
								}
							}
						}
					},
				});
				break;
		}
		if ((this.isResult || this.isThumbnail) && this.activePoll.typeVariable != "Text") {
			this.updateChart();
		}
	},
	methods: {
		getColor(options) {
			let backgroundColors = [
				'rgba(255, 74, 112, 0.8)',
				'rgba(74, 95, 255, 0.8)',
				'rgba(74, 255, 83, 0.8)',
				'rgba(255, 249, 74, 0.8)',
				'rgba(74, 255, 237, 0.8)',
				'rgba(255, 74, 249, 0.8)',
				'rgba(171, 74, 255, 0.8)',
				'rgba(195, 255, 74, 0.8)',
				'rgba(255, 193, 128, 0.8)',
				'rgba(128, 198, 255, 0.8)',
				'rgba(91, 181, 116, 0.8)',
			];
			let hoverBackgroundColors = [
				'rgba(255, 74, 112, 1)',
				'rgba(74, 95, 255, 1)',
				'rgba(74, 255, 83, 1)',
				'rgba(255, 249, 74, 1)',
				'rgba(74, 255, 237, 1)',
				'rgba(255, 74, 249, 1)',
				'rgba(171, 74, 255, 1)',
				'rgba(195, 255, 74, 1)',
				'rgba(255, 193, 128, 1)',
				'rgba(128, 198, 255, 1)',
				'rgba(91, 181, 116, 1)',
			];
			let color;

			if (this.colorIndex < backgroundColors.length) {
				let index = this.colorIndex;
				if (options) {
					index = options.random ? Math.floor(Math.random() * backgroundColors.length) : this.colorIndex;
				}
				color = {
					background: backgroundColors[index],
					hover: hoverBackgroundColors[index]
				}
				this.colorIndex++;
			} else {
				let hue = 360 * Math.random(),
					saturation = 80 + 15 * Math.random(),
					lightness = 50 + 20 * Math.random();

				color = {
					background: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`,
					hover: `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`
				}
			}

			return color;
		},

		updateCounts() {
			let counts = {
				answersCount: this.answers.length,
				usersCount: Object.keys(this.connectedUsers).length
			}
			this.$emit('update-counts', counts);
			this.$root.$refs.SugarPresence.sendMessage({
				user: this.$root.$refs.SugarPresence.getUserInfo(),
				content: {
					action: 'update-counts',
					data: {
						counts: counts
					}
				}
			});
		},

		updateChart() {
			let data = [];

			switch (this.activePoll.typeVariable) {
				case "Text":
					let canvas = document.querySelector(`#${this.id} #stats`);
					WordCloud(canvas, {
						list: this.getWordsList(this.answers),
						weightFactor: 40 - this.answers.length,
						shrinkToFit: true,
						hover: this.showWordCount
					});
					break;
				case "MCQ":
				case "ImageMCQ":
					for (let i in this.activePoll.options) {
						data.push(0);
					}
					for (let answer of this.answers) {
						data[answer]++;
					}
					this.$set(this.statsData.datasets[0], 'data', data);
					break;
				case "Rating":
					for (let i = 1; i <= 5; i++) {
						data.push(0);
					}
					for (let answer of this.answers) {
						data[answer - 1]++;
					}
					this.$set(this.statsData.datasets[0], 'data', data);
					break;
				case "YesNo":
					data.push(0);
					data.push(0);
					for (let answer of this.answers) {
						let index = answer ? 1 : 0;
						data[index]++;
					}
					this.$set(this.statsData.datasets[0], 'data', data);
					break;
			}
			if (this.activePoll.typeVariable != "Text") {
				this.statsChart.update();
			}
		},

		getWordsList(array) {
			let counts = {};
			for (let item of array) {
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
			let list = [];
			for (let key in counts) {
				list.push([key, counts[key]]);
			}
			return list;
		},

		showWordCount(item, dimensions, event) {
			this.canvasInfoItem = item;
		},

		stopPoll() {
			this.$emit('update-results', this.answers);
			this.$emit('save-to-history');
			this.$emit('stop-poll');
		},

		goBack() {
			this.$emit('go-back-to', 'polls-grid');
		}
	}
}