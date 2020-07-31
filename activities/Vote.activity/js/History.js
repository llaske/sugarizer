var History = {
	/*html*/
	template: `
		<div class="history-container" :style="{ backgroundColor: openHistoryIndex == null ? currentUser.colorvalue.fill : '#fff' }">
			<ul class="history-list" v-if="openHistoryIndex == null">
				<li 
					class="history-item" 
					v-for="(item, i) in history" 
					:key="item.endTime"
					@click="$emit('set-open-history-index', i)"
				>
					<div class="poll-image">
						
					</div>
					<div class="poll-info">
						<h3>{{ item.question }}</h3>
						<p>{{ item.type }}</p>
					</div>
					<div class="results-info">
						<p>{{ item.results.counts.answersCount }} votes</p>
					</div>
				</li>
			</ul>

			<poll-stats v-else :activePoll="history[openHistoryIndex]" isResult></poll-stats>
			<button v-if="openHistoryIndex != null" id="go-back" @click="$emit('set-open-history-index', null)"></button>
		</div>
	`,
	components: {
		'poll-stats': PollStats
	},
	props: ['history', 'openHistoryIndex', 'currentUser'],
	mounted() {
		this.history.sort((a, b) => {
			return b.endTime - a.endTime;
		});
	}
}