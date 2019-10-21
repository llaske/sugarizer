

// Toolbar item
var ToolbarItem = {
	template: `
		<div class="splitbar" v-if="isSplitbar"/>
		<button v-on:click="onClick()" v-bind:id="id" v-bind:title="title" :disabled="isDisabled" v-bind:class="toRight ? 'toolbutton pull-right' : 'toolbutton'" v-else/>
	`,
	props: ['id', 'title', 'isSplitbar', 'toRight', 'paletteObject', 'paletteFile', 'paletteEvent','disabled'],
	data: function() {
		return {
			isDisabled: this.disabled
		}
	},
	methods: {
		onClick: function() {
			this.$emit('clicked');
		}
	},

	mounted: function() {
		// Create palette if present
		var vm = this;
		if (vm.id && vm.paletteObject && vm.paletteFile) {
			requirejs([vm.paletteFile], function(palette) {
				var paletteObject = new palette[vm.paletteObject](document.getElementById(vm.id));
				if (vm.paletteEvent) {
					paletteObject.addEventListener(vm.paletteEvent, function(event) {
						vm.$emit(vm.paletteEvent, event);
					});
				}
			});
		}
	}
}

// Toolbar component
var Toolbar = {
	components: {'toolbar-item': ToolbarItem},
	template: `
		<div id="main-toolbar" class="toolbar">
			<toolbar-item id="activity-button" v-bind:title="l10n.stringCalligraActivity"></toolbar-item>
			<toolbar-item isSplitbar="true"></toolbar-item>

			<toolbar-item ref="templatebutton" class="toolbutton" id="template-button"
				v-bind:title="l10n.stringTemplate"
				paletteFile="activity/palettes/templatepalette"
				paletteObject="TemplatePalette"
				paletteEvent="templateSelected"
				v-on:templateSelected="getApp().onTemplateSelected($event)">
			</toolbar-item>
			<toolbar-item ref="settings" id="settings-button" disabled></toolbar-item>

			<toolbar-item v-on:clicked="getApp().onStop()" id="stop-button" title="Stop" toRight="true"></toolbar-item>
			<toolbar-item ref="fullscreen" v-on:clicked="getApp().fullscreen()" id="fullscreen-button" v-bind:title="l10n.stringFullscreen" toRight="true"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().onHelp()" id="help-button" v-bind:title="l10n.stringHelp" toRight="true"></toolbar-item>
		</div>
	`,
	data: function() {
		return {
			l10n: {
				stringCalligraActivity: '',
				stringTemplate: '',
				stringHelp: '',
				stringFullscreen: ''
			}
		}
	},
	methods: {
		localized: function(localization) {
			localization.localize(this.l10n);
		},

		getApp: function() {
			return app;
		}
	}
}
