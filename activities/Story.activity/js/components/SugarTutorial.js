// Tutorial component based on  introjs tour
Vue.component("sugar-tutorial", {
  data: function () {
    return {
      l10n: {
        stringTutoPrev: "Prev",
        stringTutoNext: "Next",
      },
    };
  },
  mounted() {
    let vm = this;
    if (this.$root.$refs.SugarL10n) {
      this.$root.$refs.SugarL10n.$on("localized", function () {
        vm.$root.$refs.SugarL10n.localize(vm.l10n);
      });
    }
  },
  methods: {
    show: function (steps) {
      introJs()
        .setOptions({
          tooltipClass: "customTooltip",
          steps: steps,
          prevLabel: this.l10n.stringTutoPrev,
          nextLabel: this.l10n.stringTutoNext,
          exitOnOverlayClick: false,
          nextToDone: false,
          showBullets: false,
        })
        .start();
    },
  },
});
