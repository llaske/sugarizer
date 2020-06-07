// The components Medal and UploadItem are defined in SkillsAdditional.js

var SkillCard = {
	/*html*/
	template: `
		<div 
			class="skill-card" 
			:class="{ 'settings-active': settings }"
			:style="{ border: 'solid 2px ' + category.color }"
			@click="$emit('skill-clicked', skill.id)"		
		>
			<div class="settings-row" v-if="settings">
				<button id="edit-button" @click=""></button>
				<button id="delete-button" @click.stop="onDeleteClick"></button>
			</div>
			<medal v-else small :acquired="acquired"></medal>
			<img :src="skill.image" class="skill-image">
			<div ref="footer" class="skill-footer">
				<h2 class="skill-title" v-html="skill.title"></h2>
			</div>
		</img>
	`,
	components: {
		'medal': Medal
	},
	props: ['skill', 'category', 'user', 'settings'],
	computed: {
		acquired: function () {
			if (this.user && this.user.skills[this.category.id][this.skill.id]) {
				return this.user.skills[this.category.id][this.skill.id].acquired;
			}
			return false;
		}
	},
	mounted: function () {
		this.$refs.footer.style.background = this.category.color;
		this.$refs.footer.style.boxShadow = '0 3px 15px ' + this.category.color;
	},
	methods: {
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
			
			<div class="skills-container">
				<skill-card 
					v-for="skill in category.skills" 
					:key="skill.id" 
					:skill="skill" 
					:category="category"
					:user="user"
					:settings="settings"
					@skill-clicked="onSkillClick"
					@delete-clicked="deleteSkill"
				></skill-card>
			</div>

		</div>
	`,
	components: {
		'skill-card': SkillCard,
	},
	props: ['categories', 'categoryId', 'user', 'settings'],
	computed: {
		category: function () {
			var vm = this;
			return this.categories.find(function (cat) {
				return cat.id == vm.categoryId;
			});
		}
	},
	methods: {
		onSkillClick: function (skillId) {
			this.$emit('open-skill', this.category.id, skillId);
		},

		goBackTo: function () {
			this.$emit('go-back-to', 'categories-grid');
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
				<h1 v-html="skill.title"></h1>
				<span ref="underline3" class="underline"></span>	
				<medal :acquired="currentAcquired" />
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
							<p>Click on upload to integrate some proofs of your skill</p>
						</div>
						<p v-show="uploads.length > 0">{{ uploads.length }}</p>
					</div>
					<upload-item
						v-for="item in uploads" 
						:key="item.timestamp" 
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
	props: ['categories', 'categoryId', 'skillId', 'user', 'currentAcquired'],
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
		//Handling styles
		this.$refs.underline3.style.background = this.category.color;
		var vm = this;
		requirejs(["sugar-web/graphics/icon"], function (icon) {
			icon.colorize(vm.$refs.uploadPreview, { fill: "#d3d3d3", stroke: "#d3d3d3" })
		})
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