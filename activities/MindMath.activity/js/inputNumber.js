var InputNumber = {
  props: ['number', 'type', 'fillColor', 'isSelected'],
  template: `
      <div ref="number"
      ><div>{{ number }}</div></div>
  `,
  mounted: function() {
    var vm = this;
    vm.colorize();
  },
  watch: {
    fillColor: function(newVal, oldVal) {
      var vm = this;
      requirejs(["sugar-web/graphics/icon"], function(icon) {
        icon.colorize(vm.$refs.number, {
          stroke: vm.fillColor,
          fill: vm.fillColor
        });
      })
    },
    type: function() {
      var vm = this;
      vm.colorize();
    },
    isSelected: function() {
      var vm = this;
      vm.colorize();
    }
  },
  methods: {
    colorize: function() {
      var vm = this;
      if (vm.type != 0) {
        vm.$refs.number.style.backgroundImage = 'url(./icons/square-bg.svg)';
      } else {
        vm.$refs.number.style.backgroundImage = 'url(./icons/diamond-bg.svg)';
      }
      if (vm.isSelected) {
        vm.$refs.number.style.backgroundImage = "";
      }
      requirejs(["sugar-web/graphics/icon"], function(icon) {
        icon.colorize(vm.$refs.number, {
          stroke: vm.fillColor,
          fill: vm.fillColor
        });
      })
    }
  }
}
