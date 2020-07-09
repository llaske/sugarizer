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

    generateTangram: function() {
      let vm = this;
      let tangram = standardTangrams[Math.floor(Math.random() * (standardTangrams.length-1))+1];
      let tang = tangram.tangram;
      console.log(tang);
      let puzzle = {
        name: tangram.name,
        tangram: {
          ...tangram.tangram
        },
        targetTans: [],
      };
      tang.positionCentered();
      tx = -tang.center().toFloatX();
      ty = -tang.center().toFloatY();

      let target = [];
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
          stroke: 'black',
          strokeWidth: 0.8,
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
          floatPoints.push((tmpPoint.toFloatX() + 0));
          floatPoints.push((tmpPoint.toFloatY() + 0));
        }
        targetTan.offsetX = (center.toFloatX() + tx);
        targetTan.offsetY = (center.toFloatY() + ty);
        targetTan.x = targetTan.offsetX;
        targetTan.y = targetTan.offsetY;
        targetTan.orientation = tang.tans[i].orientation;
        targetTan.points = floatPoints;
        targetTan.pointsObjs = pointsObjs;
        targetTan.stroke = vm.level === 0 ? vm.fillColor : vm.strokeColor;
        target.push(targetTan);
      }
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

  }
});
