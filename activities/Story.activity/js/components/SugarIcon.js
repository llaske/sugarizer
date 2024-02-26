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

		generateIconWithColors: function (path, colors) {
			return new Promise((resolve, reject) => {
				requirejs([`text!${path}`], function (icon) {
					icon = icon.replace(/(stroke)_color\s\"#?\w*\"/, `stroke_color "${colors.stroke}"`);
					icon = icon.replace(/(fill)_color\s\"#?\w*\"/, `fill_color "${colors.fill}"`);
					resolve("data:image/svg+xml;base64," + btoa(icon));
				});
			});
		},

		colorizeIcon: function (element, colors) {
			let vm = this;
			return new Promise((resolve, reject) => {
				var path = getBackgroundURL(element);
				vm.generateIconWithColors(path, colors)
					.then(src => {
						element.style.backgroundImage = `url(${src})`;
						resolve();
					});
			});
		}
	}
})

let getBackgroundURL = function (el) {
	var style = el.currentStyle || window.getComputedStyle(el, '');
	// Remove prefix 'url(' and suffix ')' before return
	var res = style.backgroundImage.slice(4, -1);
	var last = res.length - 1;
	if (res[0] == '"' && res[last] == '"') {
		res = res.slice(1, last);
	}
	return res;
}