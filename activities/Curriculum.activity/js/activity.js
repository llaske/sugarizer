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
		'skill-details': SkillDetails
	},
	data: {
		currentenv: null,
		currentView: "categories-grid",
		categories: [],
		selectedCategoryId: null,
		selectedSkillId: null,
		user: {},
		l10n: {
			stringFullscreen: '',
			stringUnfullscreen: ''
		}
	},
	computed: {
		currentAcquired: function () {
			if (this.selectedCategoryId != null && this.selectedSkillId != null && this.user.skills[this.selectedCategoryId][this.selectedSkillId]) {
				return this.user.skills[this.selectedCategoryId][this.selectedSkillId].acquired;
			}
			return false;
		}
	},
	created: function () {
		this.categories = categoriesData;
		this.user = userData;

		var vm = this;
		requirejs(["text!activity/imported/sections.json"], function(sections) {
			var sectionsObj = JSON.parse(sections);
			var importedCategories = [];

			var categoryId = vm.categories.length;
			sectionsObj.forEach(function(section) {
				if(section.isDomaine) return;

				var category = {
					id: categoryId,
					title: section.titre,
					color: '#' + section.color,
					skills: []
				}

				var skillId = 0;
				section.items.forEach(function(item) {
					var skill = {
						id: skillId,
						title: item.titre,
						image: 'js/imported/' + item.uuid + '.jpg'
					}
					category.skills.push(skill);
					skillId++;
				});

				importedCategories.push(category);
				// Updating the user object
				vm.$set(vm.user.skills, categoryId, new Object());
				categoryId++;
			});
			vm.categories = vm.categories.concat(importedCategories);
		});
	},
	methods: {
		initialized: function () {
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
			document.getElementById('app').style.background = this.currentenv.user.colorvalue.fill;
		},

		openCategory: function (categoryId) {
			this.selectedCategoryId = categoryId;
			this.currentView = 'skills-grid';
		},

		openSkill: function (categoryId, skillId) {
			this.selectedCategoryId = categoryId;
			this.selectedSkillId = skillId;
			this.currentView = 'skill-details';
		},

		setSkillAcquired: function (value) {
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

		goBackTo: function(view) {
			this.currentView = view;
		},

		onJournalDataLoaded: function (data, metadata) {
			console.log(data);
			this.user = data.user;
		},

		fullscreen: function () {
			this.$refs.SugarToolbar.hide();
		},

		unfullscreen: function () {
			this.$refs.SugarToolbar.show();
		},

		onStop: function () {
			var context = {
				user: this.user
			};
			this.$refs.SugarJournal.saveData(context);
		}
	}
});
