/* @ HomeScreen
 * @desc: HomeScreen is a class that is used to create a list view screen.
 */

const HomeScreen = {
	name: 'HomeScreen',
	template: ` <div class="homescreen">
						<div v-for="activity in activities" :key="activity.id">
							<icon 
								v-if="activity.favorite"
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
					</div>
					<div>
						<icon 
							id="buddy"
							svgfile="./icons/owner-icon.svg"
							color="120"
							size="84"
							v-on:mouseover="showPopupFunction($event)"
							v-on:mouseleave="removePopupFunction($event)"
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
			token: null,
			favactivities: [],
			activities: [],
			popupData: null,
			popup: null, // singular popup data
			username: null
		}
	},

	props: ['filteredactivities'],

	mounted() {
		this.token = JSON.parse(localStorage.getItem("sugar_settings")).token;
		this.getActivities();
	},

	watch: {
		filteredactivities: function (value) {
			this.activities = value;
		}
	},

	methods: {
		async getActivities() {
			const response = await axios.get("/api/v1/activities?favorite=true", {
				headers: {
					'x-key': this.token.x_key,
					'x-access-token': this.token.access_token,
				}
			});

			if (response.status != 200) {
				throw new Error('Unable to load the activities');
			}

			if (response.status == 200 || response.status == 304) {
				const activities = response.data;
				this.getUser(activities);
				console.log(activities)
			}
		},

		async getUser(activities) {
			const response = await axios.get("/api/v1/users/" + this.token.x_key, {
				headers: {
					'x-key': this.token.x_key,
					'x-access-token': this.token.access_token,
				},
			});

			if (response.status != 200) {
				throw new Error('Unable to load the user');
			}
			if (response.status == 200) {
				console.log(response.data);
				if (response.data.favorites !== undefined) {
					const list = activities;
					for (let i = 0; i < list.length; i++) {
						list[i].favorite = false;
						for (var j = 0; j < response.data.favorites.length; j++) {
							if (response.data.favorites[j] == list[i].id) {
								list[i].favorite = true;
							}
						}
					}
					this.activities = list;
					this.username = response.data.name;
					console.log(list)
					this.$emit('activities', list);
					this.favactivities = list.filter(list => list.favorite).map((list) => list.id);
					console.log(this.favactivities)
					this.getPopupData();
				} else {
					const favactivities = activities.filter(activities => activities.favorite).map((activities) => activities.id);
					await axios.put("/api/v1/users/" + this.token.x_key, ({
						"user": JSON.stringify({ "favorites": favactivities }),
					}), {
						headers: {
							'x-key': this.token.x_key,
							'x-access-token': this.token.access_token,
						},
					}).then((response) => {
						if (response.status != 200) {
							throw new Error('Unable to update the user');
						}
						else if (response.status == 200) {
							this.activities = activities;
							this.username = response.data.name;
							this.$emit('activities', activities);
							this.favactivities = favactivities;
							console.log(this.favactivities)
							this.getPopupData();
						}
					});
				}
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
					favorite: activity.favorite,
					directory: activity.directory,
					icon: {
						id: activity.id + "_popup",
						iconData: activity.directory + "/" + activity.icon,
						color: 120,
						size: 30,
						isNative: "true"
					},
					name: activity.name,
					title: activity.name + " Activity",
					footerList: [
						{ icon: { id: 1, iconData: activity.directory + "/" + activity.icon, size: 20, isNative: "true" }, name: "Start New" }
					],
				};
			});
			this.popupData = popupData;
		},

		showPopupFunction(e) {
			let itemId, x, y;
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

			if (itemId == "buddy") {
				const popupData = {};

				popupData["buddy"] = {
					id: "buddy",
					directory: "icons",
					icon: {
						id: "buddy_popup",
						iconData: "icons/owner-icon.svg",
						color: 120,
						size: 34,
					},
					name: this.username,
					title: null,
					itemList: [
						{ icon: { id: 1, iconData: "icons/preferences-system.svg", color: 256, size: 22 }, name: "Settings" },
						{ icon: { id: 2, iconData: "icons/system-shutdown.svg", color: 256, size: 22, isNative: "true" }, name: "Logout" },
					],
				};
				this.popup = popupData[itemId];
			} else {
				const obj = JSON.parse(JSON.stringify(this.popupData))
				this.popup = obj[itemId];
			}
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
			} else if (item == "buddy_Settings" || item == "buddy_" + this.username) {
				console.log(item);
			} else if (item == "buddy_Logout") {
				this.logout();
			} else {
				this.launchActivity(this.popup);
			}
			console.log(item);
		},

		logout() {
			localStorage.removeItem("sugar_settings");
			window.location.reload();
		}
	},
};