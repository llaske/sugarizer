var PollSettings = {
	/*html*/
	template: `
		<div class="settings poll-settings">
			<form @submit.prevent="onConfirm">
				<div>
					<div class="image-label">
						<label for="image">{{ l10n.stringImage }}</label>
						<div>
							<button type="button" id="delete-image-button" v-if="poll.image.indexOf('data:image') != -1" @click="deleteUserImage"></button>
							<button type="button" id="image-edit-button" @click="onUploadClick"></button>
						</div>
					</div>
					<img :src="poll.image">
				</div>
				<div id="question">
					<label for="question">{{ l10n.stringQuestion }}</label>
					<input type="text" name="question" v-model="poll.question" required>
				</div>
				<div id="type">
					<label for="type">{{ l10n.stringType }}</label>
					<select v-model="poll.typeVariable">
						<option :value="type" v-for="(image, type) in types" :key="type">{{ $root.$refs.SugarL10n.get(type) }}</option>
					</select>
				</div>
				<div v-if="poll.typeVariable == 'MCQ' || poll.typeVariable == 'ImageMCQ'">
					<div class="options-label">
						<label for="options">{{ l10n.stringOptions }}</label>
						<button type="button" class="add-option-button" @click="addOption"></button>
					</div>
					<draggable :class="{ 'image-mcq': poll.typeVariable == 'ImageMCQ' }" v-model="poll.options" animation="300">
						<div class="option" :id="i" v-for="(option, i) in poll.options" :key="i">
							<input 
								v-if="poll.typeVariable == 'MCQ'"
								type="text" 
								name="option" 
								v-model="poll.options[i]" 
								required
							>
							<div class="option-image">
								<img v-if="poll.typeVariable == 'ImageMCQ'" :src="option">
								<button type="button" class="delete-option-button" :class="{ 'image-mcq': poll.typeVariable == 'ImageMCQ' }" @click="deleteOption(i)"></button>
							</div>
						</div>
					</draggable>
				</div>
				
				<div class="buttons-row">
					<button type="submit" :disabled="poll.question == ''">
						<img src="icons/dialog-ok.svg">
						<span>{{ l10n.stringConfirm }}</span>
					</button>
					<button type="button" @click="$emit('go-back-to', 'polls-grid')">
						<img src="icons/dialog-cancel.svg">
						<span>{{ l10n.stringCancel }}</span>
					</button>
				</div>
			</form>
		</div>
	`,
	props: ['polls', 'activePoll', 'activePollStatus'],
	data: () => ({
		poll: {
			type: '',
			typeVariable: '',
			image: '',
			question: '',
			options: [],
			results: null
		},
		types: {
			"YesNo": "images/yesno.png",
			"Rating": "images/rating.png",
			"MCQ": "images/mcq.png",
			"Text": "images/text.png",
			"ImageMCQ": "images/image-mcq.png"
		},
		l10n: {
			stringQuestion: '',
			stringType: '',
			stringImage: '',
			stringOptions: '',
			stringConfirm: '',
			stringCancel: ''
		}
	}),
	watch: {
		"poll.typeVariable": function (newVal, oldVal) {
			this.poll.type = this.$root.$refs.SugarL10n.get(newVal);
			if (this.poll.image.indexOf('data:image') == -1) {
				this.poll.image = this.types[newVal];
			}
		},
	},
	created: function () {
		if (this.activePoll && this.activePollStatus == "editing") {			// Edit poll
			this.poll = JSON.parse(JSON.stringify(this.activePoll));
		}
		// Else adding a poll -> setting default typeVariable and image
		this.poll.typeVariable = Object.keys(this.types)[0];
		this.poll.image = this.types[this.poll.typeVariable];
	},
	mounted: function () {
		this.$root.$refs.SugarL10n.localize(this.l10n);
	},
	methods: {
		onUploadClick(target) {
			let vm = this;
			var filters = [
				{ mimetype: 'image/png' },
				{ mimetype: 'image/jpeg' }
			];
			this.$root.$refs.SugarJournal.insertFromJournal(filters)
				.then((data, metadata) => {
					vm.poll.image = data;
				});
		},

		addOption() {
			if (this.poll.typeVariable == "MCQ") {
				this.poll.options.push("");
			} else if (this.poll.typeVariable == "ImageMCQ") {
				let vm = this;
				var filters = [
					{ mimetype: 'image/png' },
					{ mimetype: 'image/jpeg' }
				];
				this.$root.$refs.SugarJournal.insertFromJournal(filters)
					.then((data, metadata) => {
						vm.poll.options.push(data);
					});
			}
		},

		deleteOption(i) {
			this.$delete(this.poll.options, i);
		},

		deleteUserImage() {
			this.poll.image = this.types[this.poll.typeVariable];
		},

		onConfirm() {
			if (this.poll.typeVariable != "MCQ" && this.poll.typeVariable != "ImageMCQ") {
				this.$delete(this.poll, 'options');
			}

			if (this.activePoll && this.activePollStatus == "editing") {
				this.editPoll();
			} else {
				this.addPoll();
			}
		},

		editPoll() {
			var vm = this;
			var index = this.polls.findIndex(function (poll) {
				return poll.id === vm.activePoll.id;
			});
			this.polls[index] = this.poll;
			this.$emit('go-back-to', 'polls-grid');
		},

		addPoll() {
			var nextId = this.polls.length;
			this.poll.id = nextId;
			this.polls.push(this.poll);
			this.$emit('poll-added', this.poll.id);
		}
	}
}