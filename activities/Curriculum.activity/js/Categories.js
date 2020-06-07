var CategoryCard = {
	/*html*/
	template: `
		<div 
			class="category-card" 
			:class="{ 'settings-active': settings }"
			:style="{ backgroundColor: category.color, boxShadow: '0 0 5px ' + category.color }"
			@click="onCategoryClick"
		>
			<div class="settings-row" v-if="settings">
				<button id="edit-button" @click=""></button>
				<button id="delete-button" @click.stop="onDeleteClick"></button>
			</div>
			<h1 class="category-title" v-html="category.title"></h1>
			<div class="category-skills">
				<div 
					class="skill" 
					v-for="skill in skillsToShow" 
					@click.stop="onSkillClick(skill.id)"
				>
					<img :src="skill.image">
				</div>
			</div>
			<div class="progress">
				<medal small v-for="n in category.skills.length" :key="n" :acquired="n <= acquiredSkills" />
			</div>
		</div>
	`,
	components: {
		'medal': Medal
	},
	props: ['category', 'user', 'settings'],
	computed: {
		skillsToShow: function () {
			var skills = [];
			for (var i = 0; i < Math.min(3, this.category.skills.length); i++) {
				skills.push(this.category.skills[i]);
			}
			return skills;
		},
		acquiredSkills: function () {
			if(!this.user) return this.category.skills.length/2;
			var count = 0;
			for (var skillId in this.user.skills[this.category.id]) {
				if (this.user.skills[this.category.id][skillId].acquired) count++;
			}
			return count;
		}
	},
	mounted: function () {
		var vm = this;
		requirejs(["sugar-web/graphics/icon"], function (icon) {
			if (vm.buddyMedal) {
				if (vm.$refs.medalAcquired) {
					icon.colorize(vm.$refs.medalAcquired, vm.$root.currentenv.user.colorvalue);
				}
			}
			vm.icon = icon;
		});
	},
	methods: {
		onCategoryClick: function() {
			this.$emit('category-clicked', this.category.id)
		},
		onSkillClick: function(skillId) {
			if(this.settings) return;
			this.$emit('skill-clicked', this.category.id, skillId);
		},
		onDeleteClick: function() {
			this.$emit('delete-clicked', this.category.id);
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
				:settings="settings"
				@skill-clicked="onSkillClick"
				@category-clicked="onCategoryClick"
				@delete-clicked="deleteCategory"
			></category-card>
		</div>
	`,
	components: {
		'category-card': CategoryCard
	},
	props: ['categories', 'user', 'settings'],
	methods: {
		onCategoryClick: function (categoryId) {
			console.log('cat: ', categoryId);
			this.$emit('open-category', categoryId);
		},

		onSkillClick: function (categoryId, skillId) {
			console.log('skill: ', categoryId, skillId);
			this.$emit('open-skill', categoryId, skillId);
		},

		deleteCategory: function(categoryId) {
			var index = this.categories.findIndex(function(cat) {
				return cat.id == categoryId;
			});
			this.categories.splice(index, 1);
			Vue.delete(this.user.skills, categoryId);
		}
	}
}