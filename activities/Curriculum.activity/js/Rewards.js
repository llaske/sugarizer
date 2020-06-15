var Rewards = {
	/*html*/
	template: `
		<div class="rewards-container">
			{{ totalSkillsAcquired }}/{{ totalSkills }}
		</div>
	`,
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