var SkillCard = {
	/*html*/
	template: `
		<div class="skill-card" :style="{ border: 'solid 2px ' + categoryBg }">
			{{skill}}
			<div ref="footer" class="skill-footer">
				<h2 class="skill-title">{{ skill.title }}</h2>
			</div>
		</div>
	`,
	data: {},
	props: ['skill', 'categoryBg'],
	mounted: function() {
		this.$refs.footer.style.background = this.categoryBg;
		this.$refs.footer.style.boxShadow = '0 3px 15px ' + this.categoryBg;
	},
	methods: {}
};

var SkillsGrid = {
	/*html*/
	template: `
		<div class="skills">
			<h1 class="category-title">
				{{ category.title }} 
				<span ref="underline1" class="underline"></span> 
				<span ref="underline2" class="underline"></span>
			</h1>
			<div class="skills-container">
				<skill-card v-for="skill in category.skills" :key="skill.id" :skill="skill" :categoryBg="category.bg"></skill-card>
			</div>
		</div>
	`,
	components: {
		'skill-card': SkillCard
	},
	props: ['categories', 'categoryId'],
	computed: {
		category: function () {
			var vm = this;
			return this.categories.find(function (cat) {
				return cat.id == vm.categoryId;
			});
		}
	},
	data: {},
	mounted: function() {
		this.$refs.underline1.style.background = this.category.bg;
		this.$refs.underline2.style.background = this.category.bg;
	},
	methods: {}
}

var SkillDetails = {
	/*html*/
	template: `
		<div class="skill-details">
			<h1>Skill Details</h1>
			{{ skill }}
		</div>
	`,
	components: {
		'skill-card': SkillCard
	},
	props: ['categories', 'categoryId', 'skillId'],
	computed: {
		skill: function () {
			var vm = this;
			var skills = this.categories.find(function (cat) {
				return cat.id == vm.categoryId;
			}).skills;
			return skills.find(function (skill) {
				return skill.id == vm.skillId;
			});
		}
	},
	data: {},
	methods: {}
}