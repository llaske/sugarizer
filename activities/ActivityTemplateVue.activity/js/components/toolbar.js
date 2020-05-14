// Toolbar item
Vue.component('toolbar-item', {
	template: `
		<div class="splitbar" v-if="splitbar"/>
		<button class="toolbutton" v-else v-bind:id="id" v-bind="$attrs" v-on="$listeners" :disabled="disabled" v-bind:class="{ active: active }"/>
	`,
	props: {
		'id': String,
		'splitbar': Boolean,
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
			<slot></slot>
		</div>
	`,
	data: function () {
		return {
			hidden: false,
			l10n: {
				stringNetwork: ''
			}
		}
	},
	methods: {
		localized: function (localization) {
			localization.localize(this.l10n);
		},
		
		isHidden() {
			return this.hidden;
		},

		// Handle fullscreen mode
		hide: function () {
			this.hidden = true;

		},

		show: function () {
			this.hidden = false;
		},
	}
});
