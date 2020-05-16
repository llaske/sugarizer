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
		'pawn': Pawn
	},
	data: {
		currentenv: null,
		SugarPresence: null,
		SugarLocalization: null,
		displayText: '',
		pawns: [],
		l10n: {
			stringAddPawn: ''
		}
	},
	mounted: function () {
		this.SugarPresence = this.$refs.SugarPresence;
		this.SugarLocalization = this.$refs.SugarLocalization;
	},

	methods: {

		initializeActivity: function () {
			// Initialize Sugarizer
			this.$refs.SugarActivity.setup();
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
			this.SugarLocalization.$on('localized', this.localized());
		},

		localized: function () {
			this.displayText = this.SugarLocalization.get("Hello", { name: this.currentenv.user.name });
			this.SugarLocalization.localize(this.l10n);
		},

		onAddClick: function (event) {
			var vm = this;
			for (var i = 0; i < event.count; i++) {
				this.pawns.push(this.currentenv.user.colorvalue);
				this.displayText = this.SugarLocalization.get("Played", { name: this.currentenv.user.name });

				if (this.SugarPresence && this.SugarPresence.isConnected()) {
					var message = {
						user: this.SugarPresence.getUserInfo(),
						content: {
							action: 'update',
							data: this.currentenv.user.colorvalue
						}
					}
					this.SugarPresence.sendMessage(message);
				}
			}
		},

		insertBackground: function () {
			this.$refs.SugarJournal.insertFromJournal(['image/png', 'image/jpeg'], function (data, metadata) {
				document.getElementById("app").style.backgroundImage = `url(${data})`;
			})
		},

		fullscreen: function () {
			this.$refs.SugarToolbar.hide();
			// Add more code here
		},

		unfullscreen: function () {
			this.$refs.SugarToolbar.show();
			// Add more code here
		},

		onJournalDataLoaded(data, metadata) {
			this.pawns = data.pawns;
		},

		onNetworkDataReceived(msg) {
			console.log(msg.content);
			switch (msg.content.action) {
				case 'init':
					this.pawns = msg.content.data;
					break;
				case 'update':
					this.pawns.push(msg.content.data);
					this.displayText = this.SugarLocalization.get("Played", { name: msg.user.name });
					break;
			}
		},

		onNetworkUserChanged(msg) {
			// If user joins
			if (msg.move == 1) {
				// Handling only by the host
				if (this.SugarPresence.isHost) {
					this.SugarPresence.sendMessage({
						user: this.SugarPresence.getUserInfo(),
						content: {
							action: 'init',
							data: this.pawns
						}
					});
				}
			}
			// If user leaves
			else {

			}
		},

		onHelp: function () {
			var steps = [
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: "stringTutoExplainTitle",
					content: "stringTutoExplainContent"
				},
				{
					element: "#add-button",
					placement: "right",
					title: "stringTutoAddTitle",
					content: "stringTutoAddContent"
				},
				{
					element: "#insert-button",
					placement: "bottom",
					title: "stringTutoBackgroundTitle",
					content: "stringTutoBackgroundContent"
				}
			];
			this.$refs.SugarTutorial.show(steps);
		},

		onStop: function () {
			// Save current pawns in Journal on Stop
			var context = {
				pawns: this.pawns
			};
			this.$refs.SugarJournal.saveData(context);
		}
	}
});
