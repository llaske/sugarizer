/*
<div class="result-header">
  <div class="result-bar"
  >
    <div class="result-bar-block"
      v-bind:style="{backgroundColor: fillColor}"
    >
    </div>
    <div class="result-bar-block"
      v-bind:style="{backgroundColor: fillColor}"
    >
    </div>
  </div>
</div>
*/
var Result = {
  props: ['strokeColor', 'fillColor', 'puzzles', 'pNo'],
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
          </div>
          <div class="result-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          >
          </div>
        </div>
      </div>

      <div class="result-main"
      >
        <div class="result-panel-primary"
          v-bind:style="{backgroundColor: '#ffffff'}"
        >
          <v-stage ref="stage" v-bind:config="configKonva" v-bind:style="{backgroundColor: '#ffffff'}"
          >
            <v-layer ref="layer" :config="configLayer">
              
            </v-layer>
          </v-stage>
        </div>

        <div class="result-panel-secondary"
          v-bind:style="{backgroundColor: '#ffffff'}"
        >
          <div class="result-secondary-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="result-secondary-block-logo clock-logo"></div>
            <div class="result-secondary-block-content">
              <div>00:00</div>
            </div>
          </div>

          <div class="result-secondary-block score-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="result-secondary-block-content score-title"><div>Score:</div></div>
            <div class="result-secondary-block-content score-val"><div>0</div></div>
          </div>

          <div class="result-secondary-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="result-secondary-block-content hint-title"><div>Hints Used:</div></div>
            <div class="result-secondary-block-content hint-title"><div>0</div></div>
          </div>

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
        width: 60,
        height: 60,
      },
      configLayer: {
        scaleX: 6,
        scaleY: 6
      },
      puzzleShape: null,
      currentPage: 1,
      pageCount: 1,
      visibleItemsPerPageCount: 1,
      canRestart: true,
    };
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
    resize: function() {
      let vm = this;
      let toolbarElem = document.getElementById("main-toolbar");
      let toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 3;
      let newHeight = window.innerHeight - toolbarHeight;
      let newWidth = window.innerWidth;
      let ratio = newWidth / newHeight

      document.querySelector('#result-screen').style.height = newHeight + "px";

      document.querySelector('.btn-restart').style.width = document.querySelector('.btn-restart').offsetHeight + "px";

    },

    initializePuzzleShape: function () {
      let vm = this;
      vm.puzzleShape = {
        targetTans: []
      };

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
        vm.puzzleShape.targetTans.push({
          points: floatPoints,
          offsetX: center.toFloatX() + dx,
          offsetY: center.toFloatY() + dy,
          x: center.toFloatX() + dx,
          y: center.toFloatY() + dy,
        })
      }

    }
  }
}
