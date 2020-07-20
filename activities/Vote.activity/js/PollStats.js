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
				<h1>{{ activePoll.question }}</h1>
			</div>
			{{ answers }} <br>
			<canvas id="stats" width="400" height="400"></canvas>
			<div class="poll-footer">
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
	props: ['activePoll', 'connectedUsers'],
	data: () => ({
		statsChart: null,
		statsData: {
			labels: [],
			datasets: [{
				label: 'Votes',
				data: []
			}]
		},
		statsOptions: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		},
	}),
	computed: {
		sortedUsers() {
			let users = [];
			for(let key in this.connectedUsers) {
				if(this.connectedUsers[key].answer != null) {
					users.unshift(this.connectedUsers[key]);
				} else {
					users.push(this.connectedUsers[key]);
				}
			}
			return users;
		},
		answers() {
			let answers = [];
			for(let key in this.connectedUsers) {
				if(this.connectedUsers[key].answer != null) {
					answers.push(this.connectedUsers[key].answer);
				}
			}
			return answers;
		}
	},
	watch: {
		answers: function(newVal, oldVal) {
			let data = [];

			if(this.activePoll.type == "mcq") {
				for(let i in this.activePoll.options) {
					data.push(0);
				}
				for(let answer of newVal) {
					data[answer]++;
				}
				this.$set(this.statsData.datasets[0], 'data', data);
			} else if(this.activePoll.type == "rating") {
				for(let i=1; i<=5; i++) {
					data.push(0);
				}
				for(let answer of newVal) {
					data[answer-1]++;
				}
				this.$set(this.statsData.datasets[0], 'data', data);
			}
			this.statsChart.update();
		}
	},
	mounted() {
		let ctx = document.getElementById('stats');
		let labels = [];
		let dataset = {
			label: 'Votes',
			data: [],
			backgroundColor: []
		}
		let colors = [
			'rgba(255, 99, 132, 0.8)',
			'rgba(54, 162, 235, 0.8)',
			'rgba(255, 206, 86, 0.8)',
			'rgba(75, 192, 192, 0.8)',
			'rgba(153, 102, 255, 0.8)',
			'rgba(255, 159, 64, 0.8)'
		];

		let colorIndex = 0;
		if(this.activePoll.type == "mcq") {
			for(let option of this.activePoll.options) {
				labels.push(option);
				dataset.data.push(0);
				dataset.backgroundColor.push(colors[colorIndex++]);
			}
			this.$set(this.statsData, 'labels', labels);
			this.$set(this.statsData.datasets, 0, dataset);

			this.statsChart = new Chart(ctx, {
				type: 'pie',
				data: this.statsData,
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			});
		} else if(this.activePoll.type == "rating") {
			for(let i=1; i<=5; i++) {
				labels.push(i);
				dataset.data.push(0);
				dataset.backgroundColor.push(colors[colorIndex++]);
			}
			console.log(this.statsData);
			this.$set(this.statsData, 'labels', labels);
			this.$set(this.statsData.datasets, 0, dataset);
			console.log(this.statsData);

			this.statsChart = new Chart(ctx, {
				type: 'bar',
				data: this.statsData,
				options: this.statsOptions
			});
		}
	},
	methods: {

	}
}