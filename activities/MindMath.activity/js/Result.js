var Result = {
  components: {
    "slots": Slots,
    "clock": Clock,
  },
  props: ['strokeColor', 'fillColor','questions','qNo','time','score'],
  template: `
    <div id="result-view"
    >
      <div class="result-bar"
      v-bind:style="{backgroundColor: fillColor}"
      >
      </div>

      <div class="result-main"
      v-bind:style="{backgroundColor: fillColor}"
      >
          <template v-for="(panel, index) in questionSet" v-bind:key="index">
            <div class="result-panel">
              <div class="question-bar">

                <div class="question-number"
                v-for="(number,index) in panel.inputNumbers"
                v-bind:key="index"
                >{{ number }}</div>

                <div class="question-target"
                >{{ panel.targetNum }}</div>

              </div>
              <div class="result-panel-main">
                <div class="my-solution">
                  <div class="info-bar">

                    <div class="info-block"
                    >
                      <div class="info-block-logo clock-logo"></div>
                      <div class="info-block-content">
                        <clock
                        v-bind:time="time"
                        ></clock>
                      </div>
                    </div>

                    <div class="info-user-logo"></div>

                    <div class="info-block"
                    >
                      <div class="info-block-logo score-logo"></div>
                      <div class="info-block-content">
                        <div>{{ score }}</div>
                      </div>
                    </div>

                  </div>
                  <div class="solution-main">
                    <slots
                    v-bind:strokeColor="strokeColor"
                    v-bind:fillColor="fillColor"
                    v-bind:targetNum="panel.targetNum"
                    v-bind:slots="allSlots[index]"
                    ></slots>
                  </div>
                </div>

                <div class="best-solution">
                  <div class="info-bar">
                    <div class="info-block"
                    >
                      <div class="info-block-logo bestSoln-logo"></div>
                      <div class="info-block-content">
                        <div>Best</div>
                      </div>
                    </div>
                  </div>

                  <div class="solution-main">
                    <slots
                    v-bind:strokeColor="strokeColor"
                    v-bind:fillColor="fillColor"
                    v-bind:targetNum="panel.targetNum"
                    v-bind:slots="allSlots[index]"
                    ></slots>
                  </div>
                </div>

              </div>

            </div>
          </template>

      </div>

    </div>
  `,
  data: function () {
    return {
      inputNumbers: [1,12,5,18,9],
      targetNum: 12,
      questionSet: [],
      allSlots:[]
    };
  },
  created: function () {
    var vm = this;
    window.addEventListener('resize', vm.resize)
    vm.initializeSlots();
  },
  destroyed: function() {
    var vm = this;
    window.removeEventListener("resize", vm.resize);
  },
  mounted: function () {
    var vm = this;
    vm.resize();
  },
  methods: {
    resize: function () {
      var vm = this;
      var toolbarElem = document.getElementById("main-toolbar");
      var toolbarHeight = toolbarElem.style.opacity == 1 ? toolbarElem.offsetHeight + 3 : 0;
      var newHeight = window.innerHeight - toolbarHeight;
      var newWidth = window.innerWidth;
      var ratio = newWidth / newHeight;

      document.querySelector('#result-view').style.height = newHeight+"px";

      if (ratio < 1) {
        // stack up panels
        if (document.querySelector('.result-panel-main')) {
          document.querySelector('.result-panel-main').style.flexDirection = 'column';
          document.querySelector('.my-solution').style.width = '98%';
          document.querySelector('.best-solution').style.width = '98%';
        }

      }
      else {
        //change width, height of panels
        if (document.querySelector('.result-panel-main')) {
          document.querySelector('.result-panel-main').style.flexDirection = 'row';
          document.querySelector('.my-solution').style.width = '48%';
          document.querySelector('.best-solution').style.width = '48%';
        }

      }

    },
    initializeSlots: function () {
      var vm = this;
      vm.questionSet = [];
      vm.allSlots = [];

      for (var i = 0; i <= vm.qNo; i++) {
        vm.questionSet.push(vm.questions[i]);
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
        vm.allSlots.push(slotsArr);
      }
      //vm.inputNumbers = vm.question.inputNumbers;
      //vm.targetNum = vm.question.targetNum;
    }
  }
}
