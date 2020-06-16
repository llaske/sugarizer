var Leaderboard = {
  props: ['strokeColor', 'fillColor'],
  template: `
    <div id="leaderboard-view">
      <div class="leaderboard-main">
      </div>
      <div class="leaderboard-footer">
        <div class="btn-solution-block"
          v-bind:style="{backgroundColor: fillColor}"
        >
        </div>
        <div class="restart-block"
          v-bind:style="{backgroundColor: fillColor}"
        >
        </div>
      </div>
    </div>
  `,
  created: function() {
    var vm = this;
    window.addEventListener('resize', vm.resize)
  },
  destroyed: function() {
    var vm = this;
    window.removeEventListener("resize", vm.resize);
  },
  mounted: function() {
    var vm = this;
    vm.resize();
  },
  methods: {
    resize: function () {
      var vm = this;
      var toolbarElem = document.getElementById("main-toolbar");
      var toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 0;
      var newHeight = window.innerHeight - toolbarHeight;

      document.querySelector('#leaderboard-view').style.height = newHeight + "px";
      document.querySelector('.restart-block').style.width = document.querySelector('.restart-block').offsetHeight + "px";
      document.querySelector('.btn-solution-block').style.width = document.querySelector('.btn-solution-block').offsetHeight + "px";

    }
  }
}
