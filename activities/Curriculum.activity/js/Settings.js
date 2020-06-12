var CategorySettings = {
	/*html*/
	template: `
		<div class="settings category-settings">
			<category-card 
				:category="category"
			></category-card>
			<form @submit.prevent="onConfirm">
				<div>
					<label for="title">{{ l10nCatSettings.stringTitle }}</label>
					<input type="text" name="title" v-model="category.title" required>
				</div>
				<div>
					<label for="color">{{ l10nCatSettings.stringColor }}</label>
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
						<span>{{ l10nCatSettings.stringConfirm }}</span>
					</button>
					<button type="button" @click="$emit('go-back-to', 'categories-grid')">
						<img src="icons/dialog-cancel.svg">
						<span>{{ l10nCatSettings.stringCancel }}</span>
					</button>
				</div>
			</form>
		</div>
	`,
	components: {
		'category-card': CategoryCard
	},
	props: ['categories', 'categoryId', 'user', 'l10n'],
	data: function() {
		return {
			category: {
				color: '',
				skills: []
			},
			originalTitle: '',
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
			l10nCatSettings: {
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

			this.originalTitle = this.category.title;
			if(this.category.title.indexOf('DefaultSkillSet') != -1) {
				this.category.title = this.l10n['string' + this.category.title];
			}
		} else {													// Add category
			this.category.color = this.colors[Math.floor(Math.random()*this.colors.length)];
		}
	},
	mounted: function() {
		this.$root.$refs.SugarL10n.localize(this.l10nCatSettings);
	},
	methods: {
		onConfirm: function() {
			if(this.categoryId != null) {			// Edit category
				var vm = this;
				var index = this.categories.findIndex(function (cat) {
					return cat.id === vm.categoryId;
				});

				// Deafult title check
				if(this.originalTitle.indexOf('DefaultSkillSet') != -1 
						&& this.category.title == this.l10n['string' + this.originalTitle]) {
					this.category.title = this.originalTitle;
				}
				
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
					<label for="title">{{ l10nSkillSettings.stringTitle }}</label>
					<input type="text" name="title" v-model="skill.title" required>
				</div>
				<div>
					<div class="image-label">
						<label for="image">{{ l10nSkillSettings.stringImage }}</label>
						<button type="button" id="image-edit-button" @click="onUploadClick"></button>
					</div>
					<img :src="skill.image">
				</div>
				<div class="buttons-row">
					<button type="submit" :disabled="skill.title == ''">
						<img src="icons/dialog-ok.svg">
						<span>{{ l10nSkillSettings.stringConfirm }}</span>
					</button>
					<button type="button" @click="$emit('go-back-to', 'skills-grid')">
						<img src="icons/dialog-cancel.svg">
						<span>{{ l10nSkillSettings.stringCancel }}</span>
					</button>
				</div>
			</form>
		</div>
	`,
	components: {
		'skill-card': SkillCard
	},
	props: ['categories', 'categoryId', 'skillId', 'user', 'l10n'],
	data: function() {
		return {
			category: {},
			skill: {
				title: '',
				image: 'images/default.jpg'
			},
			originalTitle: '',
			l10nSkillSettings: {
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

			this.originalTitle = this.skill.title;
			if(this.skill.title.indexOf('DefaultSkillSet') != -1) {
				this.skill.title = this.l10n['string' + this.skill.title];
			}
		}
	},
	mounted: function() {
		this.$root.$refs.SugarL10n.localize(this.l10nSkillSettings);
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

				// Deafult title check
				if(this.originalTitle.indexOf('DefaultSkillSet') != -1 
						&& this.skill.title == this.l10n['string' + this.originalTitle]) {
					this.skill.title = this.originalTitle;
				}
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
				acquired: false,
				media: {}
			});

		}
	}
}