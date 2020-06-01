var NumbersList = {
  props: {
    "inputNumbers": Array,
  },
  template: `
    <div class="list-numbers">
      <button class="btn-number diamond"
      v-for="(number,index) in inputNumbers"
      v-on:click="onSelectNumber"
      v-key="index"
      >{{ number }}</button>
    </div>
  `,
  data: function () {
    return {

    };
  },
  mounted: function () {

  },
  methods: {
    onSelectNumber: function () {

    }
  }
}
