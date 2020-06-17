var Leaderboard = {
  props: ['strokeColor', 'fillColor', 'playersAll'],
  template: `
    <div id="leaderboard-view">
      <div class="leaderboard-main">
        <div
          class="leaderboard-main-header"
        >
          <div class="leaderboard-item" style="width:25%">Rank</div>
          <div class="leaderboard-item" style="width:50%">User</div>
          <div class="leaderboard-item" style="width:25%">Score</div>
        </div>
        <div
          class="leaderboard-main-body"
        >
          <div
            class="leaderboard-panel-container"
            v-for="(item, index) in players"
            v-bind:key="index"
            v-bind:style="{borderColor: item.user.colorvalue.stroke}"
          >
            <div class="leaderboard-item leaderboard-item-rank">{{  index + 1  }}</div>
            <div
              class="leaderboard-item leaderboard-item-icon"
              v-bind:style="{backgroundImage: 'url('+ generateXOLogoWithColor(item.user.colorvalue.stroke, item.user.colorvalue.fill)+')'}"
            ></div>
            <div class="leaderboard-item leaderboard-item-name">{{  item.user.name  }}</div>
            <div class="leaderboard-item leaderboard-item-score">{{  item.score  }}</div>
          </div>
        </div>
      </div>
      <div class="leaderboard-footer">
        <div class="btn-block btn-solution-block"
          v-bind:style="{backgroundColor: fillColor}"
          v-on:click="$emit('see-solution')"
        >
        </div>
        <div class="btn-block btn-restart-block"
          v-bind:style="{backgroundColor: fillColor}"
        >
        </div>
      </div>
    </div>
  `,
  data: function () {
    return {
      players: []
    }
  },
  created: function() {
    var vm = this;
    window.addEventListener('resize', vm.resize)
    vm.sortLeaderboard();
  },
  destroyed: function() {
    var vm = this;
    window.removeEventListener("resize", vm.resize);
  },
  mounted: function() {
    var vm = this;
    vm.resize();
  },
  watch: {
    playersAll: function () {
      var vm = this;
      vm.sortLeaderboard();
    }
  },
  methods: {
    resize: function() {
      var vm = this;
      var toolbarElem = document.getElementById("main-toolbar");
      var toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 0;
      var newHeight = window.innerHeight - toolbarHeight;

      document.querySelector('#leaderboard-view').style.height = newHeight + "px";
      document.querySelector('.btn-restart-block').style.width = document.querySelector('.btn-restart-block').offsetHeight + "px";
      document.querySelector('.btn-solution-block').style.width = document.querySelector('.btn-solution-block').offsetHeight + "px";

    },

    sortLeaderboard: function () {
      var vm = this;
      vm.players = [];
      for (var i = 0; i < vm.playersAll.length; i++) {
        vm.players.push(vm.playersAll[i]);
      }

      vm.players.sort(function (a, b) {
        return b.score - a.score;
      })

    }
  }
}
