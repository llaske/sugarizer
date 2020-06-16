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
    'leaderboard': Leaderboard
  },
  data: function() {
    return {
      currentScreen: "game",
      strokeColor: '#f0d9b5',
      fillColor: '#b58863',
      currentenv: null,
      SugarL10n: null,
      SugarPresence: null,
      SugarJournal: null,
      sugarPopup: null,
      mode: 'non-timer',
      score: 0,
      level: 0,
      compulsoryOps: [],
      compulsoryOpsRem: [],
      compulsoryOpsForEachQuestion: [],
      clock: {
        active: false,
        previousTime: null,
        time: 0,
        initial: 0,
        type: 0,
      },
      questionsGenerator: null,
      hintsGenerator: null,
      questions: [{
        inputNumbers: [0, 0, 0, 0, 0],
        targetNum: 0,
        bestSoln: [],
      }],
      qNo: 0,
      slots: [
        []
      ],
      scores: [],
      timeTaken: [],
      prevTimeStones: [],
      inputNumbers: [0, 0, 0, 0, 0],
      inputNumbersTypes: [0, 0, 0, 0, 0],
      prev: [],
      redoStack: [],
      next: [],
      noOfHintsUsed: [],
      playersAll: [],
      connectedPlayers: [], //connectedPlayers[0] will be the maintainer of questions set in multiplayer game
      playersPlaying: [],
      multiplayerPlaying: false,
    }
  },
  mounted: function() {
    var vm = this;
    vm.SugarPresence = vm.$refs.SugarPresence;
    vm.sugarPopup = vm.$refs.SugarPopup;
    vm.SugarJournal = vm.$refs.SugarJournal;

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);

    document.getElementById('hint-button').addEventListener('click', function(event) {
      vm.addHintPenalty();
    });
  },
  watch: {
    currentScreen: function() {
      var vm = this;
      if (vm.currentScreen === 'game') {
        if (!vm.multiplayerPlaying) {
          vm.newGame();
        }
        vm.$set(vm.clock, 'active', true);
        vm.$set(vm.clock, 'previousTime', new Date());
      }
    },
    slots: function() {
      var vm = this;
      //update compulsoryOpsRem
      vm.updateCompulsoryOpsRem();
      //close hintPalette
      vm.$refs.hintPalette.paletteObject.popDown();
      //generating hint
      vm.generateHint();
    },
    compulsoryOps: function() {
      var vm = this;
      //update compulsoryOpsRem
      vm.updateCompulsoryOpsRem();
      //generating hint
      vm.generateHint();
    },
    qNo: function() {
      var vm = this;
      //new question
      vm.redoStack = [];
      vm.next = [];
      vm.prev = [];
      vm.noOfHintsUsed = [];

      var tmp = vm.questions.length - vm.qNo;
      if (tmp === 10) {
        if (vm.multiplayerPlaying && vm.connectedPlayers[0].networkId !== vm.SugarPresence.getUserInfo().networkId) {
          //request the questions set maintainer to add questions if it is multiplayer game
          vm.SugarPresence.sendMessage({
            user: this.SugarPresence.getUserInfo(),
            content: {
              action: 'add-questions'
            }
          });
        } else {
          var questions = vm.questionsGenerator.generate(vm.level, 10);
          vm.questions = vm.questions.concat(questions);

          if (vm.multiplayerPlaying && vm.connectedPlayers[0].networkId === vm.SugarPresence.getUserInfo().networkId) {
            //update the questions set among all others users if you are the maintainer in multiplayer game
            vm.SugarPresence.sendMessage({
              user: this.SugarPresence.getUserInfo(),
              content: {
                action: 'update-questions',
                data: {
                  questions: vm.questions
                }
              }
            });
          }

        }
      }
    }
  },
  methods: {
    initialized: function() {
      var vm = this;
      // Initialize Sugarizer
      vm.currentenv = vm.$refs.SugarActivity.getEnvironment();

      document.getElementById('app').style.background = vm.currentenv.user.colorvalue.stroke;
      vm.strokeColor = vm.currentenv.user.colorvalue.stroke;
      vm.fillColor = vm.currentenv.user.colorvalue.fill;

      //Initialize questionsGenerator
      vm.questionsGenerator = new QuestionsGenerator();
      //generating questions set
      vm.generateQuestionSet();

      //Initialize hintsGenerator
      vm.hintsGenerator = new HintsGenerator();
      vm.generateHint();

      //Initialize clock
      vm.$set(vm.clock, 'time', 0);
      vm.$set(vm.clock, 'active', true);
      vm.$set(vm.clock, 'previousTime', new Date());
      vm.tick();

    },

    updateCompulsoryOpsRem: function() {
      var vm = this;
      vm.compulsoryOpsRem = [];
      if (vm.slots[vm.qNo].length != 0) {
        //check if the operator used contains compulsoryOps
        for (var i = 0; i < vm.compulsoryOps.length; i++) {
          var tmp = vm.slots[vm.qNo].find(function(ele) {
            return ele.operator === vm.compulsoryOps[i];
          });
          if (!tmp) {
            vm.compulsoryOpsRem.push(vm.compulsoryOps[i]);
          }
        }
      }
    },

    generateHint: function() {
      var vm = this;
      var slots = vm.hintsGenerator.generate(vm.inputNumbers, vm.questions[vm.qNo].targetNum, vm.compulsoryOpsRem);
      var hint = slots.shift();
      if (hint) {
        var operator = hint[1];
        if (operator === '*') {
          operator = 'x';
        }
        var nextSlot = hint[0].val + ' ' + operator + ' ' + hint[2].val + ' = ' + hint[3];
      } else {
        var nextSlot = "No Hint"
      }
      setTimeout(() => {
        document.getElementById('hint-text').innerHTML = nextSlot;
      }, 0);
    },

    generateQuestionSet: function() {
      var vm = this;
      if (vm.mode === 'non-timer') {
        vm.questions = vm.questionsGenerator.generate(vm.level, 1);
      } else {
        vm.questions = vm.questionsGenerator.generate(vm.level, 20);
      }
      vm.qNo = 0;

      //update inputNumbers
      vm.inputNumbers = vm.questions[vm.qNo].inputNumbers;
      vm.inputNumbersTypes = [0, 0, 0, 0, 0];
    },

    pushTimeTaken: function() {
      var vm = this;
      if (vm.mode === 'non-timer') {
        vm.timeTaken.push(vm.clock.time);
      } else {
        var prevTimeStone = vm.clock.time;
        if (vm.timeTaken.length != 0) {
          var timeTaken = vm.prevTimeStones[vm.prevTimeStones.length - 1] - vm.clock.time;
        } else {
          var timeTaken = vm.clock.initial - vm.clock.time;
        }
        vm.timeTaken.push(timeTaken);
        vm.prevTimeStones.push(prevTimeStone);
      }
    },

    addSlot: function(slot, skipIndex1, skipIndex2) {
      var vm = this;

      vm.slots[vm.qNo].push(slot);
      vm.prev.push({
        index1: skipIndex1,
        index2: skipIndex2,
      })

      var newNums = removeEntryFromArray(vm.inputNumbers, skipIndex1);
      var newTypes = removeEntryFromArray(vm.inputNumbersTypes, skipIndex1);
      if (skipIndex1 < skipIndex2) {
        skipIndex2--;
      }
      newNums = removeEntryFromArray(newNums, skipIndex2);
      newTypes = removeEntryFromArray(newTypes, skipIndex2);
      newNums.push(slot.res);
      newTypes.push(1);

      vm.inputNumbers = newNums;
      vm.inputNumbersTypes = newTypes;
    },

    addHintPenalty: function() {
      var vm = this;
      var valid = document.getElementById('hint-text').innerHTML !== "No Hint";
      if (valid) {
        vm.noOfHintsUsed[vm.slots[vm.qNo].length] = 1;
      }
    },

    enableButtons: function() {
      // enable buttons functionally
      document.getElementById("timer-button").disabled = false;
      document.getElementById("level-button").disabled = false;
      document.getElementById("compulsory-op-button").disabled = false;
      document.getElementById("hint-button").disabled = false;
      document.getElementById("btn-restart").disabled = false;

      // enable buttons visually
      document.getElementById("timer-button").classList.remove('disabled');
      document.getElementById("level-button").classList.remove('disabled');
      document.getElementById("compulsory-op-button").classList.remove('disabled');
      document.getElementById("hint-button").classList.remove('disabled');
      document.getElementById("btn-restart").classList.remove('disabled');

    },

    disableButtons: function() {
      // enable buttons functionally
      document.getElementById("timer-button").disabled = true;
      document.getElementById("level-button").disabled = true;
      document.getElementById("compulsory-op-button").disabled = true;
      document.getElementById("hint-button").disabled = true;
      document.getElementById("btn-restart").disabled = true;

      // enable buttons visually
      document.getElementById("timer-button").classList.add('disabled');
      document.getElementById("level-button").classList.add('disabled');
      document.getElementById("compulsory-op-button").classList.add('disabled');
      document.getElementById("hint-button").classList.add('disabled')
      document.getElementById("btn-restart").classList.add('disabled')

    },

    newGame: function(joined) {
      var vm = this;
      vm.slots = [
        []
      ];
      vm.score = 0;
      vm.scores = [];
      vm.timeTaken = [];
      vm.compulsoryOpsForEachQuestion = [];
      vm.redoStack = [];
      vm.next = [];
      vm.prev = [];
      vm.noOfHintsUsed = [];
      vm.$set(vm.clock, 'time', vm.clock.initial);
      if (!joined) {
        vm.generateQuestionSet();
      }
    },

    onMultiplayerGameStarted: function() {
      var vm = this;
      vm.multiplayerPlaying = true;
      //disable the buttons
      vm.disableButtons();

      if (vm.mode === 'non-timer') {
        vm.mode = 'timer'
        vm.$set(vm.clock, 'initial', 2 * 60);
        vm.$set(vm.clock, 'type', 1);
        vm.selectTimerItem(vm.clock.type);
      }
      var user = {
        colorvalue: vm.currentenv.user.colorvalue,
        name: vm.currentenv.user.name,
        networkId: vm.currentenv.user.networkId
      }
      var player = {
        user: user,
        score: null,
        totalTime: null
      }

      vm.playersAll.push(player);
      vm.playersPlaying.push(user);
      vm.connectedPlayers.push(user);

      if (vm.currentScreen !== 'game') {
        vm.currentScreen = 'game';
      }

      vm.newGame();

    },

    onValidate: function() {
      var vm = this;
      //calculate score
      var slots = vm.slots[vm.qNo];
      vm.pushTimeTaken();
      //cloning array
      var compulsoryOps = vm.compulsoryOps.filter(function() {
        return true;
      })
      vm.compulsoryOpsForEachQuestion.push(compulsoryOps);
      var timeTaken = vm.timeTaken[vm.timeTaken.length - 1];
      var totalHints = vm.noOfHintsUsed.reduce(function(a, b) {
        return a + b
      }, 0)
      var scr = calculateScoreFromSlots(slots, timeTaken, totalHints);
      vm.score += scr;
      vm.scores.push(scr)

      if (vm.mode === 'non-timer') {
        vm.$set(vm.clock, 'active', false);
        vm.currentScreen = "result";
      } else {
        //go to next question in question set for timer mode
        vm.qNo++;
        vm.$set(vm.slots, vm.qNo, []);
        //update inputNumbers
        vm.inputNumbers = vm.questions[vm.qNo].inputNumbers;
        vm.inputNumbersTypes = [0, 0, 0, 0, 0];
      }

    },

    onSlotsUpdated: function(evt) {
      var vm = this;
      if (evt.type === 'add') {
        var res = evt.data.slot.res;
        var skipIndex1 = evt.data.skipIndex1;
        var skipIndex2 = evt.data.skipIndex2;

        vm.addSlot(evt.data.slot, skipIndex1, skipIndex2);
        //clearing redo stack
        vm.redoStack = [];
        vm.next = [];
      }

    },

    tick: function() {
      var vm = this;

      if (vm.clock.active) {
        var currentTime = new Date();
        if (currentTime - vm.clock.previousTime >= 1000) {
          vm.$set(vm.clock, 'previousTime', currentTime);
          if (vm.mode === 'timer') {
            vm.$set(vm.clock, 'time', vm.clock.time - 1);
            if (vm.clock.time === 0) {
              //end game
              vm.$set(vm.clock, 'active', false);
              vm.$set(vm.slots, vm.qNo, []);
              vm.score += 0;
              vm.scores.push(0)
              vm.pushTimeTaken();
              //cloning array
              var compulsoryOps = vm.compulsoryOps.filter(function() {
                return true;
              })
              vm.compulsoryOpsForEachQuestion.push(compulsoryOps);
              //change currentScreen
              if (vm.multiplayerPlaying) {
                vm.playersAll.forEach((item, i) => {
                  if (item.user.name === vm.currentenv.user.name && !item.score) {
                    vm.playersAll[i].score = vm.score;
                    vm.playersAll[i].totalTime = vm.timeTaken.reduce(function(a, b) {
                      return a + b
                    }, 0);
                  }
                });
                console.log(vm.playersAll);
                vm.multiplayerPlaying = false;
                vm.currentScreen = "leaderboard";
              } else {
                vm.currentScreen = "result";
              }
            }
          } else {
            vm.$set(vm.clock, 'time', vm.clock.time + 1);
          }
        }
      }

      requestAnimationFrame(vm.tick.bind(vm));
    },

    handleRestartButton: function() {
      var vm = this;
      if (vm.currentScreen === 'game') {
        vm.$set(vm.clock, 'active', false);
        vm.$set(vm.slots, vm.qNo, []);
        vm.score += 0;
        vm.scores.push(0)
        vm.pushTimeTaken();
        //cloning array
        var compulsoryOps = vm.compulsoryOps.filter(function() {
          return true;
        })
        vm.compulsoryOpsForEachQuestion.push(compulsoryOps);

        vm.currentScreen = "result";
      } else {
        //generating questions set
        vm.generateQuestionSet();
        //change currentScreen
        vm.currentScreen = "game";
      }
    },

    handlePassButton: function() {
      var vm = this;

      if (vm.currentScreen === 'game') {
        //stop timer
        vm.score += 0;
        vm.scores.push(0)
        vm.pushTimeTaken();
        //cloning array
        var compulsoryOps = vm.compulsoryOps.filter(function() {
          return true;
        })
        vm.compulsoryOpsForEachQuestion.push(compulsoryOps);
        if (vm.mode === 'non-timer') {
          vm.$set(vm.clock, 'active', false);
          vm.slots = [
            []
          ];

          //change currentScreen
          vm.currentScreen = "result";
        } else {
          //go to next question in question set for timer mode
          vm.$set(vm.slots, vm.qNo, []);
          vm.qNo++;
          vm.$set(vm.slots, vm.qNo, []);
          //update inputNumbers
          vm.inputNumbers = vm.questions[vm.qNo].inputNumbers;
          vm.inputNumbersTypes = [0, 0, 0, 0, 0];
        }

      } else {
        //generating questions set
        vm.generateQuestionSet();

        //change currentScreen
        vm.currentScreen = "game";
      }
    },

    handleUndoButton: function() {
      var vm = this;
      if (vm.currentScreen === 'game' && vm.slots[vm.qNo].length != 0) {
        var removedSlot = vm.slots[vm.qNo].pop();

        vm.inputNumbers.pop();
        vm.inputNumbersTypes.pop();
        var indexes = vm.prev.pop();
        var addIndex1 = indexes.index1;
        var addIndex2 = indexes.index2;

        if (addIndex1 < addIndex2) {
          var newNums = addEntryIntoArray(vm.inputNumbers, addIndex1, removedSlot.num1.val);
          var newTypes = addEntryIntoArray(vm.inputNumbersTypes, addIndex1, removedSlot.num1.type);
          newNums = addEntryIntoArray(newNums, addIndex2, removedSlot.num2.val);
          newTypes = addEntryIntoArray(newTypes, addIndex2, removedSlot.num2.type);
        } else {
          var newNums = addEntryIntoArray(vm.inputNumbers, addIndex2, removedSlot.num2.val);
          var newTypes = addEntryIntoArray(vm.inputNumbersTypes, addIndex2, removedSlot.num2.type);
          newNums = addEntryIntoArray(newNums, addIndex1, removedSlot.num1.val);
          newTypes = addEntryIntoArray(newTypes, addIndex1, removedSlot.num1.type);
        }

        vm.inputNumbers = newNums;
        vm.inputNumbersTypes = newTypes;
        //for redo actions
        vm.redoStack.push(removedSlot);
        vm.next.push({
          index1: addIndex1,
          index2: addIndex2
        })
      }
    },

    handleRedoButton: function() {
      var vm = this;
      if (vm.currentScreen === 'game' && vm.redoStack.length != 0) {
        var slotTobeAdded = vm.redoStack.pop();
        var indexes = vm.next.pop();
        var skipIndex1 = indexes.index1;
        var skipIndex2 = indexes.index2;

        vm.addSlot(slotTobeAdded, skipIndex1, skipIndex2);

      }
    },

    onDifficultySelected: function(evt) {
      var vm = this;
      vm.level = evt.index;
      vm.selectDifficultyItem(vm.level);

      if (vm.currentScreen === 'game') {
        // start a new game
        vm.newGame();
      }

    },

    selectDifficultyItem: function(number) {
      if (number === 0) {
        document.getElementById('easy-button').classList.remove("palette-button-notselected");
        document.getElementById('medium-button').classList.add("palette-button-notselected");
      } else {
        document.getElementById('medium-button').classList.remove('palette-button-notselected');
        document.getElementById('easy-button').classList.add('palette-button-notselected');
      }
    },

    onTimerSelected: function(evt) {
      var vm = this;

      switch (evt.index) {
        case 0:
          vm.mode = 'non-timer';
          vm.$set(vm.clock, 'initial', 0);
          vm.$set(vm.clock, 'type', 0);
          break;
        case 1:
          vm.mode = 'timer';
          vm.$set(vm.clock, 'initial', 2 * 60);
          vm.$set(vm.clock, 'type', 1);
          break;
        case 2:
          vm.mode = 'timer';
          vm.$set(vm.clock, 'initial', 5 * 60);
          vm.$set(vm.clock, 'type', 2);
          break;
        case 3:
          vm.mode = 'timer'
          vm.$set(vm.clock, 'initial', 10 * 60);
          vm.$set(vm.clock, 'type', 3);
          break;
      }
      vm.selectTimerItem(evt.index);

      if (vm.currentScreen === 'game') {
        vm.newGame();
      }
    },

    selectTimerItem: function(number) {
      var elems = [
        document.getElementById('no-timer-button'),
        document.getElementById('first-timer-button'),
        document.getElementById('second-timer-button'),
        document.getElementById('third-timer-button')
      ]

      for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        if (i === number) {
          elem.classList.add('palette-item-selected');
        } else {
          elem.classList.remove('palette-item-selected');
        }
      }
    },

    onCompulsoryOpSelected: function(evt) {
      var vm = this;
      if (evt.operator) {
        var indx = vm.compulsoryOps.indexOf(evt.operator);
        if (indx === -1) {
          vm.compulsoryOps.push(evt.operator);
        } else {
          vm.selectCompulsoryOpItems(vm.compulsoryOps, true);
          vm.compulsoryOps = removeEntryFromArray(vm.compulsoryOps, indx);
        }
        vm.selectCompulsoryOpItems(vm.compulsoryOps);
        vm.sugarPopup.log("Compulsory Operator Has Been Changed");
      }
    },

    selectCompulsoryOpItems: function(compulsoryOps, deselect) {
      for (var i = 0; i < compulsoryOps.length; i++) {
        var elem;
        switch (compulsoryOps[i]) {
          case '+':
            elem = document.getElementById('plus-cmpOp');
            break;
          case '-':
            elem = document.getElementById('minus-cmpOp');
            break;
          case '/':
            elem = document.getElementById('divide-cmpOp');
            break;
          case '*':
            elem = document.getElementById('multiply-cmpOp');
            break;
        }
        if (deselect) {
          elem.classList.add("palette-button-notselected");
        } else {
          elem.classList.remove("palette-button-notselected");
        }
      }
      if (compulsoryOps.length != 0) {
        document.getElementById('compulsory-op-button').style.backgroundImage = 'url(./icons/compulsory-op-imp.svg)';
      } else {
        document.getElementById('compulsory-op-button').style.backgroundImage = 'url(./icons/compulsory-op.svg)';
      }
    },

    fullscreen: function() {
      this.$refs.SugarToolbar.hide();
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 0);
    },

    unfullscreen: function() {
      this.$refs.SugarToolbar.show();
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 0);
    },

    onStop: function() {
      var vm = this;
      var context = {
        currentScreen: vm.currentScreen,
        mode: vm.mode,
        level: vm.level,
        questions: vm.questions,
        qNo: vm.qNo,
        score: vm.score,
        scores: vm.scores,
        clock: vm.clock,
        timeTaken: vm.timeTaken,
        prevTimeStones: vm.prevTimeStones,
        slots: vm.slots,
        prev: vm.prev,
        inputNumbers: vm.inputNumbers,
        inputNumbersTypes: vm.inputNumbersTypes,
        noOfHintsUsed: vm.noOfHintsUsed,
        compulsoryOps: vm.compulsoryOps,
      }

      vm.SugarJournal.saveData(context);
    },

    onJournalNewInstance: function() {
      console.log("New instance");
    },

    onJournalDataLoaded: function(data, metadata) {
      var vm = this;
      console.log("Existing instance");
      console.log(data);

      vm.currentScreen = data.currentScreen;
      vm.mode = data.mode;
      vm.level = data.level;
      vm.clock = data.clock;
      vm.$set(vm.clock, 'previousTime', new Date());
      vm.questions = data.questions;
      vm.qNo = data.qNo;
      vm.inputNumbers = data.inputNumbers;
      vm.inputNumbersTypes = data.inputNumbersTypes;
      vm.score = data.score;
      vm.scores = data.scores;
      vm.timeTaken = data.timeTaken;
      vm.prevTimeStones = data.prevTimeStones;
      vm.slots = data.slots;
      vm.prev = data.prev;
      vm.noOfHintsUsed = data.noOfHintsUsed;
      vm.compulsoryOps = data.compulsoryOps;

      //update compulsoryOpsRem
      vm.updateCompulsoryOpsRem();
      //generating hint
      vm.generateHint();
      //select Palettes items
      vm.selectDifficultyItem(vm.level);
      vm.selectCompulsoryOpItems(vm.compulsoryOps);
      vm.selectTimerItem(vm.clock.type);

    },

    onJournalLoadError: function(error) {
      console.log("Error loading from journal");
    },

    onNetworkDataReceived: function(msg) {
      var vm = this;
      if (vm.SugarPresence.getUserInfo().networkId === msg.user.networkId) {
        var vm = this;
        return;
      }
      switch (msg.content.action) {
        case 'start-game':
          var data = msg.content.data;
          if (!vm.multiplayerPlaying) {
            vm.multiplayerPlaying = true;
            vm.questions = data.questions;
            vm.qNo = 0;
            vm.level = data.level;
            vm.compulsoryOps = data.compulsoryOps;
            vm.mode = 'timer';
            vm.$set(vm.clock, 'type', data.clockType);
            vm.$set(vm.clock, 'initial', data.clockInitial);
            vm.$set(vm.clock, 'previousTime', new Date());

            //update inputNumbers
            vm.inputNumbers = vm.questions[vm.qNo].inputNumbers;
            vm.inputNumbersTypes = [0, 0, 0, 0, 0];

            if (vm.currentScreen !== 'game') {
              vm.currentScreen = 'game';
            }

            vm.selectDifficultyItem(vm.level);
            vm.selectCompulsoryOpItems(vm.compulsoryOps);
            vm.selectTimerItem(vm.clock.type);

            vm.disableButtons();
            vm.newGame(true);
          }
          break;

        case 'update-players':
          var data = msg.content.data;
          vm.playersAll = data.playersAll;
          vm.playersPlaying = data.playersPlaying;
          vm.connectedPlayers = data.playersPlaying;
          //enable the buttons if the user is host and no one is playing
          //...
          break;

        case 'add-questions':
          if (vm.connectedPlayers[0].networkId === vm.SugarPresence.getUserInfo().networkId) {
            console.log('update');
            var questions = vm.questionsGenerator.generate(vm.level, 10);
            vm.questions = vm.questions.concat(questions);

            vm.SugarPresence.sendMessage({
              user: this.SugarPresence.getUserInfo(),
              content: {
                action: 'update-questions',
                data: {
                  questions: vm.questions
                }
              }
            });
          }
          break;

        case 'update-questions':
          var data = msg.content.data;
          vm.questions = data.questions;
          break;
      }
    },

    onNetworkUserChanged: function(msg) {
      var vm = this;

      if (msg.move === 1) {
        //handling by the host only
        if (vm.SugarPresence.isHost) {
          var player = {
            user: msg.user,
            score: null,
            totalTime: null
          }
          vm.playersAll.push(player);
          vm.playersPlaying.push(msg.user);
          vm.connectedPlayers.push(msg.user);

          vm.SugarPresence.sendMessage({
            user: this.SugarPresence.getUserInfo(),
            content: {
              action: 'update-players',
              data: {
                playersAll: vm.playersAll,
                playersPlaying: vm.playersPlaying,
                connectedPlayers: vm.connectedPlayers,
              }
            }
          });

          vm.SugarPresence.sendMessage({
            user: this.SugarPresence.getUserInfo(),
            content: {
              action: 'start-game',
              data: {
                questions: vm.questions,
                clockType: vm.clock.type,
                clockInitial: vm.clock.initial,
                level: vm.level,
                compulsoryOps: vm.compulsoryOps,
              }
            }
          });
        }
      } else {
        vm.playersPlaying = vm.playersPlaying.filter(function(user) {
          return user.name !== msg.user.name
        });
        vm.connectedPlayers = vm.connectedPlayers.filter(function(user) {
          return user.name !== msg.user.name
        });
      }

    },
  }
});
