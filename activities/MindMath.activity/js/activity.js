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
      sugarPopup: null,
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
      slots:[],
      inputNumbers: [1,2,2,9,12],
      inputNumbersTypes:[0,0,0,0,0],
      prev: {
        skipIndex1: [],
        skipIndex2: []
      }
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
        //Initialize clock
        vm.$set(vm.clock, 'time', 0);
        vm.$set(vm.clock, 'active', true);
        vm.$set(vm.clock, 'previousTime', new Date());
        vm.score = 0;
        vm.slots = [];
        vm.inputNumbersTypes = [0,0,0,0,0];
        //vm.tick();
      } else {

      }
    }
  },
  methods: {
    initialized: function() {
      var vm = this;
      // Initialize Sugarizer
      vm.currentenv = vm.$refs.SugarActivity.getEnvironment();
      vm.sugarPopup = vm.$refs.SugarPopup;

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
        var slots = vm.slots;
        var timeTaken = vm.clock.time;
        score = calculateScoreFromSlots(slots, timeTaken);
        console.log(score);
      }
      vm.slots = slots;
      vm.score = score;
      //change currentScreen
      vm.currentScreen = "result"
    },
    onSlotsUpdated: function (data) {
      var vm = this;
      if (data.type === 'add') {
        vm.slots.push(data.data.slot);

        var res = data.data.slot.res;
        var skipIndex1 = data.data.skipIndex1;
        var skipIndex2 = data.data.skipIndex2;

        vm.prev.skipIndex1.push(skipIndex1);
        vm.prev.skipIndex2.push(skipIndex2);

        var newNums = removeEntryFromArray(vm.inputNumbers, skipIndex1);
        var newTypes = removeEntryFromArray(vm.inputNumbersTypes, skipIndex1);
        if (skipIndex1 < skipIndex2) {
          skipIndex2--;
        }
        newNums = removeEntryFromArray(newNums, skipIndex2);
        newTypes = removeEntryFromArray(newTypes, skipIndex2);
        newNums.push(res);
        newTypes.push(1);

        vm.inputNumbers = newNums;
        vm.inputNumbersTypes = newTypes;
      }
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
        vm.inputNumbers = questions[0].inputNumbers;
        vm.inputNumbersTypes = [0,0,0,0,0];
        //change currentScreen
        vm.currentScreen = "game";
      }
    },
    handleUndoButton: function () {
      var vm = this;
      if (vm.currentScreen === 'game' && vm.slots.length!=0) {
        var removedSlot = vm.slots.pop();

        //changing inputNumbers
        vm.inputNumbers.pop();
        vm.inputNumbersTypes.pop();
        var addIndex1 = vm.prev.skipIndex1.pop();
        var addIndex2 = vm.prev.skipIndex2.pop();

        if (addIndex1 < addIndex2) {
          var newNums = addEntryIntoArray(vm.inputNumbers, addIndex1, removedSlot.num1.val);
          var newTypes = addEntryIntoArray(vm.inputNumbersTypes, addIndex1, removedSlot.num1.type);
          newNums = addEntryIntoArray(newNums, addIndex2, removedSlot.num2.val);
          newTypes = addEntryIntoArray(newTypes, addIndex2, removedSlot.num2.type);
        }else {
          var newNums = addEntryIntoArray(vm.inputNumbers, addIndex2, removedSlot.num2.val);
          var newTypes = addEntryIntoArray(vm.inputNumbersTypes, addIndex2, removedSlot.num2.type);
          newNums = addEntryIntoArray(newNums, addIndex1, removedSlot.num1.val);
          newTypes = addEntryIntoArray(newTypes, addIndex1, removedSlot.num1.type);
        }

        vm.inputNumbers = newNums;
        vm.inputNumbersTypes = newTypes;

      }
    },
  }
});
