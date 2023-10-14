const ChatInput = {
	components: {
		emojis: Emojis,
	},
	props: ["isShared"],
	template: `
		<form class="chat-input" @submit.prevent="handleSendMsg">
			<textarea
				ref="chatInput"
				class="chat-textarea"
				@input="handleUserTyping"
				:value="message"
				@keydown.enter="handleSendMsg"
				tabindex="0"
				:placeholder="isShared ? l10n.stringWriteYourMessage : l10n.stringShareActivity"
				:disabled="!isShared"
				:class="{ disabled : !isShared }"
			></textarea>
			<div class="chat-group" v-if="isShared">
				<div class="toolbar">
					<button @click="onJournalClick" id="insert-journal" :title="l10n.stringImageTitle" class="toolbutton" type="button"></button>
				</div>
				<emojis @emoji-select="addEmoji"></emojis>
			</div>
			<button :title="l10n.stringSend" type="submit" class="send-btn" :disabled="!isShared">
				<svg width="30" height="50" viewBox="0 0 61 52" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M0.827148 51.0244L60.0745 25.6305L0.827148 0.239258L0.85586 20.8906L36.4136 25.6305L0.85586 30.3731L0.827148 51.0244Z" fill="#282828"/>
				</svg>
			</button>
		</form>
	`,
	data() {
		return {
			message: "",
			l10n: {
				stringSend: "",
				stringShareActivity: "",
				stringWriteYourMessage: "",
				stringImageTitle: "",
			},
		};
	},

	created() {
		this.isUserTyping = false;
		this.prevTypingStatus = false;
		var vm = this;
		window.addEventListener(
			"localized",
			(e) => {
				e.detail.l10n.localize(vm.l10n);
			},
			{ once: true },
		);
	},

	methods: {
		onJournalClick() {
			this.$emit("journal-click");
		},
		addEmoji(emoji) {
			this.message += " " + emoji;
			this.$refs.chatInput.focus();
		},

		stopTyping() {
			this.isUserTyping = false;
			this.checkAndSendTypingStatus();
		},

		handleUserTyping(e) {
			if (e.target.value) this.isUserTyping = true;
			else this.isUserTyping = false;
			this.checkAndSendTypingStatus();
			this.message = e.target.value;
		},

		checkAndSendTypingStatus() {
			if (this.prevTypingStatus !== this.isUserTyping) {
				this.prevTypingStatus = this.isUserTyping;
				this.sentTypingStatus();
			}
		},

		sentTypingStatus() {
			const action = this.isUserTyping ? "start-typing" : "stop-typing";
			this.$emit("send-to-list", null, action);
		},

		handleSendMsg(e) {
			e.preventDefault();
			if (this.message === "") return;

			this.$emit("send-msg", this.message, "text");
			this.message = "";
			this.$refs.chatInput.focus();
			this.stopTyping();
		},
	},
};
