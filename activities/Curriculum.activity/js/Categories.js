var CategoryCard = {
	/*html*/
	template: `
		<div 
			class="category-card" 
			:class="{ 'settings-active': settings }"
			:style="{ backgroundColor: category.color, boxShadow: '0 0 5px ' + category.color }"
			@click="onCategoryClick"
		>
			<transition name="settings-zoom">
				<div class="settings-row" v-if="settings">
					<button id="edit-button" @click="onEditClick"></button>
					<button id="delete-button" @click.stop="onDeleteClick"></button>
				</div>
			</transition>
			<h1 class="category-title">{{ category.title }}</h1>
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
		onEditClick: function() {
			this.$emit('edit-category-clicked', this.category.id)
		},
		onDeleteClick: function() {
			this.$emit('delete-clicked', this.category.id);
		}
	}
};

var CategoriesGrid = {
	/*html*/
	template: `
		<div >
			<draggable class="categories" v-model="categories" @update="onUpdate" :disabled="!settings" :animation="300">
				<category-card 
					v-for="category in categories" 
					:key="category.id"
					:category="category"
					:user="user"
					:settings="settings"
					@skill-clicked="onSkillClick"
					@category-clicked="onCategoryClick"
					@edit-category-clicked="onEditCategoryClick"
					@delete-clicked="deleteCategory"
				></category-card>
			</draggable>
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

		onUpdate: function(e) {
			this.$emit('update-categories', this.categories);
		},

		onEditCategoryClick: function(categoryId) {
			this.$emit('edit-category', categoryId);
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