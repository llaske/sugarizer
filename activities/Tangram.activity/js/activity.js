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
    'dataset-list': DatasetList,
    'setting-editor': SettingEditor,
    'categoryForm': CategoryForm,
    'leaderboard': Leaderboard,
  },
  data: {
    currentScreen: "",
    strokeColor: '#f0d9b5',
    fillColor: '#b58863',
    currentenv: null,
    SugarL10n: null,
    SugarPresence: null,
    SugarJournal: null,
    SugarPopup: null,
    DataSetHandler: null,
    mode: 'non-timer',
    view: 'play',
    score: 0,
    level: 0,
    gameLevelBonus: false,
    timer: null,
    clock: {
      active: false,
      time: 0,
      initial: 0,
      type: 0,
    },
    timeMarks: [],
    tangramCategories: ["Animals"],
    puzzles: [],
    pNo: 0,
    gameTans: [],
    userResponse: [],
    gameOver: null,
    hintNumber: 0,
    hintsUsed: [false, false, false, false, false, false, false],
    noOfHintsUsed: 0,
    showHint: false,
    gameScale: 1,
    gameStage: {
      width: 1,
      height: 1,
    },
    tanColors: ["blue", "purple", "red", "green", "yellow", "yellow"],
    puzzleToBeEdited: null,
    categoryToBeEdited: null,
    puzzleChosen: null,
    playersAll: [],
    connectedPlayers: [], //connectedPlayers[0] will be the host in multiplayer game
    playersPlaying: [],
    multiplayer: false,
    disabled: false,
    startGameConfig: null,
    l10n: {
      stringNetwork: '',
      stringView: '',
      stringRandom: '',
      stringTimer: '',
      stringDifficultyLevel: '',
      stringNewCategory: '',
      stringCategory: '',
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
      stringConfirm: '',
      stringCancel: '',
      stringTitle: '',
      stringNewTitle: '',
      stringHintsUsed: '',
      stringMyTangram: '',
      stringEasy: '',
      stringHard: '',
      stringTangramDifficulty: '',
      stringValidPuzzle: '',
      stringInvalidShape: '',
      stringInvalidName: '',
      stringTutoExplainTitle: '',
      stringTutoExplainContent: '',
      stringTutoAboutTitle: '',
      stringTutoAboutContent: '',
      stringTutoEachPuzzleTitle: '',
      stringTutoEachPuzzleContent: '',
      stringTutoTangramCategoryTitle: '',
      stringTutoTangramCategoryContent: '',
      stringTutoTargetTitle: '',
      stringTutoTargetContent: '',
      stringTutoBoardTitle: '',
      stringTutoBoardContent: '',
      stringTutoRefreshTitle: '',
      stringTutoRefreshContent: '',
      stringTutoNewCategoryTitle: '',
      stringTutoNewCategoryContent: '',
      stringTutoSettingViewTitle: '',
      stringTutoSettingViewContent: '',
      stringTutoScoreTitle: '',
      stringTutoScoreContent: '',
      stringTutoRandomPlayTitle: '',
      stringTutoRandomPlayContent: '',
      stringTutoHintTitle: '',
      stringTutoHintContent: '',
      stringTutoLevelTitle: '',
      stringTutoLevelContent: '',
      stringTutoTimerTitle: '',
      stringTutoTimerContent: '',
      stringTutoGameActionsTitle: '',
      stringTutoGameActionsContent: '',
      stringTutoViewTitle: '',
      stringTutoViewContent: '',
      stringTutoRedoTitle: '',
      stringTutoRedoContent: '',
      stringTutoKeyBoardTitle: '',
      stringTutoKeyBoardContent: '',
      stringTutoValidPuzzleIndicatorTitle: '',
      stringTutoValidPuzzleIndicatorContent: '',
      stringTutoResultTitle: '',
      stringTutoResultContent: '',
      stringTutoTangramCardTitle: '',
      stringTutoTangramCardContent: '',
      stringTutoNewPuzzleTitle: '',
      stringTutoNewPuzzleContent: '',
      stringTutoClockInfoTitle: '',
      stringTutoClockInfoContent: '',
      stringTutoScoreInfoTitle: '',
      stringTutoScoreInfoContent: '',
      stringTutoRestartTitle: '',
      stringTutoRestartContent: '',
      stringTutoLeaderboardPaginationTitle: '',
      stringTutoLeaderboardPaginationContent: '',
      stringTutoLeaderboardMainTitle: '',
      stringTutoLeaderboardMainContent: '',
      stringTutoGoBackTitle: '',
      stringTutoGoBackContent: '',
      stringTutoPlayViewTitle: '',
      stringTutoPlayViewContent: '',
      stringTutoRandomButtonTitle: '',
      stringTutoRandomButtonContent: '',
      stringTutoBoardEditorTitle: '',
      stringTutoBoardEditorContent: '',
      stringTutoValidPuzzleTitle: '',
      stringTutoValidPuzzleContent: '',
      stringTutoCategoryNameTitle: '',
      stringTutoCategoryNameContent: '',
      stringTutoEditPuzzleTitle: '',
      stringTutoEditPuzzleContent: '',
      stringTutoDeletePuzzleTitle: '',
      stringTutoDeletePuzzleContent: '',
      stringTutoEditCategoryTitle: '',
      stringTutoEditCategoryContent: '',
      stringTutoDeleteCategoryTitle: '',
      stringTutoDeleteCategoryContent: '',
    }
  },

  created: function () {
    Konva.Util.getRandomColor = function (){
			var randColor = ((Math.random() * 0xadcea0) << 0).toString(15);
			while (randColor.length < 6) {
				randColor = `0${randColor}`;
			}
			return `#${randColor}`;
		}
  },

  watch: {
    currentScreen: function() {
      var vm = this;
      document.getElementById("spinner").style.visibility = "visible";
      if (vm.currentScreen === 'game') {
        if (!vm.multiplayer) {
          vm.newGame();
        }
        if (!vm.clock.active && vm.gameOver === null) {
          vm.startClock();
        }
      } else if (vm.currentScreen === 'dataset-list') {
        if (vm.tangramCategories[0] === "Random" || vm.tangramCategories.length > 1) {
          vm.onTangramCategorySelected({
            index: "Animals"
          });
        }
      }

      if (vm.currentScreen !== 'setting-editor') {
        vm.puzzleToBeEdited = null;
      }
      if (vm.currentScreen !== 'categoryForm') {
        vm.categoryToBeEdited = null;
      }

      if (vm.currentScreen !== 'game') {
        vm.puzzleChosen = null;
      }
    },

    pNo: function() {
      let vm = this;
      vm.gameOver = null;
      vm.hintNumber = 0;
      vm.hintsUsed = [false, false, false, false, false, false, false];
      if (!vm.Level) {
        vm.gameLevelBonus = false;
      } else {
        vm.gameLevelBonus = true;
      }
      let populated = vm.populatePuzzles(vm.puzzles[vm.pNo].tangram.tans);
      vm.$set(vm.puzzles[vm.pNo], 'targetTans', populated.targetTans);
      vm.$set(vm.puzzles[vm.pNo], 'outline', computeOutline(vm.puzzles[vm.pNo].tangram.tans, true));

      vm.noOfHintsUsed = 0;
      let tmp = vm.puzzles.length - vm.pNo;
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
          let puzzles = vm.generatePuzzles(10, true);
          vm.puzzles = vm.puzzles.concat(puzzles);

          if (vm.multiplayer && vm.SugarPresence.isHost) {
            //update the questions set among all others users if you are the maintainer in multiplayer game
            vm.SugarPresence.sendMessage({
              user: this.SugarPresence.getUserInfo(),
              content: {
                action: 'update-questions',
                data: {
                  puzzles: puzzles
                }
              }
            });
          }
        }
      }
      //only when net is too slow
      if (tmp <= 5 && vm.multiplayer && !vm.SugarPresence.isHost) {
        let puzzles = vm.generatePuzzles(5, true);
        vm.puzzles = vm.puzzles.concat(puzzles);
      }
      vm.centerTangram();
    },

    'DataSetHandler.AllCategories': function(newVal, oldVal) {
      this.fillCategoryPalette();
    },

    playersPlaying: function() {
      var vm = this;
      if (vm.playersPlaying.length === 0 && vm.SugarPresence.isHost) {
        vm.disabled = false;
      } else {
        vm.disabled = true;
      }
    }
  },

  mounted: function() {
    this.SugarJournal = this.$refs.SugarJournal;
    this.SugarL10n = this.$refs.SugarL10n;
    this.SugarPresence = this.$refs.SugarPresence;
    this.DataSetHandler = this.$refs.DataSetHandler;
    this.SugarPresence = this.$refs.SugarPresence;
    this.SugarPopup = this.$refs.SugarPopup;
    generating = false;
  },

  methods: {
    initialized: function() {
      let vm = this;
      // Initialize Sugarizer
      vm.currentenv = vm.$refs.SugarActivity.getEnvironment();

      document.getElementById('app').style.background = vm.currentenv.user.colorvalue.stroke;
      vm.strokeColor = vm.currentenv.user.colorvalue.stroke;
      vm.fillColor = vm.currentenv.user.colorvalue.fill;

    },

    localized: function() {
      if (document.getElementById('no-timer-button')) {
        document.getElementById('no-timer-button').innerHTML = this.SugarL10n.get("NoTimer");
      }
      this.fillCategoryPalette();
      this.SugarL10n.localize(this.l10n);
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

    fillCategoryPalette: function() {
      let categoryButtonsContent = '';
      let changeCategory = true;
      for (var i = 0; i < this.DataSetHandler.AllCategories.length; i++) {
        let index = this.DataSetHandler.currentCategories.findIndex(ele => ele === this.DataSetHandler.AllCategories[i]);
        let ct = this.SugarL10n.dictionary ? this.SugarL10n.dictionary["Data" + this.DataSetHandler.AllCategories[i].replace(/ /g, "")] : null;
        let categoryTitle = ct ? ct.textContent : this.DataSetHandler.AllCategories[i];
        categoryButtonsContent += `<div id="category-button-` + (i + 1) + `" tangramcategory="` + this.DataSetHandler.AllCategories[i] + `" class="palette-item` + (index !== -1 ? ` palette-item-selected` : ``) + `">` + categoryTitle + `</div>`;
        if (this.DataSetHandler.AllCategories[i] === this.tangramCategories[0]) {
          changeCategory = false;
        }
      }
      let catButtonsEle = document.getElementById('category-buttons');
      if (catButtonsEle) {
        catButtonsEle.innerHTML = categoryButtonsContent;
        let that = this.$refs.categoryPalette.paletteObject;
        let customEvent = this.$refs.categoryPalette.paletteObject.tangramCategorySelectedEvent;
        let buttons = document.getElementById('category-buttons').children;
        for (var i = 0; i < buttons.length; i++) {
          let cat = this.DataSetHandler.AllCategories[i];
          buttons[i].addEventListener('click', function(event) {
            that.tangramCategorySelectedEvent.index = cat;
            that.getPalette().dispatchEvent(customEvent);
            that.popDown();
          });
        }
        if (changeCategory) {
          this.tangramCategories = [this.DataSetHandler.AllCategories[0]]
          this.DataSetHandler.onChangeCategory(this.tangramCategories);
          this.selectTangramCategoryItem(this.tangramCategories);
        }
      }
    },

    startClock: function() {
      var vm = this;
      vm.$set(vm.clock, 'time', vm.clock.initial);
      vm.$set(vm.clock, 'active', true);
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
      vm.$set(vm.clock, 'active', false);
    },

    pushTimeMark: function() {
      let vm = this;
      if (vm.timeMarks.length === 0) {
        vm.timeMarks.push(vm.clock.initial);
      }
      vm.timeMarks.push(vm.clock.time);
    },

    tick: function() {
      var vm = this;

      vm.timer = setInterval(function() {
        if (vm.clock.active) {
          if (vm.mode === 'timer') {
            vm.$set(vm.clock, 'time', vm.clock.time - 1);
            if (vm.clock.time <= 0) {
              //end game
              vm.stopClock();
              vm.pushTimeMark();
              let tans = [];
              vm.setUserResponse(tans);
              if (vm.multiplayer) {
                for (var i = 0; i < vm.playersAll.length; i++) {
                  if (vm.playersAll[i].user.networkId === vm.currentenv.user.networkId && vm.playersAll[i].score === null) {
                    vm.$set(vm.playersAll[i], 'score', vm.score);
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
              }
              vm.currentScreen = "result";
            }
          } else {
            vm.$set(vm.clock, 'time', vm.clock.time + 1);
          }
        }
      }, 1000);
    },

    newGame: function(joined) {
      let vm = this;
      vm.score = 0;
      vm.userResponse = [];
      vm.timeMarks = [];
      vm.pNo = 0;
      vm.gameOver = null;
      vm.hintNumber = 0;
      vm.noOfHintsUsed = 0;
      if (!vm.level) {
        vm.gameLevelBonus = false;
      } else {
        vm.gameLevelBonus = true;
      }
      //start clock from begining
      vm.startClock();
      if (!joined) {
        vm.generateQuestionSet();
      }
      vm.centerTangram();
    },

    onMultiplayerGameStarted: function(restarted) {
      var vm = this;
      vm.multiplayer = true;
      //disable the buttons
      vm.disabled = true;

      if (vm.mode === 'non-timer') {
        vm.mode = 'timer'
        vm.$set(vm.clock, 'initial', 2 * 60);
        vm.$set(vm.clock, 'type', 1);
        vm.selectTimerItem(vm.clock.type);
      }

      vm.startGameConfig = {
        level: vm.level,
        clockType: vm.clock.type,
        clockInitial: vm.clock.initial,
        tangramCategories: vm.tangramCategories
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
              puzzles: vm.puzzles,
              clockType: vm.startGameConfig.clockType,
              clockInitial: vm.startGameConfig.clockInitial,
              level: vm.startGameConfig.level,
              tangramCategories: vm.startGameConfig.tangramCategories,
            }
          }
        });
      }
    },

    generateQuestionSet: function(appendRandomTangrams) {
      var vm = this;
      if (vm.mode === 'non-timer') {
        vm.puzzles = vm.generatePuzzles(1, false);
      } else {
        vm.puzzles = vm.generatePuzzles(15, true);
      }
      vm.pNo = 0;
    },

    generatePuzzles: function(number, appendRandomTangrams) {
      let vm = this;
      let puzzles = [];
      let pNo = 0;
      while (pNo < number) {
        generating = true;
        let tang, tangramName;
        if (vm.tangramCategories[0] !== "Random") {
          let tmp;
          if (vm.puzzleChosen) {
            tmp = vm.puzzleChosen;
            vm.puzzleChosen = null;
            tang = tmp.tangram.dup();
            tangramName = tmp.name;
          } else {
            if (vm.DataSetHandler.nextArr.length === 0 && appendRandomTangrams) {
              let generatedTangrams = generateTangrams(2);
              tang = generatedTangrams[0];
              tangramName = "Random";
            } else {
              tmp = vm.DataSetHandler.generateTangramFromSet();
              tang = tmp.tangram.dup();
              tangramName = tmp.name;
            }
          }

        } else {
          let generatedTangrams = generateTangrams(2);
          tang = generatedTangrams[0];
          tangramName = "Random";
        }
        generating = false;
        if (tang.evaluation === undefined) {
          continue;
        }
        let tangDifficulty = checkDifficultyOfTangram(tang);
        tang.positionCentered();
        let puzzle = {
          name: tangramName,
          difficulty: tangDifficulty,
          tangram: tang,
          targetTans: [],
          outline: [],
          outlinePoints: [],
        };
        if (pNo === 0) {
          let tmp = vm.populatePuzzles(tang.tans);
          puzzle.targetTans = tmp.targetTans;
          puzzle.outline = [...tang.outline];
        }
        puzzles.push(puzzle);
        pNo++;
      }
      return puzzles;
    },

    populatePuzzles: function(tanObjsArr) {
      let vm = this;
      targetTans = [];
      let tans = [];
      for (var j = 0; j < tanObjsArr.length; j++) {
        let coeffIntX = tanObjsArr[j].anchor.x.coeffInt;
        let coeffSqrtX = tanObjsArr[j].anchor.x.coeffSqrt;
        let coeffIntY = tanObjsArr[j].anchor.y.coeffInt;
        let coeffSqrtY = tanObjsArr[j].anchor.y.coeffSqrt;
        let anchor = new Point(new IntAdjoinSqrt2(coeffIntX, coeffSqrtX), new IntAdjoinSqrt2(coeffIntY, coeffSqrtY));
        let targetTan = {
          id: (j + 50),
          x: 100,
          y: 100,
          offsetX: 100,
          offsetY: 100,
          anchor: null,
          pointsObjs: [],
          tanObj: new Tan(tanObjsArr[j].tanType, anchor.dup(), tanObjsArr[j].orientation),
          tanType: tanObjsArr[j].tanType,
          orientation: tanObjsArr[j].orientation,
          points: [],
          stroke: vm.fillColor,
          strokeEnabled: true,
          strokeWidth: 0.3,
          closed: true,
          lineJoin: 'round',
          shadowColor: 'black',
          shadowBlur: 10,
          shadowOpacity: 0.8,
          shadowEnabled: false,
        }
        let points = [...targetTan.tanObj.getPoints()];
        let center = targetTan.tanObj.center();

        let floatPoints = [];
        let pointsObjs = [];
        for (let j = 0; j < points.length; j++) {
          let tmpPoint = points[j].dup();
          pointsObjs.push(tmpPoint);
          floatPoints.push(tmpPoint.toFloatX());
          floatPoints.push(tmpPoint.toFloatY());
        }
        targetTan.offsetX = center.toFloatX();
        targetTan.offsetY = center.toFloatY();
        targetTan.x = targetTan.offsetX;
        targetTan.y = targetTan.offsetY;
        targetTan.points = floatPoints;
        targetTan.anchor = targetTan.tanObj.anchor.dup();
        targetTan.pointsObjs = pointsObjs;
        targetTan.stroke = vm.level === 0 ? vm.fillColor : vm.strokeColor;
        targetTans.push(targetTan);
        tans.push(targetTan.tanObj);
      }
      return {
        targetTans: targetTans,
        tans: tans
      };
    },

    centerTangram: function() {
      let vm = this;
      let targetTans = vm.puzzles[vm.pNo].targetTans;
      let scale = vm.gameScale;
      let dx = vm.gameStage.width / (3 * scale) - 30;
      let dy = vm.gameStage.height / (2 * scale) - 30;

      for (let index = 0; index < targetTans.length; index++) {
        let points = [...targetTans[index].tanObj.getPoints()];
        let center = targetTans[index].tanObj.center();
        let floatPoints = [];

        for (let j = 0; j < points.length; j++) {
          let tmpPoint = points[j].dup();
          tmpPoint.x.add(new IntAdjoinSqrt2(dx, 0));
          tmpPoint.y.add(new IntAdjoinSqrt2(dy, 0));
          floatPoints.push(tmpPoint.toFloatX());
          floatPoints.push(tmpPoint.toFloatY());
        }
        let outlinePoints = [];
        for (var i = 0; i < vm.puzzles[vm.pNo].outline.length; i++) {
          let tmp = [];
          for (var j = 0; j < vm.puzzles[vm.pNo].outline[i].length; j++) {
            tmp.push(vm.puzzles[vm.pNo].outline[i][j].toFloatX() + dx);
            tmp.push(vm.puzzles[vm.pNo].outline[i][j].toFloatY() + dy);
          }
          outlinePoints.push(tmp);
        }
        vm.$set(vm.puzzles[vm.pNo], 'outlinePoints', outlinePoints);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'points', floatPoints);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'offsetX', center.toFloatX() + dx);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'offsetY', center.toFloatY() + dy);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'x', center.toFloatX() + dx);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'y', center.toFloatY() + dy);
      }
    },

    setUserResponse: function(tans) {
      let vm = this;
      let isSolved = true;
      let bonus = vm.puzzles[vm.pNo].difficulty ? 2 : 0;
      let gameLevelBonus = vm.gameLevelBonus ? 2 : 0;

      let score;
      if (tans.length === 0) {
        //if tangram is not solved, so show computer's solution.
        isSolved = false;
        score = 0;
        for (var i = 0; i < 7; i++) {
          let targetTan = vm.puzzles[vm.pNo].targetTans[i];
          tans.push(targetTan.tanObj);
        }
      } else {
        score = 6 - Math.min(6, vm.noOfHintsUsed) + Math.max(0, 15 - Math.floor(Math.abs(vm.timeMarks[vm.pNo + 1] - vm.timeMarks[vm.pNo]) / 4)) + bonus + gameLevelBonus;
      }
      vm.score += score;
      vm.$set(vm.userResponse, vm.pNo, {
        isSolved: isSolved,
        score: score,
        tans: tans
      });
    },

    onConfigChanged: function(data) {
      this.gameScale = data.scale;
      this.gameStage.width = data.stageWidth;
      this.gameStage.height = data.stageHeight;
    },

    onUpdateTansPlaced: function(data) {
      let vm = this;
      if (vm.gameOver) {
        return;
      }
      let remaining = [true, true, true, true, true, true, true];
      for (var i = 0; i < 7; i++) {
        let targetTanIndex = data[i];
        if (targetTanIndex != -1) {
          remaining[targetTanIndex] = false;
        }
      }
      for (var i = 0; i < remaining.length; i++) {
        if (remaining[i]) {
          vm.hintNumber = i;
          break;
        }
      }
    },

    onTangramStatus: function(data) {
      let vm = this;
      if (vm.gameOver) {
        return;
      }
      let res = data.res;
      for (var i = 0; i < vm.puzzles[vm.pNo].targetTans.length; i++) {
        vm.$set(vm.puzzles[vm.pNo].targetTans[i], 'shadowEnabled', res);
      }
      if (res) {
        for (var i = 0; i < 7; i++) {
          vm.puzzles[vm.pNo].targetTans[i].strokeEnabled = false;
        }
        vm.pushTimeMark();
        let tans = data.tans;
        vm.setUserResponse(tans);
        vm.pulseEffect();

        if (vm.mode === 'non-timer') {
          vm.stopClock();
          vm.gameOver = 'solved';
        } else {
          vm.pNo++;
        }
      }
    },

    handleRestartButton: function() {
      var vm = this;
      if (vm.currentScreen === 'game') {
        vm.pushTimeMark();
        if (vm.mode === 'timer') {
          vm.stopClock();
          //setting userResponse
          let tans = [];
          vm.setUserResponse(tans);
          vm.currentScreen = "result";
        }
        if (vm.mode === 'non-timer' && vm.gameOver) {
          vm.gameOver = null;
          vm.pulseEffect();
          vm.newGame();
        }
      } else {
        if (vm.SugarPresence.isHost) {
          vm.onMultiplayerGameStarted(true)
        }
        //change currentScreen
        vm.currentScreen = "game";
      }
    },

    handlePassButton: function() {
      var vm = this;

      if (vm.currentScreen === 'game') {
        vm.pushTimeMark();
        let tans = [];
        vm.setUserResponse(tans);
        vm.pulseEffect();
        if (vm.mode === 'non-timer') {
          vm.stopClock();
          for (var i = 0; i < vm.puzzles[vm.pNo].targetTans.length; i++) {
            let color = vm.tanColors[vm.puzzles[vm.pNo].targetTans[i].tanType];
            vm.$set(vm.puzzles[vm.pNo].targetTans[i], 'fill', color);
            vm.$set(vm.puzzles[vm.pNo].targetTans[i], 'strokeEnabled', false);
          }
          vm.gameOver = 'passed';
        } else {
          //go to next puzzle in puzzle set for timer mode
          vm.pNo++;

        }

      }
    },

    onRandom: function() {
      let vm = this;
      if (vm.tangramCategories[0] === "Random") {
        vm.tangramCategories = ["Animals"];
        vm.DataSetHandler.onChangeCategory(vm.tangramCategories);
      } else {
        vm.tangramCategories = ["Random"];
      }
      vm.selectTangramCategoryItem(vm.tangramCategories);
      if (vm.currentScreen === 'result') {
        return;
      }
      vm.pulseEffect();
      vm.currentScreen = 'game';
      vm.newGame();

    },

    onTangramCategorySelected: function(evt) {
      let vm = this;
      let index = vm.DataSetHandler.dataSet.findIndex(ele => ele.name === evt.index);
      if (vm.currentScreen === 'game' && (index === -1 || vm.DataSetHandler.dataSet[index].tangrams.length === 0)) {
        return;
      }
      document.getElementById("spinner").style.visibility = "visible";
      vm.DataSetHandler.tangramSet = [];
      setTimeout(() => {
        vm.pulseEffect();
        vm.tangramCategories = [evt.index];
        vm.DataSetHandler.onChangeCategory(vm.tangramCategories);
        vm.selectTangramCategoryItem(vm.tangramCategories);
        if (vm.currentScreen === "game") {
          vm.newGame();
        }
        document.getElementById("spinner").style.visibility = "hidden";
      }, 0)
    },

    selectTangramCategoryItem: function(categories) {
      let elems = document.getElementById('category-buttons').children;
      for (var i = 0; i < elems.length; i++) {
        let elem = elems[i];
        let cat = elem.getAttribute('tangramcategory');
        if (categories.includes(cat)) {
          elem.classList.add('palette-item-selected');
        } else {
          elem.classList.remove('palette-item-selected');
        }
      }
    },

    onDifficultySelected: function() {
      var vm = this;
      vm.level = vm.level ? 0 : 1;
      if (vm.level == 0) {
        vm.gameLevelBonus = false;
      }
      if (vm.currentScreen !== 'game') {
        vm.gameLevelBonus = vm.level;
        return;
      }
      if (vm.gameOver) {
        vm.pulseEffect();
        vm.newGame();
        return;
      }
      let populated = vm.populatePuzzles(vm.puzzles[vm.pNo].tangram.tans);
      vm.$set(vm.puzzles[vm.pNo], 'targetTans', populated.targetTans);
      vm.$set(vm.puzzles[vm.pNo], 'outline', computeOutline(vm.puzzles[vm.pNo].tangram.tans, true));
      vm.centerTangram();
    },

    onTimerSelected: function(evt) {
      var vm = this;
      vm.pulseEffect();
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

    onHint: function() {
      let vm = this;
      if (vm.level === 0 || vm.gameOver) {
        return;
      }
      vm.hintsUsed[vm.hintNumber] = true;
      vm.noOfHintsUsed = 0;
      for (var i = 0; i < 7; i++) {
        if (vm.hintsUsed[i]) {
          vm.noOfHintsUsed++;
        }
      }
      let color = vm.tanColors[vm.puzzles[vm.pNo].targetTans[vm.hintNumber].tanType];
      vm.$set(vm.puzzles[vm.pNo].targetTans[vm.hintNumber], 'fill', color);
      vm.puzzles[vm.pNo].targetTans[vm.hintNumber].shadowEnabled = true;
      vm.showHint = true;

      setTimeout(() => {
        vm.$set(vm.puzzles[vm.pNo].targetTans[vm.hintNumber], 'fill', vm.strokeColor);
        vm.puzzles[vm.pNo].targetTans[vm.hintNumber].shadowEnabled = false;
        vm.showHint = false;
      }, 1000);

    },

    onChangeView: function() {
      let vm = this;
      vm.pulseEffect();
      if (vm.view === 'play') {
        vm.view = 'setting';
      } else {
        vm.view = 'play';
      }
      if (vm.currentScreen === 'game') {
        vm.stopClock();
        vm.view = 'setting';
        vm.currentScreen = 'dataset-list';
      }
    },

    goToSettingEditor: function() {
      this.currentScreen = 'setting-editor';
    },

    goToDatasetList: function() {
      if (this.currentScreen === 'game') {
        this.stopClock();
      }
      this.currentScreen = 'dataset-list';
    },

    onEditPuzzle: function(id) {
      this.puzzleToBeEdited = this.DataSetHandler.getTangramPuzzle(id);
      this.goToSettingEditor();
    },

    onEditCategory: function(id) {
      this.categoryToBeEdited = this.tangramCategories[0];
      this.currentScreen = 'categoryForm';
    },

    onSavePuzzle: function(data) {
      this.DataSetHandler.editTangramPuzzle(data.puzzle, data.id);
    },

    onPlayPuzzle: function(id) {
      this.puzzleChosen = this.DataSetHandler.getTangramPuzzle(id);
      let index = this.DataSetHandler.tangramSet.findIndex(ele => ele.id === id);
      let i = this.DataSetHandler.nextArr.findIndex(ele => ele === index);
      if (i !== -1) {
        this.DataSetHandler.nextArr.splice(i, 1);
      }
      this.currentScreen = "game";
    },

    importDataSet: function(dataSet) {
      let vm = this;
      vm.DataSetHandler.dataSet = dataSet;
      vm.DataSetHandler.loadTangramSet();
      vm.newGame();
    },

    deserealizePuzzles: function(puzzles) {
      let puzzlesArr = [];
      for (var i = 0; i < puzzles.length; i++) {
        let tans = puzzles[i].tangram.tans.map(ele => {
          let coeffIntX = ele.anchor.x.coeffInt;
          let coeffSqrtX = ele.anchor.x.coeffSqrt;
          let coeffIntY = ele.anchor.y.coeffInt;
          let coeffSqrtY = ele.anchor.y.coeffSqrt;
          let anchor = new Point(new IntAdjoinSqrt2(coeffIntX, coeffSqrtX), new IntAdjoinSqrt2(coeffIntY, coeffSqrtY));
          return new Tan(ele.tanType, anchor.dup(), ele.orientation)
        });
        let puzzle = {
          ...puzzles[i],
          targetTans: [],
          tangram: null,
          outline: [],
          outlinePoints: [],
        };
        puzzle.tangram = new Tangram(tans);
        puzzlesArr.push(puzzle);
      }
      return puzzlesArr
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
      let vm = this;
      let puzzlesContext = [];
      for (var i = 0; i < vm.puzzles.length; i++) {
        let puzzle = {
          name: vm.puzzles[i].name,
          targetTans: [],
        };
        for (var j = 0; j < vm.puzzles[i].tangram.tans.length; j++) {
          let targetTan = {
            tanType: vm.puzzles[i].tangram.tans[j].tanType,
            orientation: vm.puzzles[i].tangram.tans[j].orientation,
            anchor: vm.puzzles[i].tangram.tans[j].anchor.dup(),
          }
          puzzle.targetTans.push(targetTan);
        }
        puzzlesContext.push(puzzle);
      }

      let userResponseContext = [];
      for (var i = 0; i < vm.userResponse.length; i++) {
        let userResponse = {
          isSolved: vm.userResponse[i].isSolved,
          score: vm.userResponse[i].score,
          tans: []
        }
        for (var j = 0; j < vm.userResponse[i].tans.length; j++) {
          userResponse.tans.push({
            ...vm.userResponse[i].tans[j]
          });
        }
        userResponseContext.push(userResponse);
      }
      let gameTansContext = [];
      let gameScale, gameStage, gameTansPlaced, gameTansSnapped, puzzleCreated;
      if (vm.currentScreen === 'game' || vm.currentScreen === 'setting-editor') {
        let tans = vm.$refs[vm.currentScreen].tans;
        for (var i = 0; i < tans.length; i++) {
          let currentTan = tans[i];
          gameTansContext.push({
            ...currentTan.tanObj,
            placedAnchor: currentTan.placedAnchor
          });
        }
        gameStage = vm.$refs[vm.currentScreen].configKonva;
        gameScale = vm.$refs[vm.currentScreen].configLayer.scaleX;
        if (vm.currentScreen === 'game') {
          gameTansPlaced = vm.$refs[vm.currentScreen].tansPlaced;
          gameTansSnapped = vm.$refs[vm.currentScreen].tansSnapped;
        } else if (vm.currentScreen === 'setting-editor') {
          puzzleCreated = vm.$refs[vm.currentScreen].puzzleCreated;
        }
      }

      let context = {
        type: "game-context",
        currentScreen: vm.currentScreen,
        mode: vm.mode,
        view: vm.view,
        level: vm.level,
        gameLevelBonus: vm.gameLevelBonus,
        tangramCategories: vm.tangramCategories,
        puzzles: puzzlesContext,
        pNo: vm.pNo,
        score: vm.score,
        clock: vm.clock,
        timeMarks: vm.timeMarks,
        gameOver: vm.gameOver,
        userResponse: userResponseContext,
        noOfHintsUsed: vm.noOfHintsUsed,
        hintNumber: vm.hintNumber,
        hintsUsed: vm.hintsUsed,
        gameTans: gameTansContext,
        gameTansPlaced: gameTansPlaced,
        gameTansSnapped: gameTansSnapped,
        gameScale: gameScale,
        gameStage: gameStage,
        puzzleCreated: puzzleCreated,
        tangramSet: vm.DataSetHandler.tangramSet,
        dataSet: vm.DataSetHandler.dataSet,
        nextArr: vm.DataSetHandler.nextArr,
        currentCategories: vm.DataSetHandler.currentCategories,
        currentCategories: vm.DataSetHandler.currentCategories,
        puzzleToBeEdited: vm.puzzleToBeEdited
      }
      vm.SugarJournal.saveData(context);
    },

    onJournalNewInstance: function() {
      console.log("New instance");
      this.currentScreen = "dataset-list";
    },

    onJournalDataLoaded: function(data, metadata) {
      var vm = this;
      console.log("Existing instance");
      if (data.type === "game-dataset") {
        vm.importDataSet(data.dataSet);
        vm.currentScreen = 'dataset-list';
        return;
      }
      vm.clock = {
        ...data.clock
      };
      vm.DataSetHandler.dataSet = data.dataSet;
      vm.DataSetHandler.tangramSet = data.tangramSet;
      vm.DataSetHandler.currentCategories = data.currentCategories;
      vm.DataSetHandler.nextArr = data.nextArr;
      vm.DataSetHandler.AllCategories = data.dataSet.map(ele => ele.name);
      vm.tangramCategories = data.tangramCategories;
      if (!data.clock.active) {
        vm.stopClock();
      } else {
        vm.startClock();
      }
      if (data.currentScreen === 'categoryForm') {
        vm.currentScreen = 'dataset-list';
      } else if (data.currentScreen === 'leaderboard') {
        vm.currentScreen = 'result';
      } else {
        vm.currentScreen = data.currentScreen;
      }
      setTimeout(() => {
        vm.mode = data.mode;
        vm.level = data.level;
        vm.timeMarks = data.timeMarks;
        vm.hintNumber = data.hintNumber;
        vm.hintsUsed = data.hintsUsed;
        vm.noOfHintsUsed = data.noOfHintsUsed;
        vm.gameLevelBonus = vm.gameLevelBonus;
        vm.pNo = data.pNo;
        vm.score = data.score;
        vm.gameOver = data.gameOver;
        vm.userResponse = [];
        for (var i = 0; i < data.userResponse.length; i++) {
          let userResponse = {
            isSolved: data.userResponse[i].isSolved,
            score: data.userResponse[i].score,
            tans: []
          }
          for (var j = 0; j < data.userResponse[i].tans.length; j++) {
            let coeffIntX = data.userResponse[i].tans[j].anchor.x.coeffInt;
            let coeffSqrtX = data.userResponse[i].tans[j].anchor.x.coeffSqrt;
            let coeffIntY = data.userResponse[i].tans[j].anchor.y.coeffInt;
            let coeffSqrtY = data.userResponse[i].tans[j].anchor.y.coeffSqrt;
            let anchor = new Point(new IntAdjoinSqrt2(coeffIntX, coeffSqrtX), new IntAdjoinSqrt2(coeffIntY, coeffSqrtY));
            userResponse.tans.push(new Tan(data.userResponse[i].tans[j].tanType, anchor, data.userResponse[i].tans[j].orientation));
          }
          vm.userResponse.push(userResponse);
        }
        vm.clock = {
          ...data.clock
        };
        if (!data.clock.active) {
          vm.stopClock();
        }
        vm.puzzles = [];
        for (var i = 0; i < data.puzzles.length; i++) {
          let puzzle = {
            ...data.puzzles[i],
            tangram: null,
            outline: [],
            outlinePoints: [],
          };
          puzzle.targetTans = [];
          let tans = [];
          let tmp = vm.populatePuzzles(data.puzzles[i].targetTans);
          puzzle.targetTans = tmp.targetTans;
          tans = tmp.tans;
          puzzle.tangram = new Tangram(tans);
          puzzle.difficulty = checkDifficultyOfTangram(puzzle.tangram);
          puzzle.outline = computeOutline(tans, true);

          vm.puzzles.push(puzzle);
        }
        if (vm.currentScreen === 'game') {
          vm.centerTangram();
          if (data.gameOver === 'solved') {
            for (var i = 0; i < vm.puzzles[vm.pNo].targetTans.length; i++) {
              vm.$set(vm.puzzles[vm.pNo].targetTans[i], 'shadowEnabled', true);
              vm.$set(vm.puzzles[vm.pNo].targetTans[i], 'strokeEnabled', false);
            }
          } else if (data.gameOver === 'passed') {
            for (var i = 0; i < vm.puzzles[vm.pNo].targetTans.length; i++) {
              vm.$set(vm.puzzles[vm.pNo].targetTans[i], 'strokeEnabled', false);
              let color = vm.tanColors[vm.puzzles[vm.pNo].targetTans[i].tanType];
              vm.$set(vm.puzzles[vm.pNo].targetTans[i], 'fill', color);
            }
          }
        }
        if (data.currentScreen === 'game') {
          setTimeout(() => {
            vm.$refs.game.loadContext({
              tans: data.gameTans,
              tansSnapped: data.gameTansSnapped,
              tansPlaced: data.gameTansPlaced,
              pScale: data.gameScale,
              pStage: data.gameStage
            })
          }, 0);
        }
        if (data.currentScreen === 'setting-editor') {
          setTimeout(() => {
            vm.puzzleToBeEdited = data.puzzleToBeEdited;
            vm.$refs['setting-editor'].loadContext({
              tans: data.gameTans,
              pScale: data.gameScale,
              pStage: data.gameStage,
              puzzle: data.puzzleCreated,
            })
          }, 0);
        }
      }, 0);
      vm.selectTangramCategoryItem(vm.tangramCategories);
      vm.selectTimerItem(vm.clock.type);
    },

    onJournalLoadError: function(error) {
      console.log("Error loading from journal");
      this.currentScreen = "dataset-list";
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
              tangramCategories: data.tangramCategories
            }
            vm.puzzles = vm.deserealizePuzzles(data.puzzles);
            let populated = vm.populatePuzzles(vm.puzzles[0].tangram.tans);
            vm.puzzles[0].targetTans = populated.targetTans;
            vm.puzzles[0].outline = computeOutline(vm.puzzles[0].tangram.tans, true);
            vm.pNo = 0;
            vm.level = data.level;
            vm.tangramCategories = data.tangramCategories;
            vm.mode = 'timer';
            vm.$set(vm.clock, 'type', data.clockType);
            vm.$set(vm.clock, 'initial', data.clockInitial);
            if (vm.currentScreen !== 'game') {
              vm.currentScreen = 'game';
            }
            vm.selectTangramCategoryItem(vm.tangramCategories);
            vm.selectTimerItem(vm.clock.type);
            vm.disabled = true;
            vm.newGame(true);
          }
          break;

        case 'game-over':
          var data = msg.content.data;
          for (var i = 0; i < vm.playersAll.length; i++) {
            if (vm.playersAll[i].user.networkId === msg.user.networkId && vm.playersAll[i].score === null) {
              vm.$set(vm.playersAll[i], 'score', data.score);
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
            let puzzles = vm.generatePuzzles(10, true);
            vm.puzzles = vm.puzzles.concat(puzzles);

            vm.SugarPresence.sendMessage({
              user: this.SugarPresence.getUserInfo(),
              content: {
                action: 'update-questions',
                data: {
                  puzzles: puzzles
                }
              }
            });
          }
          break;

        case 'update-questions':
          var data = msg.content.data;
          let puzzles = vm.deserealizePuzzles(data.puzzles);
          vm.puzzles = vm.puzzles.concat(puzzles);
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
                puzzles: vm.puzzles,
                clockType: vm.startGameConfig.clockType,
                clockInitial: vm.startGameConfig.clockInitial,
                level: vm.startGameConfig.level,
                tangramCategories: vm.startGameConfig.tangramCategories,
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
            vm.$set(vm.playersAll[i], 'score', 0);
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
            placement: "top",
            title: this.l10n.stringTutoLeaderboardMainTitle,
            content: this.l10n.stringTutoLeaderboardMainContent
          },
          {
            element: ".btn-back",
            placement: "auto top",
            title: this.l10n.stringTutoGoBackTitle,
            content: this.l10n.stringTutoGoBackContent
          },
          {
            element: ".page-no",
            placement: "auto top",
            title: this.l10n.stringTutoLeaderboardPaginationTitle,
            content: this.l10n.stringTutoLeaderboardPaginationContent
          },
        ];
      } else if (vm.currentScreen === 'result') {
        document.querySelector('.result-panel-primary').scrollTo({
          top: 0
        });
        steps = [{
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoResultTitle,
            content: this.l10n.stringTutoResultContent
          },
          {
            element: ".result-card:first-child",
            placement: "auto right",
            title: this.l10n.stringTutoTangramCardTitle,
            content: this.l10n.stringTutoTangramCardContent
          },
          {
            element: ".result-card:first-child .clock-info-block",
            placement: "auto bottom",
            title: this.l10n.stringTutoClockInfoTitle,
            content: this.l10n.stringTutoClockInfoContent
          },
          {
            element: ".result-card:first-child .score-info-block",
            placement: "auto bottom",
            title: this.l10n.stringTutoScoreInfoTitle,
            content: this.l10n.stringTutoScoreInfoContent
          },
          {
            element: ".btn-restart",
            placement: "auto top",
            title: this.l10n.stringTutoRestartTitle,
            content: this.l10n.stringTutoRestartContent
          },
          {
            element: ".btn-see-leaderboard",
            placement: "auto top",
            title: this.l10n.stringTutoRestartTitle,
            content: this.l10n.stringTutoRestartContent
          }
        ];
      } else if (vm.currentScreen === 'game') {
        steps = [{
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoExplainTitle,
            content: this.l10n.stringTutoExplainContent
          },
          {
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoEachPuzzleTitle,
            content: this.l10n.stringTutoEachPuzzleContent
          },
          {
            element: ".stage",
            placement: "top",
            title: this.l10n.stringTutoBoardTitle,
            content: this.l10n.stringTutoBoardContent
          },
          {
            element: ".stage",
            placement: "top",
            title: this.l10n.stringTutoKeyBoardTitle,
            content: this.l10n.stringTutoKeyBoardContent
          },
          {
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoAboutTitle,
            content: this.l10n.stringTutoAboutContent
          },
          {
            element: ".footer-actions",
            placement: "top",
            title: this.l10n.stringTutoGameActionsTitle,
            content: this.l10n.stringTutoGameActionsContent
          },
          {
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoScoreTitle,
            content: this.l10n.stringTutoScoreContent
          },
          {
            element: "#puzzle-category-button",
            placement: "bottom",
            title: this.l10n.stringTutoTangramCategoryTitle,
            content: this.l10n.stringTutoTangramCategoryContent
          },
          {
            element: "#random-play-button",
            placement: "bottom",
            title: this.l10n.stringTutoRandomPlayTitle,
            content: this.l10n.stringTutoRandomPlayContent
          },
          {
            element: "#level-button",
            placement: "bottom",
            title: this.l10n.stringTutoLevelTitle,
            content: this.l10n.stringTutoLevelContent
          },
          {
            element: "#timer-button",
            placement: "bottom",
            title: this.l10n.stringTutoTimerTitle,
            content: this.l10n.stringTutoTimerContent
          },
          {
            element: "#view-button",
            placement: "bottom",
            title: this.l10n.stringTutoViewTitle,
            content: this.l10n.stringTutoViewContent
          },
          {
            element: "#hint-button",
            placement: "bottom",
            title: this.l10n.stringTutoHintTitle,
            content: this.l10n.stringTutoHintContent
          },
        ];
      } else if (vm.currentScreen === 'dataset-list' && vm.view === 'play') {
        steps = [{
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoExplainTitle,
            content: this.l10n.stringTutoExplainContent
          },
          {
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoEachPuzzleTitle,
            content: this.l10n.stringTutoEachPuzzleContent
          },
          {
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoPlayViewTitle,
            content: this.l10n.stringTutoPlayViewContent
          },
          {
            element: "#puzzle-category-button",
            placement: "bottom",
            title: this.l10n.stringTutoTangramCategoryTitle,
            content: this.l10n.stringTutoTangramCategoryContent
          },
          {
            element: "#view-button",
            placement: "bottom",
            title: this.l10n.stringTutoViewTitle,
            content: this.l10n.stringTutoViewContent
          },
        ];
      } else if (vm.currentScreen === 'dataset-list' && vm.view === 'setting') {
        document.querySelector('.dataset-list-panel-primary').scrollTo({
          top: 0
        });
        steps = [{
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoExplainTitle,
            content: this.l10n.stringTutoExplainContent
          },
          {
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoSettingViewTitle,
            content: this.l10n.stringTutoSettingViewContent
          },
          {
            element: ".tangram-card:first-child .edit-btn",
            placement: "auto bottom",
            title: this.l10n.stringTutoEditPuzzleTitle,
            content: this.l10n.stringTutoEditPuzzleContent
          },
          {
            element: ".tangram-card:first-child .delete-btn",
            placement: "auto bottom",
            title: this.l10n.stringTutoDeletePuzzleTitle,
            content: this.l10n.stringTutoDeletePuzzleContent
          },
          {
            element: ".dataset-list-bar-block .edit-btn",
            placement: "auto bottom",
            title: this.l10n.stringTutoEditCategoryTitle,
            content: this.l10n.stringTutoEditCategoryContent
          },
          {
            element: ".dataset-list-bar-block .delete-btn",
            placement: "auto bottom",
            title: this.l10n.stringTutoDeleteCategoryTitle,
            content: this.l10n.stringTutoDeleteCategoryContent
          },
          {
            element: "#puzzle-category-button",
            placement: "bottom",
            title: this.l10n.stringTutoTangramCategoryTitle,
            content: this.l10n.stringTutoTangramCategoryContent
          },
          {
            element: "#view-button",
            placement: "bottom",
            title: this.l10n.stringTutoViewTitle,
            content: this.l10n.stringTutoViewContent
          },
          {
            element: "#create-category-button",
            placement: "bottom",
            title: this.l10n.stringTutoNewCategoryTitle,
            content: this.l10n.stringTutoNewCategoryContent
          },
          {
            element: ".btn-add-puzzle",
            placement: "auto top",
            title: this.l10n.stringTutoNewPuzzleTitle,
            content: this.l10n.stringTutoNewPuzzleContent
          }
        ];
      } else if (vm.currentScreen === 'setting-editor') {
        steps = [{
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoExplainTitle,
            content: this.l10n.stringTutoExplainContent
          },
          {
            element: ".stage",
            placement: "auto left",
            title: this.l10n.stringTutoBoardEditorTitle,
            content: this.l10n.stringTutoBoardEditorContent
          },
          {
            element: "",
            orphan: true,
            placement: "bottom",
            title: this.l10n.stringTutoValidPuzzleTitle,
            content: this.l10n.stringTutoValidPuzzleContent
          },
          {
            element: ".valid-puzzle-indicator",
            placement: "auto left",
            title: this.l10n.stringTutoValidPuzzleIndicatorTitle,
            content: this.l10n.stringTutoValidPuzzleIndicatorContent
          },
          {
            element: ".btn-replay",
            placement: "auto top",
            title: this.l10n.stringTutoRefreshTitle,
            content: this.l10n.stringTutoRefreshContent
          },
          {
            element: ".btn-random",
            placement: "auto top",
            title: this.l10n.stringTutoRandomButtonTitle,
            content: this.l10n.stringTutoRandomButtonContent
          },
          {
            element: ".btn-back",
            placement: "auto top",
            title: this.l10n.stringTutoGoBackTitle,
            content: this.l10n.stringTutoGoBackContent
          },
        ];
      } else {
        steps = [{
          element: "",
          orphan: true,
          placement: "bottom",
          title: this.l10n.stringTutoExplainTitle,
          content: this.l10n.stringTutoExplainContent
        }];
      }
      this.$refs.SugarTutorial.show(steps);
    },
  }
});
