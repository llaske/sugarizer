/**
 * @module Prompt
 * @desc This is a component that displays an icon, a heading with a sub-paragraph, and two customizable icon-buttons.
 *
 * @vue-prop {String} id - The unique ID for the prompt component.
 * @vue-prop {Object} iconProps - Object containing properties for the icon.
 * @vue-prop {String} iconProps.svgfile - Path to the SVG file for the icon.
 * @vue-prop {String} iconProps.color - Color of the icon. Default is 512.
 * @vue-prop {Number} iconProps.size - Size of the icon.
 * @vue-prop {String} heading - The main heading text to be displayed.
 * @vue-prop {String} subText - The sub-paragraph text to be displayed below the heading.
 *
 * @vue-prop {Object} button1Props - Object containing properties for the first button.
 * @vue-prop {String} button1Props.text - Text to be displayed on the first button.
 * @vue-prop {String} button1Props.svgfile - Path to the SVG file for the first button.
 * @vue-prop {String} button1Props.color - Color of the first button. Default is 1024.
 * @vue-prop {String} button1Props.title - Title of the first button.
 * @vue-prop {Function} button1Props.action - Action to be performed when the first button is clicked.
 *
 * @vue-prop {Object} button2Props - Object containing properties for the second button.
 * @vue-prop {String} button2Props.text - Text to be displayed on the second button.
 * @vue-prop {String} button2Props.svgfile - Path to the SVG file for the second button.
 * @vue-prop {String} button2Props.color - Color of the second button. Default is 1024.
 * @vue-prop {String} button2Props.title - Title of the second button.
 * @vue-prop {Function} button2Props.action - Action to be performed when the second button is clicked.
 *
 * @vue-data {Boolean} isShown - Indicates whether the prompt component is currently visible.
 *
 * @vue-slot default - Slot for inserting additional content inside the prompt component.
 */

const Prompt = {
	name: "Prompt",
	template: `
		<transition name="bounce-prompt">
			<div ref="promptContainer" class="prompt-container" v-if="isShown" :id="id" @blur="hide" tabindex="0">
				<div class="prompt-header">
					<icon
						id="prompt-icon"
						:svgfile="iconProps.svgfile"
						:color="iconProps.color"
						:size="iconProps.size || 40"
						isNative="true"
						:disableHoverEffect="true"
					></icon>
					<p class="prompt-heading">{{ heading }}</p>
					<icon
						id="prompt-cancel"
						svgfile="./icons/dialog-cancel.svg"
						:size="40"
						isNative="true"
						@click="hide"
					></icon>
				</div>
				<div class="prompt-content">
					<p class="prompt-para">{{ subText }}</p>
					<slot></slot>
					<div class="prompt-btn-container">
						<icon-button
							ref="button1"
							:text="button1Props.text"
							:id="id + '-btn1'"
							:svgfile="button1Props.svgfile"
							:size="28"
							:color="button1Props.color || 1024"
							:title="button1Props.title"
							@button-click="button1Props.action"
						></icon-button>
						<icon-button
							ref="button2"
							:text="button2Props.text"
							:id="id + '-btn2'"
							:svgfile="button2Props.svgfile"
							:size="28"
							:color="button2Props.color || 1024"
							:title="button2Props.title"
							@button-click="button2Props.action"
						></icon-button>
					</div>
				</div>
			</div>
		</transition>
	`,

	components: {
		icon: Icon,
		"icon-button": IconButton,
	},

	props: {
		id: String,
		iconProps: Object,
		heading: String,
		subText: String,
		button1Props: Object,
		button2Props: Object,
	},

	data() {
		return {
			isShown: false,
		};
	},

	methods: {
		/** 
		 * @memberOf module:Prompt.methods
		 * @method show
		 * @desc Method to show the prompt component.
		 */
		show() {
			this.$nextTick(() => {
				this.$refs.promptContainer.focus();
			});
			this.isShown = true;
		},
		/** 
		 * @memberOf module:Prompt.methods
		 * @method hide
		 * @desc Method to hide the prompt component.
		 */
		hide() {
			this.isShown = false;
		},
	},
};

if (typeof module !== "undefined") module.exports = { Prompt };
