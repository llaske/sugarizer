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
		'toolbar': Toolbar, 'localization': Localization, 'tutorial': Tutorial,
		'template-viewer': TemplateViewer, 'editor': Editor, 'player': Player
	},
	data: {
		currentView: TemplateViewer,
		currentLibrary: null,
		currentTemplate: null,
		currentItem: null,
		color: {stroke:'#00000', fill:'#ffffff'}
	},

	created: function() {
		requirejs(["sugar-web/activity/activity", "sugar-web/env", "activity/palettes/templatepalette"], function(activity, env, templatepalette) {
			// Initialize Sugarizer
			activity.setup();
		});
	},

	mounted: function() {
		// Load last library from Journal
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env"], function(activity, env) {
			env.getEnvironment(function(err, environment) {
					// Use buddy color for background
					env.getEnvironment(function(err, environment) {
						vm.color = environment.user.colorvalue;
						document.getElementById("canvas").style.backgroundColor = vm.color.fill;
					});

				// Load context
				if (environment.objectId) {
					activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
						if (error==null && data!=null) {
							var parsed = JSON.parse(data);
							vm.currentLibrary = parsed.library;
							vm.currentTemplate = parsed.library[parsed.template];
							document.getElementById("template-button").style.backgroundImage = "url(icons/"+vm.currentTemplate.name+".svg)";
							vm.$refs.toolbar.$refs.templatebutton.paletteObject.getPalette().children[0].style.backgroundImage = "url(icons/"+vm.currentTemplate.name+".svg)"; 
						} else {
							vm.currentLibrary = defaultTemplates;
							vm.currentTemplate = defaultTemplates[0];
						}
					});
				} else {
					vm.currentLibrary = defaultTemplates;
					vm.currentTemplate = defaultTemplates[0];
				}
			});
		});

		// Handle resize
		window.addEventListener("resize", function() {
			vm.onResize();
		});

		// Handle unfull screen buttons (b)
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			vm.unfullscreen();
		});
	},

	methods: {

		localized: function() {
			this.$refs.toolbar.localized(this.$refs.localization);
			this.$refs.tutorial.localized(this.$refs.localization);
		},

		displayTemplateView: function() {
			var vm = this;
			vm.$refs.toolbar.$refs.settings.isDisabled = true;
			vm.currentView = TemplateViewer;
			document.getElementById("canvas").style.backgroundColor = vm.color.fill;
			document.getElementById("settings-button").style.backgroundImage = "url(icons/settings.svg)";
		},

		// Handle fullscreen mode
		fullscreen: function() {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			if (vm.currentView === Player) {
				vm.$refs.view.computeSize();
			}
		},
		unfullscreen: function() {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			if (vm.currentView === Player) {
				vm.$refs.view.computeSize();
			}
		},


		// Handle events
		onTemplateSelected: function(template) {
			var vm = this;
			for (var i = 0; i < vm.currentLibrary.length ; i++) { // Save change
				if (vm.currentTemplate == vm.currentLibrary[i]) {
					vm.currentLibrary[i] = vm.currentTemplate;
					break;
				}
			}
			vm.currentTemplate=vm.currentLibrary[template.index];
			vm.displayTemplateView();
		},

		onItemSelected: function(item) {
			if (this.currentView === TemplateViewer) {
				// Load item
				var vm = this;
				vm.$refs.toolbar.$refs.settings.isDisabled = false;
				vm.currentView = Player;
				vm.currentItem = item;
				document.getElementById("canvas").style.backgroundColor = "#ffffff";
			}
		},

		onSettings: function() {
			var vm = this;
			if (vm.currentView === Player) {
				vm.currentView = Editor;
				document.getElementById("settings-button").style.backgroundImage = "url(icons/play.svg)";
			} else {
				vm.currentView = Player;
				document.getElementById("settings-button").style.backgroundImage = "url(icons/settings.svg)";
			}
		},

		onResize: function() {
			var vm = this;
			if (vm.currentView === Player) {
				vm.$refs.view.computeSize();
			}
		},

		onHelp: function() {
			var options = {};
			options.templatebutton = this.$refs.toolbar.$refs.templatebutton.$el;
			options.fullscreenbutton = this.$refs.toolbar.$refs.fullscreen.$el;
			if (this.currentView === TemplateViewer && this.currentTemplate && this.currentTemplate.images && this.currentTemplate.images[0]) {
				options.item = this.$refs.view.$refs.item0[0].$el;
			} else if (this.currentView === Player) {
			}
			this.$refs.tutorial.show(options);
		},

		onStop: function() {
			// Save current library in Journal on Stop
			var vm = this;
			requirejs(["sugar-web/activity/activity"], function(activity) {
				console.log("writing...");
				requirejs(["sugar-web/activity/activity"], function(activity) {
					console.log("writing...");
					var i = 0;
					for (; i < vm.currentLibrary.length ; i++) { // Save change
						if (vm.currentTemplate == vm.currentLibrary[i]) {
							vm.currentLibrary[i] = vm.currentTemplate;
							break;
						}
					}
					var context = {
						library: vm.currentLibrary,
						template: i
					};
					var jsonData = JSON.stringify(context);
					activity.getDatastoreObject().setDataAsText(jsonData);
					activity.getDatastoreObject().save(function(error) {
						if (error === null) {
							console.log("write done.");
						} else {
							console.log("write failed.");
						}
					});
				});
			});
		}
	}
});
