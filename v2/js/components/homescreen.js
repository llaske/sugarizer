/* @ HomeScreen
 * @desc: HomeScreen is a class that is used to create a list view screen.
 */

const HomeScreen = {
	name: 'HomeScreen',
	template: ` <div class="homescreen" ref="homescreen">
							<div v-for="(activity, index) in filterFavorite(activities)" :key="activity.id">
								<icon
									size="55"
									:id="activity.id"
									class="home-icon"
									:svgfile="activity.directory + '/' + activity.icon"
									:x="activityPositions[index].x"
       							:y="activityPositions[index].y"
									isNative="true"
									v-on:mouseover="showPopupFunction($event)"
									v-on:mouseleave="removePopupFunction($event)"
								/>
							</div>
							<icon 
								id="buddy"
								svgfile="./icons/owner-icon.svg"
								class="home-icon"
								color="120"
								size="104"
								:x="canvasCenter.x - 52"
								:y="canvasCenter.y - 52"
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
			activityPositions: [],
			popupData: null,
			popup: null, // singular popup data
			username: null,
			constant: {
				iconSpacingFactor: 1.1,
				ringInitSpaceFactor: 2.2,
				spiralInitSpaceFactor: 0.89,
				ringSpaceFactor: 1.18,
				spiralSpaceFactor: 1.3,
				ringAdjustAngleFactor: 3.6,
				ringAdjustSizeFactor: 0.9,
				ringMinRadiusSize: 10,
			},
			canvasCenter: {},
			restrictedModeInfo: { start: 0 },
			spiralPositions: [],
		}
	},

	props: ['filteredactivities'],

	mounted() {
		this.token = JSON.parse(localStorage.getItem("sugar_settings")).token;
		this.getActivities();

		this.getCanvasCenter();
		window.addEventListener("resize", this.draw);

	},

	beforeUnmount() {
		// Remove the 'resize' event listener when the component is unmounted
		window.removeEventListener("resize", this.draw);
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
						for (let j = 0; j < response.data.favorites.length; j++) {
							if (response.data.favorites[j] == list[i].id) {
								list[i].favorite = true;
							}
						}
					}
					this.activities = list;
					this.username = response.data.name;
					this.$emit('activities', list);
					this.favactivities = list.filter(list => list.favorite).map((list) => list.id);
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
							this.getPopupData();
						}
					});
				}
				this.draw();
			}
		},

		filterFavorite( activities ) {
			return activities.filter(activity => activity.favorite);
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
		},

		getCanvasCenter() {
			let canvas = document.getElementById("canvas") || document.getElementById("body");
			let canvas_height = canvas.offsetHeight;
			let canvas_width = canvas.offsetWidth;
			let canvas_centery = parseFloat(canvas_height) / 2.0;
			let canvas_centerx = parseFloat(canvas_width) / 2.0;
			console.log(canvas_centerx, canvas_centery, canvas_width, canvas_height);

			this.canvasCenter = { x: canvas_centerx, y: canvas_centery, dx: canvas_width, dy: canvas_height };
			console.log(this.canvasCenter);
			return { x: canvas_centerx, y: canvas_centery, dx: canvas_width, dy: canvas_height};
		},

		hasRoomForSpiral(canvas_center, icon_size) {
			let activitiesList = this.activities;
			let activitiesCount = activitiesList.length;
			let constant = this.constant;
			let radiusx = icon_size * constant.iconSpacingFactor * constant.ringInitSpaceFactor;
			let icon_spacing = Math.sqrt(Math.pow(icon_size, 2) * 2) * constant.spiralInitSpaceFactor;
			let angle = Math.PI;
			let PI2 = Math.PI * 2.0;
			let semi_size = icon_size / 2;
			let spiral_spacing = icon_spacing * constant.spiralSpaceFactor;
			let maxX = 0, maxY = 0, minX = canvas_center.dx, minY = canvas_center.dy;
			while (activitiesCount-- > 0) {
				let circumference = PI2 * radiusx;
				n = circumference / icon_spacing;
				radiusx += (spiral_spacing / n);
				let ix = canvas_center.x - semi_size + Math.sin(angle) * radiusx;
				let iy = canvas_center.y + Math.cos(angle) * radiusx - semi_size;
				this.spiralPositions.push({ x: ix, y: iy });
				maxX = Math.max(maxX, ix + icon_size); maxY = Math.max(maxY, iy + icon_size);
				minX = Math.min(minX, ix); minY = Math.min(minY, iy);
				angle -= (PI2 / n);
				// this.spiralPositions = spiralPositions;
			}
			return (maxX <= canvas_center.dx && maxY <= canvas_center.dy - 5 && minX >= 0 && minY >= 0);
		},

		draw() {

			// Compute center and radius
			let constant = this.constant;
			let canvas_center = this.getCanvasCenter();
			let icon_size = 55;
			let icon_padding = icon_size * constant.iconSpacingFactor;
			let semi_size = icon_size / 2;
			let jdeltay = (canvas_center.dy < 480) ? -12 : 0;

			// Compute ring size and shape
			let activitiesList = this.filterFavorite(this.activities);
			let activitiesCount = activitiesList.length;
			let activitiesIndex = 0;
			let radiusx, radiusy, base_angle, spiralMode, restrictedMode;
			let PI2 = Math.PI * 2.0;
			radiusx = radiusy = Math.max(constant.ringMinRadiusSize, Math.min(canvas_center.x - icon_size, canvas_center.y - icon_size));
			let circumference = PI2 * radiusx;
			this.spiralPositions = [];
			this.activityPositions = [];
			if ((circumference / activitiesList.length) >= constant.iconSpacingFactor * icon_padding) {
				spiralMode = restrictedMode = false;
				base_angle = (PI2 / parseFloat(activitiesList.length));
			} else {
				if (this.hasRoomForSpiral(canvas_center, icon_size)) {
					spiralMode = true; restrictedMode = false;
					radiusx = radiusy = icon_padding * constant.ringInitSpaceFactor;
					activitiesCount = parseInt((PI2 * radiusx) / icon_padding);
					base_angle = PI2 / activitiesCount;
				} else {
					restrictedMode = true; spiralMode = false;
					activitiesCount = parseInt(circumference / icon_padding);
					while ((circumference / activitiesCount) <= constant.ringSpaceFactor * constant.iconSpacingFactor * icon_padding) {
						activitiesCount--;
					}
					base_angle = (PI2 / parseFloat(activitiesCount + 1));
				}
			}
			// Draw activity icons
			let angle = -Math.PI / 2.0 - base_angle;
			for (let i = 0; i < activitiesList.length; i++) {
				// Compute icon position
				let activity = activitiesList[i];
				let ix, iy;
				let previousAngle = angle;
				if (!spiralMode) {
					angle += base_angle;
					ix = (canvas_center.x + Math.cos(angle) * radiusx - semi_size);
					iy = (canvas_center.y + Math.sin(angle) * radiusy - semi_size);
				} else {
					ix = this.spiralPositions[i].x;
					iy = this.spiralPositions[i].y;
				}

				this.activityPositions.push({x: ix, y: iy});

			}
		},
	},
};