/* @ HomeScreen
 * @desc: HomeScreen is a class that is used to create a home screen. It renders the icons of the activities in a spiral or ring shape.
 */


const HomeScreen = {
	name: 'HomeScreen',
	template: ` <div class="homescreen" ref="homescreen">
							<div v-for="(activity, index) in restrictedModeInfo.activities || activities" :key="activity.id">
								<icon
									:size="constant.iconSizeStandard"
									:id="activity.id"
									:ref="'activity'+activity.id"
									class="home-icon"
									:svgfile="activity.directory + '/' + activity.icon"
									:x="restrictedModeInfo.positions != undefined ? restrictedModeInfo.positions[index].x : (activityPositions[index] ? activityPositions[index].x : 0)"
       								:y="restrictedModeInfo.positions != undefined ? restrictedModeInfo.positions[index].y : (activityPositions[index] ? activityPositions[index].y : 0)"
									isNative="true"
									:disabled="false"
									v-on:click="runActivity(activity)"
									v-on:mouseover="showPopupTimer($event)"
									v-on:mouseout="removePopupTimer($event)"
								/>
							</div>
							<icon 
								id="buddy"
								:ref="'buddyIcon'"
								svgfile="./icons/owner-icon.svg"
								class="home-icon"
								:color="buddycolor"
								:size="constant.sizeOwner"
								:x="canvasCenter.x - constant.sizeOwner/2"
								:y="canvasCenter.y - constant.sizeOwner/2"
								v-on:mouseover="showPopupTimer($event)"
								v-on:mouseout="removePopupTimer($event)"
							></icon>
							<icon
								id="journal-btn"
								:ref="'journalIcon'"
								svgfile="./icons/activity-journal.svg"
								class="home-icon"
								:size="constant.sizeJournal"
								:x="canvasCenter.x - constant.sizeJournal/2"
								:y="canvasCenter.y + constant.sizeOwner - constant.sizeJournal + canvasCenter.jdeltay"
								isNative="true"
							></icon>
							<icon
								v-if="isRestrictedPrev"
								id="restricted-prev"
								svgfile="./icons/activity-etc.svg"
								class="home-icon"
								:size="constant.iconSizeStandard"
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
								:size="constant.iconSizeStandard"
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
						v-on:mouseout="removePopupTimer($event)"
						v-on:itemis-clicked="itemisClicked($event)"
					></popup>
					<settings ref="settings" :buddycolor="buddycolor" :username="username" :SugarL10n="SugarL10n"></settings>
				`,

	components: {
		'icon': Icon,
		'popup': Popup,
		'settings': Settings,
	},

	data() {
		return {
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
				maxPopupHistory: 5,
				timerPopupDuration: 1000,
				sizeOwner: 100,
				sizeJournal: 40,
				iconSizeStandard: 55,
				iconSizeList: 40,
				iconSizeFavorite: 20,
			},
			canvasCenter: {},
			restrictedModeInfo: { start: 0 },
			spiralPositions: [],
			isRestrictedPrev: false,
			isRestrictedNext: false,
			buttonpositions: {
				next: {},
				prev: {}
			},
			timer: null,
			popupShown: false,
			popupIcon: null,
		}
	},

	props: ['filter', 'SugarL10n'],

	mounted() {
		this.getActivities();

		this.getCanvasCenter();
		window.addEventListener("resize", this.draw);
	},

	beforeUnmount() {
		// Remove the 'resize' event listener when the component is unmounted
		window.removeEventListener("resize", this.draw);
	},

	watch: {
		filter: async function (value) {
			this.filterSearch(value);
		}
	},

	methods: {
		async getActivities() {
			sugarizer.modules.activities.load().then((activities) => {
				this.getUser();
			}, (error) => {
				throw new Error('Unable to load the activities, error ' + error);
			});
		},

		async getUser() {
			sugarizer.modules.user.get().then((user) => {
				this.buddycolor = user.color;
				sugarizer.modules.activities.updateFavorites(user.favorites);
				this.activities = sugarizer.modules.activities.getFavorites();
				this.username = user.name;
				this.favactivities = sugarizer.modules.activities.getFavoritesName();
				this.draw();
			}, (error) => {
				throw new Error('Unable to load the user, error ' + error);
			});
		},

		async getJournal() {
			sugarizer.modules.journal.synchronize().then(() => {
				setTimeout(() => {
					if (sugarizer.modules.journal.get().length > 0) {
						this.$refs["journalIcon"].colorData = this.buddycolor;
					}
					this.getPopupData();
					this.getJournalPopupData();
					this.filterSearch(this.filter);
				}, 1000);
			});
		},

		getJournalPopupData() {
			for (let activityId in this.popupData) {
				if (!this.popupData.hasOwnProperty(activityId)) {
					continue;
				}
				const popup = this.popupData[activityId];
				let iconColor = -1;
				let activity = sugarizer.modules.activities.getById(activityId);
				let entries = sugarizer.modules.journal.getByActivity(activityId);
				for (let i = 0 ; i < entries.length ; i++) {
					const entry = entries[i];
					if (!popup.itemList) {
						popup.itemList = [];
					}
					if (popup.itemList.length < this.constant.maxPopupHistory) {
						if (iconColor == -1) {
							iconColor = sugarizer.modules.xocolor.findIndex(entry.metadata.buddy_color);
						}
						popup.itemList.push({
							icon: {
								id: entry.objectId, 
								iconData: activity.directory + "/" + activity.icon, 
								size: this.constant.iconSizeFavorite, 
								color: entry.metadata.buddy_color ? sugarizer.modules.xocolor.findIndex(entry.metadata.buddy_color) : this.buddycolor, 
								isNative: "true" 
							},
							name: entry.metadata.title
						});
					}
				}
				if (popup.itemList && popup.itemList.length >= 1) {
					popup.icon.color = iconColor;
					if (this.$refs["activity" + popup.id]) {
						let iconRef = this.$refs["activity" + popup.id][0];
						if (iconRef !== undefined) {
							iconRef.colorData = iconColor;
						}
					}
				}
			}
		},

		filterFavorite(activities) {
			return activities.filter(activity => activity.favorite);
		},

		filterSearch(filter) {
			for (let i = 0; i < this.activities.length; i++) {
				let ref = this.$refs["activity" + this.activities[i].id];
				if (!ref || ref.length == 0) {
					continue;
				}
				ref[0].disabledData = !this.activities[i].name.toUpperCase().includes(filter.toUpperCase());
			}
		},

		runActivity(activity) {
			let objectId = null;
			let name = this.SugarL10n.get("NameActivity", { name: activity.name });
			let entries = sugarizer.modules.journal.getByActivity(activity.id);
			for (let i = 0 ; i < entries.length ; i++) {
				objectId = entries[i].objectId;
				name = entries[i].metadata.title;
				break;
			}
			sugarizer.modules.activities.runActivity(activity, objectId, name);
		},

		launchActivity(activity, item) {
			let objectId = item.slice(item.indexOf("_")+1);
			let name = activity.title;
			if (objectId == "new") {
				objectId = null;
			} else if (objectId == "latest") {
				if (activity.itemList && activity.itemList.length > 0) {
					objectId = activity.itemList[0].icon.id;
					name = activity.itemList[0].name;
				} else {
					objectId = null;
				}
			} else {
				for (let i = 0 ; i < activity.itemList.length ; i++) {
					if (activity.itemList[i].icon.id == objectId) {
						name = activity.itemList[i].name;
						break;
					}
				}
			}
			sugarizer.modules.activities.runActivity(activity.activity, objectId, name);
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
						id: "latest",
						iconData: activity.directory + "/" + activity.icon,
						size: this.constant.iconSizeList,
						isNative: "true"
					},
					name: activity.name,
					title: this.SugarL10n.get("NameActivity", { name: activity.name }),
					footerList: [
						{ icon: { id: "new", iconData: activity.directory + "/" + activity.icon, size: this.constant.iconSizeFavorite, isNative: "true" }, name: this.SugarL10n.get("StartNew") }
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
						size: this.constant.iconSizeList,
					},
					name: this.username,
					title: null,
					itemList: [
						{ icon: { id: 'preferences', iconData: "icons/preferences-system.svg", color: 256, size: this.constant.iconSizeFavorite }, name: this.SugarL10n.get("MySettings") },
						{ icon: { id: 'shutdown', iconData: "icons/system-shutdown.svg", color: 256, size: this.constant.iconSizeFavorite, isNative: "true" }, name: this.SugarL10n.get("Logoff") },
					],
				};
				this.popup = popupData[itemId];
				this.popupIcon = this.$refs["buddyIcon"];
			} else {
				const obj = JSON.parse(JSON.stringify(this.popupData));
				if (!obj) {
					return;
				}
				this.popup = obj[itemId];
				this.popupIcon = this.$refs["activity" + itemId][0];
			}
			this.$refs.popup.show(x, y);
		},

		async removePopupTimer(e) {
			if (this.timer != null) {
				window.clearInterval(this.timer);
			}
			this.timer = window.setInterval(this.removePopup.bind(this), this.constant.timerPopupDuration, e);
		},
				
		async removePopup(e) {
			if (this.$refs.popup && !this.$refs.popup.isCursorInside(e.clientX, e.clientY) && this.popupIcon && !this.popupIcon.isCursorInside(e.clientX, e.clientY)) {
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
			if (this.popupShown) {
				this.removeCurrentPopup();
			}
			if (item == "buddy_preferences" || item == "buddy_buddy_popup") {
				this.$refs.settings.openSettingsModal("settingModal");
			} else if (item == "buddy_shutdown" ) {
				this.logout();
			} else {
				this.launchActivity(this.popup, item);
			}
		},

		logout() {
			// TODO: On local app disconnected a warning should be displayed to confirm lost of data 
			sugarizer.restart();
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
			let icon_size = constant.iconSizeStandard;
			let icon_padding = icon_size * constant.iconSpacingFactor;
			let semi_size = icon_size / 2;
			let jdeltay = (canvas_center.dy < 480) ? -12 : 0;
			this.canvasCenter.jdeltay = jdeltay;

			// Compute ring size and shape
			let activitiesList = this.activities;
			let activitiesCount = activitiesList.length;
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
			this.getJournal();
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

if (typeof module !== 'undefined') module.exports = { HomeScreen }