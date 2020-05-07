// Toolbar item
var ToolbarItem = {
	template: `
		<div class="splitbar" v-if="isSplitbar"/>
		<button v-bind="$attrs" v-on="$listeners" :disabled="disabled" v-bind:class="computeClass()" v-else/>
	`,
	props: {
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
			<toolbar-item id="activity-button" v-bind:title="l10n.stringFractionBounceActivity"></toolbar-item>
			<toolbar-item isSplitbar></toolbar-item>
			
			<toolbar-item ref="playBtn" class="toolbutton" id="play-button"
				v-bind:title="l10n.stringPlay"
				v-on:click="getApp().changeGameState()"
				v-if="paused">
			</toolbar-item>
			
			<toolbar-item ref="pauseBtn" class="toolbutton" id="pause-button"
				v-bind:title="l10n.stringPause"
				v-on:click="getApp().changeGameState()"
				v-else>
			</toolbar-item>
			
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
			
			<toolbar-item isSplitbar></toolbar-item>
			
			<toolbar-item 
				ref="fractionsBtn" 
				id="fractions-button" 
				v-on:click="getApp().changeMode('fractions')" 
				v-bind:active="mode == 'fractions'"
				v-bind:title="l10n.stringFractions">
			</toolbar-item>
			<toolbar-item 
				ref="sectorsBtn" 
				id="sectors-button" 
				v-on:click="getApp().changeMode('sectors')" 
				v-bind:active="mode == 'sectors'"
				v-bind:title="l10n.stringSectors">
			</toolbar-item>
			<toolbar-item 
				ref="percentsBtn" 
				id="percents-button" 
				v-on:click="getApp().changeMode('percents')" 
				v-bind:active="mode == 'percents'"
				v-bind:title="l10n.stringPercents">
			</toolbar-item>
			
			<slot></slot>

			<span class="helpText">{{ helpText }}</span>

			<toolbar-item v-on:click="getApp().onStop()" id="stop-button" title="Stop" toRight="true"></toolbar-item>
			<toolbar-item ref="fullscreen" v-on:click="getApp().fullscreen()" id="fullscreen-button" v-bind:title="l10n.stringFullscreen" toRight="true"></toolbar-item>
			<toolbar-item v-on:click="getApp().onHelp()" id="help-button" v-bind:title="l10n.stringHelp" toRight="true"></toolbar-item>
		</div>
	`,
	props: ['parts', 'answer', 'mode', 'paused', 'bounceCount'],
	data: function () {
		return {
			l10n: {
				stringFractionBounceActivity: '',
				stringTemplate: '',
				stringRestart: '',
				stringHelp: '',
				stringPlay: '',
				stringPause: '',
				stringSettings: '',
				stringBall: '',
				stringBg: '',
				stringFullscreen: '',
				stringFractions: '',
				stringSectors: '',
				stringPercents: '',
				stringHelpClickToStart: '',
				stringHelpBounceToPosition: '',
				stringHelpOfTheWay: '',
				stringHelpGameOver: '',
			}
		}
	},
	computed: {
		helpText: function() {
			if(this.answer == -1) {
				return this.l10n.stringHelpClickToStart;
			} else if(this.paused && this.bounceCount == 0) {
				return this.l10n.stringHelpGameOver;
			} else if(this.mode == 'percents') {
				return this.l10n.stringHelpBounceToPosition + ' ' + Math.floor(this.answer/this.parts*100) + '%' + ' ' + this.l10n.stringHelpOfTheWay;
			} else {
				return this.l10n.stringHelpBounceToPosition + ' ' + this.answer + "/" + this.parts + ' ' + this.l10n.stringHelpOfTheWay;
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
});
