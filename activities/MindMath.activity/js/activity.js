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
    'result': Result,
  },
  data: function() {
    return {
      currentScreen: "game",
      strokeColor: '#f0d9b5',
      fillColor: '#b58863',
      currentenv: null,
      SugarL10n: null,
      SugarPresence: null,
      mode: 'non-timer',
      score: 0,
      clock: {
        active: false,
        previousTime: null,
        time: 0,
        timer: false,
      },
      questions: [
        {
          inputNumbers: [1,2,2,9,12],
          targetNum: 3,
          difficulty: 'medium',
          compulsoryOp: null,
          bestSoln: [12,2,'+',2,'x',1,'-',9,'/'],
        },
      ],
      qNo:0,
    }
  },
  mounted: function() {
    var vm = this;
    document.getElementById("main-toolbar").style.opacity = 1;
    window.dispatchEvent(new Event('resize'));
  },
  watch: {
    currentScreen: function(newVal) {
      var vm = this;
      if (newVal === 'game') {
        //end-icon
        document.getElementById('game-button').style.backgroundImage = 'url(./icons/end-icon.svg)';
        //Initialize clock
        vm.$set(vm.clock, 'time', 0);
        vm.$set(vm.clock, 'active', true);
        vm.$set(vm.clock, 'previousTime', new Date());
        vm.score = 0;
        //vm.tick();
      } else {
        //new-icon
        //document.getElementById('game-button').style.backgroundImage = 'url(./icons/restart.svg)';
      }
    }
  },
  methods: {
    initialized: function() {
      var vm = this;
      // Initialize Sugarizer
      vm.currentenv = vm.$refs.SugarActivity.getEnvironment();
      //document.getElementById('app').style.background = vm.currentenv.user.colorvalue.fill;
      document.getElementById('app').style.background = vm.currentenv.user.colorvalue.stroke;
      vm.strokeColor = vm.currentenv.user.colorvalue.stroke;
      vm.fillColor = vm.currentenv.user.colorvalue.fill;

      //Initialize clock
      vm.$set(vm.clock, 'time', 0);
      vm.$set(vm.clock, 'active', true);
      vm.$set(vm.clock, 'previousTime', new Date());
      vm.tick();

    },
    onEndGame: function(data) {
      var vm = this;
      //stop timer
      vm.clock.active = false;

      var score = null;
      if (data.type === 'validate') {
        //calculate score
        var slots = data.slots;
        var timeTaken = vm.time;
        score = calculateScoreFromSlots(slots, timeTaken);
      }
      vm.score = score;
      //change currentScreen
      vm.currentScreen = "result"
    },
    tick: function() {
      var vm = this;

      if (vm.clock.active) {
        var currentTime = new Date();
        if (currentTime - vm.clock.previousTime >= 1000) {
          vm.clock.previousTime = currentTime;

          if (vm.clock.timer) {
            vm.clock.time--;
          } else {
            vm.clock.time++;
          }
        }
      }

      requestAnimationFrame(vm.tick.bind(vm));
    },
    handleGameButton: function () {
      var vm = this;
      if (vm.currentScreen === 'game') {
        //stop timer
        vm.clock.active = false;
        //change currentScreen
        vm.currentScreen = "result";
      }
      else {
        // generate question set,
        var questions = [{
          inputNumbers: [1, 2, 2, 9, 12],
          targetNum: 3,
          difficulty: 'medium',
          compulsoryOp: null,
          bestSoln: [12, 2, '+', 2, 'x', 1, '-', 9, '/'],
        }];

        vm.questions = questions;
        //change currentScreen
        vm.currentScreen = "game";
      }
    },
    handlePassButton: function () {
      var vm = this;
      if (vm.currentScreen === 'game') {
        //stop timer
        vm.clock.active = false;
        //change currentScreen
        vm.currentScreen = "result";
      }
      else {
        // generate question set,
        var questions = [{
          inputNumbers: [1, 2, 2, 9, 12],
          targetNum: 3,
          difficulty: 'medium',
          compulsoryOp: null,
          bestSoln: [12, 2, '+', 2, 'x', 1, '-', 9, '/'],
        }];

        vm.questions = questions;
        //change currentScreen
        vm.currentScreen = "game";
      }
    },
  }
});
