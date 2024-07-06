
/**
 * @module Icon
 * @desc This is an icon component for both native and simple SVG icons
 * @vue-prop {Number} id - Id of the icon component div
 * @vue-prop {String} svgfile - Url of svg file
 * @vue-prop {Number} [color=512] - color index value
 * @vue-prop {Number} [size=55] - size value in `px`
 * @vue-prop {Number} [x=0] - left-right margin
 * @vue-prop {Number} [y=0] - top-bottom margin
 * @vue-prop {String} [isNative='false'] true for native svg icons
 * @vue-data {Number} idData - to change the id data
 * @vue-data {String} iconData - to change the svgfile url data
 * @vue-data {Number} [sizeData=55] - to change the size data
 * @vue-data {Number} [colorData=512] - to change the color data
 * @vue-data {Number} [xData=0] - to change the left-right margin data
 * @vue-data {Number} [yData=0] - to change the top-bottom margin data
 * @vue-data {Boolean} [disabledData=false] - to change the disability condition
 * @vue-data {Boolean} [disableHoverEffect=false] - to disable hover effect
*/
const Icon ={
	name: 'Icon',
	template: `<div :class="[
		this.disabledData ? 'web-activity-disable' : '',
		disableHoverEffect ? '' : 'icon',
		].join(' ')" ref="icon" v-html="gensvg" :id="this.idData"></div>`,
	props: {
		id: String,
		svgfile: String,
		color: Number,
		size: Number,
		x: Number,
		y: Number,
		isNative: String,
		disabled: Boolean,
		disableHoverEffect: Boolean
	},
	data() {
		return {
			_svg: null,
			idData: this.id,
			_isSugarNative : this.isNative=="true"? true: false,
			iconData: this.svgfile,
			sizeData: this.size? this.size: 55,
			colorData: this.color !== undefined ? this.color: (this.isNative=="true" ? undefined : 512),
			xData: this.x ? this.x: 0,
			yData: this.y ? this.y: 0,
			disabledData: this.disabled ? this.disabled: false,
			_originalColor: { fill: null, stroke: null},
			_element: null
		}
	},
	created() {
		var vm = this;
		if (vm._isSugarNative) {
			this.loadIconPromise = (async function () {
				await vm._loadIcon(vm.svgfile).then(function (svg) {
					vm._svg = svg;
				});
			})();
		}
	},
	mounted() {
		// to render the newformat icon
		var vm = this;
		if(!this._isSugarNative) {
			this.loadIconPromise = (async function () {
				await vm._createIcon(vm.svgfile, vm.colorData, vm.sizeData);
			})();
		}
	},
	computed: {
		gensvg: function() {
			if (this._svg == null) return "";
			return this._convertSVG(this._svg, this.idData);
		}
	},
	updated: function() {
		if(this._isSugarNative) {
			let vm=this, element = null;
			let icon= this.$refs.icon;
			if (!icon) {
				return null;
			}
			for (let i = 0 ; i < icon.children.length && !element ; i++) {
				if (icon.children[i].tagName == "svg") {
					element = icon.children[i];
				}
			}
			vm._element=element;
			vm._setColor(vm, vm.colorData);
			vm._setSize(vm, vm.sizeData);
		}
	},
	watch: {
		colorData: function(newColor, oldColor) {
			var element = this._element;
			if (!element) {
				return;
			}
			element.setAttribute("class", "xo-color"+newColor);
		}, 
		color: function(newColor, oldColor) {
			this.colorData=newColor;
		},
		xData: function(newX, oldX) {
			var iconDiv = this.$refs.icon;
			if (!iconDiv) {
				return;
			}
			iconDiv.setAttribute("style", "margin: "+this.yData+"px 0px 0px "+newX+"px"+this._generateOriginalColor());
		}, 
		x: function(newX, oldX) {
			this.xData=newX;
		},
		yData: function(newY, oldX) {
			var iconDiv = this.$refs.icon;
			if (!iconDiv) {
				return;
			}
			iconDiv.setAttribute("style", "margin: "+newY+"px 0px 0px "+this.xData+"px"+this._generateOriginalColor());
		},		
		y: function(newY, oldX) {
			this.yData=newY;
		},
		disabledData: function(newDisabled, oldDisabled) {
			this.disabledData = newDisabled;
		},
		sizeData: function(newSize, oldSize) {
			var element = this._element;
			if (!element) {
				return;
			}
			element.setAttribute("width", newSize+"px");
			element.setAttribute("height", newSize+"px");
		}
	},
	methods: {
		wait() {
			return this.loadIconPromise;
		},

		async _createIcon(svgfile, color, size) {
			if(!svgfile)
				return null;
			var parent =document.getElementById(this.id);
			if (!parent) {
				return null;
			}
			var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svgElement.setAttribute("class", "xo-color"+color);
			if (size) {
				svgElement.setAttribute("width", size+"px");
				svgElement.setAttribute("height", size+"px");
				parent.setAttribute("style", "margin: "+this.yData+"px 0px 0px "+this.xData+"px"+this._generateOriginalColor());
				parent.style.width = size+"px";
				parent.style.height = size+"px";
				svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
				await new Promise((resolve, reject) => {
					const img = new Image();
					img.onload = function() {
						if (this.width != size) {
							let intersectsize = this.width;
							svgElement.setAttribute("viewBox", "0 0 " + intersectsize + " " + intersectsize);
						} else {
							svgElement.setAttribute("viewBox", "0 0 55 55");
						}
						resolve();
					};
					img.onerror = reject;
					img.src = svgfile;
				});
			}

			var useElement = document.createElementNS(svgElement.namespaceURI,"use");
			useElement.addEventListener('error', function() {
				console.log(svgfile+' error');
			}) // Error loading SVG file

			var xref = svgfile+"#icon";
			useElement.setAttribute("xlink:href",xref);
			useElement.setAttribute("href",xref);
			// Detection of error no symbol #icon is not possible due to closed ShadowDOM
			svgElement.appendChild(useElement);
			parent.appendChild(svgElement);

			this._element = svgElement;
		},
		// Load icon url and return raw data of file
		async _loadIcon(url) {
			return new Promise(function(resolve, reject) {
			   axios.get(url).then(function(response) {
					resolve(response.data);
				}).catch(function(error) {
					reject(error);
				});
			});
		},
		_convertSVG(svg, id) {
			// Get original color
			let fill = svg.match(/<!ENTITY\s+fill_color\s+"(.*)">/);
			let stroke = svg.match(/<!ENTITY\s+stroke_color\s+"(.*)">/);
			this._originalColor = { fill: fill && fill.length ? fill[1] : null, stroke: stroke && stroke.length ? stroke[1] : null };

			// Remove ENTITY HEADER
			let read = svg;
			var buf= read;
			buf = read.replace(/<!DOCTYPE[\s\S.]*\]>/g,"");

			// Replace &fill_color; and &stroke_color;
			buf = buf.replace(/&stroke_color;/g,"var(--stroke-color)");
			buf = buf.replace(/&fill_color;/g,"var(--fill-color)");

			// Add symbol and /symbol
			buf = buf.replace(/(<svg[^>]*>)/g,'$1<symbol id="icon'+id+'">');
			buf = buf.replace(/(<\/svg>)/g,'</symbol><use xlink:href="#icon'+id+'" href="#icon'+id+'"/>$1');
			return buf;
		},

		_setColor(vm, color) {
			let element = vm._element;
			if (element) {
				if (color > 179 && color != 256 && color != 512 &&  color != 768 && color != 1024) {
					color = color % 180;
				}
				if (this.color !== undefined) {
					element.setAttribute("class", "xo-color"+color);
				}
			}
		},
		_generateOriginalColor() {
			return this.color === undefined && this._originalColor.fill && this._originalColor.stroke ? ";--stroke-color:"+this._originalColor.stroke+";--fill-color:"+this._originalColor.fill+";" : "";
		},
		_setSize(vm, size) {
			let element = vm._element;
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
				// Set Position
				const iconDiv = this.$refs.icon;
				iconDiv.setAttribute("style", "margin: "+vm.yData+"px 0px 0px "+vm.xData+"px"+this._generateOriginalColor());

				// Set size
				element.setAttribute("width", size+"px");
				element.setAttribute("height", size+"px");
				element.setAttribute("preserveAspectRatio", "xMidYMid meet");
				if (!element.getAttribute("viewBox")) {
					element.setAttribute("viewBox", "0 0 "+iwidth+" "+iheight);
				}
			}
		},
		/** 
		 * @memberOf module:Icon.methods
		 * @method isCursorInside
		 * @desc check if cursor is inside the icon component or not
		 * @param {Number} x - x position of cursor
		 * @param {Number} y - y position of cursor
		 * @returns {Boolean}
		 */
		isCursorInside(x, y) {
			var ele= this.$refs.icon;
			let sizeData = parseInt(this.sizeData);
			if(ele) {
				var popupXmin= this.xData;
				var popupXmax= popupXmin + sizeData;
				var popupYmin= this.yData + (ele.getBoundingClientRect().y-this.yData);
				var popupYmax= popupYmin + sizeData;
				if((x>= popupXmin && x<=popupXmax && y>=popupYmin && y<=popupYmax))
					return true;
				else
					return false;
			} else 
				return false;
		},
	}
};

if (typeof module !== 'undefined') module.exports = { Icon }
