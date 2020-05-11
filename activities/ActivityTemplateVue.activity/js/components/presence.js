var Presence = {
  data: {
    palette: null,
    presence: null,
		isHost: false
  },
  mounted() {
		var vm = this;
		EventBus.$on('presenceExists', function(callback) {
			callback(vm.presence != null);
		});
		EventBus.$on('isHost', function(callback) {
			callback(vm.isHost);
		});
		EventBus.$on('sendMessage', this.sendMessage);

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

		sendMessage: function(message) {
			message.user = this.presence.getUserInfo(),
			this.presence.sendMessage(this.presence.getSharedInfo().id, message);
		},

    onNetworkDataReceived: function (msg) {
			if (this.presence.getUserInfo().networkId === msg.user.networkId) {
				return;  	// Return if data was sent by the user
			}

			this.$emit('data-received', msg);
		},

		onNetworkUserChanged: function (msg) {
			if (this.presence.getUserInfo().networkId === msg.user.networkId) {
				return;  	// Return if user himself joined/left
			}

			this.$emit('user-changed', msg);

			if (this.presence.getUserInfo().networkId !== msg.user.networkId) {
				var message = "User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left");
				console.log(message);
				EventBus.$emit('popupLog', message);
			}
		},
  }
}