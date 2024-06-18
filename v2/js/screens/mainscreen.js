/* @ MainScreen
 @desc This is the main screen component */
const MainScreen = {
	name: 'MainScreen',
	template: ` <div class="toolbar ">
					<div class="tool_leftitems">
						<searchfield ref="searchfield" :placeholder="$t('SearchHome')" v-on:input-changed="searchFunction"/>
						<icon 
							class="toolbutton"
							id="toolbar-help-btn"
							svgfile="./icons/help.svg"
							:size="47"
							:x="0"
							:y="0"
							:color="768"
							:title="$t('Tutorial')"
							isNative="true"
						></icon>
						<icon v-if="sync"
							class="toolbutton sync-gear"
							id="toolbar-sync-btn"
							svgfile="./icons/sync.svg"
							:size="47"
							:x="0"
							:y="0"
							:color="768"
							isNative="true"
						></icon>
						<icon v-if="offline"
							class="toolbutton"
							id="toolbar-offline-btn"
							svgfile="./icons/cloud-warning.svg"
							:size="47"
							:x="0"
							:y="0"
							:color="256"
							:title="$t('NotConnected')"
							isNative="true"
							@click="displayServerSettings()"
						></icon>
					</div>
					<div class="tool_rightitems">
						<icon
							class="toolbutton"
							v-bind:class="{ active: screentype === 'home' }"
							ref="view_home_button"
							id="view_home_button"
							svgfile="./icons/view-radial.svg" 
							:color="768"
							:size="47"
							:title="$t('FavoritesView')"
							isNative="true"
							@click="changeView('home')"
						></icon>
						<icon
							class="toolbutton"
							v-bind:class="{ active: screentype === 'neighborhood' }"
							id="view_neighborhood_button"
							svgfile="./icons/view-neighborhood.svg"
							:color="768"
							:size="47"
							:title="$t('NeighborhoodView')"
							isNative="true"
							@click="changeView('neighborhood')"
						></icon>
						<icon
							class="toolbutton"
							v-bind:class="{ active: screentype === 'list' }"
							id="view_list_button"
							svgfile="./icons/view-list.svg" 
							:color="768"
							:size="47"
							:title="$t('ListView')"
							isNative="true"
							@click="changeView('list')"
						></icon>
					</div>
					</div>
					<div id="canvas" ref="canvas" class="sugarizer-desktop">
						<listview v-if="screentype==='list'" :filter="filter" @clear-searchfield = "clearSearchField"/>
						<homescreen ref="home" v-else-if="screentype==='home'" :filter="filter" />
						<div v-else-if="screentype==='neighborhood'"> Neighborhood </div>
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
			views: ['home', 'list', 'journal', 'neighborhood', 'assignment'],
			filter: '',
			offline: false,
			sync: false,
		}
	},

	created: function () {
		let vm = this;
		this.initView();
		window.addEventListener('synchronization', (e) => {
			if (e.detail.step === 'compute') {
				vm.sync = true;
			} else if (e.detail.step === 'start') {
				if (e.detail.local+e.detail.remote > 0) {
					sugarizer.modules.humane.log(this.$t("RetrievingJournal"));
				}
			} else if (e.detail.step === 'end') {
				vm.sync = false;
			}
		});
		vm.offline = !sugarizer.modules.user.isConnected();
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
		initView() {
			let view = sugarizer.modules.settings.getUser().view;
			if (view === undefined || view === null || view < 0 || view >= this.views.length) {
				this.screentype = this.views[0];
			} else {
				this.screentype = this.views[view];
			}
		},

		changeView(view) {
			sugarizer.modules.stats.trace(this.screentype+'_view', 'change_view', view+'_view', null);
			this.screentype = view;
			sugarizer.modules.settings.setUser({'view': this.views.indexOf(view)});
		},

		searchFunction(searchInput) {
			sugarizer.modules.stats.trace(this.screentype+'_view', 'search', 'q='+searchInput, null);
			this.filter = searchInput;
		},

		displayServerSettings() {
			if (this.screentype === 'home') {
				this.$refs.home.$refs.settings.openModal('about_my_server', false);
			}
		},
		clearSearchField() {
			this.$refs.searchfield.searchQuery = '';
		},
	},
};

if (typeof module !== 'undefined') module.exports = { MainScreen }
