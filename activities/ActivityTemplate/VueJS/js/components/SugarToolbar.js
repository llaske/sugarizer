// Toolbar item
Vue.component('sugar-toolitem', {
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
		'paletteTitle': String,
		'disabled': Boolean,
		'active': Boolean
	},
	data: function () {
		return {
			paletteObject: null
		}
	},
	created: function() {
		// v-visible="condition" (Use this with palettes to avoid errors)
		Vue.directive('visible', function(el, binding) {
			el.style.visibility = !!binding.value ? 'visible' : 'hidden';
		});
	},
	mounted: function () {
		// Create palette if present
		var vm = this;
		if (vm.id && vm.paletteClass && vm.paletteFile) {
			requirejs([vm.paletteFile], function (palette) {
				vm.paletteObject = new palette[vm.paletteClass](document.getElementById(vm.id), vm.paletteTitle);
				if (vm.paletteEvent) {
					vm.paletteObject.addEventListener(vm.paletteEvent, function (event) {
						vm.$emit(vm.paletteEvent, event, vm.paletteObject);
					});
				}
			});
		}
	}
});

// Toolbar component
Vue.component('sugar-toolbar', {
	template: `
		<div id="main-toolbar" class="toolbar" v-bind:class="{ hidden: hidden }">
			<slot></slot>
		</div>
	`,
	data: function () {
		return {
			hidden: false
		}
	},
	methods: {
		isHidden: function () {
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
