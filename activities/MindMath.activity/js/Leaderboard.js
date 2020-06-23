var Leaderboard = {
  props: ['strokeColor', 'fillColor', 'playersAll', 'playersPlaying', 'l10n'],
  template: `
    <div id="leaderboard-view">
      <div class="leaderboard-main">
        <div
          class="leaderboard-main-header"
          v-bind:style="{backgroundColor: fillColor}"
        >
          <div class="leaderboard-item" style="width:25%">{{ l10n.stringRank }}</div>
          <div class="leaderboard-item" style="width:50%">{{ l10n.stringUser }}</div>
          <div class="leaderboard-item" style="width:25%">{{ l10n.stringScore }}</div>
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
            <div class="leaderboard-item leaderboard-item-rank">{{  initP + index + 1  }}</div>
            <div
              class="leaderboard-item leaderboard-item-icon"
              v-bind:style="{backgroundImage: 'url('+ generateXOLogoWithColor(item.user.colorvalue.stroke, item.user.colorvalue.fill)+')'}"
            ></div>
            <div class="leaderboard-item leaderboard-item-name">{{  item.user.name  }}</div>
            <div class="leaderboard-item leaderboard-item-score">{{  item.score!=null ? item.score : "--" }}</div>
          </div>
        </div>
      </div>
      <div class="leaderboard-footer">
        <div class="pagination">
          <button
            v-bind:disabled="isPreviousButtonDisabled"
            class="btn-block btn-previous-page"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="pageChangeHandler('previous')"
          >
          </button>
          <button
            class="btn-block page-no"
            v-bind:style="{backgroundColor: fillColor}"
          >
            {{ currentPage }}/{{ pageCount }}
          </button>
          <button
            v-bind:disabled="isNextButtonDisabled"
            class="btn-block btn-next-page"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="pageChangeHandler('next')"
          >
          </button>
        </div>
        <div class="footer-actions">
          <button class="btn-block btn-back-block"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="$emit('go-to-result')"
          >
          </button>
        </div>
      </div>
    </div>
  `,
  data: function() {
    return {
      players: [],
      currentPage: 1,
      pageCount: 1,
      visibleItemsPerPageCount: 10,
      initP: 0
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
    vm.pageCount = Math.ceil(vm.playersAll.length / vm.visibleItemsPerPageCount);
    vm.resize();
  },
  watch: {
    playersAll: function() {
      var vm = this;
      vm.pageCount = Math.ceil(vm.playersAll.length / vm.visibleItemsPerPageCount);
      vm.sortLeaderboard();
    },

    playersPlaying: function() {
      var vm = this;
      vm.sortLeaderboard();
    }
  },
  computed: {
    isPreviousButtonDisabled: function() {
      return this.currentPage === 1
    },

    isNextButtonDisabled: function() {
      return this.currentPage === this.pageCount
    }
  },
  methods: {
    resize: function() {
      var vm = this;
      var toolbarElem = document.getElementById("main-toolbar");
      var toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 0;
      var newHeight = window.innerHeight - toolbarHeight;

      document.querySelector('#leaderboard-view').style.height = newHeight + "px";
      document.querySelector('.btn-back-block').style.width = document.querySelector('.btn-back-block').offsetHeight + "px";
      document.querySelector('.btn-previous-page').style.width = document.querySelector('.btn-previous-page').offsetHeight + "px";
      document.querySelector('.page-no').style.width = document.querySelector('.page-no').offsetHeight + "px";
      document.querySelector('.btn-next-page').style.width = document.querySelector('.btn-next-page').offsetHeight + "px";

    },

    sortLeaderboard: function(all) {
      var vm = this;
      vm.players = [];
      var tmp = [];

      for (var i = 0; i < vm.playersAll.length; i++) {
        tmp.push(vm.playersAll[i]);
      }

      tmp.sort(function(a, b) {
        return b.score - a.score;
      })

      vm.initP = (vm.currentPage - 1) * vm.visibleItemsPerPageCount;
      var len = vm.playersAll.length - vm.initP;
      if (len > vm.visibleItemsPerPageCount) {
        len = vm.visibleItemsPerPageCount;
      }
      vm.players = tmp.slice(vm.initP, vm.initP + len);
    },

    pageChangeHandler: function(value) {
      switch (value) {
        case 'next':
          this.currentPage += 1
          break
        case 'previous':
          this.currentPage -= 1
          break
        default:
          this.currentPage = value
      }
      this.sortLeaderboard();
    }

  }
}
