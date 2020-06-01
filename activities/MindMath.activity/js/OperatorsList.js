var OperatorsList = {
  template: `
    <div class="list-operators">
      <button class="btn-operator" v-for="(operator,index) in operators" v-bind:style="{ background: bgColors[index] }" v-key="index">{{ operator }}</button>
    </div>
  `,
  data: function () {
    return {
      operators: ['+','-','/','*'],
      bgColors: ["#37AEC0","#AEA621","#DA5074","#C98E00"]
    };
  },
  mounted: function () {

  }
}
