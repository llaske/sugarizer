// Rebase require directory
requirejs.config({
  baseUrl: "lib",
  paths: {
    activity: "../js"
  }
});

// Vue main app
const app = Vue.createApp({
  components: {
    'game': Game,
    'result': Result,
    'leaderboard': Leaderboard,
    'slots': Slots,
    'clock': Clock,
    'sugar-activity': SugarActivity,
    'input-number': InputNumber,
    'sugar-toolitem': SugarToolitem,
    'sugar-toolbar': SugarToolbar,
    'sugar-journal': SugarJournal,
    'sugar-localization': SugarLocalization,
    'sugar-presence': SugarPresence,
    'sugar-tutorial': SugarTutorial,
    'sugar-popup': SugarPopup,
    'sugar-icon': SugarIcon
  },
  data: function() {
    return {
      currentScreen: null,
      strokeColor: '#f0d9b5',
      fillColor: '#b58863',
      currentenv: null,
      SugarPresence: null,
      SugarJournal: null,
      sugarPopup: null,
      mode: 'non-timer',
      score: 0,
      level: 0,
      compulsoryOps: [],
      compulsoryOpsRem: [],
      compulsoryOpsForEachQuestion: [],
      timer: null,
      clock: {
        active: false,
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
      connectedPlayers: [], //connectedPlayers[0] will be the host in multiplayer game
      playersPlaying: [],
      multiplayer: false,
      disabled: false,
      startGameConfig: null,
      l10n: {
        stringNetwork: '',
        stringUndo: '',
        stringRedo: '',
        stringTimer: '',
        stringDifficultyLevel: '',
        stringCompulsoryOperators: '',
        stringHint: '',
        stringTutorial: '',
        stringFullscreen: '',
        stringUnfullscreen: '',
        stringStop: '',
        stringScore: '',
        stringTotalScore: '',
        stringTotalTime: '',
        stringRank: '',
        stringUser: '',
        stringNoHint: '',
        stringTutoExplainTitle: '',
        stringTutoExplainContent: '',
        stringTutoAboutTitle: '',
        stringTutoAboutContent: '',
        stringTutoEachPuzzleTitle: '',
        stringTutoEachPuzzleContent: '',
        stringTutoInputNumbersTitle: '',
        stringTutoInputNumbersContent: '',
        stringTutoTargetTitle: '',
        stringTutoTargetContent: '',
        stringTutoOperatorsTitle: '',
        stringTutoOperatorsContent: '',
        stringTutoSlotsTitle: '',
        stringTutoSlotsContent: '',
        stringTutoHowToPlayTitle: '',
        stringTutoHowToPlayContent: '',
        stringTutoPassTitle: '',
        stringTutoPassContent: '',
        stringTutoValidateTitle: '',
        stringTutoValidateContent: '',
        stringTutoScoreTitle: '',
        stringTutoScoreContent: '',
        stringTutoCompulsoryOpTitle: '',
        stringTutoCompulsoryOpContent: '',
        stringTutoHintTitle: '',
        stringTutoHintContent: '',
        stringTutoLevelTitle: '',
        stringTutoLevelContent: '',
        stringTutoTimerTitle: '',
        stringTutoTimerContent: '',
        stringTutoGameActionsTitle: '',
        stringTutoGameActionsContent: '',
        stringTutoUndoTitle: '',
        stringTutoUndoContent: '',
        stringTutoRedoTitle: '',
        stringTutoRedoContent: '',
        stringTutoUselessOpsTitle: '',
        stringTutoUselessOpsContent: '',
        stringTutoResultTitle: '',
        stringTutoResultContent: '',
        stringTutoBestSolnTitle: '',
        stringTutoBestSolnContent: '',
        stringTutoMySolnTitle: '',
        stringTutoMySolnContent: '',
        stringTutoClockInfoTitle: '',
        stringTutoClockInfoContent: '',
        stringTutoScoreInfoTitle: '',
        stringTutoScoreInfoContent: '',
        stringTutoRestartTitle: '',
        stringTutoRestartContent: '',
        stringTutoPaginationTitle: '',
        stringTutoPaginationContent: '',
        stringTutoLeaderboardPaginationTitle: '',
        stringTutoLeaderboardPaginationContent: '',
        stringTutoLeaderboardMainTitle: '',
        stringTutoLeaderboardMainContent: '',
        stringTutoGoBackFromLeaderboardTitle: '',
        stringTutoGoBackFromLeaderboardContent: '',
      }
    }
  },
  created: function() {
    var vm = this;
    window.addEventListener('localized', (e) => {
      e.detail.l10n.localize(vm.l10n);
    }, { once: true });
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
  computed: {
    isTargetAcheived: function() {
      var vm = this;
      //check if the target acheived
      var currentRes = null;
      if (vm.slots[vm.qNo].length != 0) {
        currentRes = vm.slots[vm.qNo][vm.slots[vm.qNo].length - 1].res;
        if (vm.compulsoryOpsRem.length === 0 && currentRes === vm.questions[vm.qNo].targetNum) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    }
  },
  watch: {
    currentScreen: function() {
      var vm = this;
      if (vm.currentScreen === 'game') {
        if (!vm.multiplayer) {
          vm.newGame();
        }
        vm.startClock();
      }
    },

    slots: {
      handler() {
        var vm = this;
        vm.updateUselessOperations();
        vm.updateCompulsoryOpsRem();
        //close hintPalette
        vm.$refs.hintPalette.paletteObject.popDown();
        vm.generateHint();
      },
      deep: true
    },

    compulsoryOps: {
      handler() {
        var vm = this;
        vm.updateUselessOperations();
        vm.updateCompulsoryOpsRem();
        vm.generateHint();
      },
      deep: true
    },

    qNo: function() {
      var vm = this;
      vm.redoStack = [];
      vm.next = [];
      vm.prev = [];
      vm.noOfHintsUsed = [];

      var tmp = vm.questions.length - vm.qNo;
      if (tmp === 10) {
        if (vm.multiplayer && !vm.SugarPresence.isHost) {
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

          if (vm.multiplayer && vm.SugarPresence.isHost) {
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
    },

    playersPlaying: {
      handler() {
        var vm = this;
        if (vm.playersPlaying.length === 0 && vm.SugarPresence.isHost) {
          vm.disabled = false;
        } else {
          vm.disabled = true;
        }
      },
      deep: true
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
      //Initialize hintsGenerator
      vm.hintsGenerator = new HintsGenerator();

      vm.currentScreen = "game";

    },

    startClock: function() {
      var vm = this;
      vm.clock['time'] = vm.clock.initial;
      vm.clock['active'] = true;
      if (vm.timer === null) {
        vm.tick();
      }
    },

    stopClock: function() {
      var vm = this;
      if (vm.timer) {
        clearInterval(vm.timer);
      }
      vm.timer = null;
      vm.clock['active'] = false;
    },

    pulseEffect: function() {
      let vm = this;
      let pulseMainEle = document.querySelector('.pulse-main');
      if (pulseMainEle) {
        pulseMainEle.classList.add('pulse');
        setTimeout(() => {
          pulseMainEle.classList.remove('pulse');
        }, 600);
      }
    },

    updateCompulsoryOpsRem: function() {
      var vm = this;
      vm.compulsoryOpsRem = [];
      if (vm.slots[vm.qNo].length != 0) {
        //check if the operators used contains compulsoryOps
        for (var i = 0; i < vm.compulsoryOps.length; i++) {
          var flag = false;
          var opUsed = false;
          var opNotUsed = false;
          for (var j = 0; j < vm.slots[vm.qNo].length; j++) {
            if (vm.slots[vm.qNo][j].operator === vm.compulsoryOps[i]) {
              flag = true;
              if (vm.slots[vm.qNo][j].useless && !opUsed) {
                opNotUsed = true;
              } else {
                opNotUsed = false;
                opUsed = true;
              }
            }
          }
          if (opNotUsed) {
            vm.compulsoryOpsRem.push(vm.compulsoryOps[i]);
          } else if (!flag) {
            vm.compulsoryOpsRem.push(vm.compulsoryOps[i]);
          }
        }
      }
    },

    updateUselessOperations: function() {
      var vm = this;
      var currentRes = null;
      var slotsGood = [1, 1, 1, 1];
      if (vm.slots[vm.qNo].length != 0) {
        currentRes = vm.slots[vm.qNo][vm.slots[vm.qNo].length - 1].res;
        if (currentRes === vm.questions[vm.qNo].targetNum) {
          slotsGood = findUselessOperations(vm.slots[vm.qNo]);
        }
        for (var i = 0; i < vm.slots[vm.qNo].length; i++) {
          if (slotsGood[i] !== 1) {
            vm.slots[vm.qNo][i]['useless'] = true;
          } else {
            vm.slots[vm.qNo][i]['useless'] = false;
          }
        }
      }
    },

    generateHint: function() {
      var vm = this;
      var slots = vm.hintsGenerator.generate(vm.inputNumbers, vm.questions[vm.qNo].targetNum, vm.compulsoryOpsRem, vm.slots[vm.qNo]);
      var hint = slots.shift();
      if (hint) {
        var operator = hint[1];
        if (operator === '*') {
          operator = 'x';
        }
        var nextSlot = hint[0].val + ' ' + operator + ' ' + hint[2].val + ' = ' + hint[3];
      } else {
        var nextSlot = vm.l10n.stringNoHint;
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
      vm.clock['time'] = vm.clock.initial;
      if (!joined) {
        vm.generateQuestionSet();
      }
    },

    onMultiplayerGameStarted: function(restarted) {
      var vm = this;
      vm.multiplayer = true;
      //disable the buttons
      vm.disabled = true;

      if (vm.mode === 'non-timer') {
        vm.mode = 'timer'
        vm.clock['initial'] = 2 * 60;
        vm.clock['type'] = 1;
        vm.selectTimerItem(vm.clock.type);
      }
      var compulsoryOps = vm.compulsoryOps.filter(function() {
        return true;
      });

      vm.startGameConfig = {
        level: vm.level,
        clockType: vm.clock.type,
        clockInitial: vm.clock.initial,
        compulsoryOps: compulsoryOps,
      }

      var user = {
        colorvalue: vm.currentenv.user.colorvalue,
        name: vm.currentenv.user.name,
        networkId: vm.currentenv.user.networkId
      }
      if (!restarted) {
        var player = {
          user: user,
          score: null
        }
        vm.playersAll.push(player);
        vm.connectedPlayers.push(user);

      } else {
        vm.playersAll = [];
        for (var i = 0; i < vm.connectedPlayers.length; i++) {
          vm.playersAll.push({
            user: vm.connectedPlayers[i],
            score: null
          })
        }
      }
      vm.playersPlaying.push(user);

      vm.newGame();

      if (vm.currentScreen !== 'game') {
        vm.currentScreen = 'game';
      }

      if (vm.SugarPresence.isHost && restarted) {
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
              type: 'restart',
              questions: vm.questions,
              clockType: vm.startGameConfig.clockType,
              clockInitial: vm.startGameConfig.clockInitial,
              level: vm.startGameConfig.level,
              compulsoryOps: vm.startGameConfig.compulsoryOps,
            }
          }
        });
      }

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

      var slots = vm.slots[vm.qNo];
      var scr = calculateScoreFromSlots(slots, timeTaken, totalHints);
      vm.score += scr;
      vm.scores.push(scr)

      if (vm.mode === 'non-timer') {
        vm.stopClock();
        vm.currentScreen = "result";
      } else {
        //go to next question in question set for timer mode
        vm.qNo++;
        vm.slots[vm.qNo] = [];
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

      vm.timer = setInterval(function() {
        if (vm.clock.active) {
          if (vm.mode === 'timer') {
            vm.clock['time'] = vm.clock.time - 1;
            if (vm.clock.time <= 0) {
              //end game
              vm.stopClock();
              vm.slots[vm.qNo] = [];
              vm.score += 0;
              vm.scores.push(0)
              vm.pushTimeTaken();
              //cloning array
              var compulsoryOps = vm.compulsoryOps.filter(function() {
                return true;
              })
              vm.compulsoryOpsForEachQuestion.push(compulsoryOps);
              //change currentScreen
              if (vm.multiplayer) {
                for (var i = 0; i < vm.playersAll.length; i++) {
                  if (vm.playersAll[i].user.networkId === vm.currentenv.user.networkId && vm.playersAll[i].score === null) {
                    vm.playersAll[i]['score'] = vm.score;
                    break;
                  }
                }

                vm.playersPlaying = vm.playersPlaying.filter(function(user) {
                  return user.networkId !== vm.currentenv.user.networkId
                })

                if (vm.SugarPresence.isHost && vm.playersPlaying.length === 0) {
                  vm.disabled = false;
                }

                vm.SugarPresence.sendMessage({
                  user: vm.SugarPresence.getUserInfo(),
                  content: {
                    action: 'game-over',
                    data: {
                      score: vm.score
                    }
                  }
                });
                vm.currentScreen = "result";
              } else {
                vm.currentScreen = "result";
              }
            }
          } else {
            vm.clock['time'] = vm.clock.time + 1;
          }
        }
      }, 1000);
    },

    handleRestartButton: function() {
      var vm = this;
      if (vm.currentScreen === 'game') {
        vm.stopClock();
        vm.slots[vm.qNo] = [];
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
        if (vm.SugarPresence && vm.SugarPresence.isHost) {
          vm.onMultiplayerGameStarted(true)
        }
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
          vm.stopClock();
          vm.slots = [
            []
          ];
          //change currentScreen
          vm.currentScreen = "result";
        } else {
          vm.pulseEffect();
          //go to next question in question set for timer mode
          vm.slots[vm.qNo] = [];
          vm.qNo++;
          vm.slots[vm.qNo] = [];
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
        vm.pulseEffect();
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
      vm.pulseEffect();
      switch (evt.index) {
        case 0:
          vm.mode = 'non-timer';
          vm.clock['initial'] = 0;
          vm.clock['type'] = 0;
          break;
        case 1:
          vm.mode = 'timer';
          vm.clock['initial'] = 2 * 60;
          vm.clock['type'] = 1;
          break;
        case 2:
          vm.mode = 'timer';
          vm.clock['initial'] = 5 * 60;
          vm.clock['type'] = 2;
          break;
        case 3:
          vm.mode = 'timer'
          vm.clock['initial'] = 10 * 60;
          vm.clock['type'] = 3;
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

      vm.mode = data.mode;
      vm.level = data.level;
      vm.compulsoryOps = data.compulsoryOps;
      vm.clock = data.clock;
      if (!data.clock.active) {
        vm.stopClock();
      }
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
      if (data.currentScreen === 'game' || data.currentScreen === 'result') {
        vm.currentScreen = data.currentScreen;
      } else {
        vm.currentScreen = 'result';
      }

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

    onActivityShared: function(event, paletteObject) {
      this.onMultiplayerGameStarted();
      // Usual behaviour call
      this.SugarPresence.onShared(event, paletteObject);
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
          if ((!vm.multiplayer && data.type === 'init') || (vm.multiplayer && data.type === 'restart')) {
            vm.multiplayer = true;
            vm.startGameConfig = {
              level: data.level,
              clockType: data.clockType,
              clockInitial: data.clockInitial,
              compulsoryOps: data.compulsoryOps
            }
            vm.questions = data.questions;
            vm.qNo = 0;
            vm.level = data.level;
            vm.compulsoryOps = data.compulsoryOps;
            vm.mode = 'timer';
            vm.clock['type'] = data.clockType;
            vm.clock['initial'] = data.clockInitial;
            if (!vm.clock.active) {
              vm.startClock();
            }

            //update inputNumbers
            vm.inputNumbers = vm.questions[vm.qNo].inputNumbers;
            vm.inputNumbersTypes = [0, 0, 0, 0, 0];

            if (vm.currentScreen !== 'game') {
              vm.currentScreen = 'game';
            }

            vm.selectDifficultyItem(vm.level);
            vm.selectCompulsoryOpItems(vm.compulsoryOps);
            vm.selectTimerItem(vm.clock.type);

            vm.disabled = true;
            vm.newGame(true);
          }
          break;

        case 'game-over':
          var data = msg.content.data;
          for (var i = 0; i < vm.playersAll.length; i++) {
            if (vm.playersAll[i].user.networkId === msg.user.networkId && vm.playersAll[i].score === null) {
              vm.playersAll[i]['score'] = data.score;
              break;
            }
          }
          vm.playersPlaying = vm.playersPlaying.filter(function(user) {
            return user.networkId !== msg.user.networkId
          })
          if (vm.SugarPresence.isHost && vm.playersPlaying.length === 0) {
            vm.disabled = false;
          }
          break;

        case 'update-players':
          var data = msg.content.data;
          vm.playersAll = data.playersAll;
          vm.playersPlaying = data.playersPlaying;
          vm.connectedPlayers = data.connectedPlayers;
          //enable the buttons if the user is host and no one is playing
          if (vm.SugarPresence.isHost && vm.playersPlaying.length === 0) {
            vm.disabled = false;
          }
          break;

        case 'add-questions':
          if (vm.SugarPresence.isHost) {
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
            score: null
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
                type: 'init',
                questions: vm.questions,
                clockType: vm.startGameConfig.clockType,
                clockInitial: vm.startGameConfig.clockInitial,
                level: vm.startGameConfig.level,
                compulsoryOps: vm.startGameConfig.compulsoryOps,
              }
            }
          });
        }

      } else {
        vm.playersPlaying = vm.playersPlaying.filter(function(user) {
          return user.networkId !== msg.user.networkId
        });

        for (var i = 0; i < vm.playersAll.length; i++) {
          if (vm.playersAll[i].user.networkId === msg.user.networkId && vm.playersAll[i].score === null) {
            vm.playersAll[i]['score'] = 0;
            break;
          }
        }

        vm.connectedPlayers = vm.connectedPlayers.filter(function(user) {
          return user.networkId !== msg.user.networkId
        });
        vm.SugarPresence.isHost = vm.connectedPlayers[0].networkId === vm.SugarPresence.getUserInfo().networkId ? true : false;
      }

    },


    onHelp: function() {
      var vm = this;
      var steps = [];
      if (vm.currentScreen === 'leaderboard') {
        steps = [{
            element: ".leaderboard-main",
            position: "top",
            title: this.l10n.stringTutoLeaderboardMainTitle,
            intro: this.l10n.stringTutoLeaderboardMainContent
          },
          {
            element: ".btn-back-block",
            position: "auto top",
            title: this.l10n.stringTutoGoBackFromLeaderboardTitle,
            intro: this.l10n.stringTutoGoBackFromLeaderboardContent
          },
          {
            element: ".page-no",
            position: "auto top",
            title: this.l10n.stringTutoLeaderboardPaginationTitle,
            intro: this.l10n.stringTutoLeaderboardPaginationContent
          },
        ];
      } else if (vm.currentScreen === 'result') {
        steps = [{
            title: this.l10n.stringTutoResultTitle,
            intro: this.l10n.stringTutoResultContent
          },
          {
            element: ".best-solution",
            position: "auto left",
            title: this.l10n.stringTutoBestSolnTitle,
            intro: this.l10n.stringTutoBestSolnContent
          },
          {
            element: ".my-solution",
            position: "auto right",
            title: this.l10n.stringTutoMySolnTitle,
            intro: this.l10n.stringTutoMySolnContent
          },
          {
            element: ".clock-info-block",
            position: "auto bottom",
            title: this.l10n.stringTutoClockInfoTitle,
            intro: this.l10n.stringTutoClockInfoContent
          },
          {
            element: ".score-info-block",
            position: "auto bottom",
            title: this.l10n.stringTutoScoreInfoTitle,
            intro: this.l10n.stringTutoScoreInfoContent
          },
          {
            element: ".btn-restart-block",
            position: "auto top",
            title: this.l10n.stringTutoRestartTitle,
            intro: this.l10n.stringTutoRestartContent
          },
          {
            element: ".page-no",
            position: "auto top",
            title: this.l10n.stringTutoPaginationTitle,
            intro: this.l10n.stringTutoPaginationContent
          },
        ];
      } else if (vm.currentScreen === 'game') {
        steps = [{
            title: this.l10n.stringTutoExplainTitle,
            intro: this.l10n.stringTutoExplainContent
          },
          {
            title: this.l10n.stringTutoEachPuzzleTitle,
            intro: this.l10n.stringTutoEachPuzzleContent
          },
          {
            element: ".list-numbers",
            position: "right",
            title: this.l10n.stringTutoInputNumbersTitle,
            intro: this.l10n.stringTutoInputNumbersContent
          },
          {
            element: "#target-number",
            position: "bottom",
            title: this.l10n.stringTutoTargetTitle,
            intro: this.l10n.stringTutoTargetContent
          },
          {
            element: ".list-operators",
            position: "auto top",
            title: this.l10n.stringTutoOperatorsTitle,
            intro: this.l10n.stringTutoOperatorsContent
          },
          {
            element: ".slots-area-main",
            position: "auto left",
            title: this.l10n.stringTutoSlotsTitle,
            intro: this.l10n.stringTutoSlotsContent
          },
          {
            title: this.l10n.stringTutoHowToPlayTitle,
            intro: this.l10n.stringTutoHowToPlayContent
          },
          {
            title: this.l10n.stringTutoAboutTitle,
            intro: this.l10n.stringTutoAboutContent
          },
          {
            element: ".slots-area-footer",
            position: "top",
            title: this.l10n.stringTutoGameActionsTitle,
            intro: this.l10n.stringTutoGameActionsContent
          },
          {
            title: this.l10n.stringTutoScoreTitle,
            intro: this.l10n.stringTutoScoreContent
          },
          {
            element: "#compulsory-op-button",
            position: "bottom",
            title: this.l10n.stringTutoCompulsoryOpTitle,
            intro: this.l10n.stringTutoCompulsoryOpContent
          },
          {
            element: "#hint-button",
            position: "bottom",
            title: this.l10n.stringTutoHintTitle,
            intro: this.l10n.stringTutoHintContent
          },
          {
            element: "#level-button",
            position: "bottom",
            title: this.l10n.stringTutoLevelTitle,
            intro: this.l10n.stringTutoLevelContent
          },
          {
            element: "#timer-button",
            position: "bottom",
            title: this.l10n.stringTutoTimerTitle,
            intro: this.l10n.stringTutoTimerContent
          },
          {
            element: "#undo-button",
            position: "bottom",
            title: this.l10n.stringTutoUndoTitle,
            intro: this.l10n.stringTutoUndoContent
          },
          {
            element: "#redo-button",
            position: "bottom",
            title: this.l10n.stringTutoRedoTitle,
            intro: this.l10n.stringTutoRedoContent
          },
          {
            title: this.l10n.stringTutoUselessOpsTitle,
            intro: this.l10n.stringTutoUselessOpsContent
          },
        ];
      } else {
        steps = [{
          title: this.l10n.stringTutoExplainTitle,
          intro: this.l10n.stringTutoExplainContent
        }, ];
      }

      this.$refs.SugarTutorial.show(steps);
    },

  }
});

app.mount('#app');