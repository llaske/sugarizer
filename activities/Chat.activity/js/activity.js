// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js",
	},
});

// APP
const app = Vue.createApp({
	components: {
		message: Message,
		"chat-input": ChatInput,
		"typing-effect": TypingEffect,
		"sugar-activity": SugarActivity,
		"sugar-toolitem": SugarToolitem,
		"sugar-toolbar": SugarToolbar,
		"sugar-journal": SugarJournal,
		"sugar-localization": SugarLocalization,
		"sugar-presence": SugarPresence,
		"sugar-tutorial": SugarTutorial,
		"sugar-icon": SugarIcon,
		"sugar-popup": SugarPopup,
	},

	data: function () {
		return {
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
			l10n: {
				stringTutoExplainTitle: "",
				stringTutoExplainContent: "",
				stringTutoNetworkTitle: "",
				stringTutoNetworkContent: "",
				stringTutoClearChat: "",
				stringTutoClearChatContent: "",
				stringTutoStopTitle: "",
				stringTutoStopContent: "",
				stringTutoMessageTitle: "",
				stringTutoMessageContent: "",
				stringTutoEmojisContent: "",
				stringImageTitle: "",
				stringTutoImageContent: "",
				stringFullscreen: "",
				stringJoin: "",
				stringLeave: "",
				stringChat: "",
				stringNewMsgFrom: "",
			},
			isFullscreen: false,
			isShared: false,
		};
	},

	created() {
		var vm = this;
		window.addEventListener(
			"localized",
			(e) => {
				e.detail.l10n.localize(vm.l10n);
			},
			{ once: true },
		);
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

		handleSendFromJournal() {
			var filters = [{ mimetype: "image/png" }, { mimetype: "image/jpeg" }];
			this.SugarJournal.insertFromJournal(filters).then((data, metadata) => {
				if (!data) return;
				this.sendMessage(data, "image");
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

		handleNetworkMessage(msgRecieved) {
			const distanceFromBottom = this.$refs.msgContainer.scrollHeight - this.$refs.msgContainer.scrollTop - this.$refs.msgContainer.clientHeight;
			if (distanceFromBottom < 100) this.scrollLatestMsg();
			else {
				switch (msgRecieved.msg) {
					case 1:
						this.$refs.SugarPopup.log(`${msgRecieved.userName} ${this.l10n.stringJoin} ${this.l10n.stringChat}`)
						break;
					case -1:
						this.$refs.SugarPopup.log(`${msgRecieved.userName} ${this.l10n.stringLeave} ${this.l10n.stringChat}`)
						break;
					default:
						this.$refs.SugarPopup.log(this.l10n.stringNewMsgFrom + " " + msgRecieved.userName)
						break;
				}
			}
			this.messages.push(msgRecieved);
		},

		deleteMessage(key) {
			this.messages = this.messages.filter((msg) => msg.key !== key);
			this.sendMessageToList(key, "delete-message");
		},

		clearHistory() {
			this.messages = [];
		},

		onNetworkDataReceived(msg) {
			const { name, networkId } = msg.user;
			console.log("Recieved", msg.action);
			switch (msg.action) {
				case "init":
					this.messages = msg.content;
					break;
				case "start-typing":
					this.usersTyping[networkId] = { name: name };
					break;
				case "stop-typing":
					delete this.usersTyping[networkId];
					break;
				case "add-message":
					this.handleNetworkMessage(msg.content);
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
			this.handleNetworkMessage(statusMsg);

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
				delete this.usersTyping[msg.user.networkId];
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
				{
					title: this.l10n.stringTutoExplainTitle,
					intro: this.l10n.stringTutoExplainContent,
				},
				{
					element: "#network-button",
					position: "bottom",
					title: this.l10n.stringTutoNetworkTitle,
					intro: this.l10n.stringTutoNetworkContent,
				},
				{
					element: "#clear-button",
					position: "bottom",
					title: this.l10n.stringTutoClearChat,
					intro: this.l10n.stringTutoClearChatContent,
				},
				{
					element: "#stop-button",
					position: "bottom",
					title: this.l10n.stringTutoStopTitle,
					intro: this.l10n.stringTutoStopContent,
				},
				{
					element: ".chat-input",
					title: this.l10n.stringTutoMessageTitle,
					intro: this.l10n.stringTutoMessageContent,
				},
			];
			if (this.isShared)
				steps.push(
					{
						element: "#insert-journal",
						title: this.l10n.stringImageTitle,
						intro: this.l10n.stringTutoImageContent,
					},
					{
						element: ".emojis-container",
						title: "Emojis",
						intro: this.l10n.stringTutoEmojisContent,
					},
				);
			this.$refs.SugarTutorial.show(steps);
		},

		onStop() {
			this.$refs.SugarJournal.saveData({ messages: this.messages });
		},
	},
});

app.mount("#app");
