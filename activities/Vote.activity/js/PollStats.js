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

var PollStats = {
	/*html*/
	template: `
		<div class="poll-stats" :id="id" :class="{ 'is-result': isResult, 'is-thumbnail': isThumbnail }">
			<div class="poll-header" v-if="!isThumbnail">
				<button id="go-back" @click="goBack" v-if="!isResult && activePollStatus != 'running'"></button>
				<h2>{{ activePoll.question }}</h2>
				<button id="stop-poll" @click="stopPoll" v-if="!isResult && activePollStatus == 'running'"></button>
			</div>

			<div style="position: absolute; width: 100px; background: rgba(0,0,0,0.4); display: none">
				{{ answers }} <br>
				{{ activePoll.results }}
			</div>
		
			<div class="poll-stats-container">
				<div class="stats-container">
					<canvas id="stats" width="100" height="100"></canvas>
				</div>
				<div class="stats-legends" v-if="!isThumbnail && activePoll.typeVariable == 'ImageMCQ'">
					<div class="legend-item" v-for="(option, i) in activePoll.options" :key="i">
						<div class="color" :style="{ backgroundColor: statsData.datasets[0].backgroundColor[i] }"></div>
						<span>{{ i+1 }}</span>
						<div class="legend-image">
							<img :src="option">
						</div>
					</div>
				</div>

			</div>
			
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
		'footer-item': FooterItem
	},
	props: {
		id: {
			type: String,
			default: "stats-poll"
		},
		activePoll: Object,
		activePollStatus: String,
		connectedUsers: Object,
		isResult: Boolean,
		isThumbnail: Boolean,
		realTimeResults: Boolean,
		autoStop: Boolean
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
		colorIndex: 0
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
		}
	},
	watch: {
		answers: function (newVal, oldVal) {
			this.updateChart();

			if (this.isResult || this.isThumbnail) return;

			this.updateCounts();
			if (this.realTimeResults) {
				this.$emit('update-results', this.answers);
			}
		},

		realTimeResults: function(newVal, oldVal) {
			if(newVal) {
				this.$emit('update-results', this.answers);
			}
		},

		connectedUsers: function (newVal, oldVal) {
			if (this.isResult || this.isThumbnail) return;
			this.updateCounts();
		},
	},
	mounted() {
		let ctx = document.querySelector(`#${this.id} #stats`);
		let labels = [];
		let dataset = {
			label: 'Votes',
			data: [],
			backgroundColor: [],
			hoverBackgroundColor: []
		}
	
		if (this.activePoll.typeVariable == "MCQ") {
			for (let option of this.activePoll.options) {
				labels.push(option);
				dataset.data.push(0);
				let color = this.getColor();
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
					legend: { display: !this.isThumbnail }
				}
			});
		} else if (this.activePoll.typeVariable == "ImageMCQ") {
			for (let i in this.activePoll.options) {
				labels.push(parseInt(i) + 1);
				dataset.data.push(0);
				let color = this.getColor();
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
					legend: { display: false }
				}
			});
		} else if (this.activePoll.typeVariable == "Rating") {
			for (let i = 1; i <= 5; i++) {
				let dataset = {
					label: '',
					data: [],
					backgroundColor: [],
					hoverBackgroundColor: []
				}
				dataset.label = i;
				dataset.data.push(0);
				let color = this.getColor();
				dataset.backgroundColor.push(color.background);
				dataset.hoverBackgroundColor.push(color.hover);
				this.$set(this.statsData.datasets, i-1, dataset);
			}

			this.statsChart = new Chart(ctx, {
				type: 'bar',
				data: this.statsData,
				options: {
					...this.statsOptions,
					...this.statsBarOptions,
					legend: { display: !this.isThumbnail }
				}
			});
		} else if (this.activePoll.typeVariable == "YesNo") {
			labels.push('False');
			dataset.data.push(0);
			let color = this.getColor();
			dataset.backgroundColor.push(color.background);
			dataset.hoverBackgroundColor.push(color.hover);

			labels.push('True');
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
					legend: { display: !this.isThumbnail }
				},
			});
		}
		if (this.isResult || this.isThumbnail) {
			this.updateChart();
		}
	},
	methods: {
		getColor() {
			let backgroundColors = [
				'rgba(255, 99, 132, 0.8)',
				'rgba(54, 162, 235, 0.8)',
				'rgba(255, 206, 86, 0.8)',
				'rgba(75, 192, 192, 0.8)',
				'rgba(153, 102, 255, 0.8)',
				'rgba(255, 159, 64, 0.8)'
			];
			let hoverBackgroundColors = [
				'rgba(255, 99, 132, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(255, 206, 86, 1)',
				'rgba(75, 192, 192, 1)',
				'rgba(153, 102, 255, 1)',
				'rgba(255, 159, 64, 1)'
			];
			let color;

			if(this.colorIndex < backgroundColors.length) {
				color = {
					background: backgroundColors[this.colorIndex],
					hover: hoverBackgroundColors[this.colorIndex]
				}
				this.colorIndex++;
			} else {
				let hue = 360 * Math.random(),
					saturation = 80 + 15 * Math.random(),
					lightness = 50 + 20 * Math.random();
	
				color =  {
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

			if (this.activePoll.typeVariable == "MCQ" || this.activePoll.typeVariable == "ImageMCQ") {
				for (let i in this.activePoll.options) {
					data.push(0);
				}
				for (let answer of this.answers) {
					data[answer]++;
				}
				this.$set(this.statsData.datasets[0], 'data', data);
			} else if (this.activePoll.typeVariable == "Rating") {
				for (let i = 1; i <= 5; i++) {
					this.statsData.datasets[i-1].data[0] = 0;
				}
				for (let answer of this.answers) {
					this.statsData.datasets[answer-1].data[0]++;
				}
			} else if (this.activePoll.typeVariable == "YesNo") {
				data.push(0);
				data.push(0);
				for (let answer of this.answers) {
					let index = answer ? 1 : 0;
					data[index]++;
				}
				this.$set(this.statsData.datasets[0], 'data', data);
			}
			this.statsChart.update();
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