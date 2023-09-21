/* @ MainScreen
 @desc This is the main screen component */
const MainScreen = {
	name: 'MainScreen',
	template: ` <div class="toolbar ">
					<div class="tool_leftitems">
						<searchfield :placeholder="l10n.stringSearchHome" v-on:input-changed="searchFunction"/> 
						<icon 
							class="toolbutton"
							id="toolbar-help-btn"
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
						<listview v-if="screentype==='list'" @activities="setActivities" :filteredactivities="filteredactivities" :SugarL10n="SugarL10n"/>
						<homescreen v-else-if="screentype==='home'" @activities="setActivities" :filteredactivities="filteredactivities" :SugarL10n="SugarL10n"/>
						<div v-else-if="screentype==='neighbor'"> Neighbor </div>
					</div>
					`,
	components: {
		'searchfield': SearchField,
		'icon': Icon,
		'listview': ListView,
		'homescreen': HomeScreen
	},

	data: function () {
		return {
			screentype: 'home',
			activities: [],
			filteredactivities: [],
			SugarL10n: null,
			l10n: {
				stringSearchHome: "",
			},
		}
	},

	created: function () {
		window.addEventListener('localized', (e) => {
			e.detail.l10n.localize(this.l10n);
			this.SugarL10n = {
				localize: (l10n) => {
					e.detail.l10n.localize(l10n);
				},
				get: (key, params) => {
					return e.detail.l10n.get(key, params);
				},
				language: e.detail.l10n.language,
			}
		}, { once: true });
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
			this.filteredactivities = this.activities.filter((activity) => {
				return activity.name.toUpperCase().includes(searchInput.toUpperCase())
			})
		},
	},
};

if (typeof module !== 'undefined') module.exports = { MainScreen }
