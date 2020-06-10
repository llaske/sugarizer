Vue.component('sugar-device', {
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
			var vm = this;
			if (this.readyToWatch && this.accelerometerCallback && this.frequency) {
				return navigator.accelerometer.watchAcceleration(this.accelerometerCallback, null, { frequency: this.frequency });
			}
      return null;
		}
	},
	methods: {
		watchAcceleration: function (frequency, callback) {
      this.accelerometerCallback = callback;
      this.frequency = frequency;
		},

		getLocation(callback) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(callback);
			} else {
				alert("Geolocation is not supported by this browser.");
			}
		}
	}
})