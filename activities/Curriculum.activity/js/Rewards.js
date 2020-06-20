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
				<div class="trophy-card" v-for="item in achievements" :key="item.title" v-if="evalCondition(item.availability)">
					<trophy :userColors="userColors" :acquired="evalAndUpdate(item)" />
					<h4>{{ item.title }}</h4>
					<p 
						v-if="user.achievements[item.id].timestamp" 
					>{{ $root.$refs.SugarL10n.timestampToElapsedString(user.achievements[item.id].timestamp, 2) }}</p>
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
			for (var catId in this.user.skills) {
				for (var skillId in this.user.skills[catId]) {
					if (this.user.skills[catId][skillId].acquired) count++;
				}
			}
			return count;
		},
		totalCategoriesAcquired: function () {
			var count = 0;
			for (var catId in this.user.skills) {
				var allAcquired = true;
				for (var skillId in this.user.skills[catId]) {
					if (this.user.skills[catId][skillId].acquired != this.notationLevel) {
						allAcquired = false;
						break;
					}
				}
				if (allAcquired) count++;
			}
			return count;
		},
		totalMediaUploaded: function () {
			var count = 0;
			for (var catId in this.user.skills) {
				for (var skillId in this.user.skills[catId]) {
					for (var type in this.user.skills[catId][skillId].media) {
						count += this.user.skills[catId][skillId].media[type].length;
					}
				}
			}
			return count;
		},
		levelWiseAcquired: function () {
			var levelWiseAcquired = {};
			for (var key in this.levels[this.notationLevel]) {
				levelWiseAcquired[key] = 0
			};
			for (var catId in this.user.skills) {
				for (var skillId in this.user.skills[catId]) {
					levelWiseAcquired[this.user.skills[catId][skillId].acquired]++;
				}
			}
			return levelWiseAcquired;
		}
	},
	data: function () {
		return {}
	},
	mounted: function () {
		// console.log('LOCALIZED EVENT', this.$root.$refs.SugarL10n.l10n);
	},
	methods: {
		evalAndUpdate: function(item) {
			var result = this.evalCondition(item.condition);
			this.updateAchievement(item, result);
			return result;
		},

		evalCondition: function (condition) {
			if(typeof condition == 'boolean') return condition;
			var value = this.computeValue(condition);
			var property = this.getProperty(condition.property);
			var result;
			// console.log('poperty', property, 'value', value);

			switch (condition.op) {
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
		}
	}
}