/* @ MainScreen
 @desc This is the main screen component */
const MainScreen = {
	name: 'MainScreen',
	template: ` <div class="toolbar ">
					<div class="tool_leftitems">
						<searchfield ref="searchfield" :placeholder="l10n.stringSearchHome" v-on:input-changed="searchFunction"/> 
						<icon 
							class="toolbutton"
							id="toolbar-help-btn"
							svgfile="./icons/help.svg"
							size="47"
							x="0"
							y="0"
							color="768"
							isNative="true"
						></icon>
						<icon v-if="sync"
							class="toolbutton sync-gear"
							id="toolbar-sync-btn"
							svgfile="./icons/sync.svg"
							size="47"
							x="0"
							y="0"
							color="768"
							isNative="true"
						></icon>
						<icon v-if="offline"
							class="toolbutton"
							id="toolbar-offline-btn"
							svgfile="./icons/cloud-warning.svg"
							size="47"
							x="0"
							y="0"
							color="256"
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
							color="768"
							size="47"
							isNative="true"
							@click="changeView('home')"
						></icon>
						<icon
							class="toolbutton"
							v-bind:class="{ active: screentype === 'neighborhood' }"
							id="view_neighborhood_button"
							svgfile="./icons/view-neighborhood.svg"
							color="768"
							size="47"
							isNative="true"
							@click="changeView('neighborhood')"
						></icon>
						<icon
							class="toolbutton"
							v-bind:class="{ active: screentype === 'list' }"
							id="view_list_button"
							svgfile="./icons/view-list.svg" 
							color="768"
							size="47"
							isNative="true"
							@click="changeView('list')"
						></icon>
					</div>
					</div>
					<div id="canvas" ref="canvas" class="sugarizer-desktop">
						<listview v-if="screentype==='list'" :filter="filter" :SugarL10n="SugarL10n"/>
						<homescreen ref="home" v-else-if="screentype==='home'" :filter="filter" :SugarL10n="SugarL10n"/>
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
			filter: '',
			SugarL10n: null,
			l10n: {
				stringSearchHome: "",
			},
			offline: false,
			sync: false,
		}
	},

	created: function () {
		let vm = this;
		window.addEventListener('localized', (e) => {
			e.detail.l10n.localize(this.l10n);
			vm.$refs.searchfield.placeholderData = this.l10n.stringSearchHome;
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
		window.addEventListener('synchronization', (e) => {
			if (e.detail.step === 'compute') {
				vm.sync = true;
			} else if (e.detail.step === 'start') {
				if (e.detail.local+e.detail.remote > 0) {
					sugarizer.modules.humane.log(this.SugarL10n.get("RetrievingJournal"));
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
		changeView(view) {
			sugarizer.modules.stats.trace(this.screentype+'_view', 'change_view', view+'_view', null);
			this.screentype = view;
		},

		searchFunction(searchInput) {
			sugarizer.modules.stats.trace(this.screentype+'_view', 'search', 'q='+searchInput, null);
			this.filter = searchInput;
		},

		displayServerSettings() {
			if (this.screentype === 'home') {
				this.$refs.home.$refs.settings.openModal('aboutMyServerModal');
			}
		},
	},
};

if (typeof module !== 'undefined') module.exports = { MainScreen }
