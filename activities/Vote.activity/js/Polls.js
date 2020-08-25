var PollCard = {
	/*html*/
	template: `
		<div class="poll-card" :class="{ 'settings-active': settings }" @click="onPollClick()">
			<div class="settings-row">
				<transition name="settings-zoom">
					<button id="edit-button" @click="onEditClick" v-if="settings"></button>
				</transition>
				<transition name="settings-zoom">
					<button id="delete-button" @click.stop="onDeleteClick" v-if="settings"></button>
				</transition>
			</div>
			<div class="poll-image">
				<img :src="poll.image">
				<img src="lib/sugar-web/graphics/icons/actions/zoom-neighborhood.svg" class="share-icon">
			</div>
			<div class="poll-details">
				<h3 class="poll-title">{{ poll.question }}</h3>
				<p class="poll-type">{{ poll.type }}</p>
			</div>
		</div>
	`,
	props: ['poll', 'settings'],
	methods: {
		onPollClick() {
			if(this.settings) return;
			this.$emit('poll-clicked', this.poll.id);
		},

		onEditClick: function() {
			this.$emit('edit-clicked', this.poll.id)
		},

		onDeleteClick: function() {
			this.$emit('delete-clicked', this.poll.id);
		}
	}
}

var PollsGrid = {
	/*html*/
	template: `
		<div>
			<draggable 
				class="polls-grid" 
				:class="{ fullscreen: $root.$refs.SugarToolbar ? $root.$refs.SugarToolbar.isHidden() : false }"
				:style="{ backgroundColor: currentUser.colorvalue.fill }" 
				v-model="polls" 
				@update="onUpdate" 
				:disabled="!settings" 
				:animation="300"
			>
				<poll-card 
					:poll="poll" 
					:id="i"
					v-show="matchesSearch(poll.question)"
					v-for="(poll, i) in polls" 
					:key="poll.id"
					:settings="settings"
					@poll-clicked="onPollClick"
					@edit-clicked="onEditPollClick"
					@delete-clicked="deletePoll"
				></poll-card>
			</draggable>
		</div>
	`,
	components: {
		'poll-card': PollCard
	},
	props: ['polls', 'searchQuery', 'currentUser', 'settings'],
	methods: {
		matchesSearch(str) {
			var regex = new RegExp(this.searchQuery, "i")
			if (str.search(regex) != -1) {
				return true;
			}
			return false;
		},

		onPollClick(pollId) {
			this.$emit('start-poll', pollId);
		},

		onUpdate: function(e) {
			this.$emit('update-polls', this.polls);
		},

		onEditPollClick: function(pollId) {
			this.$emit('edit-poll', pollId);
		},

		deletePoll: function(pollId) {
			var index = this.polls.findIndex(function(poll) {
				return poll.id == pollId;
			});
			this.polls.splice(index, 1);
		}
	}
}