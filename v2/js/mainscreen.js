/* @ MainScreen
 @desc This is the main screen component */
const MainScreen = {
	name: 'MainScreen',
	template: ` <div class="toolbar ">
					<searchfield :placeholder="searchhome" v-on:input-changed="searchFunction"/> 
					<div class="tool_rightitems">
						<icon
							class="toolbutton"
							id="view_home_button"
							svgfile="/icons/view-radial.svg" 
							color="768"
							size="47"
							isNative="true"
							@click="screentype='home'"
						></icon>
						<icon
							class="toolbutton"
							id="view_neighbor_button"
							svgfile="/icons/view-neighborhood.svg"
							color="768"
							size="47"
							isNative="true"
							@click="screentype='neighbor'"
						></icon>
						<icon
							class="toolbutton"
							id="view_list_button"
							svgfile="/icons/view-list.svg" 
							color="768"
							size="47"
							isNative="true"
							@click="screentype='list'"
						></icon>
					</div>
					</div>
					<div class="sugarizer-desktop" >
						<listview v-if="screentype==='list'" @activities="setActivities" :filteredactivities="filteredactvities"/>
						<div v-else-if="screentype==='home'"> Home </div>
						<div v-else-if="screentype==='neighbor'"> Neighbor </div>
					</div>
					`,
	components: {
		'searchfield': SearchField,
		'icon': Icon,
		'listview': ListView,
	},
	props: {
		searchhome: String,
	},

	data: function () {
		return {
			screentype: 'list',
			activities: [],
			filteredactvities: [],
		}
	},

	watch: {
		screentype: function (newVal, oldVal) {
			document.getElementById(`view_${newVal}_button`).style.backgroundColor = '#808080';
			document.getElementById(`view_${oldVal}_button`).style.backgroundColor = 'transparent';
		}
	},

	mounted: function () {
		console.log(this.searchhome)
		document.getElementById(`view_${this.screentype}_button`).style.backgroundColor = '#808080';

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
