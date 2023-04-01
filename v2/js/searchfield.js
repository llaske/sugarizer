/**
 * @module SearchField
 * @desc This is an searchBox component to take input
 * @vue-prop {String} [placeholder='empty String'] - placeholder value for search-box
 * @vue-data {String} [placeholderData='empty String'] - to change the placeholder data
 * @vue-event {String} inputChanged - Emit current inputString whenever its changes 
 */
const SearchField ={
	name: 'SearchField',
	template: `
		<div id="searchField" ref="searchField" class="search-field-border search-field-border-nofocus">
			<div class="search-field-iconsearch"></div>
			<input 
				class="search-field-input" id="text" ref="text"
				type="text" v-model="searchQuery" 
				:placeholder="this.placeholderData" 
				@focus="onFocus" @blur="onBlur"
			/>
			<div v-if="showCancel"
				class="search-field-iconcancel"
				v-on:click="cancelClicked"
			></div>
		</div>
	`,
	props: ['placeholder'],
	data() {
		return {
			placeholderData: this.placeholder? this.placeholder: '',
			showCancel: false,
			searchQuery: ''
		}
	},
	watch: {
		placeholderData: function(newData, oldData) {
			this.placeholderData= newData
		}, 
		searchQuery: function(value) {
			this.$emit('inputChanged',value)
			if(value.length>0)
				this.showCancel= true
			else
				this.showCancel= false
		}
	},
	methods: {
		onFocus() {
			var element = this.$refs.searchField;
			element.classList.remove("search-field-border-nofocus");
			element.classList.add("search-field-border-focus");
		},
		onBlur() {
			var element = this.$refs.searchField;
			element.classList.remove("search-field-border-focus");
			element.classList.add("search-field-border-nofocus");
		},
		cancelClicked() {
			this.searchQuery=''
		}
	}
};

if (typeof module !== 'undefined') module.exports = { SearchField }