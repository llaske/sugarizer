var Trophy = {
	/*html*/
	template: `
		<div class="trophy-container">
			<div ref="trophyAcquired" class="trophy" :class="{ acquired: acquired }"></div>
		</div>
	`,
	props: {
		acquired: Boolean,
		userColors: Object
	},
	data: {
		icon: null
	},
	computed: {
		colors: function () {
			if (this.acquired && this.userColors) {
				return this.userColors;
			}
			return { fill: "#aaa", stroke: "#333" };
		}
	},
	watch: {
		colors: function (newVal, oldVal) {
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
		<!--	<div class="stats-container">
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
			</div> -->
			<div style="position: absolute; left: 0; top: 0; color: #d3d3d3;" :style="{ display: false ? 'block' : 'none' }">
				Debug <br>
				Total: {{ totalSkills }} <br>
				Skills acquired: {{ totalSkillsAcquired }} <br>
				Categories acquired: {{ totalCategoriesAcquired }} <br>
				Media uploaded: {{ totalMediaUploaded }}
			</div>
			<div class="trophies-container">
				<div class="trophy-card" v-for="item in achievements" :key="item.title">
					<trophy :userColors="userColors" :acquired="evalCondition(item)" />
					<h4>{{ item.title }}</h4>
					<p 
						v-if="user.achievements[item.id].timestamp" 
						:key="$root.$refs.SugarL10n"
					>{{ timestampToElapsedString(user.achievements[item.id].timestamp, 2) }}</p>
					<p v-else>{{ getProperty(item.condition.property) }}/{{ computeValue(item.condition) }}</p>
				</div>
			</div>
		</div>
	`,
	components: {
		'trophy': Trophy
	},
	props: ['achievements', 'categories', 'user', 'levels', 'notationLevel', 'userColors'],
	computed: {
		totalSkills: function () {
			var count = 0;
			this.categories.forEach(function (cat) {
				count += cat.skills.length;
			});
			return count;
		},
		totalCategories: function () {
			return this.categories.length;
		},
		totalSkillsAcquired: function () {
			var count = 0;
			this.user.skills.forEach(function (cat) {
				for (var skillId in cat) {
					if (cat[skillId].acquired) count++;
				}
			});
			return count;
		},
		totalCategoriesAcquired: function () {
			var vm = this;
			var count = 0;
			this.user.skills.forEach(function (cat) {
				var allAcquired = true;
				for (var skillId in cat) {
					if (cat[skillId].acquired != vm.notationLevel) {
						allAcquired = false;
						break;
					}
				}
				if (allAcquired) count++;
			});
			return count;
		},
		totalMediaUploaded: function () {
			var vm = this;
			var count = 0;
			this.user.skills.forEach(function (cat) {
				for (var skillId in cat) {
					for (var type in cat[skillId].media) {
						count += cat[skillId].media[type].length;
					}
				}
			});
			return count;
		},
		levelWiseAcquired: function () {
			var levelWiseAcquired = {};
			for (var key in this.levels[this.notationLevel]) {
				levelWiseAcquired[key] = 0
			};
			this.user.skills.forEach(function (cat) {
				for (var skillId in cat) {
					levelWiseAcquired[cat[skillId].acquired]++;
				}
			});
			return levelWiseAcquired;
		}
	},
	data: function () {
		return {
			units: [
				{ name: 'Years', factor: 356 * 24 * 60 * 60 },
				{ name: 'Months', factor: 30 * 24 * 60 * 60 },
				{ name: 'Weeks', factor: 7 * 24 * 60 * 60 },
				{ name: 'Days', factor: 24 * 60 * 60 },
				{ name: 'Hours', factor: 60 * 60 },
				{ name: 'Minutes', factor: 60 }
			],
			isMounted: false,
			l10n: {
				stringYears: '',
				stringMonths: '',
			}
		}
	},
	mounted: function () {
		this.isMounted = true;
		this.$root.$refs.SugarL10n.localize(this.l10n);
		console.log(this.l10n);
	},
	methods: {
		evalCondition: function (item) {
			var value = this.computeValue(item.condition);
			var property = this.getProperty(item.condition.property);
			var result;
			// console.log('poperty', property, 'value', value);

			switch (item.condition.op) {
				case '==':
					result = property == value;
					break;
				case '!=':
					result = property != value;
					break;
				case '>=':
					result = property >= value;
					break;
				case '>':
					result = property > value;
					break;
				case '<=':
					result = property <= value;
					break;
				case '<':
					result = property < value;
					break;
			}

			this.updateAchievement(item, result);
			return result;
		},

		computeValue: function (condition) {
			var value = condition.value;
			if (typeof condition.value == "object") {
				value = this.getProperty(condition.value.property);
				switch (condition.value.op) {
					case '+':
						value += condition.value.value;
						break;
					case '-':
						value -= condition.value.value;
						break;
					case '*':
						value *= condition.value.value;
						break;
					case '/':
						value /= condition.value.value;
						break;
				}
			}
			return Math.floor(value);
		},

		getProperty: function (property) {
			var match = property.match(/\[\w+((this)?\[?\w+\]?)?\w*\]/g);
			var result = this;
			var vm = this;
			match.forEach(function (item) {
				var propertyName = item.match(/\w+((this)?\[?\w+\]?)?\w*/g);
				if (propertyName[0].match(/(this\[)/)) {
					propertyName = vm.getProperty(propertyName[0]);
				}
				result = result[propertyName];
			});
			return result;
		},

		updateAchievement: function (item, result) {
			if (result) {
				if (this.user.achievements[item.id].timestamp == null) {
					this.user.achievements[item.id].timestamp = Date.now();
					var vm = this;
					this.generateIconWithColors("../icons/trophy-large.svg", this.userColors, function (src) {
						var img = "<img style='height:40px; margin:10px; vertical-align:middle;' src='" + src + "'>";
						var html = `<div style="display: flex; align-items:center;">${img} <span><small style="color:#d3d3d3">Achievement acquired</small><br>${item.title}</span></div>`
						vm.$root.$refs.SugarPopup.log(html);
					});
				}
			} else if (this.user.achievements[item.id].timestamp != null) {
				this.user.achievements[item.id].timestamp = null;
			}
		},

		generateIconWithColors: function (path, colors, callback) {
			requirejs([`text!${path}`], function (icon) {
				icon = icon.replace(/(stroke)_color\s\"#?\w*\"/, `stroke_color "${colors.stroke}"`);
				icon = icon.replace(/(fill)_color\s\"#?\w*\"/, `fill_color "${colors.fill}"`);
				callback("data:image/svg+xml;base64," + btoa(icon));
			});
		},

		timestampToElapsedString: function (timestamp, maxlevel, issmall) {
			console.log('timestampToElapsedString called');
			var suffix = (issmall ? "_short" : "");
			var levels = 0;
			var time_period = '';
			var elapsed_seconds = ((new Date().getTime()) - timestamp) / 1000;
			for (var i = 0; i < this.units.length; i++) {
				var factor = this.units[i].factor;

				var elapsed_units = Math.floor(elapsed_seconds / factor);
				if (elapsed_units > 0) {
					if (levels > 0)
						time_period += ',';

					time_period += ' ' + elapsed_units + " " + (elapsed_units == 1 ? this.$root.$refs.SugarL10n.get(this.units[i].name + "_one" + suffix) : this.$root.$refs.SugarL10n.get(this.units[i].name + "_other" + suffix));

					elapsed_seconds -= elapsed_units * factor;
				}

				if (time_period != '')
					levels += 1;

				if (levels == maxlevel)
					break;
			}

			if (levels == 0) {
				return this.$root.$refs.SugarL10n.get("SecondsAgo" + suffix);
			}

			return this.$root.$refs.SugarL10n.get("Ago" + suffix, { time: time_period });
		}
	}
}