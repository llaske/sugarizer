var Vote = {
	/*html*/
	template: `
		<div class="vote" :style="{ backgroundColor: currentUser.colorvalue.fill }">
			<div class="vote-card">
				<div class="loading" v-if="!activePoll">
					Loading...
				</div>
				<div class="vote-card-content" v-else>
					<h1 class="vote-question" v-if="currentUser.answer == null">{{ activePoll.question }}</h1>
					
					<div class="vote-waiting" v-if="currentUser.answer != null">
						<img src="icons/hourglass.svg" alt="hourglass">
						<h2>Waiting for results</h2>
					</div>
					<div class="vote-text" v-else-if="activePoll.type == 'text'">
						<input type="text" v-model="text">
					</div>
					<div class="vote-mcq" v-else-if="activePoll.type == 'mcq'">
						<button 
							class="option" 
							:class="{ selected: optionSelected == i }" 
							v-for="(option, i) in activePoll.options" 
							:key="i"
							@click="optionSelected = i"
						>{{ option }}</button>
					</div>

					<button class="submit" :disabled="!submitable" @click="submit" v-if="currentUser.answer == null"></button>
				</div>

				<button ref="raiseHandButton" class="raise-hand" :class="{ active: currentUser.handRaised }" @click="switchHandRaise"></button>
			</div>
		</div>
	`,
	props: ['activePoll', 'connectedUsers', 'currentUser'],
	data: () => ({
		text: "",
		optionSelected: null
	}),
	computed: {
		submitable() {
			switch(this.activePoll.type) {
				case 'text':
					return this.text != "";
				case 'mcq':
					return this.optionSelected != null;
			}
			return true;
		}
	},
	watch: {
		"currentUser.handRaised": function(newVal, oldVal) {
			let vm = this;
			this.$nextTick(() => {
				if(newVal) {
					vm.$root.$refs.SugarIcon.colorizeIcon(vm.$refs.raiseHandButton, vm.currentUser.colorvalue);
				} else {
					vm.$root.$refs.SugarIcon.colorizeIcon(vm.$refs.raiseHandButton, { fill: "#ffffff", stroke: "#d3d3d3" });
				}
			})
		}
	},
	methods: {
		switchHandRaise() {
			this.$emit('hand-raise-switched', !this.currentUser.handRaised);
		},
		submit() {
			switch(this.activePoll.type) {
				case 'text':
					this.$emit('vote-submitted', this.text);
					break;
				case 'mcq':
					this.$emit('vote-submitted', this.optionSelected);
					break;
			}
		}
	}
}