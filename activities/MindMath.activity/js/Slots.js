var Slots = {
  props: ['strokeColor', 'fillColor', 'targetNum', 'slots'],
  template: `
    <div class="list-slots">
      <div class="slot" v-for="(slot,index) in slots" v-key="index">
        <div
        v-bind:class="{
          'number': slot.num1.type === 0,
        }"
        >{{slot.num1.val}}</div>
        <div class="operator"
        v-bind:style="{backgroundColor: strokeColor}"
        v-bind:class="{
          'plus': slot.operator === '+',
          'minus': slot.operator === '-',
          'multiply': slot.operator === 'x',
          'divide': slot.operator === '/',
         }"
        ></div>
        <div
        v-bind:class="{
          'number': slot.num2.type === 0,
        }"
        >{{slot.num2.val}}</div>

        <div class="symbol"> = </div>

        <div
        v-bind:class="{'acheived': targetNum === slot.res && index === slots.length-1}"
        >{{slot.res}}</div>

      </div>

      <div class="slot" v-for="index in (4-slots.length)" v-key="index">
        <div
        class="empty-slot"
        ></div>
        <div class="operator"
        v-bind:style="{backgroundColor: strokeColor}"
        ></div>
        <div
        class="empty-slot"
        ></div>

        <div class="symbol"> = </div>

        <div
        class="empty-slot"
        ></div>

      </div>

    </div>
  `,
  mounted: function () {

  },
}
