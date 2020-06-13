Vue.component('sugar-device', {
	/*html*/
	template: `<div style="display: none">{{ watchId }}</div>`,
	data: function() {
		return {
      readyToWatch: false,
			accelerometerCallback: null,
      frequency: null
		}
	},
	created: function() {
		var cordovaScript = document.createElement('script');
		cordovaScript.setAttribute('type', 'text/javascript');
		cordovaScript.setAttribute('src', '../../cordova.js');
		document.head.appendChild(cordovaScript);
	},
	mounted: function() {
		var vm = this;
    //Accelerometer
    var useragent = navigator.userAgent.toLowerCase();
    if (useragent.indexOf('android') != -1 || useragent.indexOf('iphone') != -1 || useragent.indexOf('ipad') != -1 || useragent.indexOf('ipod') != -1 || useragent.indexOf('mozilla/5.0 (mobile') != -1) {
      document.addEventListener('deviceready', function () {
        vm.readyToWatch = true;
      }, false);
		}

  },
  computed: {
		watchId: function () {
			if (this.readyToWatch && this.frequency) {
				return navigator.accelerometer.watchAcceleration(this.accelerationCallback, null, { frequency: this.frequency });
			}
      return null;
		}
	},
	methods: {
		watchAcceleration: function (frequency) {
      this.frequency = frequency;
		},

		accelerationCallback: function(acceleration) {
			this.$emit('acceleration-callback', acceleration);
		},

		getLocation: function(callback) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(callback);
			} else {
				callback(null, { code: 1 });
			}
		},

		vibrate: function(value) {
			navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

			if (navigator.vibrate) {
				navigator.vibrate(value);
			}
		}
	},
	beforeDestroy: function() {
		navigator.accelerometer.clearWatch(this.watchId);
	}
})