var CategoryCard = {
	/*html*/
	template: `
		<div 
			class="category-card" 
			:style="{ backgroundColor: category.color, boxShadow: '0 0 5px ' + category.color }"
			@click="$emit('category-clicked', category.id)"
		>
			<h1 class="category-title">{{ category.title }}</h1>
			<div class="category-skills">
				<div 
					class="skill" 
					v-for="skill in skillsToShow" 
					@click.stop="$emit('skill-clicked', category.id, skill.id)"
				>
					<img :src="skill.image">
				</div>
			</div>
			<div class="progress">
				<img src="icons/flag-raised.svg" class="progress-acquired" v-for="n in acquiredSkills" :key="n">
				<img src="icons/flag-raised.svg" class="progress-remaining" v-for="n in (totalSkills - acquiredSkills)" :key="n">
			</div>
		</div>
	`,
	props: ['category', 'user'],
	computed: {
		skillsToShow: function() {
			var skills = [];
			for(var i=0; i<Math.min(3, this.category.skills.length); i++) {
				skills.push(this.category.skills[i]);
			}
			return skills;
		},
		totalSkills: function() {
			return this.category.skills.length;
		},
		acquiredSkills: function() {
			var count = 0;
			for(var skillId in this.user.skills[this.category.id]) {
				if(this.user.skills[this.category.id][skillId].acquired) count++;
			}
			return count;
		}
	}
};

var CategoriesGrid = {
	/*html*/
	template: `
		<div class="categories">
			<category-card 
				v-for="category in categories" 
				:key="category.id"
				:category="category"
				:user="user"
				@skill-clicked="onSkillClick"
				@category-clicked="onCategoryClick"
			></category-card>
		</div>
	`,
	components: {
		'category-card': CategoryCard
	},
	props: ['categories', 'user'],
	methods: {
		onCategoryClick: function (categoryId) {
			console.log('cat: ', categoryId);
			this.$emit('open-category', categoryId);
		},

		onSkillClick: function (categoryId, skillId) {
			console.log('skill: ', categoryId, skillId);
			this.$emit('open-skill', categoryId, skillId);
		},
	}
}