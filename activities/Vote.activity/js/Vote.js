var Vote = {
	/*html*/
	template: `
		<div class="vote" :style="{ backgroundColor: currentUser.colorvalue.fill }">
			<div class="vote-card">
				<div class="loading" v-if="!activePoll">
					<div>
						<img src="icons/hourglass.svg" alt="hourglass">
						<h2>{{ $root.$refs.SugarL10n.get('WaitingPoll') }}</h2>
					</div>
				</div>
				<div class="vote-card-content" v-else-if="activePollStatus == 'running' && (!realTimeResults || (realTimeResults && currentUser.answer == null))">
					<h1 class="vote-question" v-if="currentUser.answer == null">{{ activePoll.question }}</h1>
					
					<div class="vote-waiting" v-if="currentUser.answer != null">
						<img src="icons/hourglass.svg" alt="hourglass">
						<h2>{{ $root.$refs.SugarL10n.get('WaitingResults') }}</h2>
						<h3>{{ counts.answersCount }}/{{ counts.usersCount }}</h3>
						<h3>Voted</h3>
					</div>

					<!-- Text -->
					<div class="vote-text" v-else-if="activePoll.type == 'text'">
						<input type="text" v-model="text">
					</div>

					<!-- Yes/No -->
					<div class="vote-yesno" v-else-if="activePoll.type == 'yesno'">
						<button 
							class="option option-yes" 
							:class="{ selected: boolChoice == true }" 
							:style="{ backgroundImage: 'url(' + yesnoIcons.yes	 + ')' }"
							@click="boolChoice = true"
						></button>
						<button 
							class="option option-no" 
							:class="{ selected: boolChoice == false }" 
							:style="{ backgroundImage: 'url(' + yesnoIcons.no	 + ')' }"
							@click="boolChoice = false"
						></button>
					</div>

					<!-- MCQ -->
					<div class="vote-mcq" v-else-if="activePoll.type == 'mcq'">
						<button 
							class="option" 
							:class="{ selected: optionSelected == i }" 
							v-for="(option, i) in activePoll.options" 
							:key="i"
							@click="optionSelected = i"
						>{{ option }}</button>
					</div>

					<!-- Image MCQ -->
					<div class="vote-image-mcq" v-else-if="activePoll.type == 'image-mcq'">
						<div 
							class="option-image"
							:class="{ selected: optionSelected == i }" 
							v-for="(option, i) in activePoll.options" 
							:key="i"
							@click="optionSelected = i"
						>
							<img :src="option">
						</div>
					</div>

					<!-- Rating -->
					<div class="vote-rating" v-else-if="activePoll.type == 'rating'">
						<div 
							class="rating-star" 
							:style="{ backgroundImage: getRatingStar(n) }" 
							v-for="n in 5" 
							:key="n"
							@click="rating = n"
						></div>
					</div>

					<button class="submit" :disabled="!submitable" @click="submit" v-if="currentUser.answer == null"></button>
				</div>

				<div v-else-if="(activePollStatus == 'finished' || (currentUser.answer != null && realTimeResults)) && activePoll.results != null">
					<poll-stats :activePoll="activePoll" isResult></poll-states>
				</div>

				<button 
					ref="raiseHandButton" 
					v-if="activePoll"
					class="raise-hand" 
					:class="{ active: currentUser.handRaised }" 
					@click="switchHandRaise"
				></button>
			</div>
		</div>
	`,
	components: {
		'poll-stats': PollStats
	},
	props: ['activePoll', 'activePollStatus', 'realTimeResults', 'connectedUsers', 'currentUser', 'counts'],
	data: () => ({
		text: "",
		optionSelected: null,
		boolChoice: null,
		rating: 0,
		ratingIcons: {
			unselected: '../icons/star.svg',
			selected: '../icons/star.svg',
		},
		yesnoIcons: {
			yes: '../icons/dialog-ok.svg',
			no: '../icons/dialog-cancel.svg',
		},
	}),
	computed: {
		submitable() {
			switch (this.activePoll.type) {
				case 'text':
					return this.text != "";
				case 'yesno':
					return this.boolChoice != null;
				case 'mcq':
				case 'image-mcq':
					return this.optionSelected != null;
			}
			return true;
		}
	},
	watch: {
		activePoll: function (newVal, oldVal) {
			if(newVal == null) {
				this.text = "";
				this.optionSelected = null;
				this.boolChoice = null;
				this.rating = 0;
			}
		},
		"currentUser.handRaised": function (newVal, oldVal) {
			let vm = this;
			this.$nextTick(() => {
				if (newVal) {
					vm.$root.$refs.SugarIcon.colorizeIcon(vm.$refs.raiseHandButton, vm.currentUser.colorvalue);
				} else {
					vm.$root.$refs.SugarIcon.colorizeIcon(vm.$refs.raiseHandButton, { fill: "#ffffff", stroke: "#d3d3d3" });
				}
			})
		}
	},
	mounted() {
		let vm = this;
		this.$root.$refs.SugarIcon.generateIconWithColors(this.ratingIcons.unselected, { fill: "#ffffff", stroke: this.currentUser.colorvalue.stroke })
			.then(src => {
				vm.ratingIcons.unselected = src;
			});
		this.$root.$refs.SugarIcon.generateIconWithColors(this.ratingIcons.selected, this.currentUser.colorvalue)
			.then(src => {
				vm.ratingIcons.selected = src;
			});
		this.$root.$refs.SugarIcon.generateIconWithColors(this.yesnoIcons.yes, this.currentUser.colorvalue)
			.then(src => {
				vm.yesnoIcons.yes = src;
			});
		this.$root.$refs.SugarIcon.generateIconWithColors(this.yesnoIcons.no, this.currentUser.colorvalue)
			.then(src => {
				vm.yesnoIcons.no = src;
			});
	},
	methods: {
		switchHandRaise() {
			this.$emit('hand-raise-switched', !this.currentUser.handRaised);
		},
		getRatingStar(n) {
			return `url(${n <= this.rating ? this.ratingIcons.selected : this.ratingIcons.unselected})`;
		},
		submit() {
			switch (this.activePoll.type) {
				case 'text':
					this.$emit('vote-submitted', this.text);
					break;
				case 'yesno':
					this.$emit('vote-submitted', this.boolChoice);
					break;
				case 'mcq':
				case 'image-mcq':
					this.$emit('vote-submitted', this.optionSelected);
					break;
				case 'rating':
					this.$emit('vote-submitted', this.rating);
					break;
			}
		}
	}
}