var Slots = {
  components: {
    "inputNumber": InputNumber
  },
  props: ['strokeColor', 'fillColor', 'targetNum', 'slots', 'emptyLinesAllowed'],
  template: `
    <div class="list-slots">
      <div class="slot" v-for="(slot,index) in slots" v-bind:key="index">
        <inputNumber
          v-bind:class="{
            'number': slot.num1.type === 0,
          }"
          v-bind:fillColor="fillColor"
          v-bind:type="slot.num1.type"
          v-bind:number="slot.num1.val"
        ></inputNumber>
        <div class="operator"
          v-bind:style="{backgroundColor: strokeColor}"
          v-bind:class="{
            'plus': slot.operator === '+',
            'minus': slot.operator === '-',
            'multiply': slot.operator === '*',
            'divide': slot.operator === '/',
           }"
        ></div>
        <inputNumber
          v-bind:class="{
            'number': slot.num2.type === 0,
          }"
          v-bind:fillColor="fillColor"
          v-bind:type="slot.num2.type"
          v-bind:number="slot.num2.val"
        ></inputNumber>

        <div class="symbol"> = </div>

        <div
          class="res"
          v-bind:style="{backgroundColor: fillColor}"
          v-bind:class="{'acheived': targetNum === slot.res && index === slots.length-1}"
        >{{slot.res}}</div>

      </div>
      <template>
        <div
          v-bind:style="{
            visibility: emptyLinesAllowed != null ? 'visible' : 'hidden'
          }"
          class="slot"
          v-for="index in (4-slots.length)"
          v-bind:key="index + slots.length">
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
      </template>

    </div>
  `,
}
