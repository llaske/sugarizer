Vue.component('sugar-popup', {
  data: {
    humane: null
  },
  mounted() {
    var vm = this;
    requirejs(["humane"], function (humane) {
      vm.humane = humane;
    });
  },
  methods: {
    log(text) {
      this.humane.log(text);
    }
  }
});