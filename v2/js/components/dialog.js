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
		<div v-if="showDialog" class="modal-overlay" @click="cancelClicked">
			<div class="modal" @click.stop>
				<div class="dialog-content">
					<div class="toolbar">
						<div v-if="iconData" class="module-icon">
							<icon id="37" :svgfile="this.iconData" color="256" x="4" y="4" size="40"
						></icon></div>
						<div v-if="titleData" class="module-text">{{titleData}}</div>
						<search-field class="settings-filter-text"
							v-if="searchField=='true'"
							placeholder="Search in settings"
							v-on:input-changed="searchSettings($event)"
						></search-field>
						<div v-if="cancelButton=='true'" class="toolbutton module-cancel-button" @click="cancelClicked"></div>
						<div v-if="okButton=='true'" class="toolbutton module-ok-button" @click="okClicked"></div>
					</div>
					<slot></slot>
				</div>	
			</div>
		</div>
	`,
	props: ['searchField', 'okButton', 'cancelButton', 'iconData', 'titleData'],
	components: {
		'icon': Icon, 
		'search-field': SearchField,
	},
	data() {
		return {
			showDialog: false,
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
		}
	}
};

if (typeof module !== 'undefined') module.exports = { Dialog }