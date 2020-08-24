var TangramCard = {
  props: ['strokeColor', 'fillColor', 'item',  'view', 'tangramSVGconfig', 'dataSetHandler'],
  template: `
		<div class="tangram-card" v-bind:style="{backgroundColor: '#ffffff'}"
      v-on:click="view==='play'? onPlayPuzzleClicked() : 'null'"
    >
      <div class="tangram-card-info-bar">
        <div class="info-content name-info">
          <div>{{$root.SugarL10n.get(item.name)}}</div>
        </div>
        <button v-if="view==='setting'" class="info-content edit-btn" v-on:click="onEditPuzzleClicked"></button>
        <button v-if="view==='setting'" v-bind:disabled="dataSetHandler.tangramSet.length==1" class="info-content delete-btn" v-on:click="onDeletePuzzleClicked"></button>
      </div>
			<div class="tangram-card-main"
        v-bind:style="{
          cursor: view==='play' ? 'pointer' : 'auto'
        }"
      >
        <div
          v-bind:style="{
            width: tangramSVGconfig.width+'px',
            height: tangramSVGconfig.height+'px',
          }"
        >
          <svg>
            <path
              v-bind:fill="fillColor"
              v-bind:transform="pathScale"
              fill-rule='evenodd'
              v-bind:d="item.tangramSVG"
            >
            </path>
          </svg>
        </div>
      </div>
		</div>
	`,
  computed: {
    pathScale: function() {
      return 'scale(' + this.tangramSVGconfig.scale + ')';
    },
  },

  methods: {
    onDeletePuzzleClicked: function () {
      this.$emit('delete-puzzle-clicked', this.item.id)
    },

    onEditPuzzleClicked: function () {
      this.$emit('edit-puzzle-clicked', this.item.id)
    },

    onPlayPuzzleClicked: function () {
      this.$emit('play-puzzle-clicked', this.item.id)
    }

  }
}


var DatasetList = {
  components: {
    'tangram-card': TangramCard,
  },
  props: ['strokeColor', 'fillColor', 'dataSetHandler', 'puzzles', 'view'],
  template: `
    <div id="dataset-list-screen" class="pulse-main"
      v-bind:style="{backgroundColor: strokeColor}"
    >
      <div class="dataset-list-header">
        <div class="dataset-list-bar"
        >
          <div class="dataset-list-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          >
            <div class="dataset-list-bar-block-title">{{$root.SugarL10n.get(dataSetHandler.currentCategories[0])}}</div>
            <div class="buttons-grp">
              <button v-if="view==='setting'" class="info-content edit-btn" v-on:click="onEditCategory"></button>
              <button v-if="view==='setting'" v-bind:disabled="dataSetHandler.AllCategories.length==1" class="info-content delete-btn" v-on:click="onDeleteCategory"></button>
            </div>
          </div>
        </div>
      </div>

      <div class="dataset-list-main"
        v-bind:style="{
          height: view === 'setting' ? '74%' : '82%',
        }"
      >
        <div class="dataset-list-panel-primary"
        >
          <tangram-card
            v-bind:ref="index"
            v-for="(puzzle,index) in puzzlesSet"
            v-bind:key="index"
            v-bind:item="puzzle"
            v-bind:stroke-color="strokeColor"
            v-bind:fill-color="fillColor"
            v-bind:tangramSVGconfig="tangramSVGconfig"
            v-bind:view="view"
            v-bind:dataSetHandler="dataSetHandler"
            v-on:delete-puzzle-clicked="onDeletePuzzle"
            v-on:edit-puzzle-clicked="onEditPuzzle"
            v-on:play-puzzle-clicked="onPlayPuzzle"
            v-on:play-puzzle-clicked="onPlayPuzzle"
          ></tangram-card>
        </div>

      </div>
      <div class="dataset-list-footer"
        v-bind:style="{
          height: view === 'setting' ? '12%' : '3%',
        }"
      >
          <div class="pagination">
          </div>
          <div class="footer-actions">
            <button
              class="btn-in-footer btn-add-puzzle"
              v-if="view==='setting'"
              v-bind:style="{
                backgroundColor: fillColor,
                width: actionButtons.width + 'px',
                height: actionButtons.height + 'px',
              }"
              v-on:click="$emit('go-to-setting-editor')"
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
      tangramSVGconfig: {
        width: 60,
        height: 60,
        scale: 1
      }
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

  watch: {
    'dataSetHandler.tangramSet': function() {
      let vm = this;
      vm.initializePuzzleShape();
      setTimeout(()=>{
        let tangramCardMainEle = document.querySelector('.tangram-card-main');
        if (tangramCardMainEle) {
          let sideLen = Math.min(tangramCardMainEle.offsetHeight, tangramCardMainEle.offsetWidth) * 0.9;
          vm.$set(vm.tangramSVGconfig, 'width', sideLen);
          vm.$set(vm.tangramSVGconfig, 'height', sideLen);
          vm.$set(vm.tangramSVGconfig, 'scale', sideLen / 60);
        }
      }, 10);
    },

    view: function () {
      let vm = this;
      setTimeout(()=> {
        vm.resize();
      }, 0)
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
      document.querySelector('#dataset-list-screen').style.height = newHeight + "px";
      let settingEditorFooterEle = document.querySelector('.dataset-list-footer');
      vm.$set(vm.actionButtons, 'width', settingEditorFooterEle.offsetHeight * 0.95);
      vm.$set(vm.actionButtons, 'height', settingEditorFooterEle.offsetHeight * 0.95);

      let tangramCardMainEle = document.querySelector('.tangram-card-main');
      if (tangramCardMainEle) {
        let sideLen = Math.min(tangramCardMainEle.offsetHeight, tangramCardMainEle.offsetWidth) * 0.9;
        vm.$set(vm.tangramSVGconfig, 'width', sideLen);
        vm.$set(vm.tangramSVGconfig, 'height', sideLen);
        vm.$set(vm.tangramSVGconfig, 'scale', sideLen / 60);
      }
    },

    initializePuzzleShape: function() {
      let vm = this;
      vm.puzzlesSet = [];
      let tangramSet = vm.dataSetHandler.tangramSet;
      for (var i = 0; i < tangramSet.length; i++) {
        let tmp = vm.dataSetHandler.buildTangramPuzzle(i)
        let puzzle = {
          name: tmp.name,
          id: tmp.id,
          difficulty: checkDifficultyOfTangram(tmp.tangram),
          tangram: tmp.tangram.dup(),
          tangramSVG: "",
        };
        puzzle.tangram.positionCentered();
        puzzle.tangramSVG = puzzle.tangram.toSVGOutline().children[0].getAttribute('d');
        vm.puzzlesSet.push(puzzle)
      }

    },

    onEditCategory: function () {
      this.$emit('edit-category');
    },

    onDeleteCategory: function () {
      this.dataSetHandler.deleteCategory(this.dataSetHandler.currentCategories[0]);
    },

    onDeletePuzzle: function (id) {
      this.dataSetHandler.deleteTangramPuzzle(id);
    },

    onEditPuzzle: function (id) {
      this.$emit('edit-puzzle', id);
    },

    onPlayPuzzle: function (id) {
      this.$emit('play-puzzle', id);
    }
  }
}
