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
	data: {
		currentUser: {
			user: {}
		},
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

			var vm = this;
			window.addEventListener('localized', initialLocalization);
			function initialLocalization() {
				vm.displayText = vm.SugarLocalization.l10n.get("Hello", { name: vm.currentenv.user.name });
				vm.SugarLocalization.localize(vm.l10n);
				window.removeEventListener('localized', initialLocalization);
			}
		},

		onAddClick: function () {
			var vm = this;
			this.pawns.push(this.currentenv.user.colorvalue);
			this.drawPawns();
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
		},

		drawPawns: function () {
			/* Pawns are drawn automatically due to the Vue.js DOM updates */

			// Colouring the icons
			this.$nextTick(function () {
				var pawnElements = document.getElementById("pawns").children;
				for (var i = 0; i < pawnElements.length; i++) {
					this.$refs.SugarActivity.colorize(pawnElements[i], this.pawns[i])
				}
			});
		},

		insertBackground: function () {
			this.$refs.SugarJournal.insertFromJournal(['image/png', 'image/jpeg'], function (data, metadata) {
				document.getElementById("app").style.backgroundImage = `url(${data})`;
			})
		},

		localized: function () {
			this.SugarLocalization.localize(this.l10n);
			this.$refs.SugarToolbar.localized(this.SugarLocalization);
			this.$refs.SugarTutorial.localized(this.SugarLocalization);
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
			this.drawPawns();
		},

		onNetworkDataReceived(msg) {
			console.log(msg.content);
			switch (msg.content.action) {
				case 'init':
					this.pawns = msg.content.data;
					this.drawPawns();
					break;
				case 'update':
					this.pawns.push(msg.content.data);
					this.drawPawns();
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
