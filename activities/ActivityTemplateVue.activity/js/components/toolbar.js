// Toolbar item
var ToolbarItem = {
	template: `
		<div class="splitbar" v-if="isSplitbar"/>
		<button class="toolbutton" v-bind:id="id" v-bind="$attrs" v-on="$listeners" :disabled="disabled" v-bind:class="{ active: active }" v-else/>
	`,
	props: {
		'id': String,
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
	template: `
		<div id="main-toolbar" class="toolbar">
			<toolbar-item id="activity-button" v-bind:title="l10n.stringFractionBounceActivity"></toolbar-item>
			<toolbar-item isSplitbar></toolbar-item>

			<toolbar-item id="network-button" v-bind:title="l10n.stringNetwork" v-if="presence"></toolbar-item>
			
			<slot></slot>

			<toolbar-item v-on:click="parent.onStop()" id="stop-button" title="Stop" class="pull-right"></toolbar-item>
			<toolbar-item ref="fullscreen" v-on:click="parent.fullscreen()" id="fullscreen-button" v-bind:title="l10n.stringFullscreen" class="pull-right"></toolbar-item>
			<toolbar-item v-on:click="parent.onHelp()" id="help-button" v-bind:title="l10n.stringHelp" class="pull-right"></toolbar-item>
		</div>
	`,
	components: { 'toolbar-item': ToolbarItem },
	data: function () {
		return {
			parent: null,
			presence: null,
			l10n: {
				stringNetwork: ''
			}
		}
	},
	mounted: function() {
		this.parent = this.$root;
		this.presence = this.$root.$refs.presence;
	},
	methods: {
		localized: function (localization) {
			localization.localize(this.l10n);
		}
	}
};
