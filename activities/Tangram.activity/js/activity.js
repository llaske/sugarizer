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
    isTargetAcheived: false,
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
    puzzleChosen: null,
    multiplayer: null,
  },
  watch: {
    currentScreen: function() {
      var vm = this;
      if (vm.currentScreen === 'game') {
        if (!vm.multiplayer) {
          vm.newGame();
        }
        vm.startClock();
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
      if (vm.currentScreen !== 'game') {
        vm.puzzleChosen = null;
      }
      vm.changeViewButton();
    },

    view: function() {
      this.changeViewButton();
    },

    pNo: function() {
      let vm = this;
      vm.gameOver = null;
      vm.isTargetAcheived = false;
      vm.hintNumber = 0;
      vm.hintsUsed = [false, false, false, false, false, false, false];
      vm.noOfHintsUsed = 0;
      let tmp = vm.puzzles.length - vm.pNo;
      if (tmp === 10) {
        let puzzles = vm.generatePuzzles(10);
        vm.puzzles = vm.puzzles.concat(puzzles);
      }
      vm.centerTangram();
    },

    'DataSetHandler.AllCategories': function() {
      /*let buttons = '';
      for (var i = 0; i < this.DataSetHandler.AllCategories.length; i++) {
        let index = this.DataSetHandler.currentCategories.findIndex(ele => ele === this.DataSetHandler.AllCategories[i]);
        buttons += `<div id="category-button-` + (i + 1) + `" class="palette-item` + (index !== -1 ? ` palette-item-selected` : ``) + `">` + this.DataSetHandler.AllCategories[i] + `</div>`;
      }
      let catButtonsEle = document.getElementById('category-buttons');
      if (catButtonsEle) {
        catButtonsEle.innerHTML = buttons;
      }*/
    }

  },

  mounted: function() {
    this.SugarJournal = this.$refs.SugarJournal;
    this.DataSetHandler = this.$refs.DataSetHandler;
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

    pulseEffect: function() {
      let vm = this;
      if (vm.currentScreen === 'game') {
        let gameScreenEle = document.getElementById('game-screen');
        gameScreenEle.classList.add('pulse');
        setTimeout(() => {
          gameScreenEle.classList.remove('pulse');
        }, 600);
      }
    },

    changeViewButton: function() {
      setTimeout(() => {
        let viewButtonEle = document.getElementById('view-button');
        if (viewButtonEle) {
          if (this.view === 'play') {

            document.getElementById('view-button').style.backgroundImage = 'url(./icons/settings.svg)';
          } else {
            document.getElementById('view-button').style.backgroundImage = 'url(./icons/play.svg)';
          }
        }
      }, 0);
    },

    startClock: function() {
      var vm = this;
      vm.$set(vm.clock, 'time', vm.clock.initial);
      vm.$set(vm.clock, 'active', true);
      vm.tick();
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
                //handle multiplayer workflow
              } else {
                vm.currentScreen = "result";
              }
            }
          } else {
            vm.$set(vm.clock, 'time', vm.clock.time + 1);
          }
        }
      }, 1000);
    },

    newGame: function() {
      let vm = this;
      vm.score = 0;
      vm.puzzles = [];
      vm.userResponse = [];
      vm.timeMarks = [];
      vm.pNo = 0;
      vm.gameOver = null;
      vm.hintNumber = 0;
      vm.noOfHintsUsed = 0;
      vm.isTargetAcheived = false;
      vm.$set(vm.clock, 'time', vm.clock.initial);
      vm.generateQuestionSet();
      vm.centerTangram();
    },

    generateQuestionSet: function() {
      var vm = this;
      if (vm.mode === 'non-timer') {
        vm.puzzles = vm.generatePuzzles(1);
      } else {
        vm.puzzles = vm.generatePuzzles(15);
      }
      vm.pNo = 0;
    },

    generatePuzzles: function(number) {
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
          } else {
            tmp = vm.DataSetHandler.generateTangramFromSet();
          }
          tang = tmp.tangram.dup();
          tangramName = tmp.name;
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
        let puzzle = {
          name: tangramName,
          difficulty: tangDifficulty,
          tangram: tang,
          targetTans: [],
          outline: [],
          outlinePoints: [],
        };

        tang.positionCentered();
        let tmp = vm.populatePuzzles(tang.tans);
        puzzle.targetTans = tmp.targetTans;
        puzzle.outline = [...tang.outline];
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
        score = 6 - Math.min(6, vm.noOfHintsUsed) + Math.max(0, 15 - Math.floor(Math.abs(vm.timeMarks[vm.pNo + 1] - vm.timeMarks[vm.pNo]) / 4)) + bonus;
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
      vm.isTargetAcheived = res;
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
          vm.startClock();
        }
      } else {
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
        if (vm.mode === 'non-timer') {
          vm.stopClock();
          vm.pulseEffect();
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
      vm.currentScreen = 'game';
      if (vm.gameOver) {
        vm.startClock();
      }
      vm.newGame();

    },

    onTangramCategorySelected: function(evt) {
      let vm = this;
      vm.pulseEffect();
      if (vm.tangramCategories[0] === "Random") {
        vm.tangramCategories = [];
      }

      if (evt.index !== "Random" && vm.currentScreen !== "dataset-list") {
        let index = vm.tangramCategories.findIndex(el => el === evt.index);
        if (index === -1) {
          vm.tangramCategories.push(evt.index);
        } else {
          if (vm.tangramCategories.length > 1) {
            vm.tangramCategories.splice(index, 1);
            vm.DataSetHandler.onChangeCategory(vm.tangramCategories);
          } else {
            vm.tangramCategories = ["Random"];
          }
        }
      } else {
        vm.tangramCategories = [evt.index];
        if (vm.currentScreen === "dataset-list") {
          vm.DataSetHandler.onChangeCategory(vm.tangramCategories);
        }
      }
      vm.selectTangramCategoryItem(vm.tangramCategories);
      if (vm.currentScreen === "game") {
        if (vm.gameOver) {
          vm.startClock();
        }
        vm.newGame();
      }
    },

    selectTangramCategoryItem: function(categories) {
      let elems = [{
          cat: "Animals",
          elem: document.getElementById('category-button-1')
        },
        {
          cat: "Geometrical",
          elem: document.getElementById('category-button-2')
        },
        {
          cat: "Letters, Numbers, Signs",
          elem: document.getElementById('category-button-3')
        },
        {
          cat: "People",
          elem: document.getElementById('category-button-4')
        },
        {
          cat: "Usual Objects",
          elem: document.getElementById('category-button-5')
        },
        {
          cat: "Boats",
          elem: document.getElementById('category-button-6')
        },
        {
          cat: "Miscellaneous",
          elem: document.getElementById('category-button-7')
        }
      ]

      for (let i = 1; i <= elems.length; i++) {
        let elem = elems[i - 1];
        if (categories.includes(elem.cat)) {
          elem.elem.classList.add('palette-item-selected');
        } else {
          elem.elem.classList.remove('palette-item-selected');
        }
      }
    },

    onDifficultySelected: function(evt) {
      var vm = this;
      vm.pulseEffect();
      vm.level = evt.index;
      vm.selectDifficultyItem(evt.index);

      if (vm.currentScreen !== 'game') {
        return;
      }
      if (vm.gameOver) {
        vm.startClock();
        vm.newGame();
        return;
      }
      vm.newGame();
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
        if (vm.gameOver) {
          vm.startClock();
        }
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

    onDeletePuzzle: function(id) {
      this.DataSetHandler.deleteTangramPuzzle(id);
    },

    onEditPuzzle: function(id) {
      this.puzzleToBeEdited = this.DataSetHandler.getTangramPuzzle(id);
      this.goToSettingEditor();
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

    onAddPuzzle: function(puzzle) {
      this.DataSetHandler.addTangramPuzzle(puzzle);
    },

    importDataSet: function(dataSet) {
      let vm = this;
      vm.DataSetHandler.dataSet = dataSet;
      vm.DataSetHandler.loadTangramSet();
      vm.newGame();
    },

    onStop: function() {
      let vm = this;
      let puzzlesContext = [];
      for (var i = 0; i < vm.puzzles.length; i++) {
        let puzzle = {
          name: vm.puzzles[i].name,
          targetTans: [],
        };
        for (var j = 0; j < vm.puzzles[i].targetTans.length; j++) {
          let targetTan = {
            tanType: vm.puzzles[i].targetTans[j].tanObj.tanType,
            orientation: vm.puzzles[i].targetTans[j].tanObj.orientation,
            anchor: vm.puzzles[i].targetTans[j].tanObj.anchor.dup(),
            strokeEnabled: vm.puzzles[i].targetTans[j].strokeEnabled,
            shadowEnabled: vm.puzzles[i].targetTans[j].shadowEnabled,
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
      let gameScale, gameStage, gameTansPlaced, gameTansSnapped;
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
        }
      }

      let context = {
        type: "game-context",
        currentScreen: vm.currentScreen,
        mode: vm.mode,
        view: vm.view,
        level: vm.level,
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
        tangramSet: vm.DataSetHandler.tangramSet,
        dataSet: vm.DataSetHandler.dataSet,
        nextArr: vm.DataSetHandler.nextArr,
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
      console.log(data);
      if (data.type === "game-dataset") {
        vm.importDataSet(data.dataSet);
        vm.currentScreen = 'dataset-list';
        return;
      }
      vm.currentScreen = data.currentScreen;
      vm.DataSetHandler.dataSet = data.dataSet;
      vm.DataSetHandler.tangramSet = data.tangramSet;
      vm.DataSetHandler.currentCategories = data.currentCategories;
      vm.DataSetHandler.nextArr = data.nextArr;

      setTimeout(() => {
        vm.mode = data.mode;
        //  vm.level = data.level;
        vm.tangramCategories = data.tangramCategories;
        vm.hintNumber = data.hintNumber;
        vm.hintsUsed = data.hintsUsed;
        vm.noOfHintsUsed = data.noOfHintsUsed;
        vm.clock = data.clock;
        vm.timeMarks = data.timeMarks;
        if (!data.clock.active) {
          vm.stopClock();
        }
        vm.pNo = data.pNo;
        vm.score = data.score;
        vm.gameOver = data.gameOver;
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
        }

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
      }, 500);

      if (data.currentScreen === 'game') {
        setTimeout(() => {
          vm.$refs.game.loadContext({
            tans: data.gameTans,
            tansSnapped: data.gameTansSnapped,
            tansPlaced: data.gameTansPlaced,
            pScale: data.gameScale,
            pStage: data.gameStage
          })
        }, 500);
      }
      if (data.currentScreen === 'setting-editor') {
        setTimeout(() => {
          if (data.puzzleToBeEdited) {
            vm.puzzleToBeEdited = data.puzzleToBeEdited;
            vm.$refs['setting-editor'].showPuzzle(vm.puzzleToBeEdited);
          } else {
            vm.$refs['setting-editor'].loadContext({
              tans: data.gameTans,
              pScale: data.gameScale,
              pStage: data.gameStage
            })
          }
        }, 500);
      }
      vm.selectTangramCategoryItem(vm.tangramCategories);
      vm.selectDifficultyItem(vm.level);
      vm.selectTimerItem(vm.clock.type);
    },

    onJournalLoadError: function(error) {
      console.log("Error loading from journal");
    },

  }
});
