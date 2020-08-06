Vue.component('sugar-device', {
	/*html*/
	template: `<div style="display: none">{{ watchId }}</div>`,
	data: function () {
		return {
			readyToWatch: false,
			frequency: null
		}
	},
	created: function () {
		var cordovaScript = document.createElement('script');
		cordovaScript.setAttribute('type', 'text/javascript');
		cordovaScript.setAttribute('src', '../../cordova.js');
		document.head.appendChild(cordovaScript);
	},
	mounted: function () {
		var vm = this;
		//Accelerometer
		if (this.isMobile()) {
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
		isMobile() {
			var userAgent = navigator.userAgent;
			if (/Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(userAgent)) {
				return true;
			}
			return false;
		},
		isElectron() {
			var userAgent = navigator.userAgent;
			if (/Electron/.test(userAgent)) {
				return true;
			}
			return false;
		},
		isApp() {
			return document.location.protocol.substr(0,4) != "http";
		},	
		isWebApp() {
			if (!this.isMobile() && !this.isElectron() && !this.isApp()) {
				return true;
			}
			return false;
		},
		getOS() {
			var userAgent = navigator.userAgent;
			var clientStrings = [
				{ s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
				{ s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
				{ s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
				{ s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
				{ s: 'Windows Vista', r: /Windows NT 6.0/ },
				{ s: 'Windows Server 2003', r: /Windows NT 5.2/ },
				{ s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
				{ s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
				{ s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
				{ s: 'Windows 98', r: /(Windows 98|Win98)/ },
				{ s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
				{ s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
				{ s: 'Windows CE', r: /Windows CE/ },
				{ s: 'Windows 3.11', r: /Win16/ },
				{ s: 'Android', r: /Android/ },
				{ s: 'Open BSD', r: /OpenBSD/ },
				{ s: 'Sun OS', r: /SunOS/ },
				{ s: 'Chrome OS', r: /CrOS/ },
				{ s: 'Linux', r: /(Linux|X11(?!.*CrOS))/ },
				{ s: 'iOS', r: /(iPhone|iPad|iPod)/ },
				{ s: 'Mac OS X', r: /Mac OS X/ },
				{ s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
				{ s: 'QNX', r: /QNX/ },
				{ s: 'UNIX', r: /UNIX/ },
				{ s: 'BeOS', r: /BeOS/ },
				{ s: 'OS/2', r: /OS\/2/ },
				{ s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
			];
			for (var cs of clientStrings) {
				if (cs.r.test(userAgent)) {
					return cs.s;
				}
			}
		},

		watchAcceleration: function (frequency) {
			var vm = this;
			// if (window.DeviceMotionEvent == undefined) {
			// 	console.log("No accelerometer");
			// 	// this.frequency = frequency;
			// }
			// else {
			// 	console.log("Accelerometer found");
			// 	window.addEventListener("devicemotion", this.accelerationCallback, true);
			// }
			var accelerometer = new Accelerometer({ frequency: frequency });
			if (accelerometer) {
				accelerometer.addEventListener('reading', function () {
					vm.accelerationCallback(accelerometer);
				});
				accelerometer.start();
			} else {
				this.frequency = frequency;
			}
		},

		accelerationCallback: function (acceleration) {
			// if (acceleration.type == "devicemotion") {
			// 	acceleration = acceleration.accelerationIncludingGravity;
			// 	acceleration.type = "devicemotion";
			// } else {
			// 	acceleration.type = "cordova";
			// }
			this.$emit('acceleration-callback', acceleration);
		},

		getLocation: function () {
			return new Promise((resolve, reject) => {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(resolve);
				} else {
					resolve(null, { code: 1 });
				}
			})
		},

		vibrate: function (value) {
			navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

			if (navigator.vibrate) {
				navigator.vibrate(value);
			}
		}
	},
	beforeDestroy: function () {
		navigator.accelerometer.clearWatch(this.watchId);
	}
});