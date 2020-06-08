var OperatorButton = {
  props: ['colors'],
  template: `
    <button
      ref="operator"
      class="btn-operator"
      v-on:click="$emit('select-operator')"
    ></button>
  `,
  data: function () {
    return {
      icon: null
    }
  },
  mounted: function () {
    var vm = this;
		requirejs(["sugar-web/graphics/icon"], function (icon) {
			vm.icon = icon;
      vm.changeColor()
		})
  },
  watch: {
    colors: function () {
      this.changeColor();
    }
  },
  methods: {
    changeColor: function () {
      var vm = this;
      vm.icon.colorize(vm.$refs.operator, vm.colors);
    }
  }
}
