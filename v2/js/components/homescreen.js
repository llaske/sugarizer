/* @ HomeScreen
 * @desc: HomeScreen is a class that is used to create a list view screen.
 */

const HomeScreen = {
	name: 'HomeScreen',
	template: ` <div class="homescreen" ref="homescreen">
							<div v-for="(activity, index) in restrictedModeInfo.activities || activities" :key="activity.id">
								<icon
									size="55"
									:id="activity.id"
									class="home-icon"
									:svgfile="activity.directory + '/' + activity.icon"
									:x="restrictedModeInfo.positions != undefined ? restrictedModeInfo.positions[index].x : activityPositions[index].x"
       							:y="restrictedModeInfo.positions != undefined ? restrictedModeInfo.positions[index].y : activityPositions[index].y"
									isNative="true"
									v-on:mouseover="showPopupFunction($event)"
									v-on:mouseleave="removePopupFunction($event)"
								/>
							</div>
							<icon 
								id="buddy"
								svgfile="./icons/owner-icon.svg"
								class="home-icon"
								:color="buddycolor"
								size="104"
								:x="canvasCenter.x - 52"
								:y="canvasCenter.y - 52"
								v-on:mouseover="showPopupFunction($event)"
								v-on:mouseleave="removePopupFunction($event)"
							></icon>
							<icon
								id="journal-btn"
								svgfile="./icons/activity-journal.svg"
								class="home-icon"
								size="40"
								:x="canvasCenter.x - 40/2"
								:y="canvasCenter.y + 104 - 40 + canvasCenter.jdeltay"
								:color="buddycolor"
								isNative="true"
							></icon>
							<icon
								v-if="isRestrictedPrev"
								id="restricted-prev"
								svgfile="./icons/activity-etc.svg"
								class="home-icon"
								size="55"
								:x="buttonpositions.prev.x"
								:y="buttonpositions.prev.y"
								color="512"
								isNative="true"
								@click="showPreviousRestrictedList"
							></icon>
							<icon
								v-if="isRestrictedNext"
								id="restricted-next"
								svgfile="./icons/activity-etc.svg"
								class="home-icon"
								size="55"
								:x="buttonpositions.next.x"
								:y="buttonpositions.next.y"
								color="512"
								isNative="true"
								@click="showNextRestrictedList"
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
			buddycolor: null,
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
			isRestrictedPrev: false,
			isRestrictedNext: false,
			buttonpositions:{
				next: {},
				prev: {}
			},
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
		filteredactivities: async function (value) {
			const enabledactivities = await this.activities.filter(activity => value.includes(activity));
			this.enableActivities(enabledactivities);

			const disabledactivities = await this.activities.filter(activity => !value.includes(activity));
			this.disableActivities(disabledactivities);
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
						for (let j = 0; j < response.data.favorites.length; j++) {
							if (response.data.favorites[j] == list[i].id) {
								list[i].favorite = true;
							}
						}
					}
					this.activities = this.filterFavorite(list);
					this.username = response.data.name;
					this.$emit('activities', this.activities);
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
							this.activities = this.filterFavorite(activities);
							this.username = response.data.name;
							this.$emit('activities', this.activities);
							this.favactivities = favactivities;
						}
					});
				}
				this.draw();
			}
		},

		filterFavorite(activities) {
			return activities.filter(activity => activity.favorite);
		},

		launchActivity(activity) {
			const location = activity.directory + "/index.html?aid=" + activity.activityId + "&a=" + activity.id + "&n=" + activity.name;
			document.location.href = location;
		},

		disableActivities(disabledactivities) {
			for (let i = 0; i < disabledactivities.length; i++) {
				let id = disabledactivities[i].id;

				console.log(id);
				document.getElementById(id).classList.add("web-activity-disable");

				const icons = this.$refs.homescreen.querySelectorAll('.web-activity-disable');

				icons.forEach(icon => {
					icon.removeEventListener('click', this.showPopupFunction);
					icon.removeEventListener('mouseover', this.showPopupFunction); 
				});
			}
		},

		enableActivities(enabledactivities) {
			for (let i = 0; i < enabledactivities.length; i++) {
				let id = enabledactivities[i].id;

				console.log(id);
				document.getElementById(id).classList.remove("web-activity-disable");

				const icons = this.$refs.homescreen.querySelectorAll('.web-activity-disable');

				icons.forEach(icon => {
					icon.addEventListener('click', this.showPopupFunction);
					icon.addEventListener('mouseover', this.showPopupFunction);
				});
			}
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
						color: this.buddycolor,
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

			if (itemId == "buddy") {
				const popupData = {};

				popupData["buddy"] = {
					id: "buddy",
					directory: "icons",
					icon: {
						id: "buddy_popup",
						iconData: "icons/owner-icon.svg",
						color: this.buddycolor,
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

			this.canvasCenter = { x: canvas_centerx, y: canvas_centery, dx: canvas_width, dy: canvas_height };
			return { x: canvas_centerx, y: canvas_centery, dx: canvas_width, dy: canvas_height };
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
			this.canvasCenter.jdeltay = jdeltay;

			// Compute ring size and shape
			let activitiesList = this.activities;
			let activitiesCount = activitiesList.length;
			let activitiesIndex = 0;
			let radiusx, radiusy, base_angle, spiralMode, restrictedMode;
			let PI2 = Math.PI * 2.0;
			radiusx = radiusy = Math.max(constant.ringMinRadiusSize, Math.min(canvas_center.x - icon_size, canvas_center.y - icon_size));
			let circumference = PI2 * radiusx;
			this.spiralPositions = [];
			this.activityPositions = [];

			this.restrictedModeInfo.activities = undefined;
			this.restrictedModeInfo.positions = undefined;

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
					this.restrictedModeInfo.count = activitiesCount;
					this.restrictedModeInfo.length = activitiesList.length;

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

				// Restricted mode for small device: integrate a way to scroll on the circle
				this.isRestrictedPrev = false;
				this.isRestrictedNext = false;

				if (restrictedMode) {
					this.isRestrictedNext = true;
					if (i < this.restrictedModeInfo.start) {
						angle = previousAngle;
					} else if (i > 0 && this.restrictedModeInfo.start > 0) {
						this.isRestrictedPrev = true;
					} else if (this.restrictedModeInfo.start + this.restrictedModeInfo.count >= activitiesList.length) {
						this.isRestrictedNext = false;
					}
				}
				this.activityPositions.push({ x: ix, y: iy });

			}
			if (restrictedMode) {
				const nextcount = this.restrictedModeInfo.start + this.restrictedModeInfo.count;
				this.buttonpositions.next = this.activityPositions[nextcount - 1];
				this.buttonpositions.prev = this.activityPositions[this.restrictedModeInfo.start];
				if (this.restrictedModeInfo.start === 0) {
					this.restrictedModeInfo.activities = activitiesList.slice(this.restrictedModeInfo.start, nextcount - 1)
					this.restrictedModeInfo.positions = this.activityPositions.slice(this.restrictedModeInfo.start, nextcount - 1);
				} else if (this.restrictedModeInfo.start + this.restrictedModeInfo.count >= activitiesList.length) {
					this.restrictedModeInfo.activities = activitiesList.slice(-this.restrictedModeInfo.count + 1)
					this.restrictedModeInfo.positions = this.activityPositions.slice(this.restrictedModeInfo.start + 1, nextcount);
				} else {
					this.restrictedModeInfo.activities = activitiesList.slice(this.restrictedModeInfo.start, nextcount - 2)
					this.restrictedModeInfo.positions = this.activityPositions.slice(this.restrictedModeInfo.start + 1, nextcount - 1);
				}
			}
		},

		showNextRestrictedList() {
			const activities = this.activities;
			let newStart = this.restrictedModeInfo.start + this.restrictedModeInfo.count - 2;
			this.restrictedModeInfo.positions = this.activityPositions.slice(this.restrictedModeInfo.count + 2)
			this.isRestrictedPrev = true;
			if (newStart > this.restrictedModeInfo.length - 1) {
				return;
			} else if (this.restrictedModeInfo.start == 0) {
				newStart = this.restrictedModeInfo.count - 1;
			} else if (newStart + this.restrictedModeInfo.count > this.restrictedModeInfo.length) {
				newStart = this.restrictedModeInfo.length - this.restrictedModeInfo.count + 1;
				this.isRestrictedNext = false;
				this.restrictedModeInfo.positions = this.activityPositions.slice(this.restrictedModeInfo.count + 2)

				this.restrictedModeInfo.start = newStart;
				this.restrictedModeInfo.activities = activities.slice(this.restrictedModeInfo.start, this.restrictedModeInfo.start + this.restrictedModeInfo.count)
				return;

			}
			this.restrictedModeInfo.start = newStart;
			this.restrictedModeInfo.activities = activities.slice(this.restrictedModeInfo.start, this.restrictedModeInfo.start + this.restrictedModeInfo.count - 2)
		},

		showPreviousRestrictedList() {
			const activities = this.activities;
			let newStart = this.restrictedModeInfo.start - this.restrictedModeInfo.count;
			this.isRestrictedNext = true;
			if (newStart < 0) {
				newStart = 0;
				this.isRestrictedPrev = false;
				this.restrictedModeInfo.start = newStart;
				this.restrictedModeInfo.positions = this.activityPositions.slice(this.restrictedModeInfo.count + 1);
				this.restrictedModeInfo.activities = activities.slice(this.restrictedModeInfo.start, this.restrictedModeInfo.start + this.restrictedModeInfo.count - 1);
				return;
			}
			this.restrictedModeInfo.start = newStart;
			this.restrictedModeInfo.activities = activities.slice(this.restrictedModeInfo.start, this.restrictedModeInfo.start + this.restrictedModeInfo.count - 2);
		}
	},
};