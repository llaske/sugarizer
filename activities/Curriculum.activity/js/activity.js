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
	},
	data: {
		currentenv: null,
		currentView: "categories-grid",
		settings: false,
		categories: [],
		selectedCategoryId: null,
		selectedSkillId: null,
		user: {},
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
		}
	},
	computed: {
		currentAcquired: function () {
			if (this.selectedCategoryId != null && this.selectedSkillId != null) {
				return this.user.skills[this.selectedCategoryId][this.selectedSkillId].acquired;
			}
			return false;
		}
	},
	created: function () {
		this.categories = categoriesData;
		this.user = userData;

		// this.importSkills();
	},
	methods: {
		initialized: function () {
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
			this.$refs.SugarL10n.$on('localized', this.localized());

			// document.getElementById('app').style.background = this.currentenv.user.colorvalue.fill;
		},

		localized: function() {
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

		switchSkillAcquired: function (value) {
			var value = !this.user.skills[this.selectedCategoryId][this.selectedSkillId].acquired;
			if (this.user.skills[this.selectedCategoryId][this.selectedSkillId]) {
				this.user.skills[this.selectedCategoryId][this.selectedSkillId].acquired = value;
			} else {
				// this.user.skills[this.selectedCategoryId][this.selectedSkillId] = {
				// 	acquired: value,
				// 	media: {}
				// }
				this.$set(this.user.skills[this.selectedCategoryId], this.selectedSkillId, {
					acquired: value,
					media: {}
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
					if(event.mediaType == 'image') {
						journalchooser.features.push(CurriculumChooser);
					}
					journalchooser.currentFeature = 0;
				}
				setTimeout(function () {
					journalchooser.show(function (entry) {
						if (!entry) {
							return;
						}

						var mediaObj = vm.user.skills[vm.selectedCategoryId][vm.selectedSkillId].media;
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
			requirejs(["text!activity/imported/sections.json"], function (sections) {
				var sectionsObj = JSON.parse(sections);
				var importedCategories = [];

				var categoryId = vm.categories.length;
				sectionsObj.forEach(function (section) {
					if (section.isDomaine) return;

					var category = {
						id: categoryId,
						title: section.titre,
						color: '#' + section.color,
						skills: []
					}
					// Updating the user object
					vm.$set(vm.user.skills, categoryId, new Object());

					var skillId = 0;
					section.items.forEach(function (item) {
						var skill = {
							id: skillId,
							title: item.titre,
							image: 'js/imported/' + item.uuid + '.jpg'
						}
						category.skills.push(skill);

						// Updating the user object
						vm.$set(vm.user.skills[categoryId], skillId, {
							acquired: false,
							media: {}
						});
						skillId++;
					});

					importedCategories.push(category);
					categoryId++;
				});
				// Updating the categories object
				vm.categories = vm.categories.concat(importedCategories);
			});
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
				categories: this.categories
			};
			this.$refs.SugarJournal.saveData(context);
		}
	}
});
