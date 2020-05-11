Vue.component('popup', {
  data: {
    humane: null
  },
  mounted() {
    EventBus.$on('popupLog', this.log);

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