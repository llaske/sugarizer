var CategorySettings = {
	/*html*/
	template: `
		<div class="settings category-settings">
			<category-card 
				:category="category"
			></category-card>
			<form @submit.prevent="onConfirm">
				<div>
					<label for="title">{{ l10n.stringTitle }}</label>
					<input type="text" name="title" v-model="category.title" required>
				</div>
				<div>
					<label for="color">{{ l10n.stringColor }}</label>
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
				<div class="buttons-row">
					<button type="submit" :disabled="category.title == ''">
						<img src="icons/dialog-ok.svg">
						<span>{{ l10n.stringConfirm }}</span>
					</button>
					<button type="button" @click="$emit('go-back-to', 'categories-grid')">
						<img src="icons/dialog-cancel.svg">
						<span>{{ l10n.stringCancel }}</span>
					</button>
				</div>
			</form>
		</div>
	`,
	components: {
		'category-card': CategoryCard
	},
	props: ['categories', 'categoryId', 'user'],
	data: function() {
		return {
			category: {
				color: '',
				skills: []
			},
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
			l10n: {
				stringTitle: '',
				stringColor: '',
				stringConfirm: '',
				stringCancel: ''
			}
		}
	},
	created: function() {
		var vm = this;
		if(this.categoryId != null) {			// Edit category
			this.category = JSON.parse(JSON.stringify(this.categories.find(function (cat) {
				return cat.id == vm.categoryId;
			})));

			if(this.colors.indexOf(this.category.color) == -1) {
				this.colors.push(this.category.color);
			}
		} else {													// Add category
			this.category.color = this.colors[Math.floor(Math.random()*this.colors.length)];
		}
	},
	mounted: function() {
		this.$root.$refs.SugarL10n.localize(this.l10n);
	},
	methods: {
		onConfirm: function() {
			if(this.categoryId != null) {			// Edit category
				var vm = this;
				var index = this.categories.findIndex(function (cat) {
					return cat.id === vm.categoryId;
				});
				
				this.categories[index] = this.category;
			} else {													// Add category
				this.addCategory();
			}
			this.$emit('go-back-to', 'categories-grid');
		},

		addCategory: function() {
			var nextId = this.categories.length;
			this.category.id = nextId;
			this.categories.unshift(this.category);
			this.$set(this.user.skills, nextId, new Object());
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
					<label for="title">{{ l10n.stringTitle }}</label>
					<input type="text" name="title" v-model="skill.title" required>
				</div>
				<div>
					<div class="image-label">
						<label for="image">{{ l10n.stringImage }}</label>
						<button type="button" id="image-edit-button" @click="onUploadClick"></button>
					</div>
					<img :src="skill.image">
				</div>
				<div class="buttons-row">
					<button type="submit" :disabled="skill.title == ''">
						<img src="icons/dialog-ok.svg">
						<span>{{ l10n.stringConfirm }}</span>
					</button>
					<button type="button" @click="$emit('go-back-to', 'skills-grid')">
						<img src="icons/dialog-cancel.svg">
						<span>{{ l10n.stringCancel }}</span>
					</button>
				</div>
			</form>
		</div>
	`,
	components: {
		'skill-card': SkillCard
	},
	props: ['categories', 'categoryId', 'skillId', 'user'],
	data: function() {
		return {
			category: {},
			skill: {
				title: '',
				image: 'images/default.jpg'
			},
			l10n: {
				stringTitle: '',
				stringImage: '',
				stringConfirm: '',
				stringCancel: ''
			}
		}
	},
	created: function() {
		var vm = this;
		this.category = this.categories.find(function (cat) {
			return cat.id == vm.categoryId;
		});
		if(this.skillId != null) {				// Edit skill
			this.skill = JSON.parse(JSON.stringify(this.category.skills.find(function (skill) {
				return skill.id == vm.skillId;
			})));
		}
	},
	mounted: function() {
		this.$root.$refs.SugarL10n.localize(this.l10n);
	},
	methods: {
		onUploadClick: function() {
			var filters = [
				{ mimetype: 'image/png' },
				{ mimetype: 'image/jpeg' },
				{ activity: 'org.olpcfrance.PaintActivity' }
			];
			var vm = this;
			requirejs(["sugar-web/datastore", "sugar-web/graphics/journalchooser", "activity/CurriculumChooser"], function (datastore, journalchooser, CurriculumChooser) {
				journalchooser.init = function () {
					journalchooser.features = [journalchooser.featureLocalJournal]
					journalchooser.features.push(CurriculumChooser);
					journalchooser.currentFeature = 0;
				}
				setTimeout(function () {
					journalchooser.show(function (entry) {
						if (!entry) {
							return;
						}

						if (entry.metadata.activity == "org.olpcfrance.Curriculum") {
							vm.skill.image = entry.path;
						} else if (entry.objectId) {
							var dataentry = new datastore.DatastoreObject(entry.objectId);
							dataentry.loadAsText(function (err, metadata, data) {
								if (err) {
									console.error(err);
									return;
								}
								if(metadata.activity == 'org.olpcfrance.PaintActivity') {
									vm.skill.image = vm.$root.$refs.SugarJournal.LZString.decompressFromUTF16(JSON.parse(data).src);
								} else {
									vm.skill.image = data;
								}
							});
						}
					}, filters[0], filters[1], filters[2], filters[3]);
				}, 0);
			});
		},

		onConfirm: function() {
			var vm = this;
			var catIndex = this.categories.findIndex(function (cat) {
				return cat.id === vm.categoryId;
			});
			if(this.skillId != null) {				// Edit skill
				var skillIndex = this.categories[catIndex].skills.findIndex(function (skill) {
					return skill.id === vm.skillId;
				});

				this.categories[catIndex].skills[skillIndex] = this.skill;
			} else {													// Add skill
				this.addSkill(catIndex);
			}
			this.$emit('go-back-to', 'skills-grid');
		},

		addSkill: function(catIndex) {
			var nextId = this.categories[catIndex].skills.length;
			this.skill.id = nextId;
			this.categories[catIndex].skills.unshift(this.skill);
			this.$set(this.user.skills[this.categoryId], nextId, {
				acquired: 0,
				media: {}
			});

		}
	}
}