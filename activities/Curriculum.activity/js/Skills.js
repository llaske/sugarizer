// The components Medal and UploadItem are defined in SkillsAdditional.js

var SkillCard = {
	/*html*/
	template: `
		<div 
			class="skill-card" 
			:style="{ border: 'solid 2px ' + category.color }"
			@click="$emit('skill-clicked', skill.id)"		
		>
			<medal small :acquired="acquired"></medal>
			<img :src="skill.image" class="skill-image">
			<div ref="footer" class="skill-footer">
				<h2 class="skill-title" v-html="skill.title"></h2>
			</div>
		</img>
	`,
	components: {
		'medal': Medal
	},
	props: ['skill', 'category', 'user'],
	computed: {
		acquired: function () {
			if (this.user.skills[this.category.id][this.skill.id]) {
				return this.user.skills[this.category.id][this.skill.id].acquired;
			}
			return false;
		}
	},
	mounted: function () {
		this.$refs.footer.style.background = this.category.color;
		this.$refs.footer.style.boxShadow = '0 3px 15px ' + this.category.color;
	}
};

var SkillsGrid = {
	/*html*/
	template: `
		<div class="skills">
			<button id="back-button" @click="goBackTo"></button>
			<h1 class="category-title">
				{{ category.title }} 
				<span ref="underline1" class="underline"></span> 
				<span ref="underline2" class="underline"></span>
			</h1>
			
			<div class="skills-container">
				<skill-card 
					v-for="skill in category.skills" 
					:key="skill.id" 
					:skill="skill" 
					:category="category"
					:user="user"
					@skill-clicked="onSkillClick"
				></skill-card>
			</div>

		</div>
	`,
	components: {
		'skill-card': SkillCard,
	},
	props: ['categories', 'categoryId', 'user'],
	computed: {
		category: function () {
			var vm = this;
			return this.categories.find(function (cat) {
				return cat.id == vm.categoryId;
			});
		}
	},
	mounted: function () {
		//Handling styles
		this.$refs.underline1.style.background = this.category.color;
		this.$refs.underline2.style.background = this.category.color;
	},
	methods: {
		onSkillClick: function (skillId) {
			this.$emit('open-skill', this.category.id, skillId);
		},
		goBackTo: function () {
			this.$emit('go-back-to', 'categories-grid');
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
						<div v-if="uploads.length == 0">
							<div ref="uploadPreview" class="preview-icon"></div>
							<p>Click on upload to integrate some proofs of your skill</p>
						</div>
						<p v-else>{{ uploads.length }}</p>
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