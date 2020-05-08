// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
let app = new Vue({
	el: '#app',
	components: {
		'toolbar': Toolbar, 'toolbar-item': ToolbarItem, 'localization': Localization, 'tutorial': Tutorial,
		'presence': Presence, 'journal': Journal
	},
	data: {
		currentUser: {
			user: {}
		},
		full: false,
		context: null,
		presence: null,
		icon: null,
		pawns: [],
		l10n: {
			stringHello: '',
			stringPlayed: '',
			stringAddPawn: ''
		}
	},
	mounted: function () {
		// this.presence = this.$refs.presence.presence;

		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon"], function (activity, env, icon) {
			// Initialize Sugarizer
			activity.setup();
			
			env.getEnvironment(function (err, environment) {
				document.getElementById("user").innerHTML = "<h1>"+vm.l10n.stringHello+" "+environment.user.name+"!</h1>";
				vm.currentenv = environment;
			});

			vm.icon = icon;
		});

		// Handle unfull screen buttons (b)
		document.getElementById("unfullscreen-button").addEventListener('click', function () {
			vm.unfullscreen();
		});
	},

	methods: {

		onAddClick: function() {
			let vm = this;
			this.pawns.push(this.currentenv.user.colorvalue);
			this.drawPawns();

			if (this.presence) {
				this.presence.sendMessage(this.presence.getSharedInfo().id, {
					user: this.presence.getUserInfo(),
					content: {
						action: 'update',
						data: this.currentenv.user.colorvalue
					}
				});
			}
		},

		drawPawns: function() {
			/* Pawns are drawn automatically due to the Vue.js DOM updates */

			// Colouring the icons
			this.$nextTick(function() {
				let pawnElements = document.getElementById("pawns").children;
				for(let i=0; i<pawnElements.length; i++) {
					this.icon.colorize(pawnElements[i], this.pawns[i])
				}
			});
		},

		localized: function () {
			this.$refs.localization.localize(this.l10n);
			this.$refs.toolbar.localized(this.$refs.localization);
			this.$refs.tutorial.localized(this.$refs.localization);
		},

		// Handle fullscreen mode
		fullscreen: function () {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			this.full = true;
		},
		unfullscreen: function () {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			this.full = false;
		},

		onHelp: function (type) {
			this.$refs.tutorial.show(type);
		}
	}
});
