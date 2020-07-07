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
    level: 1,
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
    translateVal: 0,
  },
  created: function() {
    let vm = this;
    window.addEventListener('resize', vm.resize);
  },

  destroyed: function() {
    let vm = this;
    window.removeEventListener("resize", vm.resize);
  },

  mounted: function() {
    let vm = this;
    vm.resize();
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

    resize: function() {
      let vm = this;
      //center the target puzzle on canvas

    },

    generateTangram: function() {
      let vm = this;
      let tangram = standardTangrams[Math.floor(Math.random() * (standardTangrams.length-1))+1];
      let tang = tangram.tangram;
      console.log(tang);
      console.log(tang.center().toFloatX());
      console.log(tang.center().toFloatY());


      let puzzle = {
        name: tangram.name,
        tangram: {
          ...tangram.tangram
        },
        targetTans: [],
      };
      tang.positionCentered();
      console.log(tang.center().toFloatX()*2);
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
          points[j].x.add(new IntAdjoinSqrt2(tx, 0));
          points[j].y.add(new IntAdjoinSqrt2(ty, 0));
          pointsObjs.push(points[j]);
          floatPoints.push((points[j].toFloatX() + 0));
          if (points[j].toFloatX() > 28) {
            console.log(points[j].toFloatX());
          }
          floatPoints.push((points[j].toFloatY() + 0));
        }
        targetTan.offsetX = (center.toFloatX() + tx);
        targetTan.offsetY = (center.toFloatY() + ty);
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
