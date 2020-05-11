var Presence = {
  data: {
    palette: null,
    presence: null,
		isHost: false
  },
  mounted() {
		var vm = this;
    requirejs(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/presencepalette"], function (activity, env, presencepalette) {
			env.getEnvironment(function (err, environment) {
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

			vm.palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
			vm.palette.addEventListener('shared', function () {
				vm.palette.popDown();
				console.log("Want to share");
				vm.presence = activity.getPresenceObject(function (error, network) {
					if (error) {
						console.log("Sharing error");
						return;
					}
					network.createSharedActivity('org.sugarlabs.ActivityTemplateVue', function (groupId) {
						console.log("Activity shared");
						vm.isHost = true;
					});
					network.onDataReceived(vm.onNetworkDataReceived);
					network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
				});
			});
		});
  },
  methods: {
		getSharedInfo: function() {
			return this.presence.getSharedInfo();
		},

		getUserInfo: function() {
			return this.presence.getUserInfo();
		},

		sendMessage: function(message) {
			this.presence.sendMessage(this.presence.getSharedInfo().id, message);
		},

    onNetworkDataReceived: function (msg) {
			if (this.getUserInfo().networkId === msg.user.networkId) {
				return;  	// Return if data was sent by the user
			}

			this.$emit('data-received', msg);
		},

		onNetworkUserChanged: function (msg) {
			this.$emit('user-changed', msg);

			console.log("User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left"));
			if (this.presence.getUserInfo().networkId !== msg.user.networkId) {
				this.$parent.$refs.popup.log("User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left"));
			}
		},
  }
}