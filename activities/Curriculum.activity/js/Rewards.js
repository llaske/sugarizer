var Trophy = {
	/*html*/
	template: `
		<div class="trophy-container">
			<div ref="trophy" class="trophy" v-show="!acquired"></div>
			<div ref="trophyAcquired" class="trophy acquired" v-show="acquired"></div>
		</div>
	`,
	props: {
		acquired: Boolean,
		notationLevel: Number,
		levels: Object
	},
	data: {
		icon: null
	},
	computed: {
		colors: function() {
			if(this.$root.$refs.SugarActivity.getEnvironment()) {
				return this.$root.$refs.SugarActivity.getEnvironment().user.colorvalue;
			}
			return { fill: "#aaa", stroke: "#333" };
		}
	},
	watch: {
		colors: function(newVal, oldVal) {
			this.colorizeElements(newVal);
		}
	},
	mounted: function () {
		var vm = this;
		requirejs(["sugar-web/graphics/icon"], function (icon) {
			vm.icon = icon;
			vm.colorizeElements(vm.colors);
		});
	},
	methods: {
		colorizeElements(colors) {
			this.icon.colorize(this.$refs.trophyAcquired, colors);
			// this.icon.colorize(this.$refs.shine1, colors);
			// this.icon.colorize(this.$refs.shine2, colors);
		}
	}
}

var Rewards = {
	/*html*/
	template: `
		<div class="rewards-container">
			{{ totalSkillsAcquired }}/{{ totalSkills }} Skills Acquired
			<div class="trophies">
				<trophy v-for="n in 5" :key="n" :acquired="n == 1 || n == 5" />
			</div>
		</div>
	`,
	components: {
		'trophy': Trophy
	},
	props: ['categories', 'user'],
	computed: {
		totalSkills: function() {
			var count = 0;
			this.categories.forEach(function(cat) {
				count += cat.skills.length;
			});
			return count;
		},
		totalSkillsAcquired: function() {
			var count = 0;
			this.user.skills.forEach(function(cat) {
				for(var skillId in cat) {
					if(cat[skillId].acquired) count++;
				}
			});
			return count;
		}
	},
	mounted: function() {

	},
	methods: {

	}
}