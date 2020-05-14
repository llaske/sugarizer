// Toolbar item
Vue.component('toolbar-item', {
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

		if(vm.id == 'network-button') {
			requirejs(["sugar-web/graphics/presencepalette"], function(presencepalette) {
				var presencePalette = new presencepalette.PresencePalette(document.getElementById(vm.id), undefined);
				presencePalette.addEventListener('shared', function () {
					presencePalette.popDown();
					vm.$root.$refs.presence.onShared();
				});
			});
		}
	}
});

// Toolbar component
Vue.component('toolbar', {
	template: `
		<div id="main-toolbar" class="toolbar" v-bind:class="{ hidden: hidden }">
			<toolbar-item id="activity-button" v-bind:title="l10n.stringFractionBounceActivity"></toolbar-item>
			<toolbar-item isSplitbar></toolbar-item>

			<toolbar-item id="network-button" v-bind:title="l10n.stringNetwork" v-if="presence"></toolbar-item>
			
			<slot></slot>

			<toolbar-item v-on:click="$parent.onStop()" id="stop-button" title="Stop" class="pull-right"></toolbar-item>
			<toolbar-item v-if="!hidden" v-on:click="fullscreen" id="fullscreen-button" v-bind:title="l10n.stringFullscreen" class="pull-right"></toolbar-item>
			<toolbar-item v-else v-on:click="unfullscreen" id="unfullscreen-button" v-bind:title="l10n.stringFullscreen" class="pull-right"></toolbar-item>
			<toolbar-item v-on:click="$parent.onHelp()" id="help-button" v-bind:title="l10n.stringHelp" class="pull-right"></toolbar-item>
		</div>
	`,
	data: function () {
		return {
			hidden: false,
			presence: null,
			l10n: {
				stringNetwork: ''
			}
		}
	},
	mounted: function() {
		this.presence = this.$root.$refs.presence;
	},
	methods: {
		localized: function (localization) {
			localization.localize(this.l10n);
		},
		
		// Handle fullscreen mode
		fullscreen: function () {
			this.hidden = true;
		},

		unfullscreen: function () {
			this.hidden = false;
		},
	}
});
