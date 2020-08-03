var TangramCard = {
  props: ['strokeColor', 'fillColor', 'item'],
  template: `
		<div class="tangram-card" v-bind:style="{backgroundColor: '#ffffff'}">
      <div class="tangram-card-info-bar">
        <div class="info-content name-info">
          <div>{{item.name}}</div>
        </div>
      </div>
			<div class="tangram-card-main">
        <svg>
          <path
            v-bind:fill="fillColor"
            transform='scale(3)'
            fill-rule='evenodd'
            v-bind:d="item.tangramSVG"
          >
          </path>
        </svg>
      </div>
		</div>
	`,
}


var SettingList = {
  components: {
    'tangram-card': TangramCard,
  },
  props: ['strokeColor', 'fillColor', 'customPuzzles', 'puzzles'],
  template: `
    <div id="setting-list-screen"
      v-bind:style="{backgroundColor: strokeColor}"
    >
      <div class="setting-list-header">
        <div class="setting-list-bar"
        >
          <div class="setting-list-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          >
            <div>Current Tangram Set</div>
          </div>
        </div>
      </div>

      <div class="setting-list-main"
      >
        <div class="setting-list-panel-primary"
        >
          <tangram-card
            v-for="(puzzle,index) in puzzlesSet"
            v-bind:key="index"
            v-bind:item="puzzle"
            v-bind:stroke-color="strokeColor"
            v-bind:fill-color="fillColor"
          ></tangram-card>
        </div>

      </div>
      <div class="setting-list-footer">
          <div class="pagination">
          </div>
          <div class="footer-actions">
            <button
              class="btn-in-footer btn-add-puzzle"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="$emit('go-to-setting-editor')"
            ></button>
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
      totalScore: 0,
      puzzlesSet: [],
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
      document.querySelector('#setting-list-screen').style.height = newHeight + "px";
      document.querySelector('.btn-restart').style.width = document.querySelector('.btn-restart').offsetHeight + "px";
      document.querySelector('.btn-add-puzzle').style.width = document.querySelector('.btn-add-puzzle').offsetHeight + "px";
    },

    initializePuzzleShape: function() {
      let vm = this;
      vm.puzzlesSet = [];
      for (var i = 0; i < standardTangrams.length; i++) {
        let puzzle = {
          name: standardTangrams[i].name,
          difficulty: standardTangrams[i].difficulty,
          tangram: standardTangrams[i].tangram.dup(),
          tangramSVG: "",
        };
        puzzle.tangram.positionCentered();
        puzzle.tangramSVG = puzzle.tangram.toSVGOutline().children[0].getAttribute('d');
        vm.puzzlesSet.push(puzzle)
      }

    },

  }
}
