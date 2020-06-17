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
		'categories-grid': CategoriesGrid,
		'skills-grid': SkillsGrid,
		'skill-details': SkillDetails,
		'category-settings': CategorySettings,
		'skill-settings': SkillSettings,
		'rewards': Rewards,
		'medal': Medal
	},
	data: {
		currentenv: null,
		currentView: "categories-grid",
		settings: false,
		categories: [],
		selectedCategoryId: null,
		selectedSkillId: null,
		user: {
			skills: []
		},
		notationLevel: 1,
		levels: {
			1: [
				{
					grade: '',
					text: "Not Acquired",
					colors: {
						fill: "#FFFFFF",
						stroke: "#D3D3D3"
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
		l10n: {
			stringCategories: '',
			stringSettings: '',
			stringAdd: '',
			stringAcquire: '',
			stringUploadMedia: '',
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
		},
		l10n: function (newVal, oldVal) {
			console.log(newVal);
			this.$refs.SugarL10n.localize(this.l10n);
			var vm = this;
			this.categories.forEach(function (cat) {
				cat.title = vm.l10n['string' + cat.title];
				cat.skills.forEach(function (skill) {
					skill.title = vm.l10n['string' + skill.title]
				})
			})
		}
	},
	computed: {
		currentAcquired: function () {
			if (this.selectedCategoryId != null && this.selectedSkillId != null) {
				return this.user.skills[this.selectedCategoryId][this.selectedSkillId].acquired;
			}
			return 0;
		}
	},
	methods: {
		initialized: function () {
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
			// document.getElementById('app').style.background = this.currentenv.user.colorvalue.fill;
		},

		localized: function () {
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
			var value = this.user.skills[this.selectedCategoryId][this.selectedSkillId].acquired;
			value = (value + 1) % (this.notationLevel + 1);
			this.user.skills[this.selectedCategoryId][this.selectedSkillId].acquired = value;
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

		importSkills: function () {
			var vm = this;
			requirejs(["text!../default_template.json"], function (data) {
				var data = JSON.parse(data);
				vm.notationLevel = data.notationLevel;
				var categoriesParsed = data.categories;
				var importedCategories = [];

				categoriesParsed.forEach(function (category) {
					vm.$set(vm.l10n, 'string' + category.title, '');
					// Updating user
					vm.$set(vm.user.skills, category.id, new Object());

					category.skills.forEach(function (skill, i) {
						skill.image = 'images/skills/' + skill.image;
						vm.$set(vm.l10n, 'string' + skill.title, '');

						// Updating user
						vm.$set(vm.user.skills[category.id], skill.id, {
							acquired: 0,
							media: {}
						});
					});

					importedCategories.push(category);
				});
				// Updating categories
				vm.categories = vm.categories.concat(importedCategories);
			});
		},

		onNotationSelected: function (event) {
			var oldLevel = this.notationLevel;

			for (var cat in this.user.skills) {
				for (var skill in this.user.skills[cat]) {
					if (this.user.skills[cat][skill].acquired == oldLevel) {
						this.$set(this.user.skills[cat][skill], 'acquired', event.level);
					} else {
						this.$set(this.user.skills[cat][skill], 'acquired', 0);
					}
				}
			}
			this.notationLevel = parseInt(event.level);
		},

		goBackTo: function (view) {
			this.currentView = view;
			if (view == 'categories-grid') {
				this.selectedCategoryId = null;
				this.selectedSkillId = null;
			} else if (view == 'skills-grid') {
				this.selectedSkillId = null;
			}
		},

		onJournalDataLoaded: function (data, metadata) {
			this.user = data.user;
			this.categories = data.categories;
			this.notationLevel = data.notationLevel;
		},

		onJournalNewInstace: function () {
			this.importSkills();
		},

		fullscreen: function () {
			this.$refs.SugarToolbar.hide();
		},

		unfullscreen: function () {
			this.$refs.SugarToolbar.show();
		},

		onStop: function () {
			var context = {
				user: this.user,
				categories: this.categories,
				notationLevel: this.notationLevel
			};
			this.$refs.SugarJournal.saveData(context);
		}
	}
});
