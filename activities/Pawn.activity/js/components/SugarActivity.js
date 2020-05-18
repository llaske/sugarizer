Vue.component('sugar-activity', {
  data: {
    activity: null,
    environment: null
  },
  mounted() {
    var vm = this;
    requirejs(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {
      vm.activity = activity;
      env.getEnvironment(function (err, environment) {
        vm.environment = environment;
        activity.setup();
        vm.$emit('initialized');
      });
    });
  },
  methods: {
    getActivity: function () {
      return this.activity;
    },

    getEnvironment: function () {
      return this.environment;
    }
  }
})