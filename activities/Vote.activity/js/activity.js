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
		'voting': Voting
	},
	data: {
		currentenv: null,
		sharedInstance: false,
		settings: false,
		currentView: "",
		searchText: "",
		polls: [
			{
				id: 0,
				type: "word",
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
		activePoll: null,
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
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
		},

		localized: function () {
			let vm = this;
			this.$refs.SugarL10n.localize(this.l10n);
		},

		startPoll(pollId) {
			console.log('start poll: ', pollId);
			let index = this.polls.findIndex((poll) => {
				return poll.id == pollId;
			});
			this.activePoll = this.polls[index];
			this.currentView = "poll-stats";
			document.getElementById('shared-button').click();
		},

		onAddClick() {

		},

		goBackTo(view) {

		},

		onJournalDataLoaded: function (data, metadata) {
			console.log('Existing instance');
			this.polls = data.polls;
			this.currentView = "polls-grid";
		},

		onJournalNewInstance: function (error) {
			this.currentView = "polls-grid";
		},

		onJournalSharedInstance: function () {
			this.currentView = "voting";
		},

		onNetworkDataReceived: function (msg) {
			switch(msg.content.action) {
				case 'init':
					console.log('init')
					break;
			}
		},

		onNetworkUserChanged: function (msg) {
			if (msg.move == 1 && this.SugarPresence.isHost) {
				this.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'init',
						data: {
							activePoll: this.activePoll,
						}
					}
				});
			}
		},

		onStop() {
			var context = {
				polls: this.polls
			};
			this.$refs.SugarJournal.saveData(context);
		}
	}
});
