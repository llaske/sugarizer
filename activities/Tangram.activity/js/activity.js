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
    tangramCategory: 'standard',
    level: 0,
    timer: null,
    clock: {
      active: false,
      time: 0,
      initial: 0,
      type: 0,
    },
    puzzles: [],
    pNo: 0,
    isTargetAcheived: false,
    hintNumber: 0,
    scale: 1,
    stage: {
      width: 1,
      height: 1,
    },
    tanColors: ["blue","purple","red","violet","yellow","yellow"],
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

      vm.generateTangram();

    },

    newGame: function () {
      let vm = this;
      vm.puzzles = [];
      vm.pNo = 0;
      vm.hintNumber = 0;
      vm.generateTangram();
      let tangram_dx = (vm.stage.width / vm.scale) / 3;
      let tangram_dy = (vm.stage.height / vm.scale) / 2;

      vm.onCenterTangram({
        dx: tangram_dx,
        dy: tangram_dy
      })
    },

    generateTangram: function() {
      let vm = this;
      let tangram = standardTangrams[Math.floor(Math.random() * (standardTangrams.length - 1)) + 1];
      let tang = tangram.tangram;
      console.log(tang);
      let puzzle = {
        name: tangram.name,
        tangram: {
          ...tangram.tangram
        },
        targetTans: [],
        outline: [],
      };
      tang.positionCentered();
      tx = -tang.center().toFloatX();
      ty = -tang.center().toFloatY();

      let target = [];
      let targetTans = [];
      for (let i = 0; i < tang.tans.length; i++) {
        let targetTan = {
          tanType: tang.tans[i].tanType,
          x: 100,
          y: 100,
          offsetX: 100,
          offsetY: 100,
          pointsObjs: [],
          orientation: 0,
          points: [],
          stroke: vm.fillColor,
          strokeEnabled: true,
          strokeWidth: 0.3,
          fill: vm.strokeColor,
          closed: true,
          lineJoin: 'round',
        }

        let points = [...tang.tans[i].getPoints()];
        let center = tang.tans[i].center();

        let floatPoints = [];
        let pointsObjs = [];
        for (let j = 0; j < points.length; j++) {
          let tmpPoint = points[j].dup();
          tmpPoint.x.add(new IntAdjoinSqrt2(tx, 0));
          tmpPoint.y.add(new IntAdjoinSqrt2(ty, 0));
          pointsObjs.push(tmpPoint);
          floatPoints.push(tmpPoint.toFloatX());
          floatPoints.push(tmpPoint.toFloatY());
        }
        targetTan.offsetX = (center.toFloatX() + tx);
        targetTan.offsetY = (center.toFloatY() + ty);
        targetTan.x = targetTan.offsetX;
        targetTan.y = targetTan.offsetY;
        targetTan.orientation = tang.tans[i].orientation;
        targetTan.points = floatPoints;
        targetTan.pointsObjs = pointsObjs;
        targetTan.stroke = vm.level === 0 ? vm.fillColor : vm.strokeColor;
        let point  = pointsObjs[0].dup();
        let tan = new Tan(targetTan.tanType, point, targetTan.orientation);
        targetTans.push(tan);
        target.push(targetTan);
      }
      let outline = computeOutline(targetTans, true);
      console.log(outline);
      puzzle.targetTans = target;
      vm.puzzles = [puzzle];
    },

    onCenterTangram: function(data) {
      let vm = this;
      let dx = data.dx;
      let dy = data.dy;
      for (let index = 0; index < 7; index++) {
        let points = [];
        for (let i = 0; i < vm.puzzles[vm.pNo].targetTans[index].points.length; i += 2) {
          vm.puzzles[vm.pNo].targetTans[index].pointsObjs[i / 2].x.add(new IntAdjoinSqrt2(dx, 0));
          vm.puzzles[vm.pNo].targetTans[index].pointsObjs[i / 2].y.add(new IntAdjoinSqrt2(dy, 0));
          points.push(vm.puzzles[vm.pNo].targetTans[index].points[i] + dx);
          points.push(vm.puzzles[vm.pNo].targetTans[index].points[i + 1] + dy);
        }
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'offsetX', vm.puzzles[vm.pNo].targetTans[index].offsetX + dx);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'offsetY', vm.puzzles[vm.pNo].targetTans[index].offsetY + dy);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'x', vm.puzzles[vm.pNo].targetTans[index].x + dx);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'y', vm.puzzles[vm.pNo].targetTans[index].y + dy);
        vm.$set(vm.puzzles[vm.pNo].targetTans[index], 'points', points);
      }
    },

    onConfigChanged: function (data) {
      this.scale = data.scale;
      this.stage.width = data.stageWidth;
      this.stage.height = data.stageHeight;
    },

    onRemoveTangramBorders: function (data) {
      let vm = this;
      for (var i = 0; i < 7; i++) {
        vm.puzzles[vm.pNo].targetTans[i].strokeEnabled = true;
      }
      let tmp = 0;
      for (var i = 0; i < 7; i++) {
        let targetTanIndex = data[i];
        if (targetTanIndex != -1) {
          tmp++;
          vm.puzzles[vm.pNo].targetTans[targetTanIndex].strokeEnabled = false;
        } else {
          vm.hintNumber = i;
        }
      }
      if (tmp === 7) {
        vm.isTargetAcheived = true;
      } else {
        vm.isTargetAcheived = false;
      }
    },

    onDifficultySelected: function(evt) {
      var vm = this;
      vm.level = evt.index;
      let color = vm.level === 0 ? vm.fillColor : vm.strokeColor;
      for (var i = 0; i < vm.puzzles[vm.pNo].targetTans.length; i++) {
        vm.$set(vm.puzzles[vm.pNo].targetTans[i], 'stroke', color);
      }
      vm.selectDifficultyItem(evt.index);
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

    onHint: function () {
      let vm = this;
      if (vm.level === 0) {
        return;
      }
      let color = vm.tanColors[vm.puzzles[vm.pNo].targetTans[vm.hintNumber].tanType];
      vm.$set(vm.puzzles[vm.pNo].targetTans[vm.hintNumber], 'fill', color);
      vm.$set(vm.puzzles[vm.pNo].targetTans[vm.hintNumber], 'stroke', color);
      vm.puzzles[vm.pNo].targetTans[vm.hintNumber].strokeEnabled = false;

      setTimeout(() => {
        vm.$set(vm.puzzles[vm.pNo].targetTans[vm.hintNumber], 'fill', vm.strokeColor);
        vm.$set(vm.puzzles[vm.pNo].targetTans[vm.hintNumber], 'stroke', vm.strokeColor);
        vm.puzzles[vm.pNo].targetTans[vm.hintNumber].strokeEnabled = true;
      }, 500);
      
    }

  }
});
