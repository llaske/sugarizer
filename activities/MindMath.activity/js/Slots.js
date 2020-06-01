var Slots = {
  template: `
    <div class="list-slots">
      <div class="slot" v-for="(slot,index) in slots" v-key="index">
        <div class="number">{{slot.num1}}</div>
        <div class="operator">{{slot.operator}}</div>
        <div class="number">{{slot.num2}}</div>
        <div class="symbol diamond"> = </div>
        <div class="number">{{slot.res}}</div>
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
