var Result = {
  components: {
    "slots": Slots,
  },
  props: ['strokeColor', 'fillColor','question'],
  template: `
    <div id="result-view"
    >
      <div class="result-panel"
      v-bind:style="{backgroundColor: fillColor}"
      >
      <slots ref="slots"
      v-bind:strokeColor="strokeColor"
      v-bind:fillColor="fillColor"
      v-bind:targetNum="question.targetNum"
      ></slots>

      </div>
    </div>
  `,
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
      document.querySelector('.result-panel').style.width = '80%';
      document.querySelector('.result-panel').style.height = '95%';

    }
  }
}
