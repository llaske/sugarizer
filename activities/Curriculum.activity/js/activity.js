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
		'template-selection': TemplateSelection,
		'categories-grid': CategoriesGrid,
		'skills-grid': SkillsGrid,
		'skill-details': SkillDetails,
		'category-settings': CategorySettings,
		'skill-settings': SkillSettings,
		'rewards': Rewards,
		'export': Export
	},
	data: {
		currentenv: null,
		sharedInstance: false,
		settings: false,
		rewardsInit: false,
		rewardsActive: false,
		exporting: '',
		currentView: "categories-grid",
		searchText: "",
		categories: [],
		selectedCategoryId: null,
		selectedSkillId: null,
		user: {
			skills: {}
		},
		notationLevel: 1,
		levels: {
			1: [
				{
					grade: '',
					text: "Not Acquired",
					colors: {
						fill: "#FFFFFF",
						stroke: "#838383"
					}
				},
				{
					grade: '',
					text: "Acquired",
					colors: {
						fill: "#02F000",
						stroke: "#0B7000"
					}
				}
			],
			2: [
				{
					grade: 'C',
					text: "Not Acquired",
					colors: {
						fill: "#FF542C",
						stroke: "#700000"
					}
				},
				{
					grade: 'B',
					text: "Partially Acquired",
					colors: {
						fill: "#FFC72C",
						stroke: "#705D00"
					}
				},
				{
					grade: 'A',
					text: "Acquired",
					colors: {
						fill: "#02F000",
						stroke: "#0B7000"
					}
				}
			],
			3: [
				{
					grade: 'C',
					text: "Not Acquired",
					colors: {
						fill: "#FF542C",
						stroke: "#700000"
					}
				},
				{
					grade: 'B',
					text: "Partially Acquired",
					colors: {
						fill: "#FFC72C",
						stroke: "#705D00"
					}
				},
				{
					grade: 'A',
					text: "Acquired",
					colors: {
						fill: "#98FF5D",
						stroke: "#10A600"
					}
				},
				{
					grade: 'A+',
					text: "Exceeded",
					colors: {
						fill: "#02F000",
						stroke: "#0B7000"
					}
				}
			],
			4: [
				{
					grade: 'X',
					text: "Not Evaluated",
					colors: {
						fill: "#FFFFFF",
						stroke: "#838383"
					}
				},
				{
					grade: 'C',
					text: "Not Acquired",
					colors: {
						fill: "#FF542C",
						stroke: "#700000"
					}
				},
				{
					grade: 'B',
					text: "Partially Acquired",
					colors: {
						fill: "#FFC72C",
						stroke: "#705D00"
					}
				},
				{
					grade: 'A',
					text: "Acquired",
					colors: {
						fill: "#98FF5D",
						stroke: "#10A600"
					}
				},
				{
					grade: 'A+',
					text: "Exceeded",
					colors: {
						fill: "#02F000",
						stroke: "#0B7000"
					}
				}
			],
		},
		achievements: [
			{
				id: 0,
				title: "Achievement0",
				info: {
					icon: "medal-unacquired.svg",
					text: "#1"
				},
				availability: true,
				condition: {
					property: "this[totalSkillsAcquired]",
					op: ">=",
					value: 1
				}
			},
			{
				id: 1,
				title: "Achievement1",
				info: {
					icon: "medal-unacquired.svg",
					text: "50%"
				},
				availability: true,
				condition: {
					property: "this[totalSkillsAcquired]",
					op: ">=",
					value: {
						property: "this[totalSkills]",
						op: "/",
						value: 2
					}
				}
			},
			{
				id: 2,
				title: "Achievement2",
				info: {
					icon: "medal-unacquired.svg",
					text: "100%"
				},
				availability: true,
				condition: {
					property: "this[totalSkillsAcquired]",
					op: "==",
					value: {
						property: "this[totalSkills]"
					}
				}
			},
			{
				id: 3,
				title: "Achievement3",
				info: {
					icon: "home.svg",
					text: "#1"
				},
				availability: true,
				condition: {
					property: "this[totalCategoriesAcquired]",
					op: ">=",
					value: 1
				}
			},
			{
				id: 4,
				title: "Achievement4",
				info: {
					icon: "home.svg",
					text: "100%"
				},
				availability: true,
				condition: {
					property: "this[totalCategoriesAcquired]",
					op: "==",
					value: {
						property: "this[totalCategories]"
					}
				}
			},
			{
				id: 5,
				title: "Achievement5",
				info: {
					icon: "insert-picture.svg",
					text: "#1"
				},
				availability: true,
				condition: {
					property: "this[totalMediaUploaded]",
					op: ">=",
					value: 1
				}
			},
			{
				id: 6,
				title: "Achievement6",
				info: {
					icon: "insert-picture.svg",
					text: "#10"
				},
				availability: true,
				condition: {
					property: "this[totalMediaUploaded]",
					op: ">=",
					value: 10
				}
			},
			{
				id: 7,
				title: "Achievement7",
				info: {
					icon: "medal-unacquired.svg",
					text: "A+"
				},
				availability: {
					property: "this[notationLevel]",
					op: ">=",
					value: 3
				},
				condition: {
					property: "this[levelWiseAcquired][this[notationLevel]]",
					op: ">=",
					value: 1
				}
			},
		],
		SugarPresence: null,
		l10n: {
			stringCategory: '',
			stringSkill: '',
			stringSearch: '',
			stringCategories: '',
			stringSettings: '',
			stringAdd: '',
			stringAcquire: '',
			stringUploadMedia: '',
			stringExport: '',
			stringFullscreen: '',
			stringUnfullscreen: ''
		}
	},
	watch: {
		currentView: function (newVal, oldVal) {
			// Scroll to top
			setTimeout(function () {
				content.scrollTo(0, 0);
			}, 200);
			// Close all open palettes
			for (var palette of document.getElementsByClassName('palette')) {
				palette.style.visibility = 'hidden';
			}
			console.log
			this.searchText = "";
		},
		settings: function (newVal, oldVal) {
			if(this.SugarPresence.isConnected()) {
				this.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'updateCategories',
						data: {
							categories: this.categories,
						}
					}
				});
			}
		},
		notationLevel: function (newVal, oldVal) {
			var levelButtons = document.getElementById('notation-selector').children;
			for (var button of levelButtons) {
				if (button.id.substr(6) == newVal) {
					button.classList.add('active');
				} else {
					button.classList.remove('active');
				}
			}
			if(this.SugarPresence.isConnected()) {
				this.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'updateNotation',
						data: {
							notationLevel: newVal
						}
					}
				});
			}
		},
		l10n: function (newVal, oldVal) {
			this.$refs.SugarL10n.localize(this.l10n);
			var vm = this;
			this.categories.forEach(function (cat) {
				if(vm.l10n['string' + cat.title]) {
					cat.title = vm.l10n['string' + cat.title];
				}
				cat.skills.forEach(function (skill) {
					if(vm.l10n['string' + skill.title]) {
						skill.title = vm.l10n['string' + skill.title]
					}
				})
			});
			this.achievements.forEach(function(achievement) {
				if(vm.l10n['string' + achievement.title]) {
					achievement.title = vm.l10n['string' + achievement.title];
				}
			});
		}
	},
	computed: {
		currentAcquired: function () {
			if (this.selectedCategoryId != null && this.selectedSkillId != null) {
				return this.user.skills[this.selectedCategoryId][this.selectedSkillId].acquired;
			}
			return 0;
		},
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
			this.addTitlesToL10n(this.achievements);
			this.$refs.SugarL10n.localize(this.l10n);
		},

		openCategory: function (categoryId) {
			this.selectedCategoryId = categoryId;
			this.selectedSkillId = null;
			this.currentView = 'skills-grid';
		},

		openSkill: function (categoryId, skillId) {
			this.selectedCategoryId = categoryId;
			this.selectedSkillId = skillId;
			this.currentView = 'skill-details';
		},

		editCategory: function (categoryId) {
			this.selectedCategoryId = categoryId;
			this.selectedSkillId = null;
			this.currentView = 'category-settings';
		},

		editSkill: function (categoryId, skillId) {
			this.selectedCategoryId = categoryId;
			this.selectedSkillId = skillId;
			this.currentView = 'skill-settings';
		},

		switchSkillLevel: function () {
			var skillObj = this.user.skills[this.selectedCategoryId][this.selectedSkillId];
			var value = skillObj.acquired;
			value = (value + 1) % (this.notationLevel + 1);
			skillObj.acquired = value;
			if(this.levels[this.notationLevel][value].text == "Acquired" || this.levels[this.notationLevel][value].text == "Exceeded") {
				skillObj.timestamp = Date.now();
			} else {
				skillObj.timestamp = null;
			}

			// Update connected users
			if(this.SugarPresence.isConnected()) {
				this.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'updateUser',
						data: {
							user: this.user
						}
					}
				});
			}
		},

		onUploadItem: function (event) {
			var filters;
			var vm = this;
			switch (event.mediaType) {
				case 'image':
					filters = [
						{ mimetype: 'image/png' },
						{ mimetype: 'image/jpeg' },
						{ activity: 'org.olpcfrance.PaintActivity' }
					]
					break;
				case 'audio':
					filters = [
						{ mimetype: 'audio/mpeg' }
					]
					break;
				case 'video':
					filters = [
						{ mimetype: 'video/mp4' }
					]
					break;
			}

			requirejs(["sugar-web/datastore", "sugar-web/graphics/journalchooser", "activity/CurriculumChooser"], function (datastore, journalchooser, CurriculumChooser) {
				journalchooser.init = function () {
					journalchooser.features = [journalchooser.featureLocalJournal]
					if (event.mediaType == 'image') {
						journalchooser.features.push(CurriculumChooser);
					}
					journalchooser.currentFeature = 0;
				}
				setTimeout(function () {
					journalchooser.show(function (entry) {
						if (!entry) {
							return;
						}

						var skillObj = vm.user.skills[vm.selectedCategoryId][vm.selectedSkillId];
						var mediaObj = skillObj.media;
						if (!mediaObj[event.mediaType]) {
							vm.$set(mediaObj, event.mediaType, new Array());
						}

						if (entry.metadata.activity == "org.olpcfrance.Curriculum") {
							var objectToSave = {
								title: entry.metadata.title,
								timestamp: entry.metadata.timestamp,
								data: entry.path
							}
							mediaObj[event.mediaType].push(objectToSave)
						} else if (entry.objectId) {
							var dataentry = new datastore.DatastoreObject(entry.objectId);
							dataentry.loadAsText(function (err, metadata, data) {
								if (err) {
									console.error(err);
									return;
								}
								var objectToSave = {
									title: metadata.title,
									timestamp: metadata.timestamp
								}
								if (metadata.activity == 'org.olpcfrance.PaintActivity') {
									objectToSave.data = vm.$refs.SugarJournal.LZString.decompressFromUTF16(JSON.parse(data).src);
								} else {
									objectToSave.data = data;
								}
								mediaObj[event.mediaType].push(objectToSave)
							});
						}
						skillObj.acquired = vm.notationLevel;
						skillObj.timestamp = Date.now();

						if(vm.SugarPresence.isConnected()) {
							vm.SugarPresence.sendMessage({
								user: vm.SugarPresence.getUserInfo(),
								content: {
									action: 'updateUser',
									data: {
										user: vm.user
									}
								}
							});
						}
					}, filters[0], filters[1], filters[2], filters[3]);
				}, 0);
			});
		},

		onDeleteItem: function (item) {
			var mediaObj = this.user.skills[this.selectedCategoryId][this.selectedSkillId].media;
			var index = mediaObj[item.type].findIndex(function (el) {
				return el.timestamp === item.timestamp;
			});
			if (index !== -1) {
				mediaObj[item.type].splice(index, 1);
			}
		},

		onUpdateCategories: function (categories) {
			this.categories = categories;
		},

		onAddClick: function () {
			if (this.currentView == 'categories-grid') {
				this.editCategory(null);
			} else if (this.currentView == 'skills-grid') {
				this.editSkill(this.selectedCategoryId, null);
			}
		},

		importTemplate: function (template) {
			var vm = this;
			vm.notationLevel = template.notationLevel;
			var categoriesParsed = template.categories;
			var importedCategories = [];

			categoriesParsed.forEach(function (category) {
				if(!template.fromURL) {
					vm.$set(vm.l10n, 'string' + category.title, '');
				}
				// Updating user
				vm.$set(vm.user.skills, category.id, new Object());

				category.skills.forEach(function (skill, i) {
					if(!template.fromURL) {
						skill.image = 'images/skills/' + skill.image;
						vm.$set(vm.l10n, 'string' + skill.title, '');
					}

					// Updating user
					vm.$set(vm.user.skills[category.id], skill.id, {
						acquired: 0,
						timestamp: null,
						media: {}
					});
				});

				importedCategories.push(category);
			});
			// Updating categories
			vm.categories = importedCategories;
			this.addAchievementsToUser();
			vm.currentView = 'categories-grid';
			vm.rewardsInit = true;
		},

		addAchievementsToUser: function () {
			var vm = this;
			this.$set(this.user, 'achievements', new Object());
			this.achievements.forEach(function (achievement) {
				vm.$set(vm.user.achievements, achievement.id, { timestamp: null });
			});
		},

		addTitlesToL10n: function(array) {
			var vm = this;
			array.forEach(function (item) {
				vm.$set(vm.l10n, 'string' + item.title, '');
			});
		},

		onNotationSelected: function (event) {
			var oldLevel = this.notationLevel;
			
			var middle = Math.floor(oldLevel / 2);
			for (var cat in this.user.skills) {
				for (var skill in this.user.skills[cat]) {
					if (this.user.skills[cat][skill].acquired <= middle) {
						this.$set(this.user.skills[cat][skill], 'acquired', 0);
					} else {
						var text = this.levels[oldLevel][this.user.skills[cat][skill].acquired].text;
						switch (text) {
							case "Acquired":
								var index = this.levels[event.level].findIndex(function (level) {
									return level.text == "Acquired";
								});
								this.$set(this.user.skills[cat][skill], 'acquired', index);
								break;
							case "Exceeded":
								var index = this.levels[event.level].findIndex(function (level) {
									return level.text == "Exceeded";
								});
								if (index == -1) {
									index = this.levels[event.level].findIndex(function (level) {
										return level.text == "Acquired";
									});
								}
								this.$set(this.user.skills[cat][skill], 'acquired', index);
								break;
						}
					}
				}
			}
			// Remove A+ achievement timestamp
			if(oldLevel >= 3 && event.level < 3) {
				var index = this.achievements.findIndex(function(a) {
					return (typeof a.availability == 'object') 
								&& a.availability.property == "this[notationLevel]" 
								&& a.availability.op == ">="
								&& a.availability.value == 3;
				});
				var id = this.achievements[index].id;
				this.user.achievements[id].timestamp = null;
			}
			// Setting the new level
			this.notationLevel = parseInt(event.level);
		},

		onExportFormatSelected: function(event) {
			this.exporting = event.format;
		},

		goBackTo: function (view) {
			this.rewardsActive = false;
			this.currentView = view;
			if (view == 'categories-grid') {
				this.selectedCategoryId = null;
				this.selectedSkillId = null;
			} else if (view == 'skills-grid') {
				this.selectedSkillId = null;
			}
		},

		onJournalDataLoaded: function (data, metadata) {
			if(data.currentView == 'template-selection') {
				this.currentView = data.currentView;
			} else {
				this.user = data.user;
				this.categories = data.categories;
				this.notationLevel = data.notationLevel;
				this.selectedCategoryId = data.selectedCategoryId;
				this.selectedSkillId = data.selectedSkillId;
				this.currentView = data.currentView;
				this.rewardsInit = true;
			}
		},

		onJournalNewInstace: function () {
			this.currentView = 'template-selection';
			// this.importSkills();
			// this.addAchievementsToUser();
		},

		onNetworkDataReceived: function (msg) {
			switch(msg.content.action) {
				case 'init':
					this.sharedInstance = true;
					this.categories = msg.content.data.categories;
					this.user = msg.content.data.user;
					this.notationLevel = msg.content.data.notationLevel;
					this.currentenv = {};
					this.currentenv.user = msg.user;
					break;
				case 'updateCategories':
					this.categories = msg.content.data.categories;
					break;
				case 'updateNotation':
					this.notationLevel = msg.content.data.notationLevel;
					break;
				case 'updateUser':
					this.user = msg.content.data.user;
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
							categories: this.categories,
							user: this.user,
							notationLevel: this.notationLevel
						}
					}
				});
			}
		},

		fullscreen: function () {
			this.$refs.SugarToolbar.hide();
		},

		unfullscreen: function () {
			this.$refs.SugarToolbar.show();
		},

		onStop: function () {
			var context;
			if(this.currentView == 'template-selection') {
				context = {
					currentView: this.currentView
				}
			} else {
				context = {
					user: this.user,
					categories: this.categories,
					notationLevel: this.notationLevel,
					selectedCategoryId: this.selectedCategoryId,
					selectedSkillId: this.selectedSkillId,
					currentView: this.currentView
				};
			}
			this.$refs.SugarJournal.saveData(context);
		}
	}
});
