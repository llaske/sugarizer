/**
 * @module Popup
 * @desc This is an popup component which contains title, name, icon with optional itemList and footerList
 * @vue-prop {Object.<Object>} item - stores a data object content with name, title, item and footerList of selected icon
 * @vue-data {Object.<Object>} [itemData=null] - to change the content of component
 * @vue-data {Boolean} [isShown=false] - to ensure if popup instance is currently visible in DOM
 * @vue-data {Number} [xData=null] - left position of popup component
 * @vue-data {Number} [yData=null] - top position of popup component
 * @vue-event {String} itemisClicked - Emit selected item when clicked in "'popup component id'_'selected item name'" format
 */
const Popup ={
	name: 'Popup',
	template: ` <div ref="homePopup" class="home-activity-popup" 
					v-if="itemData && isShown && itemData.icon && itemData.name"
				>
					<div class="popup-title" @click="itemClicked(itemData.id+'_'+itemData.name)">
						<icon 
							:key="iconKey"
							class="item-icon-title"
							:id=itemData.icon.id
							:svgfile=itemData.icon.iconData
							:color=itemData.icon.color
							:size=itemData.icon.size
							:x=itemData.icon.iconx
							:y=itemData.icon.icony
						>
						</icon>
						<div>
							<div class="popup-name-text">{{ itemData.name }}</div>
							<div class="popup-title-text">{{ itemData.title }}</div>
						</div>
					</div>
					<div id="items" class="popup-items" v-if="itemData.itemList">
						<div class="popup-item-listview">
							<div class="item-list">
								<div class="item-list-item" 
									v-for="ele in itemData.itemList" key="ele.index"
									@click="itemClicked(itemData.id+'_'+ele.name)"
								>
									<icon class="item-icon"
										:key="iconKey"
										:id=ele.icon.id
										:svgfile=ele.icon.iconData
										:color=ele.icon.color
										:size=ele.icon.size
										:x=ele.icon.iconx
										:y=ele.icon.icony
									></icon>
									<div class="item-name">{{ ele.name }}</div>
								</div>
							</div>
						</div>
					</div>
					<div id="footer" class="popup-items" v-if="itemData.footerList">
						<div class="popup-item-listview">
							<div class="item-list">
								<div class="item-list-item" 
									v-for="ele in itemData.footerList" key="ele.index"
									@click="itemClicked(itemData.id+'_'+ele.name)"
								>
									<icon class="item-icon"
										:key="iconKey"
										:id=ele.icon.id
										:svgfile=ele.icon.iconData
										:color=ele.icon.color
										:size=ele.icon.size
										:x=ele.icon.iconx
										:y=ele.icon.icony
									></icon>
									<div class="item-name">{{ ele.name }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>`,
	components: {
		'icon': Icon, 
	},
	props: ['item'],
	data() {
		return {
			itemData: this.item? this.item: null,
			xData: null,
			yData: null,
			isShown: false,
			iconKey: 0
		}
	},
	watch: {
		item: async function(newItem, oldItem){
			this.itemData= newItem;
			this.iconKey= !this.iconKey;
		}
	},
	updated: function() {
		var ele= this.$refs.homePopup;
		if(ele) {
			var deltaX= this.xData + ele.clientWidth - window.innerWidth;
			// check if popup component is out of screen window, then adjust it by extra width
			if (deltaX >= 1) {
				ele.setAttribute("style", "left: "+(this.xData - deltaX)+"px; top: "+this.yData+"px;");
			} else {
				ele.setAttribute("style", "left: "+this.xData+"px; top: "+this.yData+"px;");
			}
		}
	},
	methods: {
		itemClicked(event) {
			this.$emit('itemisClicked',event)
		},
		/** 
		 * @memberOf module:Popup.methods
		 * @method show
		 * @desc set the position of popup component based on x, y argument data and display it
		 * @param {Number} x - left position of cursor
		 * @param {Number} y - top position of cursor
		 */
		show(x, y) {
			if(this.isShown) return;
			this.xData= x;
			this.yData= y;
			this.isShown= true;
		},
		/** 
		 * @memberOf module:Popup.methods
		 * @method isCursorInside
		 * @desc check if cursor is inside the popup component or not
		 * @param {Number} x - x position of cursor
		 * @param {Number} y - y position of cursor
		 * @returns {Boolean}
		 */
		isCursorInside(x, y) {
			var ele= this.$refs.homePopup;
			if(ele) {
				var popupXmin= this.xData;
				var popupXmax= this.xData + ele.clientWidth;
				var popupYmin= this.yData+15;
				var popupYmax= this.yData + ele.clientHeight;
				if((x>= popupXmin && x<=popupXmax && y>=popupYmin && y<=popupYmax))
					return true;
				else
					return false;
			} else 
				return false;
		},
		/** 
		 * @memberOf module:Popup.methods
		 * @method hide
		 * @desc hide the popup component and set all data values back to null
		 */
		hide() {
			this.isShown= false;
			this.itemData= null;
			this.xData= null;
			this.yData= null;
		}
	}
};

if (typeof module !== 'undefined') module.exports = { Popup }