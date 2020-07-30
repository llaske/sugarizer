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
		<div class="poll-stats">
			<div class="poll-header">
				<h2>{{ activePoll.question }}</h2>
				<div v-if="!isResult">
					<button id="stop-poll" @click="stopPoll" v-if="activePollStatus == 'running'"></button>
					<button id="go-back" @click="goBack" v-else></button>
				</div>
			</div>

			<div style="position: absolute; width: 100px; background: rgba(0,0,0,0.4); display: none">
				{{ answers }} <br>
				{{ activePoll.results }}
			</div>
		
			<div class="poll-stats-container">
				<div class="stats-container">
					<canvas id="stats" width="100" height="100"></canvas>
				</div>
				<div class="stats-legends" v-if="activePoll.type == 'image-mcq'">
					<div class="legend-item" v-for="(option, i) in activePoll.options" :key="i">
						<div class="color" :style="{ backgroundColor: statsData.datasets[0].backgroundColor[i] }"></div>
						<span>{{ i+1 }}</span>
						<div class="legend-image">
							<img :src="option">
						</div>
					</div>
				</div>
			</div>
			
			<div class="poll-footer" v-if="!isResult">
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
		activePoll: Object,
		activePollStatus: String,
		connectedUsers: Object,
		isResult: Boolean
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
						beginAtZero: true
					}
				}]
			}
		}
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
			if (!this.isResult) {
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

			if (this.isResult) return;
			//Updating counts
			this.updateCounts();
		},

		connectedUsers: function (newVal, oldVal) {
			if (this.isResult) return;
			//Updating counts
			this.updateCounts();
		},
	},
	mounted() {
		let ctx = document.getElementById('stats');
		let labels = [];
		let dataset = {
			label: 'Votes',
			data: [],
			backgroundColor: [],
			hoverBackgroundColor: []
		}
		// let colors = [
		// 	'rgba(255, 99, 132, 0.8)',
		// 	'rgba(54, 162, 235, 0.8)',
		// 	'rgba(255, 206, 86, 0.8)',
		// 	'rgba(75, 192, 192, 0.8)',
		// 	'rgba(153, 102, 255, 0.8)',
		// 	'rgba(255, 159, 64, 0.8)'
		// ];
		// let colorIndex = 0;
		if (this.activePoll.type == "mcq") {
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
				options: this.statsOptions
			});
		} else if (this.activePoll.type == "image-mcq") {
			for (let i in this.activePoll.options) {
				labels.push(parseInt(i)+1);
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
		} else if (this.activePoll.type == "rating") {
			for (let i = 1; i <= 5; i++) {
				labels.push(i);
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
				}
			});
		} else if (this.activePoll.type == "yesno") {
			labels.push('false');
			dataset.data.push(0);
			let color = this.getColor();
			dataset.backgroundColor.push(color.background);
			dataset.hoverBackgroundColor.push(color.hover);

			labels.push('true');
			dataset.data.push(0);
			color = this.getColor();
			dataset.backgroundColor.push(color.background);
			dataset.hoverBackgroundColor.push(color.hover);

			this.$set(this.statsData, 'labels', labels);
			this.$set(this.statsData.datasets, 0, dataset);

			this.statsChart = new Chart(ctx, {
				type: 'pie',
				data: this.statsData,
				options: this.statsData
			});
		}
		if(this.isResult) {
			this.updateChart();
		}
	},
	methods: {
		getColor() {
			let hue = 360 * Math.random(),
				saturation = 80 + 15 * Math.random(),
				lightness = 50 + 20 * Math.random();

			return {
				background: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`,
				hover: `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`
			}
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

			if (this.activePoll.type == "mcq" || this.activePoll.type == "image-mcq") {
				for (let i in this.activePoll.options) {
					data.push(0);
				}
				for (let answer of this.answers) {
					data[answer]++;
				}
				this.$set(this.statsData.datasets[0], 'data', data);
			} else if (this.activePoll.type == "rating") {
				for (let i = 1; i <= 5; i++) {
					data.push(0);
				}
				for (let answer of this.answers) {
					data[answer - 1]++;
				}
				this.$set(this.statsData.datasets[0], 'data', data);
			} else if (this.activePoll.type == "yesno") {
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