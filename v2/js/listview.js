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
			token: null,
			favactivities: [],
			activities: [],
			popupData: null,
			popup: null, //singular popup data
			buddycolor: null,
		}
	},

	props: ['filteredactivities', 'SugarL10n'],

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
			const response = await axios.get("/api/v1/activities", {
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
				requirejs(['xocolor'], (xocolor) => {
					const color = response.data.color;
					this.buddycolor = xocolor.colors.findIndex(el => {
						return el.fill === color.fill && el.stroke === color.stroke;
					});
				});
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
					this.$emit('activities', list);
					this.favactivities = list.filter(list => list.favorite).map((list) => list.id);
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
							this.$emit('activities', activities);
							this.favactivities = favactivities;
						}
					});

				}
			}
		},

		async toggleFavorite(activity) {

			const index = this.favactivities.indexOf(activity.id);
			if (index === -1) {
				this.favactivities.push(activity.id);
			} else {
				this.favactivities = this.favactivities.filter((favactivity) => favactivity !== activity.id);

			}

			const response = await axios.put("/api/v1/users/" + this.token.x_key, ({
				"user": JSON.stringify({ "favorites": this.favactivities }),
			}), {
				headers: {
					'x-key': this.token.x_key,
					'x-access-token': this.token.access_token,
				},
			});

			if (response.status != 200) {
				throw new Error('Unable to update the user');
			}

			if (response.status == 200) {
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
			}

		},

		sortObjectArray(array) {
			return array.sort(function (a, b) {
				let x = a.name.toLowerCase();
				let y = b.name.toLowerCase();
				return x < y ? -1 : x > y ? 1 : 0;
			});
		},

		getStarColor(activity) {
			if (activity.favorite) {
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