var Pawn = {
	template: `<div ref="pawn" class="pawn"></div>`,
	props: ['colors'],
	mounted() {
		var vm = this;
		requirejs(["sugar-web/graphics/icon"], function (icon) {
			icon.colorize(vm.$refs.pawn, vm.colors);
		})
	}
}