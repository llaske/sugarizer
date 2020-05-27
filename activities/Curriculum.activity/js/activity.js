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
