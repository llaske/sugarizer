
// LED icon
Vue.component('activity-icon', {
	name: 'ActivityIcon',
	template: `
		<div v-html="svg" :id="id">
		</div>
	`,
	props: ['svg','color','size'],
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
		},
		size: function(newSize, oldSize) {
			_setSize(this, newSize);
		}
	}
});

// Get SVG element from an icon
function _getSVGElement(icon) {
	if (!icon) {
		return null;
	}
	let element = null;
	for (let i = 0 ; i < icon.children.length && !element ; i++) {
		if (icon.children[i].tagName == "svg") {
			element = icon.children[i];
		}
	}
	return element;
}

// Change CSS color
function _setColor(vm, color) {
	setTimeout(function() { // HACK: Timeout need to wait for SVG to be build
		let element = _getSVGElement(document.getElementById(vm.id));
		if (element) {
			element.setAttribute("class", "xo-color"+color);
		}
	}, 0);
}

// Change CSS size
function _setSize(vm, size) {
	setTimeout(function() { // HACK: Timeout need to wait for SVG to be build
		let element = _getSVGElement(document.getElementById(vm.id));
		if (element) {
			element.setAttribute("width", size+"px");
			element.setAttribute("height", size+"px");
			element.setAttribute("style", "margin: -2px -4px");
			element.setAttribute("preserveAspectRatio", "xMidYMid meet");
			element.setAttribute("viewBox", "0 0 55 55");
		}
	}, 0);
}
