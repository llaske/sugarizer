
// LED icon
Vue.component('activity-icon', {
	name: 'ActivityIcon',
	template: `
		<div v-html="gensvg" v-bind:id="genid" style="display:inline-block;visibility:hidden">
		</div>
	`,
	props: ['id','name','svg','color','size'],
	computed: {
		gensvg: function() {
			 return _convertSVG(this.svg, this.genid);
		},
		genid: function() {
			return this.id ? this.id : this._uid;
		}
	},
	mounted: function() {
		_setColor(this, this.color);
		if (this.size) {
			_setSize(this, this.size);
		}
		_setVisibility(this, true);
	},
	updated: function() {
		_setVisibility(this, false, true);
		_setColor(this, this.color);
		if (this.size) {
			_setSize(this, this.size);
		}
		_setVisibility(this, true);
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

// Convert SVG to a pure SVG (remove Sugar stuff)
function _convertSVG(svg, id) {
	// Remove ENTITY HEADER
	let read = svg;
	var buf = read.replace(/<!DOCTYPE[\s\S.]*\]>/g,"");

	// Replace &fill_color; and &stroke_color;
	buf = buf.replace(/&stroke_color;/g,"var(--stroke-color)");
	buf = buf.replace(/&fill_color;/g,"var(--fill-color)");

	// Add symbol and /symbol
	buf = buf.replace(/(<svg[^>]*>)/g,'$1<symbol id="icon'+id+'">');
	buf = buf.replace(/(<\/svg>)/g,'</symbol><use xlink:href="#icon'+id+'" href="#icon'+id+'"/>$1');
	return buf;
}

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
		let element = _getSVGElement(document.getElementById(vm.genid));
		if (element) {
			if (color > 179 && color != 256 && color != 512) {
				color = color % 180;
			}
			element.setAttribute("class", "xo-color"+color);
		}
	}, 0);
}

// Change CSS size
function _setSize(vm, size) {
	setTimeout(function() { // HACK: Timeout need to wait for SVG to be build
		let element = _getSVGElement(document.getElementById(vm.genid));
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

// Change visibility to avoid glitch during rendering
function _setVisibility(vm, isvisible, now) {
	if (now) {
		document.getElementById(vm.genid).style.visibility=isvisible?"visible":"hidden";
		return;
	}
	setTimeout(function() { // HACK: Timeout to wait for SVG to be updated
		document.getElementById(vm.genid).style.visibility=isvisible?"visible":"hidden";
	}, 0);
}
