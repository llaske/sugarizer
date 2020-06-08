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
			// document.getElementById('app').style.background = this.currentenv.user.colorvalue.fill;
		},

		openCategory: function (categoryId) {
			this.selectedCategoryId = categoryId;
			this.selectedSkillId = null;
			if(this.settings) {
				this.currentView = 'category-settings';
			} else {
				this.currentView = 'skills-grid';
			}
		},

		openSkill: function (categoryId, skillId) {
			this.selectedCategoryId = categoryId;
			this.selectedSkillId = skillId;
			if(this.settings) {
				this.currentView = 'skill-settings';
			} else {
				this.currentView = 'skill-details';
			}
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
			this.$refs.SugarJournal.insertFromJournal(filters, function (data, metadata) {
				var obj = {
					title: metadata.title,
					timestamp: metadata.timestamp
				}
				if(metadata.activity == 'org.olpcfrance.PaintActivity') {
					obj.data = vm.$refs.SugarJournal.LZString.decompressFromUTF16(JSON.parse(data).src);
				} else {
					obj.data = data;
				}
				var mediaObj = vm.user.skills[vm.selectedCategoryId][vm.selectedSkillId].media;
				if (mediaObj[event.mediaType]) {
					mediaObj[event.mediaType].push(obj)
				} else {
					vm.$set(mediaObj, event.mediaType, new Array(obj));
				}
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

		onUpdateCategories: function(categories) {
			this.categories = categories;
		},

		onAddClick: function() {
			if(this.currentView == 'categories-grid') {
				this.openCategory(null);
			} else if(this.currentView == 'skills-grid') {
				this.openSkill(this.selectedCategoryId, null);
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
			if(view == 'categories-grid') {
				this.selectedCategoryId = null;
				this.selectedSkillId = null;
			} else if(view == 'skills-grid') {
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
