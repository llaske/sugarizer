Vue.component('sugar-presence', {
	data: {
		activity: null,
		bundleId: '',
		palette: null,
		presence: null,
		isHost: false
	},
	mounted() {
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {
			vm.activity = activity;
			env.getEnvironment(function (err, environment) {
				vm.bundleId = environment.bundleId;
				// Handle shared instance
				if (environment.sharedId) {
					console.log("Shared instance");
					vm.presence = activity.getPresenceObject(function (error, network) {
						if (error) {
							console.log(error);
						}
						network.onDataReceived(vm.onNetworkDataReceived);
						network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
					});
				}
			});
		});
	},
	methods: {

		isConnected: function () {
			return this.presence != null;
		},

		getSharedInfo: function () {
			return this.presence.getSharedInfo();
		},

		getUserInfo: function () {
			return this.presence.getUserInfo();
		},

		sendMessage: function (message) {
			this.presence.sendMessage(this.presence.getSharedInfo().id, message);
		},

		onShared: function (event, paletteObject) {
			paletteObject.popDown();
			var vm = this;
			console.log("Want to share");
			this.presence = vm.activity.getPresenceObject(function (error, network) {
				if (error) {
					console.log("Sharing error");
					return;
				}
				network.createSharedActivity(vm.bundleId, function (groupId) {
					console.log("Activity shared");
					vm.isHost = true;
				});
				network.onDataReceived(vm.onNetworkDataReceived);
				network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
			});
		},

		onNetworkDataReceived: function (msg) {
			if (this.getUserInfo().networkId === msg.user.networkId) {
				return;  	// Return if data was sent by the user
			}

			this.$emit('data-received', msg);
		},

		onNetworkUserChanged: function (msg) {
			if (this.getUserInfo().networkId === msg.user.networkId) {
				return;  	// Return if user himself changed
			}

			this.$emit('user-changed', msg);

			console.log("User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left"));
			if (this.$root.$refs.SugarPopup) {
				this.$root.$refs.SugarPopup.log("User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left"));
			}
		},
	}
});