// Rebase require directory
//TODO humane logs
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js",
	},
});

// APP
const app = new Vue({
	el: "#app",
	components: {
		message: Message,
		"chat-input": ChatInput,
		"typing-effect": TypingEffect,
	},

	data: {
		SugarL10n: null,
		SugarPresence: null,
		SugarJournal: null,
		messages: [],
		userInfo: {
			name: "",
			id: "",
			color: "",
		},
		usersTyping: {},
		l10n: {},
		isFullscreen: false,
		isShared: false,
	},

	mounted() {
		this.SugarL10n = this.$refs.SugarL10n;
		this.SugarPresence = this.$refs.SugarPresence;
		this.SugarJournal = this.$refs.SugarJournal;
	},

	methods: {
		initialized() {
			// Launched with a shared id, activity is already shared
			if (window.top.sugar.environment.sharedId) this.isShared = true;
			const currentUser = this.$refs.SugarActivity.getEnvironment().user;
			this.userInfo = {
				name: currentUser.name,
				id: currentUser.networkId,
				color: currentUser.colorvalue,
			};
		},

		localized() {
			this.SugarL10n.localize(this.l10n);
		},

		handleSendFromJournal() {
			var filters = [{ mimetype: "image/png" }, { mimetype: "image/jpeg" }];
			this.SugarJournal.insertFromJournal(filters).then((data, metadata) => {
				if (!data) return;
				this.sendMessage(data, "image");
				this.scrollLatestMsg();
			});
		},

		sendMessage(msgData, msgType) {
			const msg = {
				msg: msgData,
				type: msgType,
				userName: this.userInfo.name,
				userId: this.userInfo.id,
				fill: this.userInfo.color.fill,
				stroke: this.userInfo.color.stroke,
				key: new Date().getTime(),
			};
			this.messages.push(msg);
			this.sendMessageToList(msg, "add-message");
			this.scrollLatestMsg();
		},

		sendMessageToList(content, action) {
			if (!this.SugarPresence.isShared()) return;
			const message = {
				user: this.SugarPresence.getUserInfo(),
				content: content,
				action: action,
			};
			this.SugarPresence.sendMessage(message);
		},

		scrollLatestMsg() {
			setTimeout(() => {
				this.$refs.msgContainer.scrollTop = this.$refs.msgContainer.scrollHeight;
			}, 50);
		},

		deleteMessage(key) {
			this.messages = this.messages.filter((msg) => msg.key !== key);
			this.sendMessageToList(key, "delete-message");
		},

		onNetworkDataReceived(msg) {
			const { name, networkId } = msg.user;
			console.log("Recieved", msg.action);
			switch (msg.action) {
				case "init":
					this.messages = msg.content;
					break;
				case "start-typing":
					this.$set(this.usersTyping, networkId, { name: name });
					break;
				case "stop-typing":
					this.$delete(this.usersTyping, networkId);
					break;
				case "add-message":
					this.messages.push(msg.content);
					this.scrollLatestMsg();
					break;
				case "delete-message":
					const key = msg.content;
					this.messages = this.messages.filter((msg) => msg.key !== key);
					break;
			}
		},

		onNetworkUserChanged(msg) {
			const statusMsg = {
				msg: msg.move,
				type: "status",
				userName: msg.user.name,
				userId: msg.user.networkId,
				fill: msg.user.colorvalue.fill,
				stroke: msg.user.colorvalue.stroke,
				key: new Date().getTime(),
			};
			this.messages.push(statusMsg);
			this.scrollLatestMsg();

			if (msg.move === 1) {
				if (this.SugarPresence.isHost) {
					this.sendMessageToList(this.messages, "init");
				}
				this.$refs.ChatInput.sentTypingStatus();
			} else if (msg.move === -1) {
				if (this.userInfo.id === msg.user.networkId) {
					this.usersTyping = {};
					this.isShared = false;
					return;
				}
				this.$delete(this.usersTyping, msg.user.networkId);
			}
		},

		shouldShowUsername(idx) {
			const prevMsg = this.messages[idx - 1];
			return this.messages[idx].type === "status" || !prevMsg || prevMsg.type === "status" || prevMsg.userId !== this.messages[idx].userId;
		},

		onJournalNewInstance() {},
		onJournalDataLoaded(data, metadata) {
			this.messages = data.messages;
			this.scrollLatestMsg();
		},
		onShared(event, paletteObject) {
			this.SugarPresence.onShared(event, paletteObject);
			this.isShared = true;
		},

		onHelp() {
			const steps = [
				// {
				// 	element: "#export-img-button",
				// 	position: "bottom",
				// 	title: this.l10n.stringSaveImage,
				// 	intro: this.l10n.stringTutoSaveImage,
				// },
			];
			// this.$refs.SugarTutorial.show(steps);
		},
		onStop() {
			this.$refs.SugarJournal.saveData({ messages: this.messages });
		},
	},
});
