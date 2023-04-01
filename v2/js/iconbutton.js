/**
 * @module IconButton
 * @desc This is an button component to display button with label and icon
 * @vue-prop {String} [text='empty String'] - text label of button
 * @vue-prop {Number} id - Id of the icon component of button
 * @vue-prop {String} svgfile - Url of svg file of icon in button
 * @vue-prop {Number} [color=512] - color index value of icon in button
 * @vue-prop {Number} [size=55] - size in `px` of icon in button
 * @vue-prop {Number} [x=0] - left-right margin of icon in button
 * @vue-prop {Number} [y=0] - top-bottom margin of icon in button
 * @vue-prop {Boolean} [disabled=false] - true for disabling the button
 * @vue-data {Number} iconData - to change the icon file url data
 * @vue-data {String} [textData='empty String'] - to change the label data
 * @vue-data {Boolean} [disabledData=false] - to change the diability condition
 * @vue-event {Object} buttonClick - Emit buttonClick event to perform required action
 */
const IconButton ={
	name: 'IconButton',
	template: `<div :class="this.disabledData? 'web-activity-disable icon-button': 'icon-button'"
				v-on:click="this.buttonClicked">
				<button-icon v-if="this.iconData"
					class="icon-button-icon"
					:key="componentKey"
					:id=this.id
					:svgfile=this.iconData
					:color=this.color
					:size=this.size
					:x=this.x
					:y=this.y
				></button-icon>
				<p class="icon-button-text">{{ this.textData }}</p>
			</div>`,
	props: {
		text: String,
		id: String,
		svgfile: String,
		color: String,
		size: String,
		x: String,
		y: String,
		disabled: Boolean,
	},
	components: {
		'button-icon': Icon, 
	},
	data() {
		return {
			iconData: this.svgfile,
			textData: this.text? this.text: '',
			disabledData: this.disabled? this.disabled: false,
			componentKey: 0,
		}
	},
	watch: {
		textData: function(newText, oldText) {
			this.textData = newText
		},
		disabledData: function(newVal, oldVal) {
			this.disabledData = newVal
		},
		iconData: function(newIcon, oldIcon) {
			this.iconData= newIcon
			this.componentKey=! this.componentKey;
		}
	},
	methods: {
		buttonClicked() {
			this.$emit('buttonClick')
		}
	}
};

if (typeof module !== 'undefined') module.exports = { IconButton }