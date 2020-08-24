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
		'history': History,
		'poll-settings': PollSettings
	},
	data: {
		currentUser: {},
		settings: false,
		currentView: "",
		searchText: "",
		polls: [
			{
				id: 0,
				type: "",
				typeVariable: "YesNo",
				image: 'images/yesno.png',
				question: "DefaultPollYesNo",
				results: null
			},
			{
				id: 1,
				type: "",
				typeVariable: "Rating",
				image: 'images/rating.png',
				question: "DefaultPollRating",
				results: null
			},
			{
				id: 2,
				type: "",
				typeVariable: "MCQ",
				image: 'images/mcq.png',
				question: "DefaultPollMCQ",
				options: [
					"DefaultPollMCQOption0",
					"DefaultPollMCQOption1",
					"DefaultPollMCQOption2",
					"DefaultPollMCQOption3",
					"DefaultPollMCQOption4",
					"DefaultPollMCQOption5",
					"DefaultPollMCQOption6"
				],
				results: null
			},
			{
				id: 3,
				type: "",
				typeVariable: "Text",
				image: 'images/text.png',
				question: "DefaultPollText",
				results: null
			},
			{
				id: 4,
				type: "",
				typeVariable: "ImageMCQ",
				image: 'images/image-mcq.png',
				question: "DefaultPollImageMCQ",
				options: [
					"images/dog.png",
					"images/cat.png",
					"images/dolphin.png",
					"images/panda.png",
					"images/bear.png",
					"images/rabbit.png",
				],
				results: null
			},
		],
		connectedUsers: {},
		counts: {
			answersCount: 0,
			usersCount: 0
		},
		hostContext: null,
		activePoll: null,
		activePollStatus: '',
		autoStop: false,
		firstPollCompleted: false,
		realTimeResults: false,
		history: [],
		openHistoryIndex: null,
		exporting: '',
		SugarPresence: null,
		l10n: {
			stringHome: '',
			stringSearch: '',
			stringSettings: '',
			stringAdd: '',
			stringRealTimeResults: '',
			stringAutoStop: '',
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
	watch: {
		currentView: function (newVal, oldVal) {
			// Close all open palettes
			for (var palette of document.getElementsByClassName('palette')) {
				palette.style.visibility = 'hidden';
			}
			this.searchText = "";
		},
		settings: function (newVal, oldVal) {
			if(!newVal) {
				this.updateHostContextForConnected();
			}
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
				poll.question = this.$refs.SugarL10n.get(poll.question);
				if(poll.typeVariable == "MCQ") {
					for(let i=0; i<poll.options.length; i++) {
						poll.options[i] = this.$refs.SugarL10n.get(poll.options[i]);
					}
				}
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
			if(!this.firstPollCompleted) {
				this.firstPollCompleted = true;
				this.autoStop = true;
			}

			this.SugarPresence.sendMessage({
				user: this.SugarPresence.getUserInfo(),
				content: {
					action: 'stop-poll'
				}
			});
		},

		clearPoll() {
			this.activePoll = null;
			this.activePollStatus = '';
			this.currentUser.answer = null;
			this.currentUser.handRaised = false;
		},

		onUpdatePolls(polls) {
			this.polls = polls;
		},

		onPollAdded(pollId) {
			this.settings = false;
			this.currentView = 'polls-grid';
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
			this.updateHostContextForConnected();
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
			this.currentView = 'poll-settings';
		},

		editPoll: function (pollId) {
			let index = this.polls.findIndex(poll => {
				return poll.id == pollId;
			});
			this.activePoll = this.polls[index];
			this.activePollStatus = "editing";
			this.currentView = 'poll-settings';
		},

		goBackTo(view) {
			if(view == 'polls-grid') {
				this.activePoll = null;
				this.activePollStatus = '';
				
				if(this.SugarPresence.isConnected()) {
					this.SugarPresence.sendMessage({
						user: this.SugarPresence.getUserInfo(),
						content: {
							action: 'clear-poll'
						}
					});
				}
				// Clear answers for all connected users
				for(let id in this.connectedUsers) {
					this.$set(this.connectedUsers[id], 'answer', null);
					this.$set(this.connectedUsers[id], 'handRaised', false);
				}
				this.counts.answersCount = 0;
				// Remove users who left
				if(this.SugarPresence.isConnected()) {
					this.removeUsersNotConnected();
				}
				// Clear results from poll templates
				for(let poll of this.polls) {
					this.$set(poll, 'results', null);
				}
			}
			this.currentView = view;
		},

		removeUsersNotConnected() {
			let stillConnected = {};
			let sharedId = this.SugarPresence.presence.sharedInfo.id;
			let vm = this;
			this.SugarPresence.presence.listSharedActivityUsers(sharedId, function(users) {
				for (var i = 0 ; i < users.length ; i++) {
					stillConnected[users[i].networkId] = true;	
				}
				for(let networkId in vm.connectedUsers) {
					if(!stillConnected[networkId]) {
						vm.$delete(vm.connectedUsers, networkId);
					}
				}
			});
		},

		updateHostContextForConnected() {
			let context = {
				id: this.currentUser.networkId,
				polls: this.polls,
				realTimeResults: this.realTimeResults,
				history: this.history
			}

			this.SugarPresence.sendMessage({
				user: this.SugarPresence.getUserInfo(),
				content: {
					action: 'update-host-context',
					data: {
						hostContext: context
					}
				}
			});
		},

		onExportFormatSelected: function(event) {
			this.exporting = event.format;
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
			// To handle a case where a non-host joins a shared instance
			this.activePollStatus = 'no-host';
		},

		onNetworkDataReceived: function (msg) {
			switch(msg.content.action) {
				case 'init-new':
					console.log('init-new');
					this.activePoll = msg.content.data.activePoll;
					this.activePollStatus = msg.content.data.activePollStatus;
					this.realTimeResults = msg.content.data.realTimeResults;
					this.hostContext = msg.content.data.hostContext;
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
						this.hostContext = msg.content.data.hostContext;
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
					this.clearPoll();
					break;
				case 'restore-host':
					console.log('restore-host');
					this.clearPoll();
					if(this.currentUser.networkId == msg.content.data.hostContext.id) {
						this.history = msg.content.data.hostContext.history;
						this.polls = msg.content.data.hostContext.polls;
						this.realTimeResults = msg.content.data.hostContext.realTimeResults;

						let sharedId = this.SugarPresence.presence.sharedInfo.id;
						this.SugarPresence.presence.listSharedActivityUsers(sharedId, (users) => {
							for (var i = 0 ; i < users.length ; i++) {
								if(users[i].networkId != this.currentUser.networkId) {
									this.$set(this.connectedUsers, users[i].networkId, users[i]);
									this.$set(this.connectedUsers[users[i].networkId], 'handRaised', false);
									this.$set(this.connectedUsers[users[i].networkId], 'answer', null);
								}
							}
							this.SugarPresence.isHost = true;
							this.currentView = "polls-grid";
						});
					}
					break;
				case 'update-host-context': 
					console.log('update-host-context');
					if(!this.SugarPresence.isHost) {
						this.hostContext = msg.content.data.hostContext;
					}
			}
		},

		onNetworkUserChanged: function (msg) {
			if (msg.move == 1) {
				if(this.SugarPresence.isHost) {
					let context = {
						id: this.currentUser.networkId,
						polls: this.polls,
						realTimeResults: this.realTimeResults,
						history: this.history
					}
					// Host
					if(this.connectedUsers[msg.user.networkId] != null) {
						// User joined before
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
										answer: this.connectedUsers[msg.user.networkId].answer,
										hostContext: context
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
										handRaised: this.connectedUsers[msg.user.networkId].handRaised,
										hostContext: context
									}
								}
							});
						}
						
					} else {
						// User joined for the first time
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
									hostContext: context
								}
							}
						});
					}
				} else {
					// First connected user will send hostContext
					if(!this.SugarPresence.isHost && this.hostContext.id ==  msg.user.networkId) {
						let sharedId = this.SugarPresence.presence.sharedInfo.id;
						this.SugarPresence.presence.listSharedActivityUsers(sharedId, (users) => {
							if(users.length == 0) return;
	
							let firstUserId = users[0].networkId;
							if(this.currentUser.networkId == firstUserId) {
								this.SugarPresence.sendMessage({
									user: this.SugarPresence.getUserInfo(),
									content: {
										action: 'restore-host',
										data: {
											hostContext: this.hostContext
										}
									}
								});
								// restore-host won't be received by this user
								this.clearPoll();
							}
						});
					}
				}
			} else {
				if(this.SugarPresence.isHost && this.connectedUsers[msg.user.networkId].answer == null) {
					this.$delete(this.connectedUsers, msg.user.networkId);
				}
				if(!this.SugarPresence.isHost && msg.user.networkId == this.hostContext.id) {
					console.log('no-host');
					this.clearPoll();
					this.activePollStatus = 'no-host';
				}
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
