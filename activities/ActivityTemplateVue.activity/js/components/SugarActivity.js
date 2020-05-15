Vue.component('sugar-activity', {
  data: {
    activity: null,
    environment: null,
    icon: null
  },
  mounted() {
    var vm = this;
    requirejs(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon"], function (activity, env, icon) {
      vm.activity = activity;
      vm.icon = icon;
      env.getEnvironment(function (err, environment) {
        vm.environment = environment;
        vm.$emit('loaded');
      });
    });
  },
  methods: {
    setup: function () {
      this.activity.setup();
    },

    getActivity: function () {
      return this.activity;
    },

    getEnvironment: function () {
      return this.environment;
    },

    colorize: function (element, colors) {
      return this.icon.colorize(element, colors);
    }
  }
})