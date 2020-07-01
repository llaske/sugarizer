var Result = {
  components: {
    "slots-component": Slots,
    "clock": Clock,
    "inputNumber": InputNumber
  },
  props: ['strokeColor', 'fillColor', 'questions', 'qNo', 'time', 'score', 'slots', 'scores', 'timeTaken', 'compulsoryOpsForEachQuestion', 'playersAll', 'disabled', 'l10n', 'sugarPresence'],
  template: `
    <div id="result-view"
    >
      <div class="result-header">
        <div class="result-bar"
        >
          <div class="result-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          ><clock v-bind:time="totalTime" v-bind:text="l10n.stringTotalTime+' '"></clock>
          </div>

          <div class="result-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          > {{ l10n.stringTotalScore }} {{ score }}</div>

        </div>
      </div>

      <div class="result-main"
        v-bind:style="{backgroundColor: strokeColor}"
      >
          <template v-for="(panel, index) in questionSet" v-bind:key="index">
            <div class="result-panel"
              v-bind:style="{backgroundColor: '#ffffff'}"
            >

              <div class="result-panel-main">
                <div class="my-solution">
                  <div class="info-bar">
                    <div class="info-block clock-info-block"
                    >
                      <div class="info-block-logo clock-logo"></div>
                      <div class="info-block-content">
                        <clock v-bind:time="timeForEachQuestion[index]"></clock>
                      </div>
                    </div>

                    <div
                      class="info-bar-logo info-user-logo"
                      v-bind:style="{backgroundImage: 'url('+ generateXOLogoWithColor(strokeColor, fillColor)+')'}"
                    ></div>

                    <div class="info-block score-info-block"
                    >
                      <div class="info-block-content info-score-1">
                        <div>{{ l10n.stringScore }}:</div>
                      </div>
                      <div class="info-block-content info-score-2">
                        <div>{{ scores[index] }}</div>
                      </div>
                    </div>

                  </div>
                  <div class="solution-main">
                    <slots-component
                      v-if="mySlots[index].length!=0"
                      v-bind:strokeColor="strokeColor"
                      v-bind:fillColor="fillColor"
                      v-bind:slots="mySlots[index]"
                      v-bind:compulsoryOpsForQuestion="compulsoryOpsForEachQuestion[index]"
                      v-bind:isTargetAcheived="panel.targetNum === mySlots[index][mySlots[index].length-1].res"
                    ></slots-component>
                  </div>
                </div>

                <div class="best-solution">
                  <div class="info-bar">
                    <div class="info-bar-logo bestSoln-logo"></div>
                  </div>

                  <div class="solution-main">
                    <slots-component
                    v-bind:strokeColor="strokeColor"
                    v-bind:fillColor="fillColor"
                    v-bind:slots="bestSlots[index]"
                    v-bind:compulsoryOpsForQuestion="compulsoryOpsForEachQuestion[index]"
                    isTargetAcheived="true"
                    ></slots-component>
                  </div>
                </div>

              </div>

            </div>
          </template>
      </div>

      <div class="result-footer">
          <div class="pagination">
            <button
              v-if="qNo > 1"
              v-bind:disabled="isPreviousButtonDisabled"
              class="btn-block btn-previous-page"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="pageChangeHandler('previous')"
            >
            </button>
            <button
              v-if="qNo > 1"
              class="btn-block page-no"
              v-bind:style="{backgroundColor: fillColor}"
            >
              {{ currentPage }}/{{ pageCount }}
            </button>
            <button
              v-if="qNo > 1"
              v-bind:disabled="isNextButtonDisabled"
              class="btn-block btn-next-page"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="pageChangeHandler('next')"
            >
            </button>
          </div>
          <div class="footer-actions">
            <button
              v-if="playersAll.length!=0"
              class="btn-block btn-rankings-block"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="$emit('see-leaderboard')"
            >
            </button>
            <button
              v-if="isRestartButtonVisible"
              v-bind:disabled="disabled"
              class="btn-block btn-restart-block"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="$emit('restart-game')"
            >
            </button>
          </div>
      </div>
    </div>
  `,
  data: function() {
    return {
      questionSet: [],
      bestSlots: [],
      mySlots: [],
      totalTime: 0,
      timeForEachQuestion: [],
      currentPage: 1,
      pageCount: 1,
      visibleItemsPerPageCount: 1,
      canRestart: true,
    };
  },
  created: function() {
    var vm = this;
    window.addEventListener('resize', vm.resize)
    vm.initializeSlots();
  },
  destroyed: function() {
    var vm = this;
    window.removeEventListener("resize", vm.resize);
  },
  mounted: function() {
    var vm = this;
    vm.totalTime = vm.timeTaken.reduce(function(a, b) {
      return a + b
    }, 0)
    vm.pageCount = Math.ceil((vm.qNo + 1) / vm.visibleItemsPerPageCount);
    vm.resize();
  },
  computed: {
    isPreviousButtonDisabled: function() {
      return this.currentPage === 1
    },

    isNextButtonDisabled: function() {
      return this.currentPage === this.pageCount
    },

    isRestartButtonVisible: function () {
      var vm = this;
      vm.canRestart = vm.sugarPresence ? (vm.sugarPresence.isConnected() ? vm.sugarPresence.isHost : true) : true;
      setTimeout(() => {
        vm.resize();
      }, 0);
      return vm.canRestart;
    }
  },
  methods: {
    resize: function() {
      var vm = this;
      var toolbarElem = document.getElementById("main-toolbar");
      var toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 0;
      var newHeight = window.innerHeight - toolbarHeight;
      var newWidth = window.innerWidth;
      var ratio = newWidth / newHeight;

      document.querySelector('#result-view').style.height = newHeight + "px";
      if (vm.playersAll.length != 0) {
        document.querySelector('.btn-rankings-block').style.width = document.querySelector('.btn-rankings-block').offsetHeight + "px";
      }
      if (vm.canRestart) {
        document.querySelector('.btn-restart-block').style.width = document.querySelector('.btn-restart-block').offsetHeight + "px";
      }
      if (vm.qNo > 1) {
        document.querySelector('.btn-previous-page').style.width = document.querySelector('.btn-previous-page').offsetHeight + "px";
        document.querySelector('.page-no').style.width = document.querySelector('.page-no').offsetHeight + "px";
        document.querySelector('.btn-next-page').style.width = document.querySelector('.btn-next-page').offsetHeight + "px";
      }

      if (ratio < 1) {
        // stack up panels
        if (document.querySelector('.result-panel-main')) {
          var resultPanelMain = document.querySelectorAll('.result-panel-main');
          for (var i = 0; i < resultPanelMain.length; i++) {
            resultPanelMain[i].style.flexDirection = 'column';
            resultPanelMain[i].children[0].style.width = '98%';
            resultPanelMain[i].children[1].style.width = '98%';
          }
        }

      } else {
        //change width, height of panels
        if (document.querySelector('.result-panel-main')) {
          var resultPanelMain = document.querySelectorAll('.result-panel-main');
          for (var i = 0; i < resultPanelMain.length; i++) {
            resultPanelMain[i].style.flexDirection = 'row';
            resultPanelMain[i].children[0].style.width = '48%';
            resultPanelMain[i].children[1].style.width = '48%';
          }
        }
      }

    },

    initializeSlots: function() {
      var vm = this;
      vm.questionSet = [];
      vm.bestSlots = [];
      vm.mySlots = [];
      vm.timeForEachQuestion = [];

      var initQno = (vm.currentPage - 1) * vm.visibleItemsPerPageCount;
      var len = vm.qNo + 1 - initQno;
      if (len > vm.visibleItemsPerPageCount) {
        len = vm.visibleItemsPerPageCount;
      }

      for (var i = initQno; i < initQno + len; i++) {
        vm.questionSet.push(vm.questions[i]);
        vm.timeForEachQuestion.push(vm.timeTaken[i]);
      }

      for (var qno = initQno; qno < initQno + len; qno++) {
        var slotsArr = [];
        var slots = rpnToSlots(vm.questions[qno].bestSoln);

        for (var i = 0; i < slots.length; i++) {
          var slotObj = {
            num1: {
              type: null,
              val: null
            },
            operator: null,
            num2: {
              type: null,
              val: null
            },
            res: null,
            useless: false,
          }

          slotObj.num1.val = slots[i][0].val;
          slotObj.num1.type = slots[i][0].type;
          slotObj.operator = slots[i][1];
          slotObj.num2.val = slots[i][2].val;
          slotObj.num2.type = slots[i][2].type;
          slotObj.res = slots[i][3];

          slotsArr.push(slotObj)
        }
        vm.bestSlots.push(slotsArr);
        vm.mySlots.push(vm.slots[qno]);
      }
    },

    pageChangeHandler: function(value) {
      switch (value) {
        case 'next':
          if (this.currentPage < this.pageCount) {
            this.currentPage += 1
          }
          break
        case 'previous':
          if (this.currentPage > 1) {
            this.currentPage -= 1
          }
          break
        default:
          this.currentPage = value
      }
      this.initializeSlots();
    }

  }
}
