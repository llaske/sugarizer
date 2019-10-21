// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Default templates
var defaultTemplates = [
	{
		name: "template-lower",
		images: [
			{image:"icons/lower-a.svg"},
			{image:"icons/lower-b.svg"},
			{image:"icons/lower-c.svg", starts: [{x:108, y:87}]},
			{image:"icons/lower-d.svg"},
			{image:"icons/lower-e.svg"},
			{image:"icons/lower-f.svg"},
			{image:"icons/lower-g.svg"},
			{image:"icons/lower-h.svg"},
			{image:"icons/lower-i.svg"},
			{image:"icons/lower-j.svg"},
			{image:"icons/lower-k.svg"},
			{image:"icons/lower-l.svg"},
			{image:"icons/lower-m.svg"},
			{image:"icons/lower-n.svg"},
			{image:"icons/lower-o.svg"},
			{image:"icons/lower-p.svg"},
			{image:"icons/lower-q.svg"},
			{image:"icons/lower-r.svg"},
			{image:"icons/lower-s.svg"},
			{image:"icons/lower-t.svg"},
			{image:"icons/lower-u.svg"},
			{image:"icons/lower-v.svg"},
			{image:"icons/lower-w.svg"},
			{image:"icons/lower-x.svg"},
			{image:"icons/lower-y.svg"},
			{image:"icons/lower-z.svg"}
		]
	},
	{
		name: "template-upper",
		images: [
			{image:"icons/upper-a.svg"},
			{image:"icons/upper-b.svg"},
			{image:"icons/upper-c.svg"},
			{image:"icons/upper-d.svg"},
			{image:"icons/upper-e.svg"},
			{image:"icons/upper-f.svg"},
			{image:"icons/upper-g.svg"},
			{image:"icons/upper-h.svg", starts: [{x:97, y:65}]},
			{image:"icons/upper-i.svg"},
			{image:"icons/upper-j.svg"},
			{image:"icons/upper-k.svg"},
			{image:"icons/upper-l.svg"},
			{image:"icons/upper-m.svg"},
			{image:"icons/upper-n.svg"},
			{image:"icons/upper-o.svg"},
			{image:"icons/upper-p.svg"},
			{image:"icons/upper-q.svg"},
			{image:"icons/upper-r.svg"},
			{image:"icons/upper-s.svg"},
			{image:"icons/upper-t.svg"},
			{image:"icons/upper-u.svg"},
			{image:"icons/upper-v.svg"},
			{image:"icons/upper-w.svg"},
			{image:"icons/upper-x.svg"},
			{image:"icons/upper-y.svg"},
			{image:"icons/upper-z.svg"}
		]
	}
];

// Vue main app
var app = new Vue({
	el: '#app',
	components: {
		'toolbar': Toolbar, 'localization': Localization, 'tutorial': Tutorial,
		'template-viewer': TemplateViewer, 'editor': Editor
	},
	data: {
		currentView: TemplateViewer,
		currentLibrary: null,
		currentTemplate: null,
		currentItem: null,
		color: '#00000'
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
						vm.color = environment.user.colorvalue.fill;
						document.getElementById("canvas").style.backgroundColor = vm.color;
					});

				// Load context
				if (environment.objectId) {
					activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
						if (error==null && data!=null) {
							var parsed = JSON.parse(data);
							vm.currentLibrary = parsed.library;
							vm.currentTemplate = parsed.library[parsed.template];
							document.getElementById("template-button").style.backgroundImage = "url(icons/"+vm.currentTemplate.name+".svg)";
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
			vm.currentView = TemplateViewer;
			document.getElementById("canvas").style.backgroundColor = vm.color;
		},

		// Handle fullscreen mode
		fullscreen: function() {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			if (vm.currentView === Editor) {
				vm.$refs.view.computeSize();
			}
		},
		unfullscreen: function() {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			if (vm.currentView === Editor) {
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
			vm.currentView = TemplateViewer;
			document.getElementById("canvas").style.backgroundColor = vm.color;
		},

		onItemSelected: function(item) {
			if (this.currentView === TemplateViewer) {
				// Load item
				var vm = this;
				vm.currentView = Editor;
				vm.currentItem = item;
				document.getElementById("canvas").style.backgroundColor = "#ffffff";
			}
		},

		onResize: function() {
			var vm = this;
			if (vm.currentView === Editor) {
				vm.$refs.view.computeSize();
			}
		},

		onHelp: function() {
			var options = {};
			options.templatebutton = this.$refs.toolbar.$refs.templatebutton.$el;
			options.fullscreenbutton = this.$refs.toolbar.$refs.fullscreen.$el;
			if (this.currentView === TemplateViewer && this.currentTemplate && this.currentTemplate.images && this.currentTemplate.images[0]) {
				options.item = this.$refs.view.$refs.item0[0].$el;
			} else if (this.currentView === Editor) {
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
