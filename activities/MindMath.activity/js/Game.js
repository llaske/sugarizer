var Game = {
  components: {
    "clock": Clock,
    "slots-component": Slots,
  },
  props: ['time','strokeColor','fillColor','questions', 'qNo','score', 'mode','sugarPopup','slots','inputNumbers','inputNumbersTypes'],
  template: `
    <div id="game-view">
      <div class="game-area-panel"
      v-bind:style="{backgroundColor: fillColor}"
      >

        <div class="game-area-container">
          <div class="details-bar">

            <div class="detail-block"
            v-if="mode === 'timer'"
            v-bind:style="{backgroundColor: strokeColor}"
            >
              <div class="detail-block-logo clock-logo"></div>
              <div class="detail-block-content">
                <clock
                v-bind:time="time"
                ></clock>
              </div>
            </div>

            <div id="target-number"
            >{{ targetNum }}</div>

            <div class="detail-block"
            v-if="mode === 'timer'"
            v-bind:style="{backgroundColor: strokeColor}"
            >
              <div class="detail-block-logo score-logo"></div>
              <div class="detail-block-content">
                <div>{{ score }}</div>
              </div>
            </div>

          </div>

          <div class="list-numbers">
            <div class="btn-number"
            v-for="(number,index) in inputNumbers"
            v-on:click="onSelectNumber(index)"
            v-bind:class="{
              'selected-num': index === currentSelectedNums.numIndex1 || index === currentSelectedNums.numIndex2,
              'diamond': inputNumbersTypes[index] === 0
            }"
            v-bind:key="index"
            >{{ number }}</div>
          </div>

          <div class="list-operators">
            <button class="btn-operator"
            v-for="(operator,index) in operators"
            v-bind:class="{
              'selected-op': index === currentSelectedOp,
              'plus': operator === '+',
              'minus': operator === '-',
              'multiply': operator === 'x',
              'divide': operator === '/',
             }"
            v-bind:key="index"
            v-on:click="onSelectOperator(index)"
            v-bind:style="{backgroundColor: strokeColor}"
            ></button>
          </div>

          <div class="footer-bar">
            <transition name="fade"  mode="out-in">
              <div id="validate-button"
              v-on:click="validate"
              v-if="compulsoryOpUsed && currentRes === targetNum"
              ></div>
            </transition>
          </div>

        </div>

      </div>

      <div class="slots-area-panel"
      v-bind:style="{backgroundColor: fillColor}"
      >
        <slots-component ref="slots"
        v-bind:strokeColor="strokeColor"
        v-bind:fillColor="fillColor"
        v-bind:targetNum="targetNum"
        v-bind:slots="slots"
        ></slots-component>
      </div>

    </div>
  `,
  data: function () {
    return {
      operators: ['+','-','/','x'],
      currentSelectedNums: {
        numIndex1: null,
        numIndex2: null,
        nums:[]
      },
      currentSelectedOp: null,
      targetNum: 12,
      compulsoryOp: null,
      currentRes: null,
      compulsoryOpUsed: false,
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
    //Initialize question
    vm.targetNum = vm.questions[vm.qNo].targetNum;
    vm.compulsoryOp = vm.questions[vm.qNo].compulsoryOp;
    if (vm.compulsoryOp == null) {
      vm.compulsoryOpUsed = true;
    }

    vm.resize();
  },
  watch: {
    questions: function (newVal) {
      var vm = this;
      //Initialize question
      vm.targetNum = newVal[vm.qNo].targetNum;
      vm.compulsoryOp = newVal[vm.qNo].compulsoryOp;
      if (vm.compulsoryOp == null) {
        vm.compulsoryOpUsed = true;
      }
    },
    slots: function (newVal) {
      var vm = this;
      if (vm.slots.length!=0) {
        vm.currentRes = vm.slots[vm.slots.length-1].res;
      }else {
        vm.currentRes = null;
      }
    }
  },
  methods: {
    resize: function () {
      var vm = this;
      var toolbarElem = document.getElementById("main-toolbar");
      var toolbarHeight = toolbarElem.style.opacity == 1 ? toolbarElem.offsetHeight + 3 : 0;
      var newHeight = window.innerHeight - toolbarHeight;
      var newWidth = window.innerWidth;
      var ratio = newWidth / newHeight;

      document.querySelector('#game-view').style.height = newHeight+"px";

      if (ratio < 1) {
        // stack up panels
        document.querySelector('#game-view').style.flexDirection = 'column';
        document.querySelector('.game-area-panel').style.width = '98.4%';
        //change width, height of panels
        document.querySelector('.game-area-panel').style.height = '60%';
        document.querySelector('.slots-area-panel').style.width = '98.4%';
        document.querySelector('.slots-area-panel').style.height = '38%';
      }
      else {
        document.querySelector('#game-view').style.flexDirection = 'row';
        //change width, height of panels
        document.querySelector('.game-area-panel').style.width = '56.4%';
        document.querySelector('.game-area-panel').style.height = '95%';
        document.querySelector('.slots-area-panel').style.width = '40.4%';
        document.querySelector('.slots-area-panel').style.height = '95%';
      }
    },
    onSelectNumber: function (index) {
      var vm = this;
      if (vm.currentSelectedNums.numIndex1 === index) {
        //deselecting
        if (vm.currentSelectedNums.numIndex2 != null) {
          vm.$set(vm.currentSelectedNums,'numIndex1',vm.currentSelectedNums.numIndex2);
          vm.$set(vm.currentSelectedNums,'numIndex2',null);
        }else {
          vm.$set(vm.currentSelectedNums,'numIndex1',null);
        }
        vm.currentSelectedNums.nums = removeEntryFromArray(vm.currentSelectedNums.nums, 0) ;
        return;
      }
      else if (vm.currentSelectedNums.numIndex2 === index) {
        //deselecting
        vm.$set(vm.currentSelectedNums,'numIndex2',null);
        vm.currentSelectedNums.nums = removeEntryFromArray(vm.currentSelectedNums.nums, 1) ;
        return;
      }

      if (vm.currentSelectedNums.nums.length >= 2) {
        return;
      }
      else {
        var at = vm.currentSelectedNums.nums.length;
        vm.$set(vm.currentSelectedNums.nums, at, vm.inputNumbers[index]);
        vm.$set(vm.currentSelectedNums, 'numIndex'+(at+1), index);
        vm.computeOperation();
      }
    },
    onSelectOperator: function (index) {
      var vm = this;
      if (vm.currentSelectedOp === index ) {
        //deselecting
        vm.currentSelectedOp = null;
      }
      else{
        vm.currentSelectedOp = index;
        vm.computeOperation();
      }
    },
    computeOperation: function () {
      var vm = this;
      if (vm.currentSelectedOp != null && vm.currentSelectedNums.nums.length == 2) {
        var res;
        var num1 = vm.currentSelectedNums.nums[0];
        var num2 = vm.currentSelectedNums.nums[1];
        switch(vm.operators[vm.currentSelectedOp]) {
          case '+':
            res = num1 + num2;
            break;
          case '-':
            res = num1 - num2;
            break;
          case '/':
            res = num1 / num2;
            break;
          case 'x':
            res = num1 * num2;
            break;
        }
        if (allowedCheck(res)) {
          //filling Slots

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

          slotObj.num1.val = vm.currentSelectedNums.nums[0];
          slotObj.num1.type = vm.inputNumbersTypes[vm.currentSelectedNums.numIndex1];
          slotObj.operator = vm.operators[vm.currentSelectedOp];
          slotObj.num2.val = vm.currentSelectedNums.nums[1];
          slotObj.num2.type = vm.inputNumbersTypes[vm.currentSelectedNums.numIndex2];
          slotObj.res = res;

          //removing from inputNumbers
          var skipIndex1 = vm.currentSelectedNums.numIndex1;
          var skipIndex2 = vm.currentSelectedNums.numIndex2;

          var updateObj = {
            type: "add",
            data: {
              slot: slotObj,
              skipIndex1: skipIndex1,
              skipIndex2: skipIndex2,
            },
          }
          vm.$emit('slots-update', updateObj);

          //check if the operator used is compulsoryOp
          if (vm.operators[vm.currentSelectedOp] === vm.compulsoryOp) {
            vm.compulsoryOpUsed = true;
          }

          if (vm.compulsoryOpUsed && res === vm.targetNum ) {
            //notifying user
            vm.sugarPopup.log("You Got the Target Number")
          }

        }else {
          //notify user for an invalid operation
          vm.sugarPopup.log("Invalid option");
        }

        //deselecting
        vm.currentSelectedOp = null;
        vm.$set(vm.currentSelectedNums,'numIndex1',null);
        vm.$set(vm.currentSelectedNums,'numIndex2',null);
        vm.currentSelectedNums.nums = removeEntryFromArray(vm.currentSelectedNums.nums, 0) ;
        vm.currentSelectedNums.nums = removeEntryFromArray(vm.currentSelectedNums.nums, 0) ;
      }
    },
    validate: function () {
      var vm = this;
      if (vm.currentRes === vm.targetNum) {
        //var newScore = vm.score + vm.calculateScore();
        var endObj = {
          type: "validate",
        }
        vm.$emit('end-game', endObj);
      }
    },

  }
}
