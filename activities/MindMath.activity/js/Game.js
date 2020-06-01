var Game = {
  components: {
    "clock": Clock,
    "slots": Slots,
  },
  template: `
    <div id="game-view">
      <div class="game-area-panel">
        <div class="details-area-section">
          <clock ref="clock"></clock>

          <div class="detail-block">
            <div class="detail-logo score-logo">
            </div>
            <div class="detail-content">
              <div class="score">{{ score }}</div>
            </div>
          </div>
        </div>


        <div class="list-numbers">
          <div class="btn-number diamond"
          v-for="(number,index) in inputNumbers"
          v-on:click="onSelectNumber(index)"
          v-bind:class="{ 'selected-num': index === currentSelectedNums.numIndex1 || index === currentSelectedNums.numIndex2 }"
          v-bind:key="index"
          >{{ number }}</div>
        </div>

        <div id="target-container">
        <div id="target-number">
          {{ targetNum }}
        </div>
        <button id="btn-validate"
        v-bind:class="{
          'disabled': currentRes != targetNum,
          'validate': currentRes === targetNum,
        }"
        ></button>

        </div>

        <div class="list-operators">
          <button class="btn-operator"
          v-for="(operator,index) in operators"
          v-bind:class="{ 'selected-op': index === currentSelectedOp }"
          v-bind:key="index"
          v-on:click="onSelectOperator(index)"
          >{{ operator }}</button>
        </div>

      </div>
      <div class="slots-area-panel">
        <slots ref="slots"></slots>
      </div>
    </div>
  `,
  data: function () {
    return {
      score:0,
      inputNumbers: [1,12,5,18,9],
      operators: ['+','-','/','x'],
      currentSelectedNums: {
        numIndex1: null,
        numIndex2: null,
        nums:[]
      },
      currentSelectedOp: null,
      targetNum: 12,
      currentRes: null,
    };
  },
  mounted: function () {

  },
  watch: {
  },
  methods: {
    resize: function () {
      var vm = this;
      var toolbarElem = document.getElementById("main-toolbar");
      var toolbarHeight = toolbarElem.style.opacity == 1 ? toolbarElem.offsetHeight + 3 : 0;
      var newHeight = window.innerHeight - toolbarHeight;
      var newWidth = window.innerWidth;
      //var ratio = window.innerWidth / window.innerHeight;
      var ratio = newWidth / newHeight;

      document.querySelector('#game-view').style.height = newHeight+"px";
      //for operators list
      /*for (var i = 0; i < 4; i++) {
        document.querySelectorAll('.btn-operator')[i].style.width = '18%';
        document.querySelectorAll('.btn-operator')[i].style.height = document.querySelectorAll('.btn-operator')[i].offsetWidth;
      }*/
      /*document.querySelector('#target-number').style.width = '20%';
      document.querySelector('#target-number').style.height = document.querySelector('#target-number').offsetWidth+'px';
      document.querySelector('#btn-validate').style.width = '20%';
      document.querySelector('#btn-validate').style.height = document.querySelector('#btn-validate').offsetWidth+'px';*/


      if (ratio < 1) {
        // stack up panels
        document.querySelector('#game-view').style.flexDirection = 'column';
        document.querySelector('.game-area-panel').style.width = '96%';
        //change width, height of panels
        document.querySelector('.game-area-panel').style.height = '56%';
        document.querySelector('.slots-area-panel').style.width = '96%';
        document.querySelector('.slots-area-panel').style.height = '40%';


      }
      else {
        document.querySelector('#game-view').style.flexDirection = 'row';
        //change width, height of panels
        document.querySelector('.game-area-panel').style.width = '48%';
        document.querySelector('.game-area-panel').style.height = '95%';
        document.querySelector('.slots-area-panel').style.width = '48%';
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
          var nextSlot = vm.$refs.slots.nextSlot;

          vm.$set(vm.$refs.slots.slots[nextSlot], 'num1',  vm.currentSelectedNums.nums[0]);
          vm.$set(vm.$refs.slots.slots[nextSlot], 'operator',  vm.operators[vm.currentSelectedOp]);
          vm.$set(vm.$refs.slots.slots[nextSlot], 'num2',  vm.currentSelectedNums.nums[1]);
          vm.$set(vm.$refs.slots.slots[nextSlot], 'res',  res);

          vm.$refs.slots.nextSlot++;

          //removing from inputNumbers
          var skipIndex1 = vm.currentSelectedNums.numIndex1;
          var skipIndex2 = vm.currentSelectedNums.numIndex2;
          var newNums = removeEntryFromArray(vm.inputNumbers, skipIndex1);
          if (skipIndex1 < skipIndex2) {
            skipIndex2--;
          }
          var newNums = removeEntryFromArray(newNums, skipIndex2);
          newNums.push(res);

          vm.currentRes = res;
          vm.inputNumbers = newNums;
        }

        //deselecting
        vm.currentSelectedOp = null;
        vm.$set(vm.currentSelectedNums,'numIndex1',null);
        vm.$set(vm.currentSelectedNums,'numIndex2',null);
        vm.currentSelectedNums.nums = removeEntryFromArray(vm.currentSelectedNums.nums, 0) ;
        vm.currentSelectedNums.nums = removeEntryFromArray(vm.currentSelectedNums.nums, 0) ;
      }
    },


  }
}
