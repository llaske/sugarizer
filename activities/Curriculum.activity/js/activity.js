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
	watch: {
		currentView: function(newVal, oldVal) {
			window.scrollTo(0, 0);
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

		this.importSkills();
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

		onUploadItem: function(event) {
			var filters;
			var vm = this;

			switch(event.mediaType) {
				case 'image':
					filters = [
						{ mimetype: 'image/png' }, 
    				{ mimetype: 'image/jpeg' }
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
					data: data,
					title: metadata.title,
					timestamp: metadata.timestamp
				}
				if(vm.user.skills[vm.selectedCategoryId][vm.selectedSkillId].media[event.mediaType]) {
					vm.user.skills[vm.selectedCategoryId][vm.selectedSkillId].media[event.mediaType].push(obj)
				} else {
					vm.$set(vm.user.skills[vm.selectedCategoryId][vm.selectedSkillId].media, event.mediaType, new Array(obj));
				}
				console.log(vm.user.skills[vm.selectedCategoryId][vm.selectedSkillId].media);
			});
		},

		importSkills: function() {
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
					// Updating the user object
					vm.$set(vm.user.skills, categoryId, new Object());
	
					var skillId = 0;
					section.items.forEach(function(item) {
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
