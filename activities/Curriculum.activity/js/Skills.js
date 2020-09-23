// The components Medal and UploadItem are defined in SkillsAdditional.js

var SkillCard = {
	/*html*/
	template: `
		<div
			class="skill-card"
			:class="{ 'settings-active': settings }"
			:style="{ border: 'solid 2px ' + category.color }"
			@click="onSkillClick"
		>
				<div class="settings-row">
					<transition name="settings-zoom">
						<button id="edit-button" @click="onEditClick" v-if="settings"></button>
					</transition>
					<transition name="settings-zoom">
						<button id="delete-button" @click.stop="onDeleteClick" v-if="settings"></button>
						<medal v-else small :acquired="acquired" :levels="levels" :notation-level="notationLevel" :userColors="userColors"></medal>
					</transition>
				</div>
			<img :src="skill.image" alt="Skill image" class="skill-image" loading="lazy">
			<div ref="footer" class="skill-footer">
				<h2 class="skill-title">{{ skill.title }}</h2>
			</div>
		</img>
	`,
	components: {
		'medal': Medal
	},
	props: ['skill', 'category', 'user', 'settings', 'levels', 'notationLevel', 'userColors'],
	computed: {
		acquired: function () {
			if (this.user && this.user.skills[this.category.id][this.skill.id]) {
				return this.user.skills[this.category.id][this.skill.id].acquired;
			}
			return 0;
		}
	},
	mounted: function () {
		this.$refs.footer.style.background = this.category.color;
		this.$refs.footer.style.boxShadow = '0 3px 15px ' + this.category.color;
	},
	methods: {
		onSkillClick: function() {
			if(this.settings) return;
			this.$emit('skill-clicked', this.skill.id)
		},
		onEditClick: function() {
			this.$emit('edit-skill-clicked', this.skill.id)
		},
		onDeleteClick: function() {
			this.$emit('delete-clicked', this.skill.id);
		}
	}
};

var SkillsGrid = {
	/*html*/
	template: `
		<div class="skills">
			<button id="back-button" @click="goBackTo"></button>
			<h1 class="category-title">
				{{ category.title }}
				<span ref="underline1" class="underline" :style="{ backgroundColor: category.color }"></span>
				<span ref="underline2" class="underline" :style="{ backgroundColor: category.color }"></span>
			</h1>

			<div>
				<draggable class="skills-container" v-model="category.skills" :disabled="!settings" :animation="300">
					<skill-card
						v-for="(skill, i) in category.skills"
						:key="skill.id"
						:id="i"
						v-show="matchesSearch(skill.title)"
						:skill="skill"
						:category="category"
						:user="user"
						:settings="settings"
						:levels="levels"
						:notationLevel="notationLevel"
						:userColors="userColors"
						@skill-clicked="onSkillClick"
						@edit-skill-clicked="onEditSkillClick"
						@delete-clicked="deleteSkill"
					></skill-card>
				</draggable>
			</div>

		</div>
	`,
	components: {
		'skill-card': SkillCard,
	},
	props: ['categories', 'categoryId', 'user', 'settings', 'levels', 'notationLevel', 'searchQuery', 'userColors'],
	computed: {
		category: function () {
			var vm = this;
			return this.categories.find(function (cat) {
				return cat.id == vm.categoryId;
			});
		}
	},
	methods: {
		matchesSearch(str) {
			var regex = new RegExp(this.searchQuery, "i")
			if(str.search(regex) != -1) {
				return true;
			}
			return false;
		},

		onSkillClick: function (skillId) {
			this.$emit('open-skill', this.category.id, skillId);
		},

		goBackTo: function () {
			this.$emit('go-back-to', 'categories-grid');
		},

		onEditSkillClick: function(skillId) {
			this.$emit('edit-skill', this.category.id, skillId);
		},

		deleteSkill: function (skillId) {
			var vm = this;
			var catIndex = this.categories.findIndex(function (cat) {
				return cat.id == vm.categoryId;
			});
			var skillIndex = this.categories[catIndex].skills.findIndex(function (skill) {
				return skill.id == skillId;
			});
			this.categories[catIndex].skills.splice(skillIndex, 1);
			Vue.delete(this.user.skills[this.categoryId], skillId);
		}
	}
}

var SkillDetails = {
	/*html*/
	template: `
		<div class="skill-details">
			<button id="back-button" @click="goBackTo"></button>
			<div class="skill-title">
				<h1>{{ skill.title }}</h1>
				<span ref="underline3" class="underline"></span>
				<medal
					:acquired="currentAcquired"
					:levels="levels"
					:notation-level="notationLevel"
					:userColors="userColors"
					@click="$root.switchSkillLevel"
				/>
			</div>
			<div class="skill-contents">
				<div class="skill-image">
					<img :src="skill.image">
				</div>
				<!-- <flag :raised="currentAcquired"></flag> -->
				<div class="skill-uploads">
					<div class="upload-preview" :class="{ 'uploaded': uploads.length != 0 }">
						<div v-show="uploads.length == 0">
							<div ref="uploadPreview" class="preview-icon"></div>
							<p>{{l10n.stringUploadSkill}}</p>
						</div>
						<p v-show="uploads.length > 0">{{ uploads.length }}</p>
					</div>
					<upload-item
						v-for="(item, i) in uploads"
						:key="item.timestamp"
						:id="i"
						:item="item"
						@delete-item="$emit('delete-item', item)"
					/>
				</div>
			</div>
		</div>
	`,
	components: {
		'upload-item': UploadItem,
		'medal': Medal
	},
	props: ['categories', 'categoryId', 'skillId', 'user', 'currentAcquired', 'levels', 'notationLevel', 'userColors'],
	data: () => ({
		l10n: {
			stringUploadSkill: ''
		}
	}),
	computed: {
		category: function () {
			var vm = this;
			return this.categories.find(function (cat) {
				return cat.id == vm.categoryId;
			});
		},
		skill: function () {
			var vm = this;
			return this.category.skills.find(function (skill) {
				return skill.id == vm.skillId;
			});
		},
		uploads: function () {
			var uploads = [];
			var mediaObj = this.user.skills[this.categoryId][this.skillId].media;
			for (var key in mediaObj) {
				mediaObj[key].forEach(function (item) {
					item.type = key;
					uploads.push(item);
				});
			}
			return this.sortUploads(uploads);
		},
	},
	mounted: function () {
		this.$root.$refs.SugarL10n.localize(this.l10n);
		//Handling styles
		this.$refs.underline3.style.background = this.category.color;
	},
	methods: {
		sortUploads: function (array) {
			array.sort(function (a, b) {
				return b.timestamp - a.timestamp;
			});
			return array;
		},
		goBackTo: function () {
			this.$emit('go-back-to', 'skills-grid');
		}
	}
}
