// Initialize global cache
window.networkItemsCache = new Map();

const Neighborhood = {
	name: "Neighborhood",
	template: `
		<div ref="neighborhood" class="neighborhood">
			<transition-group name="bounce" appear>
				<icon
					v-for="(entity, _) in entitiesWithoutChildren"
					:key="'u-'+entity.networkId"
					:id="'u-'+entity.networkId"
					:ref="'u-'+entity.networkId"
					:svgfile="entity.icon"
					:color="entity.color"
					:size="constant.sizeNeighbor"
					:x="entity.x"
					:y="entity.y"
					:isNative="entity.isNative" 
					class="network-icon"
					@mouseover="showPopupTimer($event, 'u-'+entity.networkId, entity.popupData)"
					@mouseleave="removePopupTimer"
				></icon>
			</transition-group>
			<div v-for="(activity, _) in activitiesWithUsers" :key="activity.id">
				<icon
					:id="activity.id"
					:ref="activity.id"
					:svgfile="activity.icon"
					:color="activity.color"
					:size="constant.sizeNeighbor"
					:x="activity.x"
					:y="activity.y"
					isNative="true"
					class="network-icon"
					@click="joinActivity(activity.activityInfo, activity.id)"
					@mouseover="showPopupTimer($event, activity.id, activity.popupData)"
					@mouseleave="removePopupTimer"
				></icon>
				<transition-group name="bounce" appear>
					<icon
						v-for="(user, _) in activity.child"
						:key="user.networkId"
						:id="user.networkId"
						:ref="user.networkId"
						:svgfile="user.icon"
						:color="user.color"
						:size="constant.sizeNeighbor"
						:x="user.x"
						:y="user.y"
						class="network-icon"
						@mouseover="showPopupTimer($event, user.networkId, user.popupData)"
						@mouseleave="removePopupTimer"
					></icon>
				</transition-group>
			</div>
		</div>
		<popup
			ref="popup"
			:item="popupItem"
			@mouseout="removePopupTimer($event)"
			@itemis-clicked="onPopupItemClick"
		></popup>
		<div class="server-error" v-if="serverErr">
			<div>
				<div class="cloud-empty"></div>
				<div> {{ serverErr.msg }} </div>
				<icon-button
					:text="serverErr.btnText"
					:id="error-action"
					:svgfile="serverErr.btnIcon"
					:color="1024"
					:size="28"
					style="width:150px; text-align: left"
					@click="serverErr.action"
				/>
			</div>
		</div>
	`,

	components: {
		icon: Icon,
		"icon-button": IconButton,
		popup: Popup,
	},

	emits: ["openSettings"],

	data() {
		return {
			entitiesWithoutChildren: [],
			activitiesWithUsers: [],
			serverErr: null,
			popupItem: null,
		};
	},

	props: ["filter"],

	async created() {
		this.constant = {
			sizeNeighbor: 40,
			itemListIconSize: 20,
			timerUpdateNetwork: 1000,
			maxCollisionTry: 20,
			timerPopupDuration: 1000,
		};
		this.networkTimer = null;
		this.popupTimer = null;
		this.popupIconRef = null;
		this.networkId = null;
		this.currentcolor = {};
		this.eeMode = false; //easter egg
		this.users = [];
		this.activities = [];
		this.canvasCenter = this.getCanvasCenter();

		await this.getUser();
		const vm = this;
		this.presence = sugarizer.modules.presence;
		this.networkTimer = setInterval(
			vm.updateNetworkState,
			vm.constant.timerUpdateNetwork
		);
		if (this.presence.isConnected() || window.sugarizerOS) {
			this.updateNetworkState();
		}
	},

	methods: {
		getCanvasCenter() {
			let canvas =
				document.getElementById("canvas") ||
				document.getElementById("body");
			let canvas_height = canvas.offsetHeight;
			let canvas_width = canvas.offsetWidth;
			let canvas_centery = parseFloat(canvas_height) / 2.0;
			let canvas_centerx = parseFloat(canvas_width) / 2.0;
			return {
				x: canvas_centerx,
				y: canvas_centery,
				dx: canvas_width,
				dy: canvas_height,
			};
		},

		async getUser() {
			try {
				const user = await sugarizer.modules.user.get();
				this.currentcolor = user.colorvalue;
				this.networkId = user._id;
			} catch (error) {
				throw new Error("Unable to load the user, error " + error);
			}
		},

		showPopupTimer(e, iconRef, data) {
			if (this.popupTimer != null) {
				window.clearTimeout(this.popupTimer);
			}
			this.popupTimer = window.setTimeout(
				this.showPopup.bind(this),
				this.constant.timerPopupDuration,
				e,
				iconRef,
				data
			);
		},
		showPopup(e, iconRef, popupData) {
			if (this.$refs.popup.isShown) this.removePopup(e); //remove before updating iconRef

			this.popupIconRef = iconRef;
			const offset = 6;
			e.clientX += offset;
			e.clientY += offset;

			this.popupItem = popupData;
			this.$refs.popup.show(e.clientX, e.clientY);
		},

		removePopupTimer(e) {
			if (this.popupTimer != null) {
				window.clearTimeout(this.popupTimer);
			}

			this.popupTimer = window.setTimeout(
				this.removePopup.bind(this),
				this.constant.timerPopupDuration,
				e
			);
		},
		removePopup(e) {
			const popupIcon = this.$refs[this.popupIconRef]?.[0];
			if (!popupIcon) this.hidePopup();
			else if (
				!this.$refs.popup.isCursorInside(e.clientX, e.clientY) &&
				!popupIcon.isCursorInside(e.clientX, e.clientY)
			) {
				this.hidePopup();
			}
		},

		hidePopup() {
			this.$refs.popup.hide();
			this.popupTimer = null;
			this.popupItem = null;
		},

		onPopupItemClick(itemId) {
			const popupData = this.$refs.popup.item;
			const handlerFunc = popupData?.handlers?.[itemId];
			if (handlerFunc) {
				handlerFunc();
				this.hidePopup();
			}
		},

		updateNetworkState() {
			if (this.presence.isConnected()) {
				this.serverErr = null;
				if (
					this.currentcolor.stroke === "#005FE4" &&
					this.currentcolor.fill === "#FF2B34" &&
					this.filter === "Sugarizer contributors"
				) {
					if (!this.eeMode) {
						this.activities.length = 0;
						this.userListReceived(
							sugarizer.modules.contributors.getContributors()
						);
						this.eeMode = true;
					}
				} else {
					this.presence.listUsers(this.userListReceived.bind(this));
					this.presence.listSharedActivities(
						this.sharedListReceived.bind(this)
					);
					this.eeMode = false;
				}
			} else {
				this.clearNetworkEntities();
				this.users.length = 0;
				this.activities.length = 0;
				this.$refs.popup.hide();
				this.eeMode = false;
				if (sugarizer.modules.user.isConnected()) {
					this.serverErr = {
						msg: this.$t("UnableToConnect"),
						btnText: this.$t("Refresh"),
						btnIcon: "./icons/system-restart.svg",
						action: this.doRefresh,
					};
				} else {
					this.serverErr = {
						msg: this.$t("ServerNotSet"),
						btnText: this.$t("MySettings"),
						btnIcon: "./icons/system-restart.svg",
						action: this.emitOpenSettings,
					};
				}
			}
		},

		userListReceived(users) {
			// Ensure that an update is need
			if (this.users.length === users.length) {
				const len = this.users.length;
				let found = 0;
				for (let i = 0; i < len; i++) {
					for (let j = 0; j < len; j++) {
						if (users[i].networkId === this.users[j].networkId) {
							found++;
							break;
						}
					}
				}
				if (found === len) {
					return;
				}
			}
			this.users = users;
			this.updateAndPositionNetworkIcons();
		},

		sharedListReceived(activities) {
			// Ensure that an update is need
			if (this.activities.length === activities.length) {
				var len = this.activities.length;
				var found = 0;
				for (var i = 0; i < len; i++) {
					for (var j = 0; j < len; j++) {
						if (
							activities[i].activityId ==
								this.activities[j].activityId &&
							activities[i].users.length ==
								this.activities[j].users.length
						) {
							found++;
							break;
						}
					}
				}
				if (found == len) {
					return;
				}
			}

			this.activities = activities;
			this.updateAndPositionNetworkIcons();
		},

		updateAndPositionNetworkIcons() {
			this.clearNetworkEntities();

			this.updateNetworkIcons();
			this.computePositions(this.entitiesWithoutChildren, false);
			this.computePositions(this.activitiesWithUsers, true);

			const items = this.entitiesWithoutChildren.concat(
				this.activitiesWithUsers
			);
			const collisions = this.detectCollisions(items);
			if (collisions.length > 0) {
				this.solveCollisions(collisions, items);
			}

			this.filterNetwork();
		},

		// Update entitiesWithoutChildren and activitiesWithUsers
		updateNetworkIcons() {
			const users = this.users.map((user) => {
				const sizeNeighbor = this.constant.sizeNeighbor;
				user.size = sizeNeighbor;
				user.icon = "./icons/owner-icon.svg";
				user.child = [];
				user.color = sugarizer.modules.xocolor.findIndex(
					user.colorvalue
				);
				user.popupData = this.getPopupData(user);
				if (user.networkId === this.networkId) {
					user.x = this.canvasCenter.x - sizeNeighbor / 2;
					user.y = this.canvasCenter.y - sizeNeighbor;
					user.locked = true;
					user.popupData.id = "buddy";
					//prettier-ignore
					user.popupData.itemList = [
						{ icon: { id: 'settings', iconData: "icons/preferences-system.svg", color: 256, size: this.constant.itemListIconSize }, name: this.$t("MySettings") },
						{ icon: { id: 'shutdown', iconData: "icons/system-shutdown.svg", color: 256, size: this.constant.itemListIconSize, isNative: "true" }, name: this.$t("Logoff") },
					]
					user.popupData.handlers = {
						buddy_settings: this.emitOpenSettings,
						buddy_shutdown: this.logout,
					};
				}
				return user;
			});

			// Add activities
			const usersInActivity = [];
			for (const currentActivity of this.activities) {
				// Unknown activity, ignore
				const activityInfo = sugarizer.modules.activities.getById(
					currentActivity.activityId
				);
				if (
					sugarizer.modules.activities.isGeneric(activityInfo) ||
					!currentActivity.users.length
				)
					continue;

				// Add child Users for activity
				const childUsers = [];
				currentActivity.users.forEach((id) => {
					users.forEach((user) => {
						if (id === user.networkId) {
							childUsers.push(user);
							usersInActivity.push(user);
						}
					});
				});

				const color = sugarizer.modules.xocolor.findIndex(
					currentActivity.colorvalue
				);
				this.activitiesWithUsers.push({
					id: currentActivity.id,
					color: color,
					icon: activityInfo.directory + "/" + activityInfo.icon,
					size: this.constant.sizeNeighbor,
					child: childUsers,
					activityInfo: activityInfo,
					popupData: this.getActivityPopupData(
						activityInfo,
						currentActivity.id,
						color
					),
				});
			}

			// Add users alone & also server
			users.forEach((user) => {
				if (
					!usersInActivity.some(
						(userInActivity) =>
							userInActivity.networkId === user.networkId
					)
				) {
					this.entitiesWithoutChildren.push(user);
				}
			});
			const serverData = this.findInCache({ id: "network-server" });
			const serverIcon = {
				name:
					sugarizer.modules.user.getServerInformation()?.name ||
					sugarizer.modules.server.getServer(),
				title: this.$t("Connected"),
				networkId: "network-server",
				icon: "./icons/network-wireless-connected-100.svg",
				color: serverData
					? serverData.color
					: Math.floor(
							Math.random() *
								sugarizer.modules.xocolor.colors.length
					  ),
				size: this.constant.sizeNeighbor,
				isNative: "true",
				child: [],
			};
			serverIcon.popupData = this.getPopupData(serverIcon);
			this.entitiesWithoutChildren.push(serverIcon);
		},

		getPopupData(user) {
			return {
				id: user.networkId,
				directory: "icons",
				name: user.name,
				icon: {
					id: "pop-icon",
					iconData: user.icon,
					color: user.color,
					size: user.size,
					isNative: user.isNative,
				},
				title: user.title,
			};
		},

		getActivityPopupData(activityInfo, sharedId, activityColor) {
			return {
				id: activityInfo.id,
				favorite: activityInfo.favorite,
				directory: activityInfo.directory,
				icon: {
					id: "act-icon",
					color: activityColor,
					iconData: activityInfo.directory + "/" + activityInfo.icon,
					size: this.constant.sizeNeighbor,
					isNative: "true",
				},
				name: activityInfo.name,
				//prettier-ignore
				itemList: [
					{ icon: { id: 'join', iconData: "./icons/activity-start.svg", size: this.constant.itemListIconSize, isNative: "true" }, name: this.$t("JoinActivity") },
				],
				handlers: {
					[activityInfo.id + "_act-icon"]: () => {
						this.joinActivity(activityInfo, sharedId);
					},
					[activityInfo.id + "_join"]: () => {
						this.joinActivity(activityInfo, sharedId);
					},
				},
			};
		},

		computePositions(items, hasChild) {
			const canvas_center = this.canvasCenter;
			const constant = this.constant;
			hasChild = hasChild ? 1 : 0;

			const maxx =
				canvas_center.dx -
				constant.sizeNeighbor -
				2 * hasChild * constant.sizeNeighbor;
			const maxy =
				canvas_center.dy -
				constant.sizeNeighbor -
				2 * hasChild * constant.sizeNeighbor;

			// Compute icons position
			for (const current of items) {
				if (current.locked) continue;

				const cacheData = this.findInCache(current);
				current.x =
					cacheData && cacheData.x < maxx
						? cacheData.x
						: constant.sizeNeighbor * hasChild +
						  Math.floor(Math.random() * maxx);
				current.y =
					cacheData && cacheData.y < maxy
						? cacheData.y
						: constant.sizeNeighbor * hasChild +
						  Math.floor(Math.random() * maxy);

				if (!cacheData) this.addToCache(current);

				// Set child position
				if (hasChild) {
					const childLen = current.child.length;
					for (let j = 0; j < childLen; j++) {
						const child = current.child[j];
						const angle = ((2.0 * Math.PI) / childLen) * j;
						child.x =
							current.x + constant.sizeNeighbor * Math.sin(angle);
						child.y =
							current.y - constant.sizeNeighbor * Math.cos(angle);
					}
				}
			}
		},

		// Detect collisions on drawing
		detectCollisions: function (items) {
			const collisions = [];
			const len = items.length;
			for (let i = 0; i < len; i++) {
				for (let j = i + 1; j < len; j++) {
					const item0 = items[i];
					const item1 = items[j];
					const size0 = item0.size;
					const size1 = item1.size;
					let min0x = item0.x,
						max0x = item0.x + size0;
					let min0y = item0.y,
						max0y = item0.y + size0;
					let min1x = item1.x,
						max1x = item1.x + size1;
					let min1y = item1.y,
						max1y = item1.y + size1;
					if (item0.child.length > 0) {
						min0x -= size0;
						max0x += size0;
						min0y -= size0;
						max0y += size0;
					}
					if (item1.child.length > 0) {
						min1x -= size1;
						max1x += size1;
						min1y -= size1;
						max1y += size1;
					}
					if (
						!(
							max0x < min1x ||
							min0x > max1x ||
							min0y > max1y ||
							max0y < min1y
						)
					) {
						if (item0.locked) {
							collisions.push(item1);
						} else {
							collisions.push(item0);
						}
					}
				}
			}
			return collisions;
		},

		// Move items to avoid collisions
		solveCollisions(collisions, items) {
			let stillCollide = true;
			const canvas_center = this.canvasCenter;
			for (
				let i = 0;
				stillCollide && i < this.constant.maxCollisionTry;
				i++
			) {
				// Move all item with collision
				for (let j = 0; j < collisions.length; j++) {
					// Move item
					const current = collisions[j];
					const hasChild = current.child.length > 0 ? 1 : 0;
					current.x =
						current.size * hasChild +
						Math.floor(
							Math.random() *
								(canvas_center.dx -
									current.size -
									2 * hasChild * current.size)
						);
					current.y =
						current.size * hasChild +
						Math.floor(
							Math.random() *
								(canvas_center.dy -
									current.size -
									2 * hasChild * current.size)
						);

					// Move childs
					const childLen = current.child.length;
					for (let k = 0; k < childLen; k++) {
						const child = current.child[k];
						const angle = ((2.0 * Math.PI) / childLen) * k;
						child.x = current.x + current.size * Math.sin(angle);
						child.y = current.y - current.size * Math.cos(angle);
					}
				}

				// Detect again
				collisions = this.detectCollisions(items);
				stillCollide = collisions.length > 0;
			}
		},

		// Cache handling
		addToCache(item) {
			const id = item.networkId || item.id;
			if (id && !window.networkItemsCache.has(id)) {
				window.networkItemsCache.set(id, {
					x: item.x,
					y: item.y,
					color: item.color,
				});
			}
		},
		findInCache(item) {
			const id = item.networkId || item.id;
			if (id) {
				const cachedItem = window.networkItemsCache.get(id);
				if (cachedItem) {
					return cachedItem;
				}
			}
			return null;
		},

		//prettier-ignore
		joinActivity(activity, sharedId) {
			sugarizer.modules.stats.trace("neighborhood_view", "click", "logoff");
			sugarizer.modules.activities.runActivity(activity, null, activity.name, sharedId);
		},
		//prettier-ignore
		emitOpenSettings() {
			sugarizer.modules.stats.trace("neighborhood_view", "click", "My Settings");
			this.$emit("openSettings");
		},
		logout() {
			//prettier-ignore
			sugarizer.modules.stats.trace("neighborhood_view", "click", "Logoff");
			sugarizer.restart();
		},

		doRefresh: function () {
			if (!this.presence.isConnected()) {
				const that = this;
				this.presence.joinNetwork(function (error, user) {
					if (error) {
						console.log(
							"WARNING: Can't connect to presence server"
						);
					} else {
						that.updateNetworkState();
					}
				});
			} else {
				this.updateNetworkState();
			}
		},
		clearNetworkEntities() {
			this.entitiesWithoutChildren = [];
			this.activitiesWithUsers = [];
		},

		filterNetwork() {
			if (this.eeMode) return;
			this.entitiesWithoutChildren.forEach((entity) => {
				const ref = this.$refs["u-" + entity.networkId];
				if (ref && ref[0]) {
					ref[0].disabledData = !entity.name
						.toLowerCase()
						.includes(this.filter.toLowerCase());
				}
			});

			this.activitiesWithUsers.forEach((activity) => {
				const activityRef = this.$refs[activity.id];
				const activityNameMatch = activity.activityInfo.name
					.toLowerCase()
					.includes(this.filter.toLowerCase());

				if (activityRef && activityRef[0]) {
					activityRef[0].disabledData = !activityNameMatch;
				}
				if (activity.child && activity.child.length > 0) {
					activity.child.forEach((user) => {
						const userRef = this.$refs[user.networkId];
						const userNameMatch = user.name
							.toLowerCase()
							.includes(this.filter.toLowerCase());

						if (userRef && userRef[0]) {
							userRef[0].disabledData = !(
								activityNameMatch || userNameMatch
							);
						}
					});
				}
			});
		},
	},

	beforeUnmount() {
		clearInterval(this.popupTimer);
		clearInterval(this.networkTimer);
	},

	watch: {
		filter: function () {
			this.filterNetwork();
		},
	},
};
