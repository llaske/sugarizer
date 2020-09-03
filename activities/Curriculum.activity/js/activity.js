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
		// Template
		templateTitle: '',
		templateImage: '',
		notationLevel: 1,
		categories: [],
		selectedCategoryId: null,
		selectedSkillId: null,
		user: {
			skills: {}
		},
		levels: {
			1: [
				{
					grade: '',
					textVariable: "LevelNotAcquired",
					text: "",
					colors: {
						fill: "#FFFFFF",
						stroke: "#838383"
					}
				},
				{
					grade: '',
					textVariable: "LevelAcquired",
					text: "",
					colors: {
						fill: "#02F000",
						stroke: "#0B7000"
					}
				}
			],
			2: [
				{
					grade: 'C',
					textVariable: "LevelNotAcquired",
					text: "",
					colors: {
						fill: "#FF542C",
						stroke: "#700000"
					}
				},
				{
					grade: 'B',
					textVariable: "LevelPartiallyAcquired",
					text: "",
					colors: {
						fill: "#FFC72C",
						stroke: "#705D00"
					}
				},
				{
					grade: 'A',
					textVariable: "LevelAcquired",
					text: "",
					colors: {
						fill: "#02F000",
						stroke: "#0B7000"
					}
				}
			],
			3: [
				{
					grade: 'C',
					textVariable: "LevelNotAcquired",
					text: "",
					colors: {
						fill: "#FF542C",
						stroke: "#700000"
					}
				},
				{
					grade: 'B',
					textVariable: "LevelPartiallyAcquired",
					text: "",
					colors: {
						fill: "#FFC72C",
						stroke: "#705D00"
					}
				},
				{
					grade: 'A',
					textVariable: "LevelAcquired",
					text: "",
					colors: {
						fill: "#98FF5D",
						stroke: "#10A600"
					}
				},
				{
					grade: 'A+',
					textVariable: "LevelExceeded",
					text: "",
					colors: {
						fill: "#02F000",
						stroke: "#0B7000"
					}
				}
			],
			4: [
				{
					grade: 'X',
					textVariable: "LevelNotEvaluated",
					text: "",
					colors: {
						fill: "#FFFFFF",
						stroke: "#838383"
					}
				},
				{
					grade: 'C',
					textVariable: "LevelNotAcquired",
					text: "",
					colors: {
						fill: "#FF542C",
						stroke: "#700000"
					}
				},
				{
					grade: 'B',
					textVariable: "LevelPartiallyAcquired",
					text: "",
					colors: {
						fill: "#FFC72C",
						stroke: "#705D00"
					}
				},
				{
					grade: 'A',
					textVariable: "LevelAcquired",
					text: "",
					colors: {
						fill: "#98FF5D",
						stroke: "#10A600"
					}
				},
				{
					grade: 'A+',
					textVariable: "LevelExceeded",
					text: "",
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
			stringUnfullscreen: '',
			stringUploadSkill: '',
			stringLevelNotEvaluated:'',
			stringLevelAcquired:'',
			stringLevelNotAcquired:'',
			stringLevelPartiallyAcquired:'',
			stringLevelExceeded:'',
			stringTutoTrophyCardTitle: '',
			stringTutoTrophyCardContent: '',
			stringTutoSettingsCategoryCardTitle: '',
			stringTutoSettingsCategoryCardContent: '',
			stringTutoSettingsSkillCardTitle: '',
			stringTutoSettingsSkillCardContent: '',
			stringTutoSettingsEditButtonTitle: '',
			stringTutoSettingsEditButtonContent: '',
			stringTutoSettingsDeleteButtonTitle: '',
			stringTutoSettingsDeleteButtonContent: '',
			stringTutoSettingsNotationButtonTitle: '',
			stringTutoSettingsNotationButtonContent: '',
			stringTutoSettingsAddButtonTitle: '',
			stringTutoSettingsAddButtonContent: '',
			stringTutoExplainTitle: '',
			stringTutoExplainContent: '',
			stringTutoTemplateSelectionTitle: '',
			stringTutoTemplateSelectionContent: '',
			stringTutoTemplateTitle: '',
			stringTutoTemplateContent: '',
			stringTutoAddTemplateTitle: '',
			stringTutoAddTemplateContent: '',
			stringTutoCategoryCardTitle: '',
			stringTutoCategoryCardContent: '',
			stringTutoCategorySkillsTitle: '',
			stringTutoCategorySkillsContent: '',
			stringTutoCategoryProgressTitle: '',
			stringTutoCategoryProgressContent: '',
			stringTutoCategorySearchTitle: '',
			stringTutoCategorySearchContent: '',
			stringTutoRewardsButtonTitle: '',
			stringTutoRewardsButtonContent: '',
			stringTutoSettingsButtonTitle: '',
			stringTutoSettingsButtonContent: '',
			stringTutoExportButtonTitle: '',
			stringTutoExportButtonContent: '',
			stringTutoNetworkButtonTitle: '',
			stringTutoNetworkButtonContent: '',
			stringTutoSkillCardTitle: '',
			stringTutoSkillCardContent: '',
			stringTutoHomeButtonTitle: '',
			stringTutoHomeButtonContent: '',
			stringTutoSkillSearchTitle: '',
			stringTutoSkillSearchContent: '',
			stringTutoSkillUploadsTitle: '',
			stringTutoSkillUploadsContent: '',
			stringTutoAcquireButtonTitle: '',
			stringTutoAcquireButtonContent: '',
			stringTutoUploadButtonTitle: '',
			stringTutoUploadButtonContent: '',
			stringTutoUploadedItemTitle: '',
			stringTutoUploadedItemContent: ''
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
			let vm = this;
			this.addTitlesToL10n(this.achievements);
			this.$refs.SugarL10n.localize(this.l10n);
			this.achievements.forEach(function(achievement) {
				achievement.title = vm.$refs.SugarL10n.get(achievement.title);
			});
			for(let achievement of this.achievements) {
				achievement.title = this.$refs.SugarL10n.get(achievement.title);
			}
			for(let key in this.levels) {
				for(let level in this.levels[key]) {
					this.levels[key][level].text = this.$refs.SugarL10n.get(this.levels[key][level].textVariable);
				}
			}
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
			if(this.sharedInstance) return;
			
			var skillObj = this.user.skills[this.selectedCategoryId][this.selectedSkillId];
			var value = skillObj.acquired;
			value = (value + 1) % (this.notationLevel + 1);
			skillObj.acquired = value;
			if(this.levels[this.notationLevel][value].textVariable == "LevelAcquired" || this.levels[this.notationLevel][value].textVariable == "LevelExceeded") {
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
			vm.templateTitle = template.templateTitle;
			vm.templateImage = template.templateImage;
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
						var text = this.levels[oldLevel][this.user.skills[cat][skill].acquired].textVariable;
						switch (text) {
							case "LevelAcquired":
								var index = this.levels[event.level].findIndex(function (level) {
									return level.textVariable == "LevelAcquired";
								});
								this.$set(this.user.skills[cat][skill], 'acquired', index);
								break;
							case "LevelExceeded":
								var index = this.levels[event.level].findIndex(function (level) {
									return level.textVariable == "LevelExceeded";
								});
								if (index == -1) {
									index = this.levels[event.level].findIndex(function (level) {
										return level.textVariable == "LevelAcquired";
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
				this.sharedInstance = data.sharedInstance;
				this.templateTitle = data.templateTitle;
				this.templateImage = data.templateImage;
				this.notationLevel = data.notationLevel;
				this.categories = data.categories;
				this.user = data.user;
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
					this.templateTitle = msg.content.data.templateTitle;
					this.categories = msg.content.data.categories;
					this.user = msg.content.data.user;
					this.notationLevel = msg.content.data.notationLevel;
					this.currentenv = {};
					this.currentenv.user = msg.user;
					this.rewardsInit = true;
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
							templateTitle: this.templateTitle,
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

		onHelp() {
			let steps = [];
			if(this.rewardsActive) {
				steps = steps.concat([
					{
						element: ".trophy-card#0",
						placement: "bottom",
						title: this.l10n.stringTutoTrophyCardTitle,
						content: this.l10n.stringTutoTrophyCardContent
					},
				]);
			} else if(this.settings) {
				steps = steps.concat([
					{
						element: ".category-card#0",
						placement: "right",
						title: this.l10n.stringTutoSettingsCategoryCardTitle,
						content: this.l10n.stringTutoSettingsCategoryCardContent
					},
					{
						element: ".skill-card#0",
						placement: "right",
						title: this.l10n.stringTutoSettingsSkillCardTitle,
						content: this.l10n.stringTutoSettingsSkillCardContent
					},
					{
						element: "#edit-button",
						placement: "right",
						title: this.l10n.stringTutoSettingsEditButtonTitle,
						content: this.l10n.stringTutoSettingsEditButtonContent
					},
					{
						element: "#delete-button",
						placement: "right",
						title: this.l10n.stringTutoSettingsDeleteButtonTitle,
						content: this.l10n.stringTutoSettingsDeleteButtonContent
					},
					{
						element: "#notation-button",
						placement: "bottom",
						title: this.l10n.stringTutoSettingsNotationButtonTitle,
						content: this.l10n.stringTutoSettingsNotationButtonContent
					},
					{
						element: "#add-button",
						placement: "bottom",
						title: this.l10n.stringTutoSettingsAddButtonTitle,
						content: this.l10n.stringTutoSettingsAddButtonContent
					},
				]);
			} else {
				switch(this.currentView) {
					case 'template-selection':
						steps = steps.concat([
							{
								element: "",
								orphan: true,
								placement: "bottom",
								title: this.l10n.stringTutoExplainTitle,
								content: this.l10n.stringTutoExplainContent
							},
							{
								element: "",
								orphan: true,
								placement: "bottom",
								title: this.l10n.stringTutoTemplateSelectionTitle,
								content: this.l10n.stringTutoTemplateSelectionContent
							},
							{
								element: ".template#0",
								placement: "bottom",
								title: this.l10n.stringTutoTemplateTitle,
								content: this.l10n.stringTutoTemplateContent
							},
							{
								element: ".add-template",
								placement: "left",
								title: this.l10n.stringTutoAddTemplateTitle,
								content: this.l10n.stringTutoAddTemplateContent
							}
						]);
						break;
					case 'categories-grid':
						steps = steps.concat([
							{
								element: "",
								orphan: true,
								placement: "bottom",
								title: this.l10n.stringTutoExplainTitle,
								content: this.l10n.stringTutoExplainContent
							},
							{
								element: ".category-card#0",
								placement: "right",
								title: this.l10n.stringTutoCategoryCardTitle,
								content: this.l10n.stringTutoCategoryCardContent
							},
							{
								element: ".category-card#0 .category-skills",
								placement: "bottom",
								title: this.l10n.stringTutoCategorySkillsTitle,
								content: this.l10n.stringTutoCategorySkillsContent
							},
							{
								element: ".category-card#0 .progress",
								placement: "bottom",
								title: this.l10n.stringTutoCategoryProgressTitle,
								content: this.l10n.stringTutoCategoryProgressContent
							},
							{
								element: ".search-input",
								placement: "bottom",
								title: this.l10n.stringTutoCategorySearchTitle,
								content: this.l10n.stringTutoCategorySearchContent
							},
							{
								element: "#rewards-button",
								placement: "bottom",
								title: this.l10n.stringTutoRewardsButtonTitle,
								content: this.l10n.stringTutoRewardsButtonContent
							},
							{
								element: "#settings-button",
								placement: "bottom",
								title: this.l10n.stringTutoSettingsButtonTitle,
								content: this.l10n.stringTutoSettingsButtonContent
							},
							{
								element: "#export-button",
								placement: "bottom",
								title: this.l10n.stringTutoExportButtonTitle,
								content: this.l10n.stringTutoExportButtonContent
							},
							{
								element: "#network-button",
								placement: "bottom",
								title: this.l10n.stringTutoNetworkButtonTitle,
								content: this.l10n.stringTutoNetworkButtonContent
							},
						]);
						break;
					case 'skills-grid':
						steps = steps.concat([
							{
								element: ".skill-card#0",
								placement: "right",
								title: this.l10n.stringTutoSkillCardTitle,
								content: this.l10n.stringTutoSkillCardContent
							},
							{
								element: "#home-button",
								placement: "bottom",
								title: this.l10n.stringTutoHomeButtonTitle,
								content: this.l10n.stringTutoHomeButtonContent
							},
							{
								element: ".search-input",
								placement: "bottom",
								title: this.l10n.stringTutoSkillSearchTitle,
								content: this.l10n.stringTutoSkillSearchContent
							},
						]);
						break;
					case 'skill-details':
						steps = steps.concat([
							{
								element: ".skill-uploads",
								placement: "top",
								title: this.l10n.stringTutoSkillUploadsTitle,
								content: this.l10n.stringTutoSkillUploadsContent
							},
							{
								element: "#acquire-button",
								placement: "bottom",
								title: this.l10n.stringTutoAcquireButtonTitle,
								content: this.l10n.stringTutoAcquireButtonContent
							},
							{
								element: "#upload-button",
								placement: "bottom",
								title: this.l10n.stringTutoUploadButtonTitle,
								content: this.l10n.stringTutoUploadButtonContent
							},
							{
								element: "#0 .uploaded-item",
								placement: "top",
								title: this.l10n.stringTutoUploadedItemTitle,
								content: this.l10n.stringTutoUploadedItemContent
							},
						]);
						break;
				}
			}

			this.$refs.SugarTutorial.show(steps);
		},

		onStop: function () {
			var context;
			if(this.currentView == 'template-selection') {
				context = {
					currentView: this.currentView
				}
			} else {
				context = {
					sharedInstance: this.sharedInstance,
					templateTitle: this.templateTitle,
					templateImage: this.templateImage,
					notationLevel: this.notationLevel,
					categories: this.categories,
					user: this.user,
					selectedCategoryId: this.selectedCategoryId,
					selectedSkillId: this.selectedSkillId,
					currentView: this.currentView
				};
			}
			this.$refs.SugarJournal.saveData(context);
		}
	}
});
