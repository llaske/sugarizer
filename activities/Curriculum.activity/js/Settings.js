var CategorySettings = {
	/*html*/
	template: `
		<div class="settings category-settings">
			<category-card 
				:category="category"
			></category-card>
			<form @submit.prevent="onConfirm">
				<div>
					<label for="title">Title</label>
					<input type="text" name="title" v-model="category.title" required>
				</div>
				<div>
					<label for="color">Color</label>
					<div class="colors">
						<div 
							class="color"
							v-for="color in colors"
							:key="color"
							:style="{ backgroundColor: color }"
							:class="{ selected: category.color == color }"
							@click="category.color = color"
						></div>
					</div>
				</div>
				<button type="submit">Confirm</button>
				<button type="button" @click="$emit('go-back-to', 'categories-grid')">Cancel</button>
			</form>
		</div>
	`,
	components: {
		'category-card': CategoryCard
	},
	props: ['categories', 'categoryId'],
	data: function() {
		return {
			category: {},
			colors: [
				'#ff4f4f',
				'#ffb64f',
				'#fffc4f',
				'#a7ff4f',
				'#4fff58',
				'#4fffd9',
				'#4fcdff',
				'#4f78ff',
				'#a14fff',
				'#fc4fff',
				'#ff4f8d'
			],
		}
	},
	created: function() {
		var vm = this;
		this.category = JSON.parse(JSON.stringify(this.categories.find(function (cat) {
			return cat.id == vm.categoryId;
		})))
		if(this.colors.indexOf(this.category.color) == -1) {
			this.colors.push(this.category.color);
		}
	},
	methods: {
		onConfirm: function() {
			var vm = this;
			var index = this.categories.findIndex(function (cat) {
				return cat.id === vm.categoryId;
			});
			this.categories[index] = this.category;
			this.$emit('go-back-to', 'categories-grid');
		}
	}
}


var SkillSettings = {
	/*html*/
	template: `
		<div class="settings skill-settings">
			<skill-card 
				:category="category"
				:skill="skill"
			></skill-card>
			<form @submit.prevent="onConfirm">
				<div>
					<label for="title">Title</label>
					<input type="text" name="title" v-model="skill.title" required>
				</div>
				<div>
					<div class="image-label">
						<label for="image">Image</label>
						<button type="button" id="image-edit-button" @click="onUploadClick"></button>
					</div>
					<img :src="skill.image">
				</div>
				<button type="submit">Confirm</button>
				<button type="button" @click="$emit('go-back-to', 'skills-grid')">Cancel</button>
			</form>
		</div>
	`,
	components: {
		'skill-card': SkillCard
	},
	props: ['categories', 'categoryId', 'skillId'],
	data: function() {
		return {
			category: {},
			skill: {}
		}
	},
	created: function() {
		var vm = this;
		this.category = this.categories.find(function (cat) {
			return cat.id == vm.categoryId;
		});
		this.skill = JSON.parse(JSON.stringify(this.category.skills.find(function (skill) {
			return skill.id == vm.skillId;
		})));
	},
	methods: {
		onUploadClick: function() {
			var filters = [
				{ mimetype: 'image/png' },
				{ mimetype: 'image/jpeg' },
				{ activity: 'org.olpcfrance.PaintActivity' }
			];
			var vm = this;
			this.$root.$refs.SugarJournal.insertFromJournal(filters, function (data, metadata) {
				if(metadata.activity == 'org.olpcfrance.PaintActivity') {
					vm.skill.image = vm.$root.$refs.SugarJournal.LZString.decompressFromUTF16(JSON.parse(data).src);
				} else {
					vm.skill.image = data;
				}
			});
		},
		onConfirm: function() {
			var vm = this;
			var catIndex = this.categories.findIndex(function (cat) {
				return cat.id === vm.categoryId;
			});
			var skillIndex = this.categories[catIndex].skills.findIndex(function (skill) {
				return skill.id === vm.skillId;
			});
			this.categories[catIndex].skills[skillIndex] = this.skill;
			this.$emit('go-back-to', 'skills-grid');
		}
	}
}