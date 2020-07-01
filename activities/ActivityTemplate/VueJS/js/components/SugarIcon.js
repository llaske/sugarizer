Vue.component('sugar-icon', {
	data: function () {
		return {
			icon: null
		}
	},
	mounted() {
		var vm = this;
		requirejs(["sugar-web/graphics/icon"], function (icon) {
			vm.icon = icon;
		});
	},
	methods: {
		colorize: function (element, colors, callback) {
			this.icon.colorize(element, colors, callback);
		},

		generateIconWithColors: function (path, colors, callback) {
			requirejs([`text!${path}`], function (icon) {
				icon = icon.replace(/(stroke)_color\s\"#?\w*\"/, `stroke_color "${colors.stroke}"`);
				icon = icon.replace(/(fill)_color\s\"#?\w*\"/, `fill_color "${colors.fill}"`);
				callback("data:image/svg+xml;base64," + btoa(icon));
			});
		},

		colorizeIcon: function (element, colors, callback) {
			var path = this.getBackgroundURL(element);
			this.generateIconWithColors(path, colors, function (src) {
				element.style.backgroundImage = `url(${src})`;
				if (callback) {
					callback();
				}
			});
		},

		getBackgroundURL: function (elem) {
			var style = elem.currentStyle || window.getComputedStyle(elem, '');
			// Remove prefix 'url(' and suffix ')' before return
			var res = style.backgroundImage.slice(4, -1);
			var last = res.length - 1;
			if (res[0] == '"' && res[last] == '"') {
				res = res.slice(1, last);
			}
			return res;
		}
	}
})