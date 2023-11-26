/* @ListView
 * @desc: ListView is a class that is used to create a list view screen.
 */

const ListView = {
	name: 'ListView',
	template: ` <div class="listview" v-for="activity in sortObjectArray(activities)" :key="activity.id">
						<div class="listview_left" >
							<icon
								:ref="'star' + activity.id"
								:id="'star' + activity.id"
								svgfile="./icons/star.svg"
								:color="getStarColor(activity)"
								size="22"
								:x=0
								:y=0
								@click="toggleFavorite(activity)"
								style="padding: 10px;"
							></icon>
							<div style="width:44px">
								<icon 
									:id=activity.id
									:svgfile="activity.directory + '/' + activity.icon"
									size="40"
									isNative="true"
									v-on:mouseover="showPopupFunction($event)"
									v-on:mouseleave="removePopupFunction($event)"
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
							color="256"
							size="44"
							isNative="true"
						></icon>
					</div>
					<popup 
						ref="popup" 
						v-bind:item="popup"
						v-on:mouseleave="removePopupFunction($event)"
						v-on:itemis-clicked="itemisClicked($event)"
					></popup>
				`,

	components: {
		'icon': Icon,
		'popup': Popup,
	},

	emits: ['activities'],

	data() {
		return {
			favactivities: [],
			activities: [],
			popupData: null,
			popup: null, //singular popup data
			buddycolor: null,
		}
	},

	props: ['filteredactivities', 'SugarL10n'],

	mounted() {
		this.getActivities();
	},

	watch: {
		filteredactivities: function (value) {
			this.activities = value;
		}
	},

	methods: {
		async getActivities() {
			sugarizer.modules.server.getActivities((activities) => {
				this.getUser(activities);
			}, (error) => {
				throw new Error('Unable to load the activities, error ' + error);
			});
		},

		async getUser(activities) {
			sugarizer.modules.server.getUser(null, (user) => {
				const color = user.color;
				this.buddycolor = sugarizer.modules.xocolor.colors.findIndex(el => {
					return el.fill === color.fill && el.stroke === color.stroke;
				});
				sugarizer.modules.activities.updateFavorites(user.favorites);
				this.activities = sugarizer.modules.activities.get();
				this.$emit('activities', this.activities);
				this.favactivities = sugarizer.modules.activities.getFavoritesName();
			}, (error) => {
				throw new Error('Unable to load the user, error ' + error);
			});
		},

		async toggleFavorite(activity) {

			const index = this.favactivities.indexOf(activity.id);
			if (index === -1) {
				this.favactivities.push(activity.id);
			} else {
				this.favactivities = this.favactivities.filter((favactivity) => favactivity !== activity.id);

			}

			sugarizer.modules.server.putUser(null, {"favorites": this.favactivities }, (user) => {
				const iconRef = this.$refs["star" + activity.id][0];
				activity.favorite = !activity.favorite;
				if (iconRef.colorData == this.buddycolor) {
					iconRef.colorData = 256;
				} else if (iconRef.colorData == 256) {
					iconRef.colorData = this.buddycolor;
				};

				this.popupData[activity.id].favorite = activity.favorite;
				this.popupData[activity.id].itemList[1].icon.color = activity.favorite ? this.buddycolor : 256;
				this.popup.favorite = activity.favorite;
				this.popup.itemList[1].icon.color = activity.favorite ? this.buddycolor : 256;
			}, (error) => {
				throw new Error('Unable to update the user, error ' + error);
			});
		},

		sortObjectArray(array) {
			return array.sort(function (a, b) {
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
			const location = activity.directory + "/index.html?aid=" + activity.activityId + "&a=" + activity.id + "&n=" + activity.name;
			document.location.href = location;
			console.log(activity.activityId);
		},

		getPopupData() {
			const popupData = {};
			const activities = this.activities;
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
						{ icon: { id: 1, iconData: activity.directory + "/" + activity.icon, size: 20, isNative: "true" }, name: this.SugarL10n.get("StartNew") },
						{ icon: { id: 2, iconData: "icons/star.svg", color: activity.favorite ? this.buddycolor : 256, size: 20 }, name: activity.favorite ? this.SugarL10n.get("RemoveFavorite") : this.SugarL10n.get("MakeFavorite") },
					],
				};
			});
			this.popupData = popupData;
		},

		async showPopupFunction(e) {
			let itemId, x, y;
			await this.getPopupData();
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
		removePopupFunction(e) {
			if (!this.$refs.popup.isCursorInside(e.clientX, e.clientY)) {
				this.$refs.popup.hide();
			}
		},
		itemisClicked(item) {
			let favIcon = this.popup.id + "_Favorite";
			if (item == favIcon) {
				this.toggleFavorite(this.popup);
			} else {
				this.launchActivity(this.popup);
			}
		},
	},
};