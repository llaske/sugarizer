/* @ MainScreen
 @desc This is the main screen component */
const MainScreen = {
	name: 'MainScreen',
	template: ` <div class="toolbar ">
					<searchfield :placeholder="searchhome"/> 
					<div class="tool_rightitems">
						<icon
							class="toolbutton"
							id="view_home_button"
							svgfile="/icons/view-radial.svg" 
							color="768"
							size="47"
							isNative="true"
						></icon>
						<icon
							class="toolbutton"
							id="view_list_button"
							svgfile="/icons/view-list.svg" 
							color="768"
							size="47"
							isNative="true"
						></icon>
					</div>
					</div>
					<div class="sugarizer-desktop">
						<listview />
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
		}
	},
	mounted: function () {
		console.log(this.searchhome)
	}
};

if (typeof module !== 'undefined') module.exports = { MainScreen }
