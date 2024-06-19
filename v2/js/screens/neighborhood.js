const Neighborhood = {
	name: "Neighborhood",
	templatee: `
		<div class="neighborhood-view" ref="neighborhoodView">
			<icon
				id="owner"
				:ref="'ownerIcon'"
				svgfile="./icons/owner-icon.svg"
				class="network-icon"
				:color="buddyColor"
				:size="constant.sizeOwner"
				:x="canvasCenter.x - constant.sizeOwner / 2"
				:y="canvasCenter.y - constant.sizeOwner / 2"
				@mouseover="showPopupTimer($event)"
				@mouseout="removePopupTimer($event)"
			></icon>

			<icon
				v-for="(user, index) in users"
				:key="user.networkId"
				:id="user.networkId"
				:ref="'user' + user.networkId"
				svgfile="./icons/user-icon.svg"
				class="network-icon"
				:color="user.color"
				:size="constant.sizeNeighbor"
				:x="userPositions[index].x"
				:y="userPositions[index].y"
				@mouseover="showPopupTimer($event)"
				@mouseout="removePopupTimer($event)"
			></icon>

			<icon
				id="server"
				:ref="'serverIcon'"
				svgfile="./icons/network-wireless-connected-100.svg"
				class="network-icon"
				:color="server.color"
				:size="constant.sizeServer"
				:x="canvasCenter.x + 100"
				<!--
				Adjust
				the
				position
				as
				needed
				--
			>
				:y="canvasCenter.y + 100"
				<!-- Adjust the position as needed -->
				@mouseover="showServerPopup" @mouseout="hideServerPopup" ></icon
			>
		</div>
	`,

	components: {
		icon: Icon,
		popup: Popup,
	},

	data() {
		return {
			users: [],
			userPositions: [],
			// buddyColor: preferences.getColor(),
			server: {
				color: "someColor",
			},
			constant: {
				sizeOwner: 100,
				sizeNeighbor: 50,
				sizeServer: 120,
				timerUpdateNetwork: 1000,
			},
			canvasCenter: { x: 0, y: 0 },
			timer: null,
		};
	},

	props: ["filter"],

	created() {
		// this.setCanvasCenter();
		const vm = this;
		this.presence = sugarizer.modules.presence;
		this.timer = setInterval(
			vm.updateNetworkState,
			vm.constant.timerUpdateNetwork
		);
	},
	methods: {
		setCanvasCenter() {
			this.canvasCenter = util.getCanvasCenter();
		},

		updateNetworkState() {
			this.presence.listUsers(this.userListReceived.bind(this));
			this.presence.listSharedActivities(
				this.sharedListReceived.bind(this)
			);
		},

		userListReceived(users) {
			// Ensure that an update is need
			if (this.users.length == users.length) {
				var len = this.users.length;
				var found = 0;
				for (var i = 0; i < len; i++) {
					for (var j = 0; j < len; j++) {
						if (users[i].networkId == this.users[j].networkId) {
							found++;
							break;
						}
					}
				}
				if (found == len) {
					return;
				}
			}

			this.users = users;
			this.draw();
		},

		sharedListReceived(users) {
			console.log("shared", users);
		},

		draw() {

		},

		setUserPositions() {
			// Ensure that an update is need
			if (this.users.length == users.length) {
				var len = this.users.length;
				var found = 0;
				for (var i = 0; i < len; i++) {
					for (var j = 0; j < len; j++) {
						if (users[i].networkId == this.users[j].networkId) {
							found++;
							break;
						}
					}
				}
				if (found == len) {
					return;
				}
			}

			// Retrieve users
			this.users = users;

			// Add dummy users for testing
			var dummy = 0;
			for (var i = 0; i < dummy; i++) {
				this.users.push({
					networkId: "nxx" + i,
					name: "dummy " + i,
					colorvalue:
						xoPalette.colors[
							Math.floor(Math.random() * xoPalette.colors.length)
						],
				});
			}

			// Redraw
			this.draw();
			this.userPositions = this.users.map((user, index) => {
				return {
					x: Math.random() * 800, // Replace with logic to set x position
					y: Math.random() * 600, // Replace with logic to set y position
				};
			});
		},
		showPopupTimer(event) {
			// Implement popup logic
		},
		removePopupTimer(event) {
			// Implement logic to remove popup
		},
		showServerPopup() {
			// Logic to show server popup
		},
		hideServerPopup() {
			// Logic to hide server popup
		},
		filterSearch(filter) {
			console.log(filter);
		},
	},

	beforeUnmount() {
		clearInterval(this.timer);
		console.log("Clearing Timer");
	},

	watch: {
		filter: function (value) {
			this.filterSearch(value);
		},
	},
};
