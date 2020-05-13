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
		'localization': Localization, 
		'tutorial': Tutorial,
		'journal': Journal, 
		'presence': Presence
	},
	data: {
		currentUser: {
			user: {}
		},
		presence: null,
		journal: null,
		localization: null,
		icon: null,
		displayText: '',
		pawns: [],
		l10n: {
			stringHello: '',
			stringPlayed: '',
			stringAddPawn: ''
		}
	},
	mounted: function () {
		this.presence = this.$refs.presence;
		this.journal = this.$refs.journal;
		this.localization = this.$refs.localization;

		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon"], function (activity, env, icon) {
			// Initialize Sugarizer
			activity.setup();

			env.getEnvironment(function (err, environment) {
				vm.displayText = vm.l10n.stringHello + " " + environment.user.name + "!";
				vm.currentenv = environment;
			});

			vm.icon = icon;
		});
	},

	methods: {

		onAddClick: function() {
			var vm = this;
			this.pawns.push(this.currentenv.user.colorvalue);
			this.drawPawns();
			this.displayText = this.currentenv.user.name + " " + this.l10n.stringPlayed + "!";

			if (this.presence && this.presence.presence) {
				var message = {
					user: this.presence.getUserInfo(),
					content: {
						action: 'update',
						data: this.currentenv.user.colorvalue
					}
				}
				this.presence.sendMessage(message);
			}
		},

		drawPawns: function() {
			/* Pawns are drawn automatically due to the Vue.js DOM updates */

			// Colouring the icons
			this.$nextTick(function() {
				var pawnElements = document.getElementById("pawns").children;
				for(var i=0; i<pawnElements.length; i++) {
					this.icon.colorize(pawnElements[i], this.pawns[i])
				}
			});
		},

		insertBackground: function() {
			this.journal.insertFromJournal(['image/png', 'image/jpeg'], function(data, metadata) {
				document.getElementById("app").style.backgroundImage = `url(${data})`;
			})
		},

		localized: function () {
			this.$refs.localization.localize(this.l10n);
			this.$refs.toolbar.localized(this.$refs.localization);
			this.$refs.tutorial.localized(this.$refs.localization);
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
					this.displayText = msg.user.name + " " + this.l10n.stringPlayed + "!";
					break;
			}
		},

		onNetworkUserChanged(msg) {
			// If user joins
			if (msg.move == 1) {
				// Handling only by the host
				if (this.presence.isHost) {
					this.presence.sendMessage({
						user: this.presence.getUserInfo(),
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

		onHelp: function (type) {
			this.$refs.tutorial.show(type);
		},

		onStop: function () {
			// Save current pawns in Journal on Stop
			var context = {
				pawns: this.pawns
			};
			this.journal.saveData(context);
    }
	}
});
