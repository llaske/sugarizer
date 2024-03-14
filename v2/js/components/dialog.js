/**
 * @module Dialog
 * @desc This is an modal component for different settings overlay pages
 * @vue-prop {Boolean} [searchField=null] - to show search-bar in the toolbar
 * @vue-prop {Boolean} [okButton=null] - to show ok button in the toolbar
 * @vue-prop {Boolean} [cancelButton=null] - to show cancel button in the toolbar
 * @vue-prop {String} [iconData=null] - stores the url of svg file of icon in the toolbar
 * @vue-prop {String} [titleData=null] - stores the title text of feature page in the toolbar
 * @vue-data {Boolean} [showDialog=false] - condition to show or hide the dialog modal
 * @vue-event {} onCancel - emit cancel event to close the dialogBox
 * @vue-event {} onOk - emit ok event to save the changes and close the dialogBox
 * @vue-event {String} searchInput - emit inputString of the search-bar whenever its changes 
 */

 const Dialog ={
	name: 'Dialog',
	template: `
		<div v-if="showDialog" class="modal-overlay" ref="dialogbox" @click="cancelClicked">
			<div class="modal" @click.stop>
				<div class="dialog-content">
					<div class="toolbar">
						<div v-if="iconData" class="module-icon">
							<icon id="37" :svgfile="this.iconData" :isNative="this.isNative" :color="iconColorData ? iconColorData : 256" :x="4" :y="4" :size="constant.sizeToolbar"
						></icon></div>
						<div v-if="titleData" class="module-text">{{titleData}}</div>
						<search-field class="settings-filter-text"
							v-if="searchField=='true'"
							:placeholder="searchPlaceholder"
							v-on:input-changed="searchSettings($event)"
						></search-field>
						<div v-if="cancelButton=='true'" :class="'toolbutton settings-tool-button '+(okButton=='true'?'module-cancel-button':'module-cancel-button-only')" @click="cancelClicked"></div>
						<div v-if="okButton=='true'" class="toolbutton settings-tool-button module-ok-button" @click="okClicked"></div>
					</div>
					<slot></slot>
				</div>	
			</div>
		</div>
	`,
	props: ['searchField', 'searchPlaceholder','okButton', 'cancelButton', 'iconData', 'iconColorData', 'titleData', 'isNative'],
	components: {
		'icon': Icon, 
		'search-field': SearchField,
	},
	data() {
		return {
			showDialog: false,
			constant: {
				sizeToolbar: 40
			}
		}
	},
	watch: {
		showDialog: function(val) {
			if (val == true) {
				this.$nextTick(() => {
					this.centerDialog();
				});
			}
		}
	},
	methods: {
		cancelClicked() {
			this.$emit('onCancel');
		},
		okClicked() {
			this.$emit('onOk');
		},
		searchSettings(query) {
			this.$emit('searchInput',query)
		},
		computeMargin(size, maxpercent) {
			let canvas = document.getElementById("canvas");
			let canvas_height = canvas ? canvas.offsetHeight : 0;
			let canvas_width = canvas ? canvas.offsetWidth : 0;
			let size_width = (size.width <= canvas_width ? size.width : maxpercent.width*canvas_width);
			let size_height = (size.height <= canvas_height ? size.height : maxpercent.height*canvas_height);
			return { left: parseFloat(canvas_width-size_width)/2.0, top: parseFloat(canvas_height-size_height)/2.0, width: size_width, height: size_height };
		},
		centerDialog() {
			const margin = this.computeMargin({width: 800, height: 500}, {width: 0.95, height: 0.95});
			const dialogbox = this.$refs.dialogbox;
			dialogbox.style.marginLeft = margin.left+"px";
			dialogbox.style.marginTop = (margin.top-55)+"px";
			return margin;
		},
	}
};

if (typeof module !== 'undefined') module.exports = { Dialog }