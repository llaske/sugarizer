var Vote = {
	/*html*/
	template: `
		<div class="vote" :style="{ backgroundColor: currentUser.colorvalue.fill }">
			<div class="vote-card">
				<div class="loading" v-if="!activePoll">
					Loading...
				</div>
				<div class="vote-card-content" v-else>
					<h1 class="vote-question">{{ activePoll.question }}</h1>
					
					<div class="vote-waiting" v-if="currentUser.answer != null">
						<h4>Waiting for results</h4>
					</div>
					<div class="vote-text" v-else-if="activePoll.type == 'text'">
						<input type="text" v-model="text">
					</div>

					<button class="submit" :disabled="!submitable" @click="submit"></button>
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
			this.$emit('hand-raise-switch', !this.currentUser.handRaised);
		},
		submit() {
			switch(this.activePoll.type) {
				case 'text':
					console.log(this.text);
					break;
				case 'mcq':
					console.log(this.optionSelected);
					break;
			}
		}
	}
}