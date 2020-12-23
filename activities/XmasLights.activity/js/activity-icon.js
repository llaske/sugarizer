
// LED icon
Vue.component('activity-icon', {
	name: 'ActivityIcon',
	template: `
		<div v-html="svg" :id="id" style="display: inline-block">
		</div>
	`,
	props: ['name','svg','color','size'],
	data: function() {
		return {
			id: null
		}
	},
	mounted: function() {
		this.id = this._uid;
		_setColor(this, this.color);
		if (this.size) {
			_setSize(this, this.size);
		}
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
			element.setAttribute("class", "xo-color"+(color%180));
		}
	}, 0);
}

// Change CSS size
function _setSize(vm, size) {
	setTimeout(function() { // HACK: Timeout need to wait for SVG to be build
		let element = _getSVGElement(document.getElementById(vm.id));
		if (element) {
			// Compute optimal viewBox size depending of previous width/height value and unity
			let iwidth = element.getAttribute("width").replace("px","");
			if (iwidth == "100%") {
				iwidth = 55;
			} else if ((""+iwidth).indexOf("pt")!=-1) {
				iwidth = Math.round(parseInt(iwidth.replace("pt",""),10)*96/72); // Convert pt to px
			}
			let iheight = element.getAttribute("height").replace("px","").replace("pt","");
			if (iheight == "100%") {
				iheight = 55;
			} else if ((""+iheight).indexOf("pt")!=-1) {
				iheight = Math.round(parseInt(iheight.replace("pt",""),10)*96/72); // Convert pt to px
			}

			// Set size
			element.setAttribute("width", size+"px");
			element.setAttribute("height", size+"px");
			element.setAttribute("preserveAspectRatio", "xMidYMid meet");
			if (!element.getAttribute("viewBox")) {
				element.setAttribute("viewBox", "0 0 "+iwidth+" "+iheight);
			}
		}
	}, 0);
}
