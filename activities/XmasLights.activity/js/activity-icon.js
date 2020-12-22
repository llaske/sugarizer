
// LED icon
Vue.component('activity-icon', {
	name: 'ActivityIcon',
	template: `<div v-html="svg" :id="id"></div>`,
	props: ['svg','color'],
	data: function() {
		return {
			id: null
		}
	},
	mounted: function() {
		this.id = this._uid;
	},
	watch: {
		color: function(newColor, oldColor) {
			_setColor(this, newColor);
		}
	}
});

// Change CSS color
function _setColor(vm, color) {
	setTimeout(function() { // HACK: Timeout need to wait for SVG to be build
		let icon = document.getElementById(vm.id);
		if (!icon) {
			return -1; // Error bad element
		}
		var element = null;
		for (var i = 0 ; i < icon.children.length && !element ; i++) {
			if (icon.children[i].tagName == "svg") {
				element = icon.children[i];
			}
		}
		if (element == null) {
			return -1; // Error no SVG included
		}
		element.setAttribute("class", "xo-color"+color);
		return 0;
	}, 0);
}
