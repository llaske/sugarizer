var Game = {
  props: ['strokeColor', 'fillColor', 'isTargetAcheived', 'puzzles', 'pNo'],
  template: `
    <div id="game-screen"
      v-bind:style="{backgroundColor: strokeColor}"
    >
      <div class="game-main">
        <v-stage ref="stage" v-bind:config="configKonva" v-bind:style="{backgroundColor: '#ffffff'}">
          <v-layer ref="layer" :config="configLayer">
          <template v-if="puzzles[pNo]">
            <v-line v-for="(targetTan,index) in puzzles[pNo].targetTans" :key="index" :config="targetTan"></v-line>
          </template>
          <v-line v-for="(tan,index) in tans" :key="index" :config="tan"
            v-on:tap="onTap($event, index)"
            v-on:click="onClick($event, index)"
            v-on:dragend="onDragEnd($event, index)"
            v-on:mouseover="onMouseOver($event, index)"
            v-on:mouseout="onMouseOut($event, index)"
          ></v-line>
          </v-layer>
        </v-stage>
        <div id="floating-info-block"
          v-bind:style="{backgroundColor: '#ffffff'}"
        >
          <div class="detail-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="detail-block-content tangram-name"><div>{{ puzzles[pNo] ? puzzles[pNo].name : ''}}</div></div>
          </div>

          <div class="detail-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="detail-block-logo clock-logo"></div>
            <div class="detail-block-content">
              <div>00:00</div>
            </div>
          </div>

          <div class="detail-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="detail-block-content"><div>Score:</div></div>
            <div class="detail-block-content"><div>0</div></div>
          </div>

        </div>
      </div>
      <div class="game-footer">
        <div>
        </div>
        <div class="footer-actions">
          <button
            class="btn-in-footer btn-replay"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="initializeTans()"
          ></button>
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
  data: function() {
    return {
      configKonva: {
        width: 10,
        height: 10,
      },
      configLayer: {
        scaleX: 6,
        scaleY: 6
      },
      tans: [],
      flip: 5,
      translateVal: 0,
      initialPositions: [],
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

  mounted: function() {
    let vm = this;
    vm.resize();
    setTimeout(() => {
      vm.initializeTans();
    }, 0);
  },

  methods: {
    resize: function() {
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
      let scale = Math.min(cw, ch) / 80;

      let pw = vm.configKonva.width;
      let ph = vm.configKonva.height;
      let pScale = Math.min(pw, ph) / 80;
      if (pw == 10) {
        pw = 0;
        ph = 0;
      }

      vm.$set(vm.configKonva, 'width', cw);
      vm.$set(vm.configKonva, 'height', ch);

      vm.$set(vm.configLayer, 'scaleX', scale);
      vm.$set(vm.configLayer, 'scaleY', scale);

      let tangram_dx = (cw / scale - pw / pScale) / 2;
      let tangram_dy = (ch / scale - ph / pScale) / 2;

      vm.$emit('center-tangram', {
        dx: tangram_dx,
        dy: tangram_dy
      });

      for (var i = 0; i < 7; i++) {
        switch (i) {
          case 0:
            vm.initialPositions.push({
              x: (cw / scale) * 0.13,
              y: (ch / scale) * 0.25
            })
            break;
          case 1:
            vm.initialPositions.push({
              x: (cw / scale) * 0.18,
              y: (ch / scale) * 0.20
            })
            break;
          case 2:
            vm.initialPositions.push({
              x: (cw / scale) * 0.17,
              y: (ch / scale) * 0.80
            })
            break;
          case 3:
            vm.initialPositions.push({
              x: (cw / scale) * 0.08,
              y: (ch / scale) * 0.15
            })
            break;
          case 4:
            vm.initialPositions.push({
              x: (cw / scale) * 0.07,
              y: (ch / scale) * 0.85
            })
            break;
          case 5:
            vm.initialPositions.push({
              x: (cw / scale) * 0.18,
              y: (ch / scale) * 0.60
            })
            break;
          case 6:
            vm.initialPositions.push({
              x: (cw / scale) * 0.03,
              y: (ch / scale) * 0.60
            })
            break;
        }
      }

      if (vm.tans.length != 0) {
        for (var index = 0; index < 7; index++) {
          let tan_dx = ((cw / pw) * (pScale / scale) - 1) * vm.tans[index].points[0];
          let tan_dy = ((ch / ph) * (pScale / scale) - 1) * vm.tans[index].points[1];
          vm.moveTan(index, tan_dx, tan_dy);
        }
      }

      document.querySelector('#floating-info-block').style.width = gameMainEle.offsetWidth * 0.20 + "px";
      document.querySelector('#floating-info-block').style.height = gameMainEle.offsetHeight * 0.50 + "px";
      document.querySelector('#floating-info-block').style.top = toolbarHeight + gameMainEle.offsetHeight * 0.01 + "px";
      document.querySelector('#floating-info-block').style.right = gameMainEle.offsetWidth * 0.01 + "px";

      if (vm.isTargetAcheived) {
        document.querySelector('.btn-validate').style.width = document.querySelector('.btn-validate').offsetHeight + "px";
      } else {
        document.querySelector('.btn-pass').style.width = document.querySelector('.btn-pass').offsetHeight + "px";
      }
      document.querySelector('.btn-restart').style.width = document.querySelector('.btn-restart').offsetHeight + "px";
      document.querySelector('.btn-replay').style.width = document.querySelector('.btn-replay').offsetHeight + "px";

    },

    initializeTans: function() {
      let vm = this;
      let tans = [];
      vm.tans = [];
      let squareTangram = standardTangrams[0].tangram;
      for (let i = 0; i < squareTangram.tans.length; i++) {
        let tan = {
          tanType: squareTangram.tans[i].tanType,
          x: 100,
          y: 100,
          offsetX: 100,
          offsetY: 100,
          orientation: 0,
          rotation: 0,
          points: [],
          pointsObjs: [],
          stroke: vm.strokeColor,
          strokeEnabled: false,
          strokeWidth: 0.8,
          closed: true,
          draggable: true,
          fill: 'blue',
          lineJoin: 'round',
        }
        let points = [...squareTangram.tans[i].getPoints()];
        let center = squareTangram.tans[i].center();
        let dx = vm.initialPositions[i].x - points[0].toFloatX();
        let dy = vm.initialPositions[i].y - points[0].toFloatY();

        let floatPoints = [];
        let pointsObjs = [];
        for (let j = 0; j < points.length; j++) {
          let tmpPoint = points[j].dup();
          tmpPoint.x.add(new IntAdjoinSqrt2(dx, 0));
          tmpPoint.y.add(new IntAdjoinSqrt2(dy, 0));
          pointsObjs.push(tmpPoint);
          floatPoints.push(tmpPoint.toFloatX());
          floatPoints.push(tmpPoint.toFloatY());
        }

        tan.offsetX = (center.toFloatX() + dx);
        tan.offsetY = (center.toFloatY() + dy);
        tan.x = tan.offsetX;
        tan.y = tan.offsetY;
        tan.orientation = squareTangram.tans[i].orientation;
        tan.points = floatPoints;
        tan.pointsObjs = pointsObjs;
        tan.fill = vm.fillColor;
        tans.push(tan);
      }
      vm.tans = tans;
    },

    snapTan: function(index) {
      let vm = this;
      let currentTan = this.tans[index];
      let x = currentTan.x;
      let y = currentTan.y;
      let currentTanPoints = currentTan.points;

      let flag = false;
      for (let i = 0; i < 7; i++) {
        if (i == index) {
          continue;
        }
        let otherTanPoints = [...vm.tans[i].points];
        let otherTanPointsObjs = [...vm.tans[i].pointsObjs];
        for (let j = 0; j < currentTanPoints.length; j += 2) {
          let fl = false;
          for (let k = 0; k < otherTanPoints.length; k += 2) {
            if (Math.abs(currentTanPoints[j] - otherTanPoints[k]) <= 1.5 && Math.abs(currentTanPoints[j + 1] - otherTanPoints[k + 1]) <= 1.5) {
              let diff = otherTanPointsObjs[k / 2].dup().subtract(vm.tans[index].pointsObjs[j / 2]);
              let dx = diff.toFloatX();
              let dy = diff.toFloatY();
              vm.moveTan(index, dx, dy, diff);
              fl = true;
              break;
            }
          }
          if (fl) {
            flag = true;
            break;
          }
        }
        if (flag) {
          break;
        }
      }

      if (!flag) {
        for (var i = 0; i < currentTanPoints.length; i += 2) {

          for (var targetTan = 0; targetTan < vm.puzzles[vm.pNo].targetTans.length; targetTan++) {
            var fl = false;
            for (var j = 0; j < vm.puzzles[vm.pNo].targetTans[targetTan].points.length; j += 2)
              if (Math.abs(currentTanPoints[i] - vm.puzzles[vm.pNo].targetTans[targetTan].points[j]) <= 1.5 && Math.abs(currentTanPoints[i + 1] - vm.puzzles[vm.pNo].targetTans[targetTan].points[j + 1]) <= 1.5) {

                var diff = vm.puzzles[vm.pNo].targetTans[targetTan].pointsObjs[j / 2].dup().subtract(vm.tans[index].pointsObjs[i / 2]);
                var dx = diff.toFloatX();
                var dy = diff.toFloatY();
                vm.moveTan(index, dx, dy, diff);
                fl = true;
                break;
              }
            if (fl) {
              flag = true;
              break;
            }
          }
          if (flag) {
            break;
          }
        }
      }

    },

    moveTan: function(index, dx, dy, diff) {
      let vm = this;
      let points = [];
      for (let i = 0; i < vm.tans[index].points.length; i += 2) {
        if (diff) {
          vm.tans[index].pointsObjs[i / 2].add(diff);
        } else {
          vm.tans[index].pointsObjs[i / 2].x.add(new IntAdjoinSqrt2(dx, 0));
          vm.tans[index].pointsObjs[i / 2].y.add(new IntAdjoinSqrt2(dy, 0));
        }
        points.push(vm.tans[index].points[i] + dx);
        points.push(vm.tans[index].points[i + 1] + dy);
      }
      vm.$set(vm.tans[index], 'offsetX', vm.tans[index].offsetX + dx);
      vm.$set(vm.tans[index], 'offsetY', vm.tans[index].offsetY + dy);
      vm.$set(vm.tans[index], 'x', vm.tans[index].x + dx);
      vm.$set(vm.tans[index], 'y', vm.tans[index].y + dy);
      vm.$set(vm.tans[index], 'points', points);
    },

    rotateTan: function(index) {
      let vm = this;
      let cx = vm.tans[index].x;
      let cy = vm.tans[index].y;
      let tanCenter = new Point(new IntAdjoinSqrt2(cx, 0), new IntAdjoinSqrt2(cy, 0));

      if (vm.tans[index].tanType == vm.flip && vm.tans[index].orientation == 3) {
        //flip parallelogram
        vm.$set(vm.tans[index], 'tanType', vm.flip == 4 ? 5 : 4);
        vm.$set(vm.tans[index], 'orientation', 0);

        let anchor = tanCenter.dup();
        let sub = InsideDirections[vm.tans[index].tanType][vm.tans[index].orientation][0];
        anchor.x.subtract(new IntAdjoinSqrt2(sub.toFloatX(), 0));
        anchor.y.subtract(new IntAdjoinSqrt2(sub.toFloatY(), 0));

        let flippedTan = new Tan(vm.tans[index].tanType, anchor, vm.tans[index].orientation);
        let points = flippedTan.getPoints();
        let center = flippedTan.center();
        vm.$set(vm.tans[index], 'points', []);
        vm.$set(vm.tans[index], 'pointsObjs', []);

        for (let j = 0; j < points.length; j++) {
          vm.tans[index].pointsObjs.push(points[j]);
          vm.tans[index].points.push(points[j].toFloatX());
          vm.tans[index].points.push(points[j].toFloatY());
        }
        vm.$set(vm.tans[index], 'offsetX', cx);
        vm.$set(vm.tans[index], 'offsetY', cy);
        vm.$set(vm.tans[index], 'x', cx);
        vm.$set(vm.tans[index], 'y', cy);

        vm.flip = vm.flip == 4 ? 5 : 4;
      } else {
        //update points of tan
        let points = [];
        for (let i = 0; i < vm.tans[index].points.length; i += 2) {
          let x1 = vm.tans[index].points[i];
          let y1 = vm.tans[index].points[i + 1];
          let pt = new Point(new IntAdjoinSqrt2(x1, 0), new IntAdjoinSqrt2(y1, 0));
          vm.tans[index].pointsObjs[i / 2].subtract(tanCenter).rotate(45).add(tanCenter);
          pt.subtract(tanCenter).rotate(45).add(tanCenter);
          points.push(pt.toFloatX());
          points.push(pt.toFloatY());
        }
        vm.$set(vm.tans[index], 'points', points);
        vm.$set(vm.tans[index], 'orientation', (vm.tans[index].orientation + 1) % 8);
      }
    },

    onClick: function(e, index) {
      this.rotateTan(index);
    },

    onTap: function(e, index) {
      this.rotateTan(index);
    },

    onDragEnd: function(e, index) {
      let vm = this;
      var dx = e.target.attrs.x - this.tans[index].x;
      var dy = e.target.attrs.y - this.tans[index].y;
      vm.moveTan(index, dx, dy);
      setTimeout(() => {
        vm.snapTan(index);
      }, 0);
      //this.checkIfSolved();
    },

    onMouseOver: function(e, index) {
      let vm = this;
      vm.$set(vm.tans[index], 'strokeEnabled', true);
      let boundingBox = e.target.getClientRect();
    },

    onMouseOut: function(e, index) {
      let vm = this;
      vm.$set(vm.tans[index], 'strokeEnabled', false);
    }

  }
}
