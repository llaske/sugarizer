/* @ MainScreen
 @desc This is the main screen component */
const MainScreen = {
	name: 'MainScreen',
	template: ` <div class="toolbar ">
					<div class="tool_leftitems">
						<searchfield :placeholder="searchhome" v-on:input-changed="searchFunction"/> 
						<icon 
							class="toolbutton"
							id="help-icon"
							svgfile="/icons/help.svg"
							size="47"
							x="0"
							y="0"
							color="768"
							isNative="true"
						></icon>
					</div>
					<div class="tool_rightitems">
						<icon
							class="toolbutton"
							v-bind:class="{ active: screentype === 'home' }"
							ref="view_home_button"
							id="view_home_button"
							svgfile="/icons/view-radial.svg" 
							color="768"
							size="47"
							isNative="true"
							@click="screentype='home'"
						></icon>
						<icon
							class="toolbutton"
							v-bind:class="{ active: screentype === 'neighbor' }"
							id="view_neighbor_button"
							svgfile="/icons/view-neighborhood.svg"
							color="768"
							size="47"
							isNative="true"
							@click="screentype='neighbor'"
						></icon>
						<icon
							class="toolbutton"
							v-bind:class="{ active: screentype === 'list' }"
							id="view_list_button"
							svgfile="/icons/view-list.svg" 
							color="768"
							size="47"
							isNative="true"
							@click="screentype='list'"
						></icon>
					</div>
					</div>
					<div id="canvas" ref="canvas" class="sugarizer-desktop">
						<listview v-if="screentype==='list'" @activities="setActivities" :filteredactivities="filteredactvities"/>
						<homescreen v-else-if="screentype==='home'"/>
						<div v-else-if="screentype==='neighbor'"> Neighbor </div>
					</div>
					`,
	components: {
		'searchfield': SearchField,
		'icon': Icon,
		'listview': ListView,
		'homescreen': HomeScreen
	},
	props: {
		searchhome: String,
	},

	data: function () {
		return {
			screentype: 'home',
			activities: [],
			filteredactvities: [],
		}
	},

	watch: {
		screentype: function (newVal, oldVal) {
			document.getElementById(`view_${newVal}_button`).classList.add('active');
			document.getElementById(`view_${oldVal}_button`).classList.remove('active');
		}
	},

	mounted: function () {
		document.getElementById(`view_${this.screentype}_button`).classList.add('active');
	},

	methods: {
		setActivities: function (activities) {
			this.activities = activities;
		},

		searchFunction(searchInput) {
			this.filteredactvities = this.activities.filter((activity) => {
				return activity.name.toUpperCase().includes(searchInput.toUpperCase())
			})
		},
	},
};

if (typeof module !== 'undefined') module.exports = { MainScreen }
