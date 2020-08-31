Vue.component('sugar-presence', {
	data: function () {
		return {
			activity: null,
			LZString: null,
			bundleId: '',
			palette: null,
			presence: null,
			isHost: false
		}
	},
	mounted() {
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env", "lz-string"], function (activity, env, LZString) {
			vm.activity = activity;
			vm.LZString = LZString;
			env.getEnvironment(function (err, environment) {
				vm.bundleId = environment.bundleId;
				// Handle shared instance
				if (environment.sharedId) {
					console.log("Shared instance");
				}
				vm.presence = activity.getPresenceObject(function (error, network) {
					if (error) {
						console.log(error);
					}
					network.onDataReceived(vm.onNetworkDataReceived);
					network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
				});
			});
		});
	},
	methods: {
		
		isConnected: function () {
			return this.presence != null && this.presence.isConnected();
		},

		isShared() {
			return this.presence != null && this.presence.hasOwnProperty('sharedInfo');
		},

		getSharedInfo: function () {
			return this.presence.getSharedInfo();
		},

		getUserInfo: function () {
			return this.presence.getUserInfo();
		},

		sendMessage: function (message) {
			var compressedMsg = this.LZString.compressToUTF16(JSON.stringify(message));
			this.presence.sendMessage(this.presence.getSharedInfo().id, compressedMsg);
		},

		onShared: function (event, paletteObject) {
			paletteObject.popDown();
			var vm = this;
			console.log("Want to share");
			this.presence.createSharedActivity(this.bundleId, function (groupId) {
				console.log("Activity shared");
				vm.isHost = true;
			});
		},

		onNetworkDataReceived: function (msg) {
			var decompressedMsg = JSON.parse(this.LZString.decompressFromUTF16(msg));

			if (this.getUserInfo().networkId === decompressedMsg.user.networkId) {
				return;  	// Return if data was sent by the user
			}

			this.$emit('data-received', decompressedMsg);
		},

		onNetworkUserChanged: function (msg) {
			if (this.getUserInfo().networkId === msg.user.networkId) {
				return;  	// Return if user himself changed
			}

			this.$emit('user-changed', msg);

			console.log("User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left"));
			let vm = this;
			// Show popup
			if (this.$root.$refs.SugarPopup) {
				let stringToDisplay = '';

				// Get localized string
				if(this.$root.$refs.SugarL10n) {
					let userStringToGet = "User" + (msg.move == 1 ? "Joined" : "Left");
					stringToDisplay = this.$root.$refs.SugarL10n.get(userStringToGet, { name: msg.user.name });
				} else {
					stringToDisplay = "User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left");
				}

				// Show icon
				if(this.$root.$refs.SugarIcon) {
					this.$root.$refs.SugarIcon.generateIconWithColors('../icons/owner-icon.svg', msg.user.colorvalue)
						.then(src => {
							let html = `<div style="display: flex; align-items:center;">`;
							let img = "<img style='height:40px; margin:10px; vertical-align: middle;' src='" + src + "'>";
							html += `${img}`;
							html += `<span>${stringToDisplay}</span>`
							html += `</div>`;
							vm.$root.$refs.SugarPopup.log(html);
						});
				} else {
					this.$root.$refs.SugarPopup.log(stringToDisplay);
				}
			}
		}
	}
});