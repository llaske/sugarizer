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
  mounted: function () {
    var vm = this;
    window.addEventListener('resize',function () {
      vm.$refs.currentScreen.resize();
    })
    document.getElementById("main-toolbar").style.opacity = 1;
    window.dispatchEvent(new Event('resize'));
  },
  methods: {
		initialized: function() {
      // Initialize Sugarizer
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
			//document.getElementById('app').style.background = this.currentenv.user.colorvalue.fill;
      document.getElementById('app').style.background = this.currentenv.user.colorvalue.stroke;
      document.querySelector('.slots-area-panel').style.background = this.currentenv.user.colorvalue.fill;
      document.querySelector('.game-area-panel').style.background = this.currentenv.user.colorvalue.fill;
      for (var i = 0; i < 4; i++) {
        document.querySelectorAll('.btn-operator')[i].style.backgroundColor = this.currentenv.user.colorvalue.stroke;
        document.querySelectorAll('.slot .operator')[i].style.backgroundColor = this.currentenv.user.colorvalue.stroke;
        //document.querySelectorAll('.btn-operator')[i].style.color = this.currentenv.user.colorvalue.fill;
      }
      for (var i = 0; i < 2; i++) {
        document.querySelectorAll('.details-area-section .detail-block')[i].style.backgroundColor = this.currentenv.user.colorvalue.stroke;
        document.querySelectorAll('.details-area-section .detail-content')[i].style.backgroundColor = this.currentenv.user.colorvalue.stroke;
      }

    },
	}
});
