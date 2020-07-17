// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
var app = new Vue({
	el: '#app',
	components: {
		'polls-grid': PollsGrid,
		'poll-stats': PollStats,
		'vote': Vote
	},
	data: {
		currentUser: {},
		sharedInstance: false,
		settings: false,
		currentView: "",
		searchText: "",
		polls: [
			{
				id: 0,
				type: "text",
				question: "What is your age?",
			},
			{
				id: 1,
				type: "mcq",
				question: "Which number is the largest?",
				options: [
					"2",
					"3",
					"4",
					"5"
				]
			},
		],
		connectedUsers: {},
		activePoll: null,
		answeredActivePoll: false,
		SugarPresence: null,
		l10n: {
			stringSearch: '',
			stringSettings: '',
			stringAdd: '',
			stringExport: '',
			stringFullscreen: '',
			stringUnfullscreen: ''
		}
	},
	computed: {
		searchQuery: function() {
			return this.searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}
	},
	mounted: function () {
		this.SugarPresence = this.$refs.SugarPresence;
	},
	methods: {
		initialized: function () {
			let currentenv = this.$refs.SugarActivity.getEnvironment();
			this.$set(this.currentUser, 'colorvalue', currentenv.user.colorvalue);
			this.$set(this.currentUser, 'name', currentenv.user.name);
			this.$set(this.currentUser, 'networkId', currentenv.user.networkId);
			this.$set(this.currentUser, 'handRaised', false);
			this.$set(this.currentUser, 'answer', null);
		},

		localized: function () {
			let vm = this;
			this.$refs.SugarL10n.localize(this.l10n);
		},

		startPoll(pollId) {
			let index = this.polls.findIndex((poll) => {
				return poll.id == pollId;
			});
			this.activePoll = this.polls[index];
			this.currentView = "poll-stats";
			document.getElementById('shared-button').click();
		},

		onHandRaiseSwitched(value) {
			this.$set(this.currentUser, 'handRaised', value);
			this.SugarPresence.sendMessage({
				user: this.$root.$refs.SugarPresence.getUserInfo(),
				content: {
					action: 'hand-raise-switched',
					data: {
						value: value
					}
				}
			});
		},

		onVoteSubmitted(answer) {
			this.$set(this.currentUser, 'answer', answer);
			this.SugarPresence.sendMessage({
				user: this.$root.$refs.SugarPresence.getUserInfo(),
				content: {
					action: 'vote-submitted',
					data: {
						answer: answer
					}
				}
			});
		},

		onAddClick() {

		},

		goBackTo(view) {

		},

		onJournalDataLoaded: function (data, metadata) {
			this.polls = data.polls;
			this.currentView = "polls-grid";
		},

		onJournalNewInstance: function (error) {
			this.currentView = "polls-grid";
		},

		onJournalSharedInstance: function () {
			this.currentView = "vote";
		},

		onNetworkDataReceived: function (msg) {
			switch(msg.content.action) {
				case 'init-new':
					console.log('init-new');
					this.activePoll = msg.content.data.activePoll;
					break;
				case 'init-existing':
					console.log('init-existing');
					this.activePoll = msg.content.data.activePoll;
					this.currentUser.handRaised = msg.content.data.handRaised;
					if(msg.content.data.answer) {
						this.currentUser.answer = msg.content.data.answer;
					}
					break;
				case 'hand-raise-switched':
					if(this.SugarPresence.isHost) {
						console.log('hand-raise-switched');
						this.connectedUsers[msg.user.networkId].handRaised = msg.content.data.value;
					}
					break;
				case 'vote-submitted':
					if(this.SugarPresence.isHost) {
						console.log('vote-submitted');
						this.connectedUsers[msg.user.networkId].answer = msg.content.data.answer;
					}
					break;
			}
		},

		onNetworkUserChanged: function (msg) {
			if (msg.move == 1) {
				if(this.SugarPresence.isHost) {
					if(this.connectedUsers[msg.user.networkId] != null) {
						if(this.connectedUsers[msg.user.networkId].answer != null) {
							this.SugarPresence.sendMessage({
								user: this.SugarPresence.getUserInfo(),
								content: {
									action: 'init-existing',
									data: {
										activePoll: this.activePoll,
										handRaised: this.connectedUsers[msg.user.networkId].handRaised,
										answer: this.connectedUsers[msg.user.networkId].answer
									}
								}
							});
						} else {
							this.SugarPresence.sendMessage({
								user: this.SugarPresence.getUserInfo(),
								content: {
									action: 'init-existing',
									data: {
										activePoll: this.activePoll,
										handRaised: this.connectedUsers[msg.user.networkId].handRaised
									}
								}
							});
						}
						
					} else {
						this.connectedUsers[msg.user.networkId] = msg.user;
						this.connectedUsers[msg.user.networkId].handRaised = false;
						this.connectedUsers[msg.user.networkId].answer = null;
						this.SugarPresence.sendMessage({
							user: this.SugarPresence.getUserInfo(),
							content: {
								action: 'init-new',
								data: {
									activePoll: this.activePoll
								}
							}
						});
					}
				}
			} else {
				console.log(msg);
			}
			console.log(this.connectedUsers);
		},

		onStop() {
			var context = {
				polls: this.polls
			};
			this.$refs.SugarJournal.saveData(context);
		}
	}
});
