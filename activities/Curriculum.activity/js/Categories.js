var CategoryCard = {
	/*html*/
	template: `
		<div 
			class="category-card" 
			:class="{ 'settings-active': settings }"
			:style="{ backgroundColor: category.color, boxShadow: '0 0 5px ' + category.color }"
			@click="onCategoryClick"
		>
			<div class="settings-row">
				<transition name="settings-zoom">
					<button id="edit-button" @click="onEditClick" v-if="settings"></button>
				</transition>
				<transition name="settings-zoom">
					<button id="delete-button" @click.stop="onDeleteClick" v-if="settings"></button>
				</transition>
			</div>
			<h1 class="category-title">{{ category.title }}</h1>
			<div class="category-skills">
				<div 
					class="skill" 
					v-for="skill in skillsToShow" 
					@click.stop="onSkillClick(skill.id)"
				>
					<img :src="skill.image" :alt="skill.title" loading="lazy">
				</div>
			</div>
			<div class="progress">
				<medal 
					small 
					v-for="(n, i) in category.skills.length" 
					:key="n" 
					:acquired="i < acquiredSkills.length ? acquiredSkills[i] : 0" 
					:levels="levels" 
					:notation-level="notationLevel" 
				/>
			</div>
		</div>
	`,
	components: {
		'medal': Medal
	},
	props: ['category', 'user', 'settings', 'levels', 'notationLevel'],
	computed: {
		skillsToShow: function () {
			var skills = [];
			for (var i = 0; i < Math.min(3, this.category.skills.length); i++) {
				skills.push(this.category.skills[i]);
			}
			return skills;
		},
		acquiredSkills: function () {
			var acquired = [];
			if(this.user) {
				for (var skillId in this.user.skills[this.category.id]) {
					if (this.user.skills[this.category.id][skillId].acquired) {
						acquired.push(this.user.skills[this.category.id][skillId].acquired);
					}
				}
			}
			return acquired;
		}
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
					v-show="matchesSearch(category.title)"
					:category="category"
					:user="user"
					:settings="settings"
					:levels="levels"
					:notationLevel="notationLevel"
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
	props: ['categories', 'user', 'settings', 'levels', 'notationLevel', 'searchQuery'],
	methods: {
		matchesSearch(str) {
			var regex = new RegExp(this.searchQuery, "i")
			if(str.search(regex) != -1) {
				return true;
			}
			return false;
		},

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