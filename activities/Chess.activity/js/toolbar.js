// Toolbar item
var ToolbarItem = {
	template: `
		<div class="splitbar" v-if="isSplitbar"/>
		<button v-on:click="onClick()" v-bind:id="id" v-bind:title="title" :disabled="isDisabled" v-bind:class="computeClass()" v-else/>
	`,
	props: ['id', 'title', 'isSplitbar', 'toRight', 'paletteClass', 'paletteFile', 'paletteEvent', 'disabled', 'active'],
	data: function () {
		return {
			isDisabled: (this.disabled !== undefined),
			isActive: (this.active !== undefined),
			paletteObject: null
		}
	},
	methods: {
		onClick: function () {
			this.$emit('clicked');
		},

		computeClass: function () {
			return (this.toRight ? 'toolbutton pull-right' : 'toolbutton') + (this.isActive ? ' active' : '');
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
			
			<toolbar-item ref="restartBtn" id="restart-button" v-on:clicked="getApp().restartGame()" v-bind:title="l10n.stringRestart"></toolbar-item>
			<toolbar-item ref="undoBtn" id="undo-button" v-on:clicked="getApp().undo()" v-bind:title="l10n.stringUndo"></toolbar-item>
			<toolbar-item ref="difficultyBtn" class="toolbutton" id="difficulty-button"
				v-bind:title="l10n.stringDifficulty"
				paletteFile="activity/palettes/difficultypalette"
				paletteClass="DifficultyPalette"
				paletteEvent="difficultySelected"
				v-on:difficultySelected="getApp().onDifficultySelected($event)">
			</toolbar-item>
			<toolbar-item isSplitbar="true"></toolbar-item>
			<toolbar-item ref="networkBtn" id="network-button" v-bind:title="l10n.stringNetwork"></toolbar-item>

			<toolbar-item v-on:clicked="getApp().onStop()" id="stop-button" title="Stop" toRight="true"></toolbar-item>
			<toolbar-item ref="fullscreen" v-on:clicked="getApp().fullscreen()" id="fullscreen-button" v-bind:title="l10n.stringFullscreen" toRight="true"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().onHelp()" id="help-button" v-bind:title="l10n.stringHelp" toRight="true"></toolbar-item>
		</div>
	`,
	data: function () {
		return {
			l10n: {
				stringChessActivity: '',
				stringTemplate: '',
				stringRestart: '',
				stringLines: '',
				stringZoom: '',
				stringInsertImage: '',
				stringHelp: '',
				stringUndo: '',
				stringFullscreen: '',
				stringNetwork: '',
				stringDifficulty: ''
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
