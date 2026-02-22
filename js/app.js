
const appVue = Vue.createApp({
	components: {
		"firstscreen": FirstScreen,
		"mainscreen": MainScreen,
	},
	data() {
		return {
			isFirstScreen: null
		}
	},
	
	created: async function () {
		await this.checkReset();
		this.checkUserLoggedIn();
	},

	methods: {
		setIsFirstScreen(value) {
			this.isFirstScreen = value;
		},

		async checkReset() {
			if (location.href.indexOf("rst=1") != -1) {
				await sugarizer.modules.settings.reinitialize(true);
				location.assign(location.href.replace(/\?rst=?./g,"?rst=0"));
			} else if (location.href.indexOf("rst=2") != -1) {
				await sugarizer.modules.settings.reinitialize(false);
				location.assign(location.href.replace(/\?rst=?./g,"?rst=0"));
			}
		},

		checkUserLoggedIn() {
			if (sugarizer.modules.settings.getUser() != null) {
				sugarizer.modules.user.get().then((user) => {
					this.setIsFirstScreen(false);
					this.updateFavicon();
				},(error) => {
					console.log("Error: ", error);
					this.setIsFirstScreen(true);
					this.updateFavicon();
				});
			} else {
				this.setIsFirstScreen(true);
				this.updateFavicon();
			}
		},

		updateFavicon() {
			var buddyIcon='<?xml version="1.0" encoding="UTF-8" standalone="no"?>\
			<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" version="1.0" >\
			<g transform="translate(37.943468,-309.4636)">\
			<g transform="matrix(0.05011994,0,0,0.05012004,-41.76673,299.66011)" style="fill:&fill_color;;fill-opacity:1;stroke:&stroke_color;;stroke-opacity:1">\
			<circle transform="matrix(0.969697,0,0,0.969697,-90.879133,125.06999)" style="fill:&fill_color;;fill-opacity:1;stroke:&stroke_color;;stroke-width:20.62502098;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" cx="331.38321" cy="134.2677" r="51.220825" />\
			<path d="m 290.55846,302.47333 -58.81513,59.20058 -59.39461,-59.40024 c -25.19828,-24.48771 -62.7038,13.33148 -38.1941,37.98719 l 60.04451,58.9817 -59.73639,59.42563 c -24.83976,24.97559 12.91592,63.26505 37.66786,37.75282 l 59.95799,-59.28294 58.75912,59.21065 c 24.50656,25.09065 62.43116,-13.00322 37.87956,-37.85772 l -59.24184,-59.02842 58.87574,-59.14782 c 25.1689,-25.18348 -13.0489,-62.75154 -37.80271,-37.84143 z" style="fill:&fill_color;;fill-opacity:1;stroke:&stroke_color;;stroke-width:20.00002098;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" />\
			</g></g></svg>';
			var settings = sugarizer.modules.settings.getUser();
			var color = settings && settings.colorvalue ? settings.colorvalue : {stroke: "#005FE4", fill: "#FF2B34"};
			var name = settings && settings.name ? settings.name : "<No name>";
			document.title = ((name&&name!="<No name>")?name+" - ":"")+"Sugarizer";
			var icon = buddyIcon.replace(new RegExp("&fill_color;","g"),color.fill).replace(new RegExp("&stroke_color;","g"),color.stroke);
			var svg_xml = (new XMLSerializer()).serializeToString((new DOMParser()).parseFromString(icon, "text/xml"));
			var canvas = document.createElement('canvas');
			canvas.width = 16;
			canvas.height = 16;
			var ctx = canvas.getContext('2d');
			var img = new Image();
			img.src = "data:image/svg+xml;base64," + btoa(svg_xml);
			img.onload = function() {
				ctx.drawImage(img, 0, 0);
				var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
				link.type = 'image/x-icon';
				link.rel = 'shortcut icon';
				link.href = canvas.toDataURL("image/x-icon");
				document.getElementsByTagName('head')[0].appendChild(link);
			}
		},
	},
});

let app;
sugarizer.init().then(() => {
	sugarizer.modules.i18next.useI18n(appVue)
	app = appVue.mount('#app');
});
