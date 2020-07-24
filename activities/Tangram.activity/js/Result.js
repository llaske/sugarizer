var ResultCard = {
  components: {
    'clock': Clock
  },
  props: ['strokeColor', 'fillColor', 'puzzle', 'configKonva', 'configLayer'],
  template: `
		<div class="result-card" v-bind:style="{backgroundColor: '#ffffff'}">
      <div class="info-bar">
        <div class="info-block clock-info-block"
        >
          <div class="info-block-logo clock-logo"></div>
          <div class="info-block-content">
            <clock v-bind:time=0></clock>
          </div>
        </div>

        <div
          class="info-bar-logo info-user-logo"
          v-bind:style="{backgroundImage: puzzle.isSolved ? 'url('+ generateXOLogoWithColor(strokeColor, fillColor)+')' : 'url(./icons/robot.svg)' }"
        ></div>

        <div class="info-block score-info-block"
        >
          <div class="info-block-content info-score-1">
            <div>Score:</div>
          </div>
          <div class="info-block-content info-score-2">
            <div>0</div>
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
  props: ['strokeColor', 'fillColor', 'puzzles', 'pNo', 'userResponse'],
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
            <clock time='0' text='Total Time: '></clock>
          </div>
          <div class="result-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          >
            <div>Total Score: 0</div>
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
          ></result-card>

        </div>

      </div>
      <div class="result-footer">
          <div class="pagination">
          </div>
          <div class="footer-actions">
            <button
              class="btn-in-footer btn-restart"
              v-bind:style="{backgroundColor: fillColor}"
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
      puzzlesSet: [],
      currentPage: 1,
      pageCount: 1,
      visibleItemsPerPageCount: 1,
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
      document.querySelector('.btn-restart').style.width = document.querySelector('.btn-restart').offsetHeight + "px";

    },

    initializePuzzleShape: function() {
      let vm = this;
      vm.puzzlesSet = [];
      for (var i = 0; i <= vm.pNo; i++) {
        let puzzleShape = {
          isSolved: vm.userResponse[i].isSolved,
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
