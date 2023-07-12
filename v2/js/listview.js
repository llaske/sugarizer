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
								size="24"
								:x=0
								:y=0
								@click="toggleFavorite(activity)"
								style="padding: 9px;"
							></icon>
							<icon 
								:id=activity.id
								:svgfile="activity.directory + '/' + activity.icon"
								color="512"
								size="44"
								isNative="true"
								@click="launchActivity(activity)"
							></icon>
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
					</div>`,

	components: {
		'icon': Icon,
	},

	data() {
		return {
			token: null,
			favactivities: [],
			activities: [],
		}
	},

	props: {
		// The list of items to display
	},

	mounted() {
		this.token = JSON.parse(localStorage.getItem("sugar_settings")).token;
		this.getActivities();
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

			if (response.status == 200) {
				console.log(response.data);
				const activities = response.data;
				console.log(this.activities);
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
							this.favactivities = favactivities;
						}
					});
				}
			}
		},

		async toggleFavorite(activity) {
			if (!activity.favorite) {
				this.favactivities.push(activity.id);
				console.log(this.favactivities)
			} else if (activity.favorite) {
				this.favactivities = this.favactivities.filter((favactivity) => favactivity != activity.id);
			}
			console.log(this.favactivities)
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
				console.log(iconRef.colorData)
				if (iconRef.colorData == 45) {
					iconRef.colorData = 512;
				} else if (iconRef.colorData == 512){
					iconRef.colorData = 45;
				};
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
				return 45;
			} else {
				return 512;
			}
		},

		launchActivity(activity) {
			const location = activity.directory+"/index.html?aid="+activity.activityId+"&a="+activity.id+"&n="+activity.name;
			document.location.href = location;
		},
	},
};