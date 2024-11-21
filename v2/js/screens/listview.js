/* @ListView
 * @desc: ListView is a class that is used to create a list view screen.
 */

const ListView = {
	name: 'ListView',
	template: `<transition-group name="fade" appear>
					<div class="listview" v-for="activity in sortByName(activities)" :key="activity.id">
						<div class="listview_left" >
							<icon
								:ref="'star' + activity.id"
								:id="'star' + activity.id"
								svgfile="./icons/star.svg"
								:color="getStarColor(activity)"
								:size="22"
								:x=10
								:y=0
								@click="toggleFavorite(activity)"
								style="padding: 10px;"
							></icon>
							<div style="width:44px">
								<icon 
									:id=activity.id
									:svgfile="activity.directory + '/' + activity.icon"
									:size="40"
									isNative="true"
									v-on:mouseover="showPopupTimer($event)"
									v-on:mouseleave="removePopupTimer($event)"
									@click="launchActivity(activity)"
									style="padding: 2px;"
								></icon>
								</div>
							
							<div class="activity-name">{{ activity.name }}</div>
						</div>
						<div class="activity-version">Version {{ activity.version }}</div>
						<icon 
							:id="'help' + activity.id"
							svgfile="./icons/help-rev.svg"
							:color="256"
							:size="44"
							isNative="true"
						></icon>
					</div>
				</transition-group>
					<div v-if="activities.length === 0">
						<div v-if="activitiesLoaded" class="no-matching-activities">
							<div>
								<icon 
									svgfile="./icons/entry-search.svg"
									:color="768"
									:size="44"
									isNative="true"
								></icon>
							</div>
							<div> {{ $t("NoMatchingActivities") }} </div>
							<icon-button
								id="clear-search"
								svgfile="./icons/dialog-cancel.svg"
								:size="20"
								:color="1024"
								:text="$t('ClearSearch')"
								@click="clearSearchField"
							></icon-button>
						</div>
					</div>
					<popup 
						ref="popup" 
						v-bind:item="popup"
					v-on:mouseout="removePopupTimer($event)"
						v-on:itemis-clicked="itemisClicked($event)"
					></popup>
				<div v-if="!activitiesLoaded" class="loading-activities-message">
					<img src="./images/spinner-light.gif">
				</div>
				`,

	components: {
		'icon': Icon,
		'icon-button': IconButton,
		'popup': Popup,
	},

	data() {
		return {
			favactivities: [],
			activities: [],
			activitiesLoaded: false, // Variable to track loading state
			popupData: null,
			popup: null, //singular popup data
			buddycolor: null,
			timer: null,
			constant: {
				timerPopupDuration: 1000,
			},
		}
	},

	props: ['filter'],

	mounted() {
		this.getUser();
	},

	watch: {
		filter: function (value) {
			this.activities = sugarizer.modules.activities.get().filter((activity) => {
				return activity.name.toUpperCase().includes(value.toUpperCase())
			});
		}
	},

	methods: {
		async getUser() {
			sugarizer.modules.user.get().then((user) => {
				this.buddycolor = user.color;
				sugarizer.modules.activities.updateFavorites(user.favorites);
				this.activities = sugarizer.modules.activities.get().filter((activity) => {
					return activity.name.toUpperCase().includes(this.filter.toUpperCase())
				});
				this.favactivities = sugarizer.modules.activities.getFavoritesName();
				this.activitiesLoaded = true;
			}, (error) => {
				throw new Error('Unable to load the user, error ' + error);
			});
		},

		async toggleFavorite(activity) {
			sugarizer.modules.stats.trace('list_view', 'switch_favorite', activity.id, null);

			const index = this.favactivities.indexOf(activity.id);
			if (index === -1) {
				this.favactivities.push(activity.id);
			} else {
				this.favactivities = this.favactivities.filter((favactivity) => favactivity !== activity.id);

			}

			this.$refs.popup.hide();
			sugarizer.modules.user.update({"favorites": this.favactivities }).then((user) => {
				const iconRef = this.$refs["star" + activity.id][0];
				if (iconRef.colorData == this.buddycolor) {
					iconRef.colorData = 256;
				} else if (iconRef.colorData == 256) {
					iconRef.colorData = this.buddycolor;
				};

				sugarizer.modules.activities.updateFavorites(this.favactivities);
			}, (error) => {
				throw new Error('Unable to update the user, error ' + error);
			});
		},

		sortByName(array) {
			return [...array].sort(function (a, b) {
				let x = a.name.toLowerCase();
				let y = b.name.toLowerCase();
				return x < y ? -1 : x > y ? 1 : 0;
			});
		},

		getStarColor(activity) {
			const favorites = sugarizer.modules.activities.getFavoritesName();
			if (favorites.indexOf(activity.id) !== -1) {
				return this.buddycolor;
			} else {
				return 256;
			}
		},

		launchActivity(activity) {
			sugarizer.modules.activities.runActivity(activity, null, activity.title);
		},

		computePopup() {
			const popupData = {};
			const activities = sugarizer.modules.activities.get();
			activities.forEach(activity => {
				popupData[activity.id] = {
					id: activity.id,
					icon: {
						id: activity.id + "_popup",
						iconData: activity.directory + "/" + activity.icon,
						color: this.buddycolor,
						size: 30,
						isNative: "true"
					},
					name: activity.name,
					title: null,
					itemList: [
						{ icon: { id: 'new', iconData: activity.directory + "/" + activity.icon, size: 20, isNative: "true" }, name: this.$t("StartNew") },
						{ icon: { id: 'favorite', iconData: "icons/star.svg", color: !activity.favorite ? this.buddycolor : 256, size: 20 }, name: activity.favorite ? this.$t("RemoveFavorite") : this.$t("MakeFavorite") },
					],
					activity: activity,
				};
			});
			this.popupData = popupData;
		},

		async showPopupTimer(e) {
			if (this.timer != null) {
				window.clearInterval(this.timer);
			}
			this.timer = window.setInterval(this.showPopup.bind(this), this.constant.timerPopupDuration, e);
		},

		async showPopup(e) {
			let itemId, x, y;
			if (this.popupShown) {
				this.removeCurrentPopup();
			}
			this.popupShown = true;
			window.clearInterval(this.timer);
			this.timer = null;
			await this.computePopup();
			if (e.target.tagName == 'svg') {
				itemId = e.target.parentElement.id
				x = e.clientX - 4;
				y = e.clientY - 4;
			}
			else if (e.target.tagName == 'use') {
				itemId = e.target.parentElement.parentElement.id
				x = e.clientX;
				y = e.clientY;
			}
			else {
				itemId = e.target.id;
				x = e.clientX - 12;
				y = e.clientY - 12;
			}
			const obj = JSON.parse(JSON.stringify(this.popupData))
			this.popup = obj[itemId];
			this.$refs.popup.show(x, y);
		},

		async removePopupTimer(e) {
			if (this.timer != null) {
				window.clearInterval(this.timer);
			}
			this.timer = window.setInterval(this.removePopup.bind(this), this.constant.timerPopupDuration, e);
		},

		async removePopup(e) {
			if (!this.$refs.popup.isCursorInside(e.clientX, e.clientY)) {
				this.removeCurrentPopup();
			}
		},

		removeCurrentPopup() {
			this.$refs.popup.hide();
			this.popupShown = false;
			window.clearInterval(this.timer);
			this.timer = null;
		},

		itemisClicked(item) {
			let favIcon = this.popup.id + "_favorite";
			if (item == favIcon) {
				this.toggleFavorite(this.popup);
			} else {
				this.launchActivity(this.popup.activity);
			}
		},
		clearSearchField() {
			this.$emit('clear-searchfield'); 
		},
	},
};
