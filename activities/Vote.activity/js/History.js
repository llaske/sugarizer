var History = {
	/*html*/
	template: `
		<div class="history-container" :style="{ backgroundColor: openHistoryIndex == null ? currentUser.colorvalue.stroke : '#fff' }">
			<ul class="history-list" v-if="openHistoryIndex == null">
				<li 
					class="history-item" 
					v-for="(item, i) in history" 
					:key="item.endTime"
					@click="$emit('set-open-history-index', i)"
				>
					<div class="poll-image">
						<poll-stats :id="'stats-' + i" :activePoll="item" isThumbnail />
					</div>
					<div class="poll-info">
						<h3>{{ item.question }}</h3>
						<p>{{ item.type }}</p>
						<small>{{ $root.$refs.SugarL10n.localizeTimestamp(item.endTime) }}</small>
					</div>
					<div class="results-info">
						<p>{{ item.results.counts.answersCount }} votes</p>
						<p>{{ item.results.counts.usersCount }} users</p>
					</div>
				</li>
			</ul>

			<poll-stats v-else :activePoll="history[openHistoryIndex]" :current-user="currentUser" isResult isHistory></poll-stats>
			<button v-if="openHistoryIndex != null" id="go-back" :disabled="exporting != ''" @click="$emit('set-open-history-index', null)"></button>

			<export 
				v-if="exporting != ''"
				:history="history"
				:currentUser="currentUser"
				:exporting="exporting"
				@export-completed="$emit('export-completed')"
			></export>
		</div>
	`,
	components: {
		'poll-stats': PollStats,
		'export': Export
	},
	props: ['history', 'openHistoryIndex', 'currentUser', 'exporting'],
	mounted() {
		this.history.sort((a, b) => {
			return b.endTime - a.endTime;
		});
	},
	data: () => ({

	})
}