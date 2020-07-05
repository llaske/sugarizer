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
    translateVal: 20,
  },
  methods: {
    initialized: function() {
      var vm = this;
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
      let tangram = standardTangrams[Math.floor(Math.random() * standardTangrams.length)];
      let tang = tangram.tangram;
      console.log(tang);

      let puzzle = {
        name: tangram.name,
        tangram: {...tangram.tangram},
        targetTans: [],
      };

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
          stroke: "black",
          strokeWidth: 0.4,
          fill: vm.strokeColor,
          closed: true,
        }
        let points = [...tang.tans[i].getPoints()];
        let center = tang.tans[i].center();
        let floatPoints = [];
        let pointsObjs = [];
        for (let j = 0; j < points.length; j++) {
          points[j].x.add(new IntAdjoinSqrt2(this.translateVal, 0));
          points[j].y.add(new IntAdjoinSqrt2(this.translateVal, 0));
          pointsObjs.push(points[j]);
          floatPoints.push((points[j].toFloatX() + 0));
          floatPoints.push((points[j].toFloatY() + 0));
        }
        targetTan.offsetX = (center.toFloatX() + this.translateVal);
        targetTan.offsetY = (center.toFloatY() + this.translateVal);
        targetTan.x = targetTan.offsetX;
        targetTan.y = targetTan.offsetY;
        targetTan.orientation = tang.tans[i].orientation;
        targetTan.points = floatPoints;
        targetTan.pointsObjs = pointsObjs;
        targetTan.stroke = vm.level === 0 ? "black" : vm.strokeColor;
        target.push(targetTan);
      }
      puzzle.targetTans = target;
      vm.puzzles = [puzzle];
    },
  }
});
