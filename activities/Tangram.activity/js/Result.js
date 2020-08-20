var ResultCard = {
  components: {
    'clock': Clock
  },
  props: ['strokeColor', 'fillColor', 'puzzle', 'configKonva', 'configLayer', 'l10n'],
  template: `
		<div class="result-card" v-bind:style="{backgroundColor: '#ffffff'}">
      <div class="info-bar">
        <div class="info-block clock-info-block"
        >
          <div class="info-block-logo clock-logo"></div>
          <div class="info-block-content">
            <clock v-bind:time="puzzle.timeTaken"></clock>
          </div>
        </div>

        <div
          class="info-bar-logo info-user-logo"
          v-bind:style="{backgroundImage: puzzle.isSolved ? 'url('+ generateXOLogoWithColor(strokeColor, fillColor)+')' : 'url(./icons/robot.svg)' }"
        ></div>

        <div class="info-block score-info-block"
        >
          <div class="info-block-content info-score-1">
            <div>{{ l10n.stringScore }}:</div>
          </div>
          <div class="info-block-content info-score-2">
            <div>{{puzzle.score}}</div>
          </div>
        </div>
      </div>
			<div class="result-card-main">
        <v-stage ref="stage" v-bind:config="configKonva"
        >
          <v-layer ref="layer" :config="configLayer">
            <v-line
              v-for="(targetTan, index) in puzzle.targetTans"
              v-bind:key="index"
              :config="{
                ...targetTan,
              }"
            ></v-line>
          </v-layer>
        </v-stage>
      </div>
		</div>
	`,
}

var Result = {
  components: {
    'result-card': ResultCard,
    'clock': Clock
  },
  props: ['strokeColor', 'fillColor', 'puzzles', 'pNo', 'userResponse', 'timeMarks', 'disabled', 'playersAll', 'l10n'],
  template: `
    <div id="result-screen"
      v-bind:style="{backgroundColor: strokeColor}"
    >
      <div class="result-header">
        <div class="result-bar"
        >
          <div class="result-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          >
            <clock v-bind:time="timeMarks[0] - timeMarks[timeMarks.length-1]" v-bind:text="l10n.stringTotalTime+' '"></clock>
          </div>
          <div class="result-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          >
            <div>{{l10n.stringTotalScore}} {{totalScore}}</div>
          </div>
        </div>
      </div>

      <div class="result-main"
      >
        <div class="result-panel-primary"
        >
          <result-card
            v-for="(puzzle,index) in puzzlesSet"
            v-bind:key="index"
            v-bind:configLayer="configLayer"
            v-bind:configKonva="configKonva"
            v-bind:puzzle="puzzle"
            v-bind:stroke-color="strokeColor"
    				v-bind:fill-color="fillColor"
            v-bind:l10n="l10n"
          ></result-card>

        </div>

      </div>
      <div class="result-footer">
          <div class="pagination">
          </div>
          <div class="footer-actions">
            <button
              v-if="playersAll.length!=0"
              class="btn-in-footer btn-see-leaderboard"
              v-bind:style="{
                backgroundColor: fillColor,
                width: actionButtons.width + 'px',
                height: actionButtons.height + 'px',
              }"
              v-on:click="$emit('see-leaderboard')"
            >
            </button>
            <button
              class="btn-in-footer btn-restart"
              v-if="isRestartButtonVisible"
              v-bind:disabled="disabled"
              v-bind:style="{
                backgroundColor: fillColor,
                width: actionButtons.width + 'px',
                height: actionButtons.height + 'px',
              }"
              v-on:click="$emit('restart-game')"
            ></button>
          </div>
      </div>
    </div>
  `,
  data: function() {
    return {
      configKonva: {
        width: 300,
        height: 300,
      },
      configLayer: {
        scaleX: 5,
        scaleY: 5
      },
      actionButtons: {
        width: 30,
        width: 30,
      },
      totalScore: 0,
      puzzlesSet: [],
      canRestart: true,
      tanColors: ["blue", "purple", "red", "green", "yellow", "yellow"],
    };
  },

  created: function() {
    let vm = this;
    window.addEventListener('resize', vm.resize);
    vm.initializePuzzleShape();
  },

  destroyed: function() {
    let vm = this;
    window.removeEventListener("resize", vm.resize);
  },

  mounted: function() {
    let vm = this;
    vm.resize();
  },
  computed: {
    isRestartButtonVisible: function () {
      var vm = this;
      vm.canRestart = vm.$root.SugarPresence ? (vm.$root.SugarPresence.isConnected() ? vm.$root.SugarPresence.isHost : true) : true;
      return vm.canRestart;
    }
  },
  methods: {
    resize: function() {
      let vm = this;
      let toolbarElem = document.getElementById("main-toolbar");
      let toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 3;
      let newHeight = window.innerHeight - toolbarHeight;
      let newWidth = window.innerWidth;
      let ratio = newWidth / newHeight
      let resultCardMainEle = document.querySelector('.result-card-main');
      document.querySelector('#result-screen').style.height = newHeight + "px";
      let resultFooterEle = document.querySelector('.result-footer');
      vm.$set(vm.actionButtons, 'width', resultFooterEle.offsetHeight * 0.95);
      vm.$set(vm.actionButtons, 'height', resultFooterEle.offsetHeight * 0.95);

    },

    initializePuzzleShape: function() {
      let vm = this;
      vm.puzzlesSet = [];
      vm.totalScore = 0;
      for (var i = 0; i < vm.userResponse.length; i++) {
        vm.totalScore+=vm.userResponse[i].score;
      }
      for (var i = 0; i < vm.userResponse.length; i++) {
        let puzzleShape = {
          isSolved: vm.userResponse[i].isSolved,
          score: vm.userResponse[i].score,
          timeTaken: vm.timeMarks[i] - vm.timeMarks[i+1],
          targetTans: []
        };
        let tans = vm.userResponse[i].tans;

        for (let index = 0; index < tans.length; index++) {
          let tan = new Tan(tans[index].tanType, tans[index].anchor.dup(), tans[index].orientation);
          let points = [...tan.getPoints()];
          let center = tan.center();
          let floatPoints = [];

          for (let j = 0; j < points.length; j++) {
            let tmpPoint = points[j].dup();
            floatPoints.push(tmpPoint.toFloatX());
            floatPoints.push(tmpPoint.toFloatY());
          }
          puzzleShape.targetTans.push({
            points: floatPoints,
            offsetX: center.toFloatX(),
            offsetY: center.toFloatY(),
            x: center.toFloatX(),
            y: center.toFloatY(),
            fill: vm.tanColors[tans[index].tanType],
            lineJoin: 'round',
            closed: true,
          })
        }
        vm.puzzlesSet.push(puzzleShape);
      }
    },

  }
}
