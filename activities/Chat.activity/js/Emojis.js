const Emojis = {
	template: `
		<div class="emojis-container">
			<button class="smiley-btn" title="Emoji" @click="toggleEmojiPopup" type="button">{{ getEmoji(128515) }}</button>

			<transition name="bounce">
				<div v-if="showEmojiPopup" class="emoji-popup">
					<div class="emoji-icon-container">
						<button class="emoji-btn" v-for="emojiUnicode in emojis[selectedEmojiKey]" :key="emojiUnicode" @click="selectEmoji(emojiUnicode)" type="button">
							{{ getEmoji(emojiUnicode) }}
						</button>
					</div>
					<div class="emoji-category-container">
						<div class="emoji-category" v-for="(_, emojiKey) in emojis" :class="{active: selectedEmojiKey === emojiKey}" :key="emojiKey" @click="selectedEmojiKey = emojiKey">
							{{ getEmoji(emojisCategory[emojiKey]) }}
						</div>
					</div>
				</div>
			</transition>

		</div>
  	`,

	data() {
		return {
			showEmojiPopup: false,
			selectedEmojiKey: "happyEmojis",
			emojisCategory: {
				happyEmojis: 128516,
				sadEmojis: 128532,
				otherEmojis: 8943,
			},
			emojis: {
				happyEmojis: [],
				sadEmojis: [],
				otherEmojis: [],
			},
		};
	},

	created() {
		const emojis = {
			happyEmojis: [
				[128513, 128516],
				[128517, 128519],
				[128521, 128528],
			],
			sadEmojis: [
				[128531, 128534],
				[128545, 128551],
				[128555, 128558],
			],
			otherEmojis: [
				[128568, 128573],
				[128581, 128588],
			],
		};
		for (let emojiType in emojis) {
			for (let emojiRange of emojis[emojiType]) {
				for (let i = emojiRange[0]; i < emojiRange[1]; i++) {
					this.emojis[emojiType].push(i);
				}
			}
		}
	},

	methods: {
		toggleEmojiPopup() {
			this.showEmojiPopup = !this.showEmojiPopup;
		},

		selectEmoji(unicode) {
			this.$emit("emoji-select", this.getEmoji(unicode));
			this.showEmojiPopup = false;
		},

		getEmoji(unicode) {
			return String.fromCodePoint(unicode);
		},
	},
};
