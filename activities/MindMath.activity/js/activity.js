// Rebase require directory
requirejs.config({
  baseUrl: "lib",
  paths: {
    activity: "../js"
  }
});

// Vue main app
var app = new Vue({
  el: '#app',
  components: {
    'game': Game,
  },
  data: function() {
    return {
      currentScreen: "game",
      currentenv: null,
      SugarL10n: null,
      SugarPresence: null,

    }
  },
  methods: {
		initialized: function() {
      // Initialize Sugarizer
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
			document.getElementById('app').style.background = this.currentenv.user.colorvalue.fill;
      //document.getElementById('app').style.background = this.currentenv.user.colorvalue.stroke;
      //document.querySelector('.slots-area-panel').style.background = this.currentenv.user.colorvalue.fill;
      //document.querySelector('.game-area-panel').style.background = this.currentenv.user.colorvalue.fill;



    },
	}
});
