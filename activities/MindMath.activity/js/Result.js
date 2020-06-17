var Result = {
  components: {
    "slots-component": Slots,
    "clock": Clock,
    "inputNumber": InputNumber
  },
  props: ['strokeColor', 'fillColor', 'questions', 'qNo', 'time', 'score', 'slots', 'scores', 'timeTaken', 'compulsoryOpsForEachQuestion', 'playersAll'],
  template: `
    <div id="result-view"
    >
      <div class="result-header">
        <div class="result-bar"
        >
          <div class="result-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          >
            <clock v-bind:time="totalTime" text="Total Time: "></clock>
          </div>

          <div class="result-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          > Total Score: {{ score }}</div>

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
                    <div class="info-block"
                    >
                      <div class="info-block-logo clock-logo"></div>
                      <div class="info-block-content">
                        <clock v-bind:time="timeForEachQuestion[index]"></clock>
                      </div>
                    </div>

                    <div class="info-user-logo"></div>

                    <div class="info-block"
                    >
                      <div class="info-block-logo score-logo"></div>
                      <div class="info-block-content">
                        <div>{{ scores[index] }}</div>
                      </div>
                    </div>

                  </div>
                  <div class="solution-main">
                    <slots-component
                      v-if="mySlots[index].length!=0"
                      v-bind:strokeColor="strokeColor"
                      v-bind:fillColor="fillColor"
                      v-bind:targetNum="panel.targetNum"
                      v-bind:slots="mySlots[index]"
                      v-bind:compulsoryOpsForQuestion="compulsoryOpsForEachQuestion[index]"
                    ></slots-component>
                  </div>
                </div>

                <div class="best-solution">
                  <div class="info-bar">
                    <div class="info-block"
                    >
                      <div class="info-block-logo bestSoln-logo"></div>
                      <div class="info-block-content">
                        <div></div>
                      </div>
                    </div>
                  </div>

                  <div class="solution-main">
                    <slots-component
                    v-bind:strokeColor="strokeColor"
                    v-bind:fillColor="fillColor"
                    v-bind:targetNum="panel.targetNum"
                    v-bind:slots="bestSlots[index]"
                    v-bind:compulsoryOpsForQuestion="compulsoryOpsForEachQuestion[index]"
                    ></slots-component>
                  </div>
                </div>

              </div>

            </div>
          </template>
      </div>

      <div class="result-footer">
          <div class="btn-block btn-back-block"
            v-if="playersAll.length!= 0"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="$emit('go-to-leaderboard')"
          >
          </div>
          <div
            v-else
            class="btn-block btn-restart-block"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="$emit('restart-game')"
          >
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
    vm.resize();
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
      if (vm.playersAll.length!=0) {
        document.querySelector('.btn-back-block').style.width = document.querySelector('.btn-back-block').offsetHeight + "px";
      } else {
        document.querySelector('.btn-restart-block').style.width = document.querySelector('.btn-restart-block').offsetHeight + "px";
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

      for (var i = 0; i <= vm.qNo; i++) {
        vm.questionSet.push(vm.questions[i]);
        vm.timeForEachQuestion.push(vm.timeTaken[i]);
      }

      for (var qno = 0; qno < vm.questionSet.length; qno++) {
        var slotsArr = [];
        var slots = rpnToSlots(vm.questionSet[qno].bestSoln);

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
            res: null
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
    }
  }
}
