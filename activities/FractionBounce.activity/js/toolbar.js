// Toolbar item
var ToolbarItem = {
	template: `
		<div class="splitbar" v-if="isSplitbar"/>
		<button v-on:click="onClick()" v-bind:id="id" v-bind:title="title" :disabled="disabled" v-bind:class="computeClass()" v-else/>
	`,
	props: {
		'id': String, 
		'title': String, 
		'isSplitbar': Boolean, 
		'toRight': Boolean, 
		'paletteClass': String, 
		'paletteFile': String, 
		'paletteEvent': String, 
		'disabled': Boolean, 
		'active': Boolean
	},
	data: function () {
		return {
			paletteObject: null
		}
	},
	methods: {
		onClick: function () {
			this.$emit('clicked');
		},

		computeClass: function () {
			return (this.toRight ? 'toolbutton pull-right' : 'toolbutton') + (this.active ? ' active' : '');
		}
	},

	mounted: function () {
		// Create palette if present
		var vm = this;
		if (vm.id && vm.paletteClass && vm.paletteFile) {
			requirejs([vm.paletteFile], function (palette) {
				vm.paletteObject = new palette[vm.paletteClass](document.getElementById(vm.id));
				if (vm.paletteEvent) {
					vm.paletteObject.addEventListener(vm.paletteEvent, function (event) {
						vm.$emit(vm.paletteEvent, event);
					});
				}
			});
		}
	}
}

// Toolbar component
var Toolbar = {
	components: { 'toolbar-item': ToolbarItem },
	template: `
		<div id="main-toolbar" class="toolbar">
			<toolbar-item id="activity-button" v-bind:title="l10n.stringChessActivity"></toolbar-item>
			<toolbar-item isSplitbar="true"></toolbar-item>
			
			<toolbar-item ref="settingsBtn" class="toolbutton" id="settings-button"
				v-bind:title="l10n.stringSettings"
				paletteFile="activity/palettes/settingspalette"
				paletteClass="SettingsPalette"
				paletteEvent="fractionAdded"
				v-on:fractionAdded="getApp().onFractionAdded($event)">
			</toolbar-item>
			<toolbar-item ref="ballBtn" class="toolbutton" id="ball-button"
				v-bind:title="l10n.stringBall"
				paletteFile="activity/palettes/ballpalette"
				paletteClass="BallPalette"
				paletteEvent="ballSelected"
				v-on:ballSelected="getApp().onBallSelected($event)">
			</toolbar-item>
			<toolbar-item ref="bgBtn" class="toolbutton" id="bg-button"
				v-bind:title="l10n.stringBg"
				paletteFile="activity/palettes/bgpalette"
				paletteClass="BgPalette"
				paletteEvent="bgSelected"
				v-on:bgSelected="getApp().onBgSelected($event)">
			</toolbar-item>
			
			<toolbar-item isSplitbar="true"></toolbar-item>
			
			<toolbar-item 
				ref="fractionsBtn" 
				id="fractions-button" 
				v-on:clicked="getApp().changeMode('fractions')" 
				v-bind:active="mode == 'fractions'"
				v-bind:title="l10n.stringFractions">
			</toolbar-item>
			<toolbar-item 
				ref="sectorsBtn" 
				id="sectors-button" 
				v-on:clicked="getApp().changeMode('sectors')" 
				v-bind:active="mode == 'sectors'"
				v-bind:title="l10n.stringSectors">
			</toolbar-item>
			<toolbar-item 
				ref="percentsBtn" 
				id="percents-button" 
				v-on:clicked="getApp().changeMode('percents')" 
				v-bind:active="mode == 'percents'"
				v-bind:title="l10n.stringPercents">
			</toolbar-item>
			
			<span class="helpText">{{ helpText }}</span>

			<toolbar-item v-on:clicked="getApp().onStop()" id="stop-button" title="Stop" toRight="true"></toolbar-item>
			<toolbar-item ref="fullscreen" v-on:clicked="getApp().fullscreen()" id="fullscreen-button" v-bind:title="l10n.stringFullscreen" toRight="true"></toolbar-item>
		</div>
	`,
	props: ['parts', 'answer', 'mode'],
	data: function () {
		return {
			l10n: {
				stringChessActivity: '',
				stringTemplate: '',
				stringRestart: '',
				stringHelp: '',
				stringSettings: '',
				stringBall: '',
				stringBg: '',
				stringFullscreen: '',
				stringNetwork: '',
				stringFractions: '',
				stringSectors: '',
				stringPercents: '',
			}
		}
	},
	computed: {
		helpText: function() {
			if(this.answer == -1) {
				return "Click on the ball to start. Use arrow keys to move the ball.";
			} else if(this.mode == 'percents') {
				return "Bounce the ball to a position " + Math.round((this.answer/this.parts*100 + Number.EPSILON) * 100) / 100 + '%' + " of the way from the left side of the bar.";
			} else {
				return "Bounce the ball to a position " + this.answer + "/" + this.parts + " of the way from the left side of the bar.";
			}
		}
	},
	methods: {
		localized: function (localization) {
			localization.localize(this.l10n);
		},

		getApp: function () {
			return app;
		}
	}
}
