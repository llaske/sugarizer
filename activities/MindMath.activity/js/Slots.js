var Slots = {
  template: `
    <div class="list-slots">
      <div class="slot" v-for="(slot,index) in slots" v-key="index">
        <button class="number">{{slot.num1}}</button>
        <button class="operator">{{slot.operator}}</button>
        <button class="number">{{slot.num2}}</button>
        <button class="symbol"> = </button>
        <button class="number">{{slot.res}}</button>
      </div>

    </div>
  `,
  data: function () {
    return {
      slots: [
        {
          num1:null,
          operator: null,
          num2: null,
          res: null
        },
        {
          num1:null,
          operator: null,
          num2: null,
          res: null
        },
        {
          num1:null,
          operator: null,
          num2: null,
          res: null
        },
        {
          num1:null,
          operator: null,
          num2: null,
          res: null
        }
      ],
      nextSlot: 0,
    };
  },
  mounted: function () {

  }
}
