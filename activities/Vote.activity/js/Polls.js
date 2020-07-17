var PollCard = {
	/*html*/
	template: `
		<div class="poll-card" @click="$emit('poll-clicked', poll.id)">
			<div class="poll-image"></div>
			<div class="poll-details">
				<h3 class="poll-title">{{ poll.question }}</h3>
				<p class="poll-type">{{ poll.type }}</p>
			</div>
		</div>
	`,
	props: ['poll']
}

var PollsGrid = {
	/*html*/
	template: `
		<div class="polls-grid" :style="{ backgroundColor: currentUser.colorvalue.fill }">
			<poll-card 
				:poll="poll" 
				v-show="matchesSearch(poll.question)"
				v-for="poll in polls" 
				:key="poll.id"
				@poll-clicked="onPollClick"
			></poll-card>
		</div>
	`,
	components: {
		'poll-card': PollCard
	},
	props: ['polls', 'searchQuery', 'currentUser'],
	methods: {
		matchesSearch(str) {
			var regex = new RegExp(this.searchQuery, "i")
			if(str.search(regex) != -1) {
				return true;
			}
			return false;
		},
		onPollClick(pollId) {
			this.$emit('start-poll', pollId);
		}
	}
}