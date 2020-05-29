var Flag = {
	/*html*/
	template: `
		<div class="flag">
			<div v-if="small" class="flag-small">
				<div class="pole"></div>
				<img :src="raised ? 'icons/flag-green.svg' : 'icons/flag-red.svg'" class="fly" :style="{ top: raised ? '0' : '50%' }">
			</div>
			<div v-else class="flag-large">
				<img src="icons/clouds.svg" class="bg">
				<div class="pole"></div>
				<img :src="raised ? 'icons/flag-green.svg' : 'icons/flag-red.svg'" class="fly" :style="{ top: raised ? '0' : '50%' }">
				<img v-if="raised" src="icons/flag-star.svg" class="star1">
				<img v-if="raised" src="icons/flag-star.svg" class="star2">
			</div>
		</div>
	`,
	props: {
		small: Boolean,
		raised: Boolean
	},
	data: {},
	methods: {}
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
	},
	data: {},
	methods: {}
};

var SkillsGrid = {
	/*html*/
	template: `
		<div class="skills">
			<img src="icons/go-left.svg" id="back-button" @click="goBack">
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
		'skill-card': SkillCard
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
	data: {},
	mounted: function () {
		//Handling styles
		this.$refs.underline1.style.background = this.category.color;
		this.$refs.underline2.style.background = this.category.color;
	},
	methods: {
		onSkillClick: function (skillId) {
			this.$emit('open-skill', this.category.id, skillId);
		},
		goBack: function() {
			this.$emit('go-back-to', 'categories-grid');
		}
	}
}

var SkillDetails = {
	/*html*/
	template: `
		<div class="skills">
			<img src="icons/go-left.svg" id="back-button" @click="goBack">
			<h1 class="category-title">
				{{ category.title }} 
				<span ref="underline1" class="underline"></span>
				<span ref="underline2" class="underline"></span>
			</h1>
			<div class="skill-details">
				<div class="skill-info-container">
					<img :src="skill.image" class="skill-image">
					<div class="skill-info">
						<h1>
							{{ skill.title }}
							<span ref="underline3" class="underline"></span>	
						</h1>
						<p>{{ skill.description }}</p>
					</div>
				</div>
				<div class="skill-uploads">
					<flag :raised="currentAcquired"></flag>
					<div class="uploads"></div>
				</div>
			</div>
		</div>
	`,
	components: {
		'flag': Flag
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
		}
	},
	data: {},
	mounted: function () {
		//Handling styles
		this.$refs.underline1.style.background = this.category.color;
		this.$refs.underline2.style.background = this.category.color;
		this.$refs.underline3.style.background = this.category.color;
	},
	methods: {
		goBack: function() {
			this.$emit('go-back-to', 'skills-grid');
		}
	}
}