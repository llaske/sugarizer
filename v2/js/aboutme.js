/* @ About me 
 @desc This is the subcomponent of the settings component */

const AboutMe = {
	name: 'AboutMe',
	template: ` 
				<dialog-box 
						ref="aboutMeModal"
						iconData="./icons/owner-icon.svg"
						:iconColorData="buddycolor"
						:titleData="SugarL10n ? SugarL10n.get('AboutMe') : ''"
						ok-button="true"
						cancel-button="true"
						v-on:on-ok="okClicked"
						v-on:on-cancel="close('aboutMeModal')"
					>
						<div class="settings-subscreen aboutme-box">
							<div class="firstscreen_text">{{SugarL10n ? SugarL10n.get('ClickToColor') : ''}}</div>
							<div class="aboutme-iconbox">
								<icon id="psicon" ref="psicon" svgfile="./icons/owner-icon.svg" :size="constant.sizeOwner" @click="setcolor('psicon')" />
								<icon id="nsicon" ref="nsicon" svgfile="./icons/owner-icon.svg" :size="constant.sizeOwner" @click="setcolor('nsicon')" />
								<div class="aboutme-cicon"><icon id="cicon" ref="cicon" svgfile="./icons/owner-icon.svg" :size="constant.sizeOwner" @click="setcolor('cicon')" /></div>
								<icon id="pficon" ref="pficon" svgfile="./icons/owner-icon.svg" :size="constant.sizeOwner" @click="setcolor('pficon')" />
								<icon id="nficon" ref="nficon" svgfile="./icons/owner-icon.svg" :size="constant.sizeOwner" @click="setcolor('nficon')" />
							</div>
							<input ref="nameInput" class="input_field aboutme-input"  v-model="name" />
							<div class="aboutme-warning" v-show="warning.show">
								<icon 
									id="warning-icon"
									svgfile="./icons/emblem-warning.svg"
									:size="constant.sizeWarning"
									color="256"
									x="0"
									y="0"
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

	props: ['buddycolor', 'username', 'SugarL10n'],

	data() {
		return {
			currentcolor: this.buddycolor,
			xoPalette: null,
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
		requirejs(['xocolor'], (xocolor) => {
			this.xoPalette = xocolor;
			this.colorize();
		});
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
			this.$refs.psicon.colorData = this.getPreviousStrokeColor(this.currentcolor);
			this.$refs.pficon.colorData = this.getPreviousFillColor(this.currentcolor);
			this.$refs.cicon.colorData = this.currentcolor;
			this.$refs.nficon.colorData = this.getNextFillColor(this.currentcolor);
			this.$refs.nsicon.colorData = this.getNextStrokeColor(this.currentcolor);
		},


		getNextStrokeColor(color) {
			let current = color;
			let xoPalette = this.xoPalette;

			if (current == -1) {
				return color;
			}
			let next = this.nextIndex(current);
			while (xoPalette.colors[next].stroke != xoPalette.colors[current].stroke) {
				next = this.nextIndex(next);
			}
			return next;
		},

		getPreviousStrokeColor(color) {
			let current = color;
			let xoPalette = this.xoPalette;

			if (current == -1) {
				return color;
			}
			let previous = this.previousIndex(current);
			while (xoPalette.colors[previous].stroke != xoPalette.colors[current].stroke) {
				previous = this.previousIndex(previous);
			}
			return previous;
		},

		getNextFillColor(color) {
			let current = color;
			let xoPalette = this.xoPalette;

			if (current == -1) {
				return color;
			}
			let next = this.nextIndex(current);
			while (xoPalette.colors[next].fill != xoPalette.colors[current].fill) {
				next = this.nextIndex(next);
			}
			return next;
		},

		getPreviousFillColor(color) {
			let current = color;
			let xoPalette = this.xoPalette;
			if (current == -1) {
				return color;
			}
			let previous = this.previousIndex(current);
			while (xoPalette.colors[previous].fill != xoPalette.colors[current].fill) {
				previous = this.previousIndex(previous);
			}
			return previous;
		},

		nextIndex(index) {
			let next = index + 1;
			let xoPalette = this.xoPalette;
			if (next == xoPalette.colors.length) {
				next = 0;
			}
			return next;
		},

		previousIndex(index) {
			let previous = index - 1;
			let xoPalette = this.xoPalette;
			if (previous < 0) {
				previous = xoPalette.colors.length - 1;
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

		checkifUserExists(name) {
			return new Promise((resolve, reject) => {
				const data = {
					name: name,
					role: "student",
					beforeSignup: "true"
				};

				axios.post("/auth/signup", JSON.stringify({ user: JSON.stringify(data) }), {
					headers: {
						'Content-Type': 'application/json; charset=UTF-8'
					}
				}).then((response) => {
					resolve(response.data.exists);
				}).catch((error) => {
					if (error.response && error.response.status === 401) {
						resolve(error.response.data.exists);
					} else {
						reject(error);
					}
				});
			});
		},

		async updateUser(name, colorIndex) {
			const token = await JSON.parse(localStorage.getItem("sugar_settings")).token;
			const color = this.xoPalette.colors[colorIndex];

			const response = await axios.put("/api/v1/users/" + token.x_key, ({
				"user": JSON.stringify({ name: name, color: color }),
			}), {
				headers: {
					'x-key': token.x_key,
					'x-access-token': token.access_token,
				},
			});
			if (response.status == 200) {
				window.location.reload();
			}
		},

		async okClicked() {
			this.name = this.$refs.nameInput.value;
			const nameChanged = this.nameChanged();
			if (!nameChanged && this.currentcolor == this.buddycolor) {
				this.close('aboutMeModal');
				return;
			}
			if (nameChanged && await this.checkifUserExists(this.name)) {
				this.warning.show = true;
				this.warning.text = this.SugarL10n ? this.SugarL10n.get('UserAlreadyExist') : 'User Already Exists';
				return;
			}
			await this.updateUser(this.name, this.currentcolor);
		},
	},

};

if (typeof module !== 'undefined') module.exports = { AboutMe }