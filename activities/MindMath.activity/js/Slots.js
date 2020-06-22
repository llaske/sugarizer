var Slots = {
  components: {
    "inputNumber": InputNumber
  },
  props: ['strokeColor', 'fillColor', 'targetNum', 'slots', 'emptyLinesAllowed', 'compulsoryOpsForQuestion', 'compulsoryOpsRem'],
  template: `
    <div class="list-slots">
      <div class="slot" v-for="(slot,index) in slots" v-bind:key="index">
        <inputNumber class="slotChild"
          v-bind:class="{
            'number': slot.num1.type === 0,
          }"
          v-bind:fillColor="slot.useless ? 'rgba(0, 0, 0, 0.4)' : fillColor"
          v-bind:type="slot.num1.type"
          v-bind:number="slot.num1.val"
        ></inputNumber>
        <div class="slotChild operator"
          v-bind:style="[slot.useless ? {backgroundColor: 'rgba(0, 0, 0, 0.4)'} : {backgroundColor: strokeColor}]"
          v-bind:class="{
            'plus': slot.operator === '+',
            'minus': slot.operator === '-',
            'multiply': slot.operator === '*',
            'divide': slot.operator === '/',
            'circle': compulsoryOpsForQuestion && compulsoryOpsForQuestion.indexOf(slot.operator) !== -1
           }"
        ></div>
        <inputNumber class="slotChild"
          v-bind:class="{
            'number': slot.num2.type === 0,
          }"
          v-bind:fillColor="slot.useless ? 'rgba(0, 0, 0, 0.4)' : fillColor"
          v-bind:type="slot.num2.type"
          v-bind:number="slot.num2.val"
        ></inputNumber>

        <div class="slotChild symbol"> = </div>

        <div
          class="slotChild res"
          v-bind:style="[slot.useless ? {backgroundColor: 'rgba(0, 0, 0, 0.4)'} : {backgroundColor: fillColor}]"
          v-bind:class="{'acheived': (compulsoryOpsRem!=null ? compulsoryOpsRem.length===0 : true) && targetNum === slot.res && index === slots.length-1}"
        >{{slot.res}}</div>

      </div>
      <template>
        <div
          v-bind:style="{
            visibility: emptyLinesAllowed != null ? 'visible' : 'hidden'
          }"
          class="slot"
          v-for="index in (4-slots.length)"
          v-bind:key="index + slots.length"
        >
          <div class="slotChild empty-slot"></div>
          <div class="slotChild operator"
            v-bind:style="{backgroundColor: strokeColor}"
          ></div>
          <div class="slotChild empty-slot"></div>
          <div class="slotChild symbol"> = </div>
          <div class="slotChild empty-slot"></div>
        </div>
      </template>

    </div>
  `,
}
