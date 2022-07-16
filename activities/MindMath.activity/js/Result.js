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
              class="btn-general-block btn-previous-page"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="pageChangeHandler('previous')"
            >
            </button>
            <button
              v-if="qNo > 1"
              class="btn-general-block page-no"
              v-bind:style="{backgroundColor: fillColor}"
            >
              {{ currentPage }}/{{ pageCount }}
            </button>
            <button
              v-if="qNo > 1"
              v-bind:disabled="isNextButtonDisabled"
              class="btn-general-block btn-next-page"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="pageChangeHandler('next')"
            >
            </button>
          </div>
          <div class="footer-actions">
            <button
              v-if="playersAll.length!=0"
              class="btn-general-block btn-rankings-block"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="$emit('see-leaderboard')"
            >
            </button>
            <button
              v-if="isRestartButtonVisible"
              v-bind:disabled="disabled"
              class="btn-general-block btn-restart-block"
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
  unmounted: function() {
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
      vm.canRestart = vm.sugarPresence ? (vm.sugarPresence.isShared() ? vm.sugarPresence.isHost : true) : true;
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
      var toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 3;
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
    },

    generateXOLogoWithColor: function (strokeColor, fillColor) {
      var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';
      var coloredLogo = xoLogo;
      coloredLogo = coloredLogo.replace("#010101", strokeColor)
      coloredLogo = coloredLogo.replace("#FFFFFF", fillColor)
      return "data:image/svg+xml;base64," + btoa(coloredLogo);
    }

  }
}
