/* @ About me 
 @desc This is the subcomponent of the settings component */

const AboutMe = {
	name: 'AboutMe',
	template: ` 
				<dialog-box 
						ref="about_me"
						iconData="./icons/owner-icon.svg"
						:iconColorData="buddycolor"
						:titleData="$t('AboutMe')"
						ok-button="true"
						cancel-button="true"
						v-on:on-ok="okClicked"
						v-on:on-cancel="close('about_me')"
					>
						<div class="settings-subscreen aboutme-box">
							<div class="firstscreen_text">{{$t('ClickToColor')}}</div>
							<div class="aboutme-iconbox">
								<icon id="psicon" ref="psicon" svgfile="./icons/owner-icon.svg" :size="constant.sizeOwner" @click="setcolor('psicon')" />
								<icon id="nsicon" ref="nsicon" svgfile="./icons/owner-icon.svg" :size="constant.sizeOwner" @click="setcolor('nsicon')" />
								<div class="aboutme-cicon"><icon id="cicon" ref="cicon" svgfile="./icons/owner-icon.svg" :size="constant.sizeOwner" @click="setcolor('cicon')" /></div>
								<icon id="pficon" ref="pficon" svgfile="./icons/owner-icon.svg" :size="constant.sizeOwner" @click="setcolor('pficon')" />
								<icon id="nficon" ref="nficon" svgfile="./icons/owner-icon.svg" :size="constant.sizeOwner" @click="setcolor('nficon')" />
							</div>
							<input ref="nameInput" name="name" class="input_field aboutme-input"  v-model="name" />
							<div class="aboutme-warning" v-show="warning.show">
								<icon 
									id="warning-icon"
									svgfile="./icons/emblem-warning.svg"
									:size="constant.sizeWarning"
									:color="256"
									:x="0"
									:y="0"
									isNative="true"
								></icon>
								<span id="warning_text">{{ warning.text }}</span>
							</div>
						</div>
				</dialog-box> 
	`,
	components: {
		'dialog-box': Dialog,
		'icon': Icon,
	},

	props: ['buddycolor', 'username'],

	data() {
		return {
			currentcolor: this.buddycolor,
			warning: {
				show: false,
				text: ''
			},
			name: this.username,
			constant: {
				sizeOwner: 100,
				sizeWarning: 18,
			}
		}
	},

	mounted() {
		window.setTimeout(() => {
			this.colorize();
		}, 0);
	},

	methods: {

		close(ref) {
			this.$refs[ref].showDialog = false;
			this.$refs[ref].$emit('close', null);

		},

		openModal(ref) {
			this.$refs[ref].showDialog = true;
		},

		colorize() {
			const icons = ['psicon', 'pficon', 'cicon', 'nficon', 'nsicon'];
			const colorFunctions = [
				this.getPreviousStrokeColor,
				this.getPreviousFillColor,
				color => color,
				this.getNextFillColor,
				this.getNextStrokeColor
			];
			icons.forEach(async (icon, index) => {
				await this.$refs[icon].wait();
				this.$refs[icon].colorData = colorFunctions[index](this.currentcolor);
			});
		},

		getNextStrokeColor(color) {
			let current = color;

			if (current == -1) {
				return color;
			}
			let next = this.nextIndex(current);
			while (sugarizer.modules.xocolor.colors[next].stroke != sugarizer.modules.xocolor.colors[current].stroke) {
				next = this.nextIndex(next);
			}
			return next;
		},

		getPreviousStrokeColor(color) {
			let current = color;

			if (current == -1) {
				return color;
			}
			let previous = this.previousIndex(current);
			while (sugarizer.modules.xocolor.colors[previous].stroke != sugarizer.modules.xocolor.colors[current].stroke) {
				previous = this.previousIndex(previous);
			}
			return previous;
		},

		getNextFillColor(color) {
			let current = color;

			if (current == -1) {
				return color;
			}
			let next = this.nextIndex(current);
			while (sugarizer.modules.xocolor.colors[next].fill != sugarizer.modules.xocolor.colors[current].fill) {
				next = this.nextIndex(next);
			}
			return next;
		},

		getPreviousFillColor(color) {
			let current = color;
			if (current == -1) {
				return color;
			}
			let previous = this.previousIndex(current);
			while (sugarizer.modules.xocolor.colors[previous].fill != sugarizer.modules.xocolor.colors[current].fill) {
				previous = this.previousIndex(previous);
			}
			return previous;
		},

		nextIndex(index) {
			let next = index + 1;
			if (next == sugarizer.modules.xocolor.colors.length) {
				next = 0;
			}
			return next;
		},

		previousIndex(index) {
			let previous = index - 1;
			if (previous < 0) {
				previous = sugarizer.modules.xocolor.colors.length - 1;
			}
			return previous;
		},

		setcolor(icon) {
			const newcolor = this.$refs[icon].colorData;
			if (newcolor == this.currentcolor) {
				return;
			}
			this.currentcolor = newcolor;
			this.colorize();
		},

		nameChanged() {
			if (this.$refs.nameInput.value == this.username) {
				return false;
			}
			return true;
		},

		async updateUser(name, colorIndex) {
			const colorvalue = sugarizer.modules.xocolor.get(colorIndex);
			sugarizer.modules.user
				.update(
					{ name: name, color: colorvalue }, //for server only store necesssary fields
					{ name: name, colorvalue: colorvalue, color: colorIndex },
				)
				.then(() => {
					sugarizer.reload();
				});
		},

		async okClicked() {
			this.name = this.$refs.nameInput.value;
			const nameChanged = this.nameChanged();
			if (!nameChanged && this.currentcolor == this.buddycolor) {
				this.close('about_me');
				return;
			}
			if (nameChanged && await sugarizer.modules.user.checkIfExists(null, this.name)) {
				this.warning.show = true;
				this.warning.text = this.$t('UserAlreadyExist');
				return;
			}
			await this.updateUser(this.name, this.currentcolor);
			sugarizer.modules.stats.trace('my_settings_about_me', 'change', 'name_color', null);
		},
	},

};

if (typeof module !== 'undefined') module.exports = { AboutMe }
