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
		l10n: {
			stringFullscreen: '',
			stringUnfullscreen: ''
		}
	},
	created: function() {
		this.categories = categoriesData;
	},
	methods: {
		initialized: function() {
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
			document.getElementById('app').style.background = this.currentenv.user.colorvalue.fill;
		},

		openCategory: function(categoryId) {
			this.selectedCategoryId = categoryId;
			this.currentView = 'skills-grid';
		},

		openSkill: function(categoryId, skillId) {
			this.selectedCategoryId = categoryId;
			this.selectedSkillId = skillId;
			this.currentView = 'skill-details';
		},

		fullscreen: function() {
			this.$refs.SugarToolbar.hide();
		},

		unfullscreen: function() {
			this.$refs.SugarToolbar.show();
		},
	}
});
