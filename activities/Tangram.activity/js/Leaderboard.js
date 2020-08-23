var Leaderboard = {
  props: ['strokeColor', 'fillColor', 'playersAll', 'playersPlaying', 'l10n'],
  template: `
    <div id="leaderboard-view">
      <div class="leaderboard-main">
        <button id="back-button" v-on:click="$emit('go-to-dataset-list')"></button>
        <div
          class="leaderboard-main-header"
          v-bind:style="{backgroundColor: fillColor}"
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
            <div class="leaderboard-item leaderboard-item-rank">{{  initP + index + 1  }}</div>
            <div
              class="leaderboard-item leaderboard-item-icon"
              v-bind:style="{backgroundImage: 'url('+ generateXOLogoWithColor(item.user.colorvalue.stroke, item.user.colorvalue.fill)+')'}"
            ></div>
            <div class="leaderboard-item leaderboard-item-name">{{  item.user.name  }}</div>
            <div class="leaderboard-item leaderboard-item-score"
            v-bind:style="{backgroundImage: item.score===null ? 'url(./icons/hourglass.svg)' : ''}"
            >{{  item.score!=null ? item.score : "" }}</div>
          </div>
        </div>
      </div>
      <div class="leaderboard-footer">
        <div class="pagination">
          <button
            v-if="playersAll.length > 3"
            v-bind:disabled="isPreviousButtonDisabled"
            class="btn-in-footer btn-previous-page"
            v-bind:style="{
              backgroundColor: fillColor,
              width: actionButtons.width + 'px',
              height: actionButtons.height + 'px',
            }"
            v-on:click="pageChangeHandler('previous')"
          >
          </button>
          <button
            v-if="playersAll.length > 3"
            class="btn-in-footer page-no"
            v-bind:style="{
              backgroundColor: fillColor,
              width: actionButtons.width + 'px',
              height: actionButtons.height + 'px',
            }"
          >
            {{ currentPage }}/{{ pageCount }}
          </button>
          <button
            v-if="playersAll.length > 3"
            v-bind:disabled="isNextButtonDisabled"
            class="btn-in-footer btn-next-page"
            v-bind:style="{
              backgroundColor: fillColor,
              width: actionButtons.width + 'px',
              height: actionButtons.height + 'px',
            }"
            v-on:click="pageChangeHandler('next')"
          >
          </button>
        </div>
        <div class="footer-actions">
        </div>
      </div>
    </div>
  `,
  data: function() {
    return {
      players: [],
      currentPage: 1,
      pageCount: 1,
      visibleItemsPerPageCount: 3,
      initP: 0,
      actionButtons: {
        width: 30,
        width: 30,
      },
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
      setTimeout(() => {
        vm.resize();
      }, 0);
    },

    playersPlaying: function() {
      var vm = this;
      vm.sortLeaderboard();
    },

    currentPage: function () {
      const leaderboardMainBody = document.querySelector(".leaderboard-main-body");
      if (leaderboardMainBody) {
        leaderboardMainBody.scrollTo(0,0);
      }
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
      var toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 3;
      var newHeight = window.innerHeight - toolbarHeight;

      document.querySelector('#leaderboard-view').style.height = newHeight + "px";
      let leaderboardFooterEle = document.querySelector('.leaderboard-footer');
      vm.$set(vm.actionButtons, 'width', leaderboardFooterEle.offsetHeight * 0.95);
      vm.$set(vm.actionButtons, 'height', leaderboardFooterEle.offsetHeight * 0.95);
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
          if (this.currentPage < this.pageCount) {
            this.currentPage += 1
          }
          break
        case 'previous':
          if (this.currentPage > 1) {
            this.currentPage -= 1
          }
          break
        default:
          this.currentPage = value
      }
      this.sortLeaderboard();
    }

  }
}
