var InputNumber = {
  props: ['number', 'type','colorObj','isSelected'],
  template: `
      <div ref="number"
      >{{ number }}</div>
  `,
  mounted: function () {
    var vm = this;
    vm.colorize();
  },
  watch: {
    colorObj: function () {
      var vm = this;
  		requirejs(["sugar-web/graphics/icon"], function (icon) {
  			icon.colorize(vm.$refs.number, vm.colorObj);
  		})
    },
    type: function () {
      var vm = this;
      vm.colorize();
    },
    isSelected: function () {
      var vm = this;
      vm.colorize();
    }
  },
  methods: {
    colorize: function () {
      var vm = this;
      if (vm.type != 0) {
        vm.$refs.number.style.backgroundImage = 'url(./icons/square-bg.svg)';
      }else {
        vm.$refs.number.style.backgroundImage = 'url(./icons/diamond-bg.svg)';
      }
      if (vm.isSelected) {
        vm.$refs.number.style.backgroundImage = "";
      }
  		requirejs(["sugar-web/graphics/icon"], function (icon) {
  			icon.colorize(vm.$refs.number, vm.colorObj);
  		})
    }
  }
}
