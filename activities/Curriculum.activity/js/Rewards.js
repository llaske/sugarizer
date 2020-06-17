var Trophy = {
	/*html*/
	template: `
		<div class="trophy-container">
			<div ref="trophyAcquired" class="trophy" :class="{ acquired: acquired }"></div>
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
			if(this.acquired && this.$root.$refs.SugarActivity.getEnvironment()) {
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
			<div class="stats-container">
				<table class="level-distribution">
					<tr v-for="(level, key) in levelWiseAcquired" :key="key">
						<td class="text">{{ level.text }}</td>
						<td class="bar-container">
							<div class="bar" :style="{ width: level.skills/totalSkills*100 + '%', background: colors.fill }"></div>
						</td>
					</tr>
				</table>
				<div class="stat-card" :style="{ background: 'linear-gradient(180deg, ' + colors.fill + ' 50%, black 200%)' }">
					<span class="acquired">{{ totalSkillsAcquired }}</span><span class="total">/{{ totalSkills }}</span>
					<p>Skills Acquired</p>
				</div>
			</div>
			<div class="trophies-container">
				<div class="trophies">
					<trophy v-for="n in 5" :key="n" :acquired="n == 1 || n == 5" />
				</div>
				<div class="trophies">
					<trophy v-for="n in 5" :key="n" :acquired="n == 1 || n == 5" />
				</div>
			</div>
		</div>
	`,
	components: {
		'trophy': Trophy
	},
	props: ['categories', 'user', 'levels', 'notationLevel'],
	computed: {
		colors: function() {
			if(this.$root.$refs.SugarActivity.getEnvironment()) {
				return this.$root.$refs.SugarActivity.getEnvironment().user.colorvalue;
			}
			return {
				fill: "#d3d3d3",
				stroke: "#000000"
			}
		},
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
		},
		levelWiseAcquired: function() {
			var levelWiseAcquired = {};
			for(var key in this.levels[this.notationLevel]) {
				levelWiseAcquired[key] = {}
				levelWiseAcquired[key].text = this.levels[this.notationLevel][key].text;
				levelWiseAcquired[key].skills = 0;
			};
			this.user.skills.forEach(function(cat) {
				for(var skillId in cat) {
					levelWiseAcquired[cat[skillId].acquired].skills++;
				}
			});
			return levelWiseAcquired;
		}
	},
	mounted: function() {

	},
	methods: {

	}
}