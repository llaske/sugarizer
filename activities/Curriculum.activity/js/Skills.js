// The components Flag and UploadItem are defined in SkillsAdditional.js

var SkillsLayout = {
	/*html*/
	template: `
		<div class="skills">
			<img src="icons/go-left.svg" id="back-button" @click="goBackTo">
			<h1 class="category-title">
				{{ category.title }} 
				<span ref="underline1" class="underline"></span> 
				<span ref="underline2" class="underline"></span>
			</h1>
			<slot></slot>
		</div>
	`,
	props: ['category', 'backTo'],
	mounted: function () {
		//Handling styles
		this.$refs.underline1.style.background = this.category.color;
		this.$refs.underline2.style.background = this.category.color;
	},
	methods: {
		goBackTo: function() {
			this.$emit('go-back-to', this.backTo);
		}
	}
}

var SkillCard = {
	/*html*/
	template: `
		<div 
			class="skill-card" 
			:style="{ border: 'solid 2px ' + category.color }"
			@click="$emit('skill-clicked', skill.id)"		
		>
			<flag small :raised="acquired"></flag>
			<img :src="skill.image" class="skill-image">
			<div ref="footer" class="skill-footer">
				<h2 class="skill-title">{{ skill.title }}</h2>
			</div>
		</div>
	`,
	components: {
		'flag': Flag
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
		<skills-layout :category="category" backTo="categories-grid" @go-back-to="$emit('go-back-to', $event)">
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
		</skills-layout>
	`,
	components: {
		'skills-layout': SkillsLayout,
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
	methods: {
		onSkillClick: function (skillId) {
			this.$emit('open-skill', this.category.id, skillId);
		}
	}
}

var SkillDetails = {
	/*html*/
	template: `
		<div class="">
			<div id="back-button" @click="goBackTo"></div>
			<div class="skill-details">
				<div class="skill-info-container">
					<div class="skill-info">
						<h1>
							{{ skill.title }}
							<span ref="underline3" class="underline"></span>	
						</h1>
						<p>{{ skill.description }}</p>
					</div>
					<img :src="skill.image" class="skill-image">
				</div>
				<div class="skill-uploads">
					<!-- <flag :raised="currentAcquired"></flag> -->
					<div class="uploads">
						<div class="upload-preview" :class="{ 'uploaded': uploads.length != 0 }">
							<div ref="uploadPreview" class="preview-icon"></div>
							<p v-if="uploads.length == 0">No uploads for this skill</p>
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
		</div>
	`,
	components: {
		'skills-layout': SkillsLayout,
		'flag': Flag,
		'upload-item': UploadItem
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
			for(var key in mediaObj) {
				mediaObj[key].forEach(function(item) {
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
		requirejs(["sugar-web/graphics/icon"], function(icon) {
			icon.colorize(vm.$refs.uploadPreview, { fill: "#d3d3d3", stroke: "#d3d3d3" })
		})
	},
	methods: {
		sortUploads: function(array) {
			array.sort(function(a, b) {
				return b.timestamp - a.timestamp;
			});
			return array;
		},
		goBackTo: function() {
			this.$emit('go-back-to', 'skills-grid');
		}
	}
}