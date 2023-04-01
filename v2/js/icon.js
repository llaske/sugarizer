
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
*/
const Icon ={
	name: 'Icon',
	template: `<div class="icon" ref="icon" v-html="gensvg" :id="this.idData"></div>`,
	props: ['id','svgfile','color','size','x','y','isNative'],
	data() {
		return {
			_svg: null,
			idData: this.id,
			_isSugarNative : this.isNative=="true"? true: false,
			iconData: this.svgfile,
			sizeData: this.size? this.size: 55,
			colorData: this.color? this.color: 512,
			xData: this.x ? this.x: 0,
			yData: this.y ? this.y: 0,
			_element: null
		}
	},
	async created() {
		var vm = this;
		if(this._isSugarNative) {
			await this._loadIcon(this.svgfile).then(function(svg) {
				vm._svg=svg;
			});
		}
	},
	mounted() {
		// to render the newformat icon
		if(!this._isSugarNative) {
			this._createIcon(this.svgfile, this.colorData, this.sizeData);
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
			element.setAttribute("class", "xo-color"+newColor);
		}, 
		xData: function(newX, oldX) {
			var element = this._element;
			element.setAttribute("style", "margin: "+newX+"px "+this.yData+"px");
		}, 
		yData: function(newY, oldX) {
			var element = this._element;
			element.setAttribute("style", "margin: "+this.xData+"px "+newY+"px");
		},		
		sizeData: function(newSize, oldSize) {
			var element = this._element;
			element.setAttribute("width", newSize+"px");
			element.setAttribute("height", newSize+"px");
		}
	},
	methods: {
		_createIcon(svgfile, color, size, callback) {
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
				svgElement.setAttribute("style", "margin: "+this.xData+"px "+this.yData+"px");
				svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
				var img = new Image();
				img.onload = function() {
					if(this.width!=size) {
						let intersectsize=this.width;
						svgElement.setAttribute("viewBox", "0 0 "+intersectsize+" "+intersectsize);
					}
					else {
						svgElement.setAttribute("viewBox", "0 0 55 55");
					}
				}
				img.src = svgfile;
			}
			var useElement = document.createElementNS(svgElement.namespaceURI,"use");
			useElement.addEventListener('load', function() {
				if (callback) {
					callback(svgElement);
				}
			})
			useElement.addEventListener('error', function() {
				console.log(svgfile+' error');
				if (callback) {
					callback(null);
				}
			}) // Error loading SVG file
			var xref = svgfile+"#icon";
			useElement.setAttribute("xlink:href",xref);
			useElement.setAttribute("href",xref);
			this._element = svgElement;
			// Detection of error no symbol #icon is not possible due to closed ShadowDOM
			svgElement.appendChild(useElement);
			parent.appendChild(svgElement);
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
				if (color > 179 && color != 256 && color != 512) {
					color = color % 180;
				}
				element.setAttribute("class", "xo-color"+color);
			}
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
				element.setAttribute("style", "margin: "+vm.xData+"px "+vm.yData+"px");
				// Set size
				element.setAttribute("width", size+"px");
				element.setAttribute("height", size+"px");
				element.setAttribute("preserveAspectRatio", "xMidYMid meet");
				if (!element.getAttribute("viewBox")) {
					element.setAttribute("viewBox", "0 0 "+iwidth+" "+iheight);
				}
			}
		},
	}
};

if (typeof module !== 'undefined') module.exports = { Icon }