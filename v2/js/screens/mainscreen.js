/* @ MainScreen
 @desc This is the main screen component */
const MainScreen = {
	name: 'MainScreen',
	template: `<div class="toolbar" v-show="screentype !== 'journal' && screentype !== null">
					<div class="tool_leftitems">
						<searchfield
							ref="searchfield"
							v-on:input-changed="searchFunction"
							:placeholder="screentype==='neighborhood' ? $t('SearchNeighbor') : $t('SearchHome')"
						/>
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
						<div v-if="assignmentCount > 0" id="toolbar-assignment-btn">
							<icon
								class="toolbutton"
								svgfile="./icons/assignment.svg"
								isNative="true"
								:color="buddycolor"
								:size="47"
								:title="$t('Assignments')"
								@click="openJournalAssgn"
							/>
							<span class="assignment-count">{{ assignmentCount }} </span>
						</div>
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
						<settings ref="settings" :buddycolor=buddycolor :username="username"></settings>
						<listview v-if="screentype==='list'" :filter="filter" @clear-searchfield = "clearSearchField"/>
						<homescreen ref="home" @set-assignment-count="setAssignmentCount" @open-journal="changeView('journal')" @open-settings="displaySettings" v-else-if="screentype==='home'" :filter="filter" />
						<neighborhood @open-settings="displayServerSettings" v-else-if="screentype==='neighborhood'" :filter="filter" />
						<journal :isAssignmentSelected="isAssignmentSelected" @close-journal="changeView('home')" v-else-if="screentype==='journal'"/>
					</div>
					`,
	components: {
		'searchfield': SearchField,
		'icon': Icon,
		'listview': ListView,
		'homescreen': HomeScreen,
		"neighborhood": Neighborhood,
		"journal": Journal,
		'settings': Settings,
	},

	data: function () {
		return {
			screentype: null,
			views: ['home', 'list', 'journal', 'neighborhood', 'assignment'],
			filter: '',
			offline: false,
			sync: false,
			buddycolor: null,
			username: null,
			assignmentCount: 0,
		}
	},

	created: async function () {
		let vm = this;
		this.connectToServer();
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

		await sugarizer.modules.journal.synchronize();
		await this.initializeActivities();
		this.initView();
	},

	methods: {
		async initializeActivities() {
			try {
				await sugarizer.modules.activities.load();
			} catch (error) {
				throw new Error('Unable to load the activities, error ' + error);
			}
		},

		initView() {
			let view = sugarizer.modules.settings.getUser().view;
			sugarizer.modules.user.get().then((user) => {
				this.buddycolor = user.color;
				this.username = user.name;
			});
			if (view === undefined || view === null || view < 0 || view >= this.views.length) {
				this.screentype = this.views[0];
			} else {
				this.screentype = this.views[view];
			}
		},

		connectToServer() {
			const vm = this;
			const isConnected = sugarizer.modules.presence.isConnected();
			if (!isConnected) {
				sugarizer.modules.presence.joinNetwork(function (error, user) {
					if (error) {
						console.log("WARNING: Can't connect to presence server");
					}
					sugarizer.modules.presence.onConnectionClosed(function (event) {
						console.log("Disconnected");
						const message = vm.$t((event.code == 4999) ? "YouveGotDisconnectedAutomatically" : "YouveGotDisconnected");
						sugarizer.modules.humane.log(message);
					});
				});
			}
		},

		changeView(view) {
			this.$refs.settings.setSubScreen(null);
			this.$refs.settings.closeSettings("settingModal");
			sugarizer.modules.stats.trace(this.screentype+'_view', 'change_view', view+'_view', null);
			this.screentype = view;
			sugarizer.modules.settings.setUser({'view': this.views.indexOf(view)});
		},

		openJournalAssgn() {
			this.isAssignmentSelected = true;
			this.changeView("journal");
			this.$nextTick(() => this.isAssignmentSelected = false)
		},
		setAssignmentCount(count) {
			this.assignmentCount = count;
		},

		searchFunction(searchInput) {
			sugarizer.modules.stats.trace(this.screentype+'_view', 'search', 'q='+searchInput, null);
			this.filter = searchInput.trim();
		},

		displaySettings() {
			this.$refs.settings.openSettingsModal("settingModal");
		},
		displayServerSettings() {
			this.$refs.settings.openModal('about_my_server', false);
		},

		clearSearchField() {
			this.$refs.searchfield.searchQuery = '';
		},
	},
};

if (typeof module !== 'undefined') module.exports = { MainScreen }
