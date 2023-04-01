/**
 * @module FilterBox
 * @desc This is an filter selelector component which contains different options of filter to select
 * @vue-prop {Object.<Object>} options - stores options array and a default filter option for filter-bar
 * @vue-data {String} [currentFilterBoxRef=null] - global variable which stores active ref value of filterBox instance
 * @vue-data {Object.<Object>} [optionsData=null] - to change the filter options data
 * @vue-event {Object} filterSelected - Emit selected item object with its icon and text when clicked
 */

var currentFilterBoxRef= null;
const FilterBox ={
	name: 'FilterBox',
	template: ` <div 
					ref="filterBox"
					v-if="optionsData && (optionsData.icon || optionsData.name)"
					v-bind:class="showSubpopup? 'filterBox-sugarizer filterBox-up': 'filterBox-sugarizer filterBox-down'"
				>
					<div class="filterBox" v-on:click="showFilterBox()">
						<icon class="filterBox-icon"
							v-if="selectedData.icon"
							:key="this.iconKey"
							:id="'optionsData.id'+selectedData.icon.id"
							:svgfile=selectedData.icon.iconData
							:color=selectedData.icon.color
							:size=selectedData.icon.size
							:x=selectedData.icon.iconx
							:y=selectedData.icon.icony
						></icon>
						<div v-if="selectedData.name" class="filterBox-text">{{ selectedData.name }}</div>
					</div>
					<div ref="filterBoxPopup">
						<div v-if="showSubpopup" class="filterBox-content">
							<div v-if="optionsData.header" class="filterBox-header">{{ optionsData.header }}</div>
							<div class="filterBox-hr"></div>
							<div class="filterBox-items">
								<div class="filterBox-items-item" 
									v-for="item in optionsData.filterBoxList" key="item.index"
									v-on:click=optionisSelected(item)
								>
									<icon class="filterBox-icon"
										v-if="item.icon"
										:key="iconKey"
										:id=item.icon.id
										:svgfile=item.icon.iconData
										:color=item.icon.color
										:size=item.icon.size
										:x=item.icon.iconx
										:y=item.icon.icony
									></icon>
									<div class="filterBox-text">{{ item.name }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>`,
	components: {
		'icon': Icon,
	},
	props: ['options'],
	data() {
		return {
			optionsData: this.options? this.options: null,
			selectedData: {
				icon: this.options? this.options.icon: null,
				name: this.options? this.options.name: null,
			},
			showSubpopup: false,
			iconKey: 0
		}
	},
	methods: {
		removeFilterBox() {
			this.showSubpopup= false;
			currentFilterBoxRef= null;
		},
		showFilterBox() {
			// retrieve current instance name attribute
			const currRef= this.$refs.filterBox.getAttribute('name');
			// if currentFilterBoxRef is not null and active ref name is current ref then 
			// hide subPopup, it will works as toggling subPopup
			if(currentFilterBoxRef && currentFilterBoxRef ==currRef) {
				this.removeFilterBox();
				return;
			}
			// if currentFilterBoxRef is not null and active ref name is not current ref then 
			// hide the active ref's subPopup so that we can open current one
			if(currentFilterBoxRef && currentFilterBoxRef!=currRef) {
				this.$root.$refs[currentFilterBoxRef].removeFilterBox();
				currentFilterBoxRef= null;
			}
			// if there is no active subPopup and current subPopup is also false or if it's have options to show
			if(!currentFilterBoxRef && !this.showSubpopup && this.optionsData.filterBoxList && this.optionsData.filterBoxList.length >0) {
				this.showSubpopup= true;
				this.iconKey= !this.iconKey;
				currentFilterBoxRef= currRef;
			}
		},
		optionisSelected(item) {
			var data= JSON.parse(JSON.stringify(item))
			if(data.icon) {
				this.selectedData.icon= data.icon;
				this.iconKey= !this.iconKey;
			}
			this.selectedData.name= data.name;
			this.removeFilterBox();
			this.$emit('filterSelected', data);
		},
	}
};

if (typeof module !== 'undefined') module.exports = { FilterBox }