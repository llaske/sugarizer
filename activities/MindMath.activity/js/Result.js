var Result = {
  components: {
    "slots": Slots,
  },
  props: ['strokeColor', 'fillColor','question','time'],
  template: `
    <div id="result-view"
    >

      <div class="solution-panel"
      v-bind:style="{backgroundColor: fillColor}"
      >
        <div class="list-numbers">
          <div class="btn-number result-btn-number diamond"
          v-for="(number,index) in inputNumbers"
          v-bind:key="index"
          >{{ number }}</div>
        </div>

        <slots ref="slots"
        v-bind:strokeColor="strokeColor"
        v-bind:fillColor="fillColor"
        v-bind:targetNum="question.targetNum"
        ></slots>

      </div>
      
      <div class="result-detail-panel"
      v-bind:style="{backgroundColor: fillColor}"
      >
        <div class="result-detail-block"
        v-bind:style="{backgroundColor: strokeColor}"
        ><div class="result-detail-logo score-logo"></div>
          <div class="result-detail-content"
          v-bind:style="{backgroundColor: strokeColor}"
          ><div class="score"> {{ score }} </div>
          </div>
        </div>

        <div class="result-detail-block"
        v-bind:style="{backgroundColor: strokeColor}"
        ><div class="result-detail-logo clock-logo"></div>
          <div class="result-detail-content"
          v-bind:style="{backgroundColor: strokeColor}"
          ><div class="clock"> {{ parsedClockTime }} </div>
          </div>
        </div>

      </div>

    </div>
  `,
  data: function () {
    return {
      score:0,
      inputNumbers: [1,12,5,18,9],
      targetNum: 12,
    };
  },
  created: function () {
    var vm = this;
    window.addEventListener('resize', vm.resize)
  },
  destroyed: function() {
    var vm = this;
    window.removeEventListener("resize", vm.resize);
  },
  mounted: function () {
    var vm = this;
    var slotsArr = [];
    var slots = rpnToSlots(vm.question.bestSoln);
    for (var i = 0; i < slots.length; i++) {
      var nextSlot = vm.$refs.slots.nextSlot;

      vm.$set(vm.$refs.slots.slots[nextSlot], 'num1',  slots[i][0]);
      vm.$set(vm.$refs.slots.slots[nextSlot], 'operator',  slots[i][1]);
      vm.$set(vm.$refs.slots.slots[nextSlot], 'num2',  slots[i][2]);
      vm.$set(vm.$refs.slots.slots[nextSlot], 'res',  slots[i][3]);
      vm.$refs.slots.nextSlot++;
    }

    vm.inputNumbers = vm.question.inputNumbers;
    vm.targetNum = vm.question.targetNum;

    vm.resize();
  },
  computed: {
    parsedClockTime: function() {
      var timeInSeconds = this.time;
      var pad = function(num, size) {
          return ('000' + num).slice(size * -1);
        },
        time = parseFloat(timeInSeconds).toFixed(3),
        hours = Math.floor(time / 60 / 60),
        minutes = Math.floor(time / 60) % 60,
        seconds = Math.floor(time - minutes * 60),
        milliseconds = time.slice(-3);
      return pad(minutes, 2) + ':' + pad(seconds, 2);
    },
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
      //document.querySelector('.result-panel').style.width = '80%';
      //document.querySelector('.result-panel').style.height = '95%';

      if (ratio < 1) {
        // stack up panels
        document.querySelector('#result-view').style.flexDirection = 'column';
        document.querySelector('.solution-panel').style.width = '98.4%';
        //change width, height of panels
        document.querySelector('.solution-panel').style.height = '60%';
        document.querySelector('.result-detail-panel').style.width = '98.4%';
        document.querySelector('.result-detail-panel').style.height = '38%';
      }
      else {
        document.querySelector('#result-view').style.flexDirection = 'row';
        //change width, height of panels
        document.querySelector('.solution-panel').style.width = '66.4%';
        document.querySelector('.solution-panel').style.height = '95%';
        document.querySelector('.result-detail-panel').style.width = '30.4%';
        document.querySelector('.result-detail-panel').style.height = '95%';
      }

    },
  }
}
