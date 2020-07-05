var Game = {
  props: ['strokeColor', 'fillColor', 'isTargetAcheived'],
  template: `
    <div id="game-screen"
      v-bind:style="{backgroundColor: strokeColor}"
    >
      <div class="game-main">
        <div id="floating-info-block">
          eigvjgoeibibjjpb
        </div>
        <v-stage ref="stage" v-bind:config="configKonva" v-bind:style="{backgroundColor: '#ffffff'}">
          <v-layer ref="layer" :config="configLayer">
          <v-line v-for="(tan,index) in tans" :key="index" :config="tan"></v-line>
          </v-layer>
        </v-stage>
      </div>
      <div class="game-footer">
        <div>
        </div>
        <div class="footer-actions">
          <button
            class="btn-in-footer btn-restart"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="$emit('restart-game')"
          ></button>
          <transition name="fade" mode="out-in">
            <button
              class="btn-in-footer btn-validate"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="$emit('validate-question')"
              v-if="isTargetAcheived"
            ></button>
            <button
              class="btn-in-footer btn-pass"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="$emit('pass-question')"
              v-else
            ></button>
          </transition>
        </div>
      </div>

    </div>
  `,
  data: function () {
    return {
      configKonva: {
        width: 100,
        height: 100,
      },
      configLayer:{
        scaleX: 6,
        scaleY: 6
      },
      tans: [],
      translateVal: 10,
    }
  },

  created: function() {
    let vm = this;
    window.addEventListener('resize', vm.resize);
  },

  destroyed: function() {
    let vm = this;
    window.removeEventListener("resize", vm.resize);
  },

  mounted: function () {
    let vm = this;
    vm.resize();
    vm.initializeTans();
  },

  methods: {
    resize: function () {
      let vm = this;
      let toolbarElem = document.getElementById("main-toolbar");
      let toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 3;
      let newHeight = window.innerHeight - toolbarHeight;
      let newWidth = window.innerWidth;
      let ratio = newWidth / newHeight

      document.querySelector('#game-screen').style.height = newHeight + "px";
      let gameMainEle = document.querySelector('.game-main');
      let cw = gameMainEle.offsetWidth * 0.98;
      let ch = gameMainEle.offsetHeight * 0.97;
      vm.$set(vm.configKonva, 'width',cw);
      vm.$set(vm.configKonva, 'height',ch);

      if (vm.isTargetAcheived) {
        document.querySelector('.btn-validate').style.width = document.querySelector('.btn-validate').offsetHeight + "px";
      } else {
        document.querySelector('.btn-pass').style.width = document.querySelector('.btn-pass').offsetHeight + "px";
      }
      document.querySelector('.btn-restart').style.width = document.querySelector('.btn-restart').offsetHeight + "px";
    },

    initializeTans: function () {
      let vm = this;
      let tans = [];
      let squareTangram = standardTangrams[0].tangram;
      for (let i = 0; i < squareTangram.tans.length; i++) {
        let tan = {
          tanType:squareTangram.tans[i].tanType,
          x:100,
          y:100,
          offsetX: 100,
          offsetY: 100,
          orientation: 0,
          rotation: 0,
          points: [],
          pointsObjs: [],
          stroke: "black",
          strokeWidth: 0.2,
          closed: true,
          draggable: true,
          fill:"blue",
        }
        let points = squareTangram.tans[i].getPoints();
        let center = squareTangram.tans[i].center();
        let floatPoints = [];
        let pointsObjs = [];
        for (let j = 0; j < points.length; j++) {
          points[j].x.add(new IntAdjoinSqrt2(this.translateVal,0));
          points[j].y.add(new IntAdjoinSqrt2(this.translateVal,0));
          pointsObjs.push(points[j]);
          floatPoints.push((points[j].toFloatX() + 0));
          floatPoints.push((points[j].toFloatY() + 0));
        }

        tan.offsetX = (center.toFloatX() + this.translateVal);
        tan.offsetY = (center.toFloatY() + this.translateVal);
        tan.x =  tan.offsetX;
        tan.y =  tan.offsetY;
        tan.orientation = squareTangram.tans[i].orientation;
        tan.points = floatPoints;
        tan.pointsObjs = pointsObjs;
        //tan.tan = squareTangram.tans[i];
        tan.fill = vm.fillColor;

        tans.push(tan);
      }
      this.tans = tans;
    },


  }
}
