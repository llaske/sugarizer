// Rebase require directory
requirejs.config({
  baseUrl: "lib",
  paths: {
    activity: "../js"
  }
});

var requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

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
      level: 0,
      compulsoryOp: null,
      clock: {
        active: false,
        previousTime: null,
        time: 0,
        timer: false,
      },
      questionsGenerator: null,
      questions: [
        {
          inputNumbers: [1,2,2,9,12],
          targetNum: 3,
          difficulty: 'medium',
          bestSoln: [12,2,'+',2,'*',1,'-',9,'/'],
        },
      ],
      qNo:0,
      slots:[[]],
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
    setTimeout(() => {
       window.dispatchEvent(new Event('resize'));
     }, 0);
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
        vm.slots = [[]];
        vm.qNo = 0;
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

      //Initialize questionsGenerator
      vm.questionsGenerator = new QuestionsGenerator();
      vm.questions = vm.questionsGenerator.generate(vm.level,1);
      vm.qNo = 0;
      vm.inputNumbers = vm.questions[vm.qNo].inputNumbers;
      vm.inputNumbersTypes = [0,0,0,0,0];

      //Initialize clock
      vm.$set(vm.clock, 'time', 0);
      vm.$set(vm.clock, 'active', true);
      vm.$set(vm.clock, 'previousTime', new Date());
      vm.tick();

    },

    onValidate: function(data) {
      var vm = this;
      //stop timer
      vm.clock.active = false;
      //calculate score
      var slots = vm.slots[vm.qNo];
      var timeTaken = vm.clock.time;
      var scr = calculateScoreFromSlots(slots, timeTaken);
      vm.score += scr;

      if (vm.mode === 'non-timer') {
        //change currentScreen
        vm.currentScreen = "result";
      }

    },

    onSlotsUpdated: function (data) {
      var vm = this;
      if (data.type === 'add') {
        vm.slots[vm.qNo].push(data.data.slot);

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

    handleRestartButton: function () {
      var vm = this;
      if (vm.currentScreen === 'game') {
        //stop timer
        vm.clock.active = false;
        vm.slots = [[]];
        //change currentScreen
        vm.currentScreen = "result";
      }
      else {
        // generate question set,
        vm.questions = vm.questionsGenerator.generate(vm.level,1);
        vm.inputNumbers = vm.questions[vm.qNo].inputNumbers;
        vm.inputNumbersTypes = [0,0,0,0,0];

        //change currentScreen
        vm.currentScreen = "game";
      }
    },

    handlePassButton: function () {
      var vm = this;
      if (vm.currentScreen === 'game') {
        //stop timer
        vm.clock.active = false;
        vm.slots = [[]];
        vm.score+=0;
        if (vm.mode === 'non-timer') {
          //change currentScreen
          vm.currentScreen = "result";
        }else {
          //go to next question in question set for timer mode
          vm.qNo++;
        }

      }
      else {
        // generate question set,
        vm.questions = vm.questionsGenerator.generate(vm.level,1);
        vm.inputNumbers = vm.questions[vm.qNo].inputNumbers;
        vm.inputNumbersTypes = [0,0,0,0,0];

        //change currentScreen
        vm.currentScreen = "game";
      }
    },

    handleUndoButton: function () {
      var vm = this;
      if (vm.currentScreen === 'game' && vm.slots[vm.qNo].length!=0) {
        var removedSlot = vm.slots[vm.qNo].pop();

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

    onDifficultySelected: function (data) {
      this.level = data.index;
      // can also start a new game
      //....
    },

    onHintUsed: function () {

    },

    handleCompulsoryOpButton: function () {
      var vm = this;
      switch (vm.compulsoryOp) {
        case null:
          vm.compulsoryOp = '+';
          document.getElementById('compulsory-op-button').style.backgroundImage = "url(./icons/plus-comp.svg)"
          break;
        case '+':
          vm.compulsoryOp = '-';
          document.getElementById('compulsory-op-button').style.backgroundImage = "url(./icons/minus-comp.svg)"
          break;
        case '-':
          vm.compulsoryOp = '*';
          document.getElementById('compulsory-op-button').style.backgroundImage = "url(./icons/multiply-comp.svg)"
          break;
        case '*':
          vm.compulsoryOp = '/';
          document.getElementById('compulsory-op-button').style.backgroundImage = "url(./icons/divide-comp.svg)"
          break;
        case '/':
          vm.compulsoryOp = null;
          document.getElementById('compulsory-op-button').style.backgroundImage = "url(./icons/none-comp.svg)"
          break;
        default:
          vm.compulsoryOp = null;
          document.getElementById('compulsory-op-button').style.backgroundImage = "url(./icons/none-comp.svg)"
      }
    },

    fullscreen: function () {
			this.$refs.SugarToolbar.hide();
      setTimeout(() => {
         window.dispatchEvent(new Event('resize'));
       }, 0);
		},

		unfullscreen: function () {
			this.$refs.SugarToolbar.show();
      setTimeout(() => {
         window.dispatchEvent(new Event('resize'));
       }, 0);
		},

  }
});
