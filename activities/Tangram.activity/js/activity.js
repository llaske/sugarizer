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
  data: {
    currentScreen: "",
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
    tangramType: 1,
    timer: null,
    clock: {
      active: false,
      time: 0,
      initial: 0,
      type: 0,
    },
    timeMarks: [],
    puzzles: [],
    pNo: 0,
    userResponse: [],
    gameOver: null,
    isTargetAcheived: false,
    hintNumber: 0,
    hintsUsed: [false, false, false, false, false, false, false],
    noOfHintsUsed: 0,
    showHint: false,
    scale: 1,
    stage: {
      width: 1,
      height: 1,
    },
    tanColors: ["blue", "purple", "red", "green", "yellow", "yellow"],
    pulseEffect: false,
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
      }
    },

    pNo: function() {
      let vm = this;
      let tmp = vm.puzzles.length - vm.pNo;
      if (tmp === 10) {
        let puzzles = vm.generatePuzzles(10);
        vm.puzzles = vm.puzzles.concat(puzzles);
      }
      vm.centerTangram();
    },

    pulseEffect: function() {
      let vm = this;
      if (vm.currentScreen === 'game') {
        let gameScreenEle = document.getElementById('game-screen');
        gameScreenEle.classList.add('pulse');
        setTimeout(() => {
          gameScreenEle.classList.remove('pulse');
          vm.pulseEffect = false;
        }, 600);
      }
    }

  },

  mounted: function () {
    this.SugarJournal = this.$refs.SugarJournal;
  },

  methods: {
    initialized: function() {
      let vm = this;
      // Initialize Sugarizer
      vm.currentenv = vm.$refs.SugarActivity.getEnvironment();

      document.getElementById('app').style.background = vm.currentenv.user.colorvalue.stroke;
      vm.strokeColor = vm.currentenv.user.colorvalue.stroke;
      vm.fillColor = vm.currentenv.user.colorvalue.fill;

      vm.currentScreen = "game";

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

    pushTimeMark: function () {
      let vm = this;
      if(vm.timeMarks.length === 0){
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

    checkDifficultyOfTangram: function (tang) {
      return tang.evaluation.getValue(2) <= 11 ? 1 : 0;
    },

    generatePuzzles: function(number) {
      let vm = this;
      let puzzles = [];
      for (var pNo = 0; pNo < number; pNo++) {
        generating = true;
        let tang, tangramName;
        if (vm.tangramType === 1) {
          let tangram = standardTangrams[Math.floor(Math.random() * (standardTangrams.length - 1)) + 1];
          tang = tangram.tangram;
          tangramName = tangram.name;
        } else if (vm.tangramType === 2) {
          let generatedTangrams = generateTangrams(2);
          tang = generatedTangrams[0];
          tangramName = "Random";
        } else if (vm.tangramType === 3) {
          let tangram = standardTangrams[0];
          tang = tangram.tangram;
          tangramName = tangram.name;
        }
        generating = false;
        let tangDifficulty = vm.checkDifficultyOfTangram(tang);
        let puzzle = {
          name: tangramName,
          difficulty: tangDifficulty,
          tangram: {
            ...tang
          },
          targetTans: [],
          outline: [],
        };

        tang.positionCentered();

        let target = [];
        let targetTans = [];
        for (let i = 0; i < tang.tans.length; i++) {
          let targetTan = {
            x: 100,
            y: 100,
            offsetX: 100,
            offsetY: 100,
            anchor: null,
            pointsObjs: [],
            tanObj: new Tan(tang.tans[i].tanType, tang.tans[i].anchor.dup(), tang.tans[i].orientation),
            tanType: tang.tans[i].tanType,
            orientation: tang.tans[i].orientation,
            points: [],
            stroke: vm.fillColor,
            strokeEnabled: true,
            strokeWidth: 0.3,
            fill: vm.strokeColor,
            closed: true,
            lineJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOpacity: 0.8,
            shadowEnabled: false,
          }

          let points = [...tang.tans[i].getPoints()];
          let center = tang.tans[i].center();

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
          targetTan.anchor = tang.tans[i].anchor.dup();
          targetTan.pointsObjs = pointsObjs;
          targetTan.stroke = vm.level === 0 ? vm.fillColor : vm.strokeColor;
          target.push(targetTan);
        }
        puzzle.targetTans = target;
        puzzle.outline = [...tang.outline];
        puzzles.push(puzzle);
      }
      return puzzles;
    },

    centerTangram: function() {
      let vm = this;
      let targetTans = vm.puzzles[vm.pNo].targetTans;
      let scale = vm.scale;
      let dx = vm.stage.width / (3 * scale) - 30;
      let dy = vm.stage.height / (2 * scale) - 30;

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
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'points', floatPoints);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'offsetX', center.toFloatX() + dx);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'offsetY', center.toFloatY() + dy);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'x', center.toFloatX() + dx);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'y', center.toFloatY() + dy);
      }

    },

    setUserResponse: function (tans) {
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
        score = 6 - Math.min(6, vm.noOfHintsUsed) + Math.max(0, 15 - Math.floor(Math.abs(vm.timeMarks[vm.pNo+1] - vm.timeMarks[vm.pNo]) / 4)) + bonus;
      }
      vm.score+=score;
      vm.$set(vm.userResponse, vm.pNo, {
        isSolved: isSolved,
        score: score,
        tans: tans
      });
    },

    onConfigChanged: function(data) {
      this.scale = data.scale;
      this.stage.width = data.stageWidth;
      this.stage.height = data.stageHeight;
    },

    onRemoveTangramBorders: function(data) {
      let vm = this;
      if (vm.gameOver) {
        return;
      }
      for (var i = 0; i < 7; i++) {
        vm.puzzles[vm.pNo].targetTans[i].strokeEnabled = true;
      }
      let remaining = [true, true, true, true, true, true, true];
      for (var i = 0; i < 7; i++) {
        let targetTanIndex = data[i];
        if (targetTanIndex != -1) {
          vm.puzzles[vm.pNo].targetTans[targetTanIndex].strokeEnabled = false;
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
        vm.pulseEffect = true;

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
          vm.pulseEffect = true;
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
          vm.pulseEffect = true;
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

    onTangramTypeSelected: function(evt) {
      let vm = this;
      vm.pulseEffect = true;
      vm.tangramType = evt.index;
      vm.selectTangramTypeItem(evt.index);
      if (vm.gameOver) {
        vm.startClock();
      }
      vm.newGame();
    },

    selectTangramTypeItem: function(number) {
      let elems = [
        document.getElementById('standard-type-button'),
        document.getElementById('random-type-button'),
        document.getElementById('custom-type-button')
      ]

      for (let i = 1; i <= elems.length; i++) {
        let elem = elems[i - 1];
        if (i === number) {
          elem.classList.add('palette-item-selected');
        } else {
          elem.classList.remove('palette-item-selected');
        }
      }
    },

    onDifficultySelected: function(evt) {
      var vm = this;
      vm.pulseEffect = true;
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
      let color = vm.level === 0 ? vm.fillColor : vm.strokeColor;
      for (var i = 0; i < vm.puzzles[vm.pNo].targetTans.length; i++) {
        vm.$set(vm.puzzles[vm.pNo].targetTans[i], 'stroke', color);
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
      vm.pulseEffect = true;
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
        if(vm.hintsUsed[i]){
          vm.noOfHintsUsed++;
        }
      }
      let color = vm.tanColors[vm.puzzles[vm.pNo].targetTans[vm.hintNumber].tanType];
      vm.$set(vm.puzzles[vm.pNo].targetTans[vm.hintNumber], 'fill', color);
      vm.$set(vm.puzzles[vm.pNo].targetTans[vm.hintNumber], 'stroke', vm.fillColor);
      //vm.puzzles[vm.pNo].targetTans[vm.hintNumber].strokeEnabled = false;
      vm.puzzles[vm.pNo].targetTans[vm.hintNumber].shadowEnabled = true;
      vm.showHint = true;

      setTimeout(() => {
        vm.$set(vm.puzzles[vm.pNo].targetTans[vm.hintNumber], 'fill', vm.strokeColor);
        vm.$set(vm.puzzles[vm.pNo].targetTans[vm.hintNumber], 'stroke', vm.strokeColor);
        //vm.puzzles[vm.pNo].targetTans[vm.hintNumber].strokeEnabled = true;
        vm.puzzles[vm.pNo].targetTans[vm.hintNumber].shadowEnabled = false;
        vm.showHint = false;
      }, 1000);

    },

    onStop: function () {
      let vm = this;
      let puzzlesContext = [];
      for (var i = 0; i < vm.puzzles.length; i++) {
        let puzzle = {
          name: vm.puzzles[i].name,
          difficulty: vm.puzzles[i].difficulty,
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
            anchor: vm.userResponse[i].tans[j].anchor.dup(),
            tanType: vm.userResponse[i].tans[j].tanType,
            orientation: vm.userResponse[i].tans[j].orientation,
          });
        }
        userResponseContext.push(userResponse);
      }
      let context = {
        currentScreen: vm.currentScreen,
        mode: vm.mode,
        level: vm.level,
        tangramType: vm.tangramType,
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
      }
      vm.SugarJournal.saveData(context);
    },

    onJournalNewInstance: function() {
      console.log("New instance");
    },

    onJournalDataLoaded: function(data, metadata) {
      var vm = this;
      vm.pulseEffect = true;
      console.log("Existing instance");
      console.log(data);
      vm.mode = data.mode;
      vm.level = data.level;
      vm.tangramType = data.tangramType;
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

      if (vm.gameOver === null) {
        vm.puzzles = [];
        vm.userResponse = [];
        for (var i = 0; i < data.puzzles.length; i++) {
          let puzzle = {...data.puzzles[i]};
          puzzle.targetTans = [];
          for (var j = 0; j < data.puzzles[i].targetTans.length; j++) {
            let coeffIntX = data.puzzles[i].targetTans[j].anchor.x.coeffInt;
            let coeffSqrtX = data.puzzles[i].targetTans[j].anchor.x.coeffSqrt;
            let coeffIntY = data.puzzles[i].targetTans[j].anchor.y.coeffInt;
            let coeffSqrtY = data.puzzles[i].targetTans[j].anchor.y.coeffSqrt;
            let anchor = new Point(new IntAdjoinSqrt2(coeffIntX, coeffSqrtX), new IntAdjoinSqrt2(coeffIntY, coeffSqrtY));
            let targetTan = {
              x: 100,
              y: 100,
              offsetX: 100,
              offsetY: 100,
              anchor: null,
              pointsObjs: [],
              tanObj: new Tan(data.puzzles[i].targetTans[j].tanType, anchor.dup(), data.puzzles[i].targetTans[j].orientation),
              tanType: data.puzzles[i].targetTans[j].tanType,
              orientation: data.puzzles[i].targetTans[j].orientation,
              points: [],
              stroke: vm.fillColor,
              //strokeEnabled: data.puzzles[i].targetTans[j].strokeEnabled,
              strokeEnabled: true,
              strokeWidth: 0.3,
              fill: vm.strokeColor,
              closed: true,
              lineJoin: 'round',
              shadowColor: 'black',
              shadowBlur: 10,
              shadowOpacity: 0.8,
              //shadowEnabled: data.puzzles[i].targetTans[j].shadowEnabled,
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
            puzzle.targetTans.push(targetTan);
          }
          vm.puzzles.push(puzzle);
        }
        vm.centerTangram();

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
      } else {
        vm.startClock();
        vm.newGame();
      }

      if (data.currentScreen === 'game' || data.currentScreen === 'result') {
        vm.currentScreen = data.currentScreen;
      } else {
        vm.currentScreen = 'result';
      }
      vm.selectTangramTypeItem(vm.tangramType);
      vm.selectDifficultyItem(vm.level);
      vm.selectTimerItem(vm.clock.type);

    },

    onJournalLoadError: function(error) {
      console.log("Error loading from journal");
    },


  }
});
