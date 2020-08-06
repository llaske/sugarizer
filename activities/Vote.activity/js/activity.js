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
		'vote': Vote,
		'history': History
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
				type: "",
				typeVariable: "Text",
				image: 'images/text.png',
				question: "What is your name?",
				results: null
			},
			{
				id: 1,
				type: "",
				typeVariable: "MCQ",
				image: 'images/mcq.png',
				question: "Which number is the largest?",
				options: [
					"Two",
					"Three",
					"Four",
					"Five"
				],
				results: null
			},
			{
				id: 2,
				type: "",
				typeVariable: "Rating",
				image: 'images/rating.png',
				question: "How was the lecture today?",
				results: null
			},
			{
				id: 3,
				type: "",
				typeVariable: "YesNo",
				image: 'images/yesno.png',
				question: "Is this correct?",
				results: null
			},
			{
				id: 4,
				type: "",
				typeVariable: "ImageMCQ",
				image: 'images/image-mcq.png',
				question: "Which sport should we play today?",
				options: [
					"https://image.freepik.com/free-vector/football-match_23-2147510647.jpg",
					"https://cdn.myanimelist.net/s/common/uploaded_files/1458944553-4b7af8f4ae7669de5d0117c62f866e0e.jpeg",
					"https://www.gstindia.com/wp-content/uploads/bfi_thumb/cricket-n36v308u97493zg6wv7qf3800x5adbz6mnqufan1n4.jpg",
					"https://image.shutterstock.com/image-vector/stock-vector-illustration-back-sport-260nw-665547703.jpg"
				],
				results: null
			},
		],
		connectedUsers: {},
		counts: {
			answersCount: 0,
			usersCount: 0
		},
		activePoll: null,
		activePollStatus: '',
		autoStop: false,
		realTimeResults: false,
		history: [],
		openHistoryIndex: null,
		SugarPresence: null,
		l10n: {
			stringHome: '',
			stringSearch: '',
			stringSettings: '',
			stringAdd: '',
			stringRealTimeResults: '',
			stringHistory: '',
			stringDeletePoll: '',
			stringExport: '',
			stringFullscreen: '',
			stringUnfullscreen: ''
		}
	},
	computed: {
		searchQuery() {
			return this.searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}
	},
	mounted() {
		this.SugarPresence = this.$refs.SugarPresence;
	},
	methods: {
		initialized() {
			let currentenv = this.$refs.SugarActivity.getEnvironment();
			this.$set(this.currentUser, 'colorvalue', currentenv.user.colorvalue);
			this.$set(this.currentUser, 'name', currentenv.user.name);
			this.$set(this.currentUser, 'networkId', currentenv.user.networkId);
			this.$set(this.currentUser, 'handRaised', false);
			this.$set(this.currentUser, 'answer', null);
		},

		localized() {
			let vm = this;
			this.$refs.SugarL10n.localize(this.l10n);
			for(let poll of this.polls) {
				poll.type = this.$refs.SugarL10n.get(poll.typeVariable);
			}
		},

		startPoll(pollId) {
			let index = this.polls.findIndex((poll) => {
				return poll.id == pollId;
			});
			this.activePoll = this.polls[index];
			this.activePollStatus = 'running';
			this.currentView = "poll-stats";
			document.getElementById('shared-button').click();

			if(Object.keys(this.connectedUsers).length > 0) {
				this.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'start-poll',
						data: {
							activePoll: this.activePoll
						}
					}
				});
			}
		},

		stopPoll() {
			this.activePollStatus = 'finished';

			this.SugarPresence.sendMessage({
				user: this.SugarPresence.getUserInfo(),
				content: {
					action: 'stop-poll'
				}
			});
		},

		switchRealTimeResults() {
			this.realTimeResults = !this.realTimeResults;

			this.SugarPresence.sendMessage({
				user: this.SugarPresence.getUserInfo(),
				content: {
					action: 'switch-real-time',
					data: {
						realTimeResults: this.realTimeResults
					}
				}
			});
		},

		onHandRaiseSwitched(value) {
			this.$set(this.currentUser, 'handRaised', value);
			this.SugarPresence.sendMessage({
				user: this.SugarPresence.getUserInfo(),
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
				user: this.SugarPresence.getUserInfo(),
				content: {
					action: 'vote-submitted',
					data: {
						answer: answer
					}
				}
			});
		},

		updateCounts(counts) {
			this.counts.answersCount = counts.answersCount;
			this.counts.usersCount = counts.usersCount;
		},

		updateResults(answers) {
			this.activePoll.results = new Object();
			this.$set(this.activePoll.results, 'answers', answers);
			this.$set(this.activePoll.results, 'counts', JSON.parse(JSON.stringify(this.counts)));

			this.SugarPresence.sendMessage({
				user: this.SugarPresence.getUserInfo(),
				content: {
					action: 'update-results',
					data: {
						results: this.activePoll.results
					}
				}
			});
		},

		saveToHistory() {
			this.history.push({
				...this.activePoll,
				endTime: Date.now()
			});
			console.log('Saved to history');
		},

		setOpenHistoryIndex(index) {
			this.openHistoryIndex = index;
		},

		deleteHistoryPoll() {
			this.history.splice(this.openHistoryIndex, 1);
			this.openHistoryIndex = null;
		},

		onAddClick() {

		},

		goBackTo(view) {
			if(view == 'polls-grid') {
				this.activePoll = null;
				this.activePollStatus = '';
				this.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'clear-poll'
					}
				});
				// Clear answers for all connected users
				for(let id in this.connectedUsers) {
					this.$set(this.connectedUsers[id], 'answer', null);
				}
				this.counts.answersCount = 0;
				// Clear results from poll templates
				for(let poll of this.polls) {
					this.$set(poll, 'results', null);
				}
			}
			this.currentView = view;
		},

		onJournalDataLoaded: function (data, metadata) {
			this.polls = data.polls;
			this.realTimeResults = data.realTimeResults;
			this.history = data.history;
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
					this.activePollStatus = msg.content.data.activePollStatus;
					this.realTimeResults = msg.content.data.realTimeResults;
					break;
				case 'init-existing':
					if(this.activePoll == null) {
						console.log('init-existing');
						this.activePoll = msg.content.data.activePoll;
						this.activePollStatus = msg.content.data.activePollStatus;
						this.realTimeResults = msg.content.data.realTimeResults;
						this.counts.answersCount = msg.content.data.counts.answersCount;
						this.counts.usersCount = msg.content.data.counts.usersCount;
						this.currentUser.handRaised = msg.content.data.handRaised;
						if(msg.content.data.answer) {
							this.currentUser.answer = msg.content.data.answer;
						}
					}
					break;
				case 'switch-real-time':
					console.log('switch-real-time');
					this.realTimeResults = msg.content.data.realTimeResults;
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
				case 'update-counts':
					console.log('update-counts');
					this.counts.answersCount = msg.content.data.counts.answersCount;
					this.counts.usersCount = msg.content.data.counts.usersCount;
					break;
				case 'update-results':
					console.log('update-results');
					this.activePoll.results = msg.content.data.results;
					break;
				case 'start-poll':
					console.log('start-poll');
					this.activePoll = msg.content.data.activePoll;
					this.activePollStatus = 'running';
					break;
				case 'stop-poll':
					console.log('stop-poll');
					this.activePollStatus = 'finished';
					break;
				case 'clear-poll':
					console.log('clear-poll');
					this.activePoll = null;
					this.activePollStatus = '';
					this.currentUser.answer = null;
					this.currentUser.handRaised = false;
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
										activePollStatus: this.activePollStatus,
										realTimeResults: this.realTimeResults,
										counts: this.counts,
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
										activePollStatus: this.activePollStatus,
										realTimeResults: this.realTimeResults,
										counts: this.counts,
										handRaised: this.connectedUsers[msg.user.networkId].handRaised
									}
								}
							});
						}
						
					} else {
						this.$set(this.connectedUsers, msg.user.networkId, msg.user);
						this.$set(this.connectedUsers[msg.user.networkId], 'handRaised', false);
						this.$set(this.connectedUsers[msg.user.networkId], 'answer', null);
						
						this.SugarPresence.sendMessage({
							user: this.SugarPresence.getUserInfo(),
							content: {
								action: 'init-new',
								data: {
									activePoll: this.activePoll,
									activePollStatus: this.activePollStatus,
									realTimeResults: this.realTimeResults,
								}
							}
						});
					}
				}
			} else {
				console.log(msg);
			}
		},

		onStop() {
			var context = {
				polls: this.polls,
				realTimeResults: this.realTimeResults,
				history: this.history
			};
			this.$refs.SugarJournal.saveData(context);
		}
	}
});
