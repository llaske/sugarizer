var Game = {
  props: ['strokeColor', 'fillColor', 'isTargetAcheived', 'puzzles', 'pNo', 'showHint', 'hintNumber'],
  template: `
    <div id="game-screen"
      v-bind:style="{backgroundColor: strokeColor}"
    >
      <div class="game-main">
        <v-stage ref="stage" v-bind:config="configKonva" v-bind:style="{backgroundColor: '#ffffff'}"
        >
          <v-layer ref="layer" :config="configLayer">
          <v-line :config="partitionLine"></v-line>
          <template v-if="puzzles[pNo]">
            <template v-for="(targetTan,index) in puzzles[pNo].targetTans" :key="index">
              <v-line v-if="index!=hintNumber"
                :config="{
                  ...targetTan,
                  strokeEnabled: showHint ? true : targetTan.strokeEnabled
                }"
              ></v-line>
            </template>
            <v-line v-if="showHint" :config="puzzles[pNo].targetTans[hintNumber]"></v-line>
          </template>
          <template v-for="(tan,index) in tans" :key="index">
            <v-line v-if="currentTan!=index && !(showHint && (tansSnapped[index] || tansPlaced[index]!=-1))" :config="tan"
              v-on:tap="onTap($event, index)"
              v-on:click="onClick($event, index)"
              v-on:dragstart="onDragStart($event, index)"
              v-on:dragend="onDragEnd($event, index)"
              v-on:dragmove="onDragMove($event, index)"
              v-on:mouseover="onMouseOver($event, index)"
              v-on:mouseout="onMouseOut($event, index)"
            ></v-line>
          </template>
          <template>
            <v-line v-if="!(showHint && (tansSnapped[currentTan] || tansPlaced[currentTan]!=-1))"
              :config="tans[currentTan]"
              v-on:tap="onTap($event, currentTan)"
              v-on:click="onClick($event, currentTan)"
              v-on:dragstart="onDragStart($event, currentTan)"
              v-on:dragend="onDragEnd($event, currentTan)"
              v-on:dragmove="onDragMove($event, currentTan)"
              v-on:mouseover="onMouseOver($event, currentTan)"
              v-on:mouseout="onMouseOut($event, currentTan)"
            ></v-line>
          </template>
          </v-layer>
        </v-stage>
        <div id="floating-info-block"
          v-bind:style="{width: infoContainer.width + 'px',
            height: infoContainer.height + 'px',
            top: infoContainer.top + 'px',
            right: infoContainer.right + 'px'
          }"
        >
          <div class="detail-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="detail-block-logo clock-logo"></div>
            <div class="detail-block-content">
              <div>00:00</div>
            </div>
          </div>

          <div class="detail-block score-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="detail-block-content score-title"><div>Score:</div></div>
            <div class="detail-block-content score-val"><div>0</div></div>
          </div>

        </div>
        <div class="tangram-name detail-block floating-block"
          v-bind:style="{width: nameBlock.width + 'px',
            height: nameBlock.height + 'px',
            top: nameBlock.top + 'px',
            left: infoContainer.left + 'px',
            borderColor: 'transparent'
          }"
        >
          <div class="detail-block-content tangram-name"><div>{{ puzzles[pNo] ? puzzles[pNo].name : ''}}</div></div>
        </div>
      </div>
      <div class="game-footer">
        <div>
        </div>
        <div class="footer-actions">
          <button
            class="btn-in-footer btn-replay"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="onRefresh"
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
        width: 60,
        height: 60,
      },
      configLayer: {
        scaleX: 6,
        scaleY: 6
      },
      infoContainer: {
        width: 1,
        height: 1,
        top: 0,
        right: 0,
      },
      nameBlock: {
        width: 1,
        height: 1,
        top: 0,
        left: 0
      },
      partitionLine: {
        points: [],
        stroke: 'green',
        strokeWidth: 0.8,
        lineJoin: 'round',
        dash: [2, 2]
      },
      tans: [],
      tanState: 0,
      currentTan: 0,
      flip: 5,
      initialPositions: [],
      selectedTanStrokeWidth: 0.8,
      nonSelectedTanStrokeWidth: 0.3,
      tanColors: ["blue", "purple", "red", "violet", "yellow", "yellow"],
      tansPlaced: [-1, -1, -1, -1, -1, -1, -1],
      snapRange: 1.5,
      tansSnapped: [false, false, false, false, false, false, false],
    }
  },

  created: function() {
    let vm = this;
    window.addEventListener('resize', vm.resize);
    window.addEventListener('keydown', vm.onKeyDown);
    window.addEventListener('keyup', vm.onKeyUp);
  },

  destroyed: function() {
    let vm = this;
    window.removeEventListener("resize", vm.resize);
    window.removeEventListener('keydown', vm.onKeyDown);
    window.removeEventListener('keyup', vm.onKeyUp);
  },

  mounted: function() {
    let vm = this;
    vm.resize();
    setTimeout(() => {
      vm.initializeTans();
    }, 0);
  },

  watch: {
    puzzles: function() {
      this.initializeTans();
    }
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


      vm.$set(vm.configKonva, 'width', cw);
      vm.$set(vm.configKonva, 'height', ch);

      vm.$set(vm.configLayer, 'scaleX', scale);
      vm.$set(vm.configLayer, 'scaleY', scale);

      vm.$emit('config-changed', {
        stageWidth: cw,
        stageHeight: ch,
        scale: scale
      });

      vm.$emit('center-tangram');

      for (var i = 0; i < 7; i++) {
        switch (i) {
          case 0:
            vm.initialPositions.push({
              x: (cw / scale) * 0.88,
              y: (ch / scale) * 0.75
            })
            break;
          case 1:
            vm.initialPositions.push({
              x: (cw / scale) * 0.87,
              y: (ch / scale) * 0.40
            })
            break;
          case 2:
            vm.initialPositions.push({
              x: (cw / scale) * 0.72,
              y: (ch / scale) * 0.75
            })
            break;
          case 3:
            vm.initialPositions.push({
              x: (cw / scale) * 0.93,
              y: (ch / scale) * 0.62
            })
            break;
          case 4:
            vm.initialPositions.push({
              x: (cw / scale) * 0.75,
              y: (ch / scale) * 0.52
            })
            break;
          case 5:
            vm.initialPositions.push({
              x: (cw / scale) * 0.78,
              y: (ch / scale) * 0.60
            })
            break;
          case 6:
            vm.initialPositions.push({
              x: (cw / scale) * 0.72,
              y: (ch / scale) * 0.33
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

      vm.$set(vm.infoContainer, 'width', gameMainEle.offsetWidth * 0.30);
      vm.$set(vm.infoContainer, 'height', gameMainEle.offsetHeight * 0.15);
      vm.$set(vm.infoContainer, 'top', toolbarHeight + gameMainEle.offsetHeight * 0.02);
      vm.$set(vm.infoContainer, 'right', gameMainEle.offsetWidth * 0.01);

      let partitionLinePoints = [gameMainEle.offsetWidth * 0.685 / scale, gameMainEle.offsetHeight * 0.16 / scale, gameMainEle.offsetWidth * 0.685 / scale, ch / scale];
      vm.$set(vm.partitionLine, 'points', partitionLinePoints);
      vm.$set(vm.partitionLine, 'stroke', vm.strokeColor);

      vm.$set(vm.nameBlock, 'width', gameMainEle.offsetWidth * 0.20);
      vm.$set(vm.nameBlock, 'height', gameMainEle.offsetHeight * 0.15);
      //vm.$set(vm.nameBlock, 'bottom', document.querySelector('.game-footer').offsetHeight * 1.1 + gameMainEle.offsetHeight * 0.01);
      vm.$set(vm.nameBlock, 'top', gameMainEle.offsetHeight * 0.01 + toolbarHeight);
      vm.$set(vm.infoContainer, 'left', gameMainEle.offsetWidth * 0.01 + cw / 4.5);

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
      let squareTangram = standardTangrams[0].tangram;
      for (let i = 0; i < squareTangram.tans.length; i++) {
        let tan = {
          x: 100,
          y: 100,
          offsetX: 100,
          offsetY: 100,
          rotation: 0,
          points: [],
          tanObj: null,
          orientation: squareTangram.tans[i].orientation,
          tanType: squareTangram.tans[i].tanType,
          placedAnchor: null,
          stroke: vm.strokeColor,
          strokeEnabled: false,
          strokeWidth: vm.nonSelectedTanStrokeWidth,
          closed: true,
          draggable: true,
          fill: 'blue',
          lineJoin: 'round',
          shadowColor: 'black',
          shadowBlur: 5,
          shadowOpacity: 0.4,
          shadowEnabled: false
        }
        tan.tanObj = new Tan(squareTangram.tans[i].tanType, new Point(new IntAdjoinSqrt2(vm.initialPositions[i].x, 0), new IntAdjoinSqrt2(vm.initialPositions[i].y, 0)), squareTangram.tans[i].orientation);
        let points = [...tan.tanObj.getPoints()];
        let center = tan.tanObj.center();

        let floatPoints = [];
        for (let j = 0; j < points.length; j++) {
          let tmpPoint = points[j].dup();
          floatPoints.push(tmpPoint.toFloatX());
          floatPoints.push(tmpPoint.toFloatY());
        }
        tan.offsetX = center.toFloatX();
        tan.offsetY = center.toFloatY();
        tan.x = tan.offsetX;
        tan.y = tan.offsetY;
        tan.points = floatPoints;
        tan.fill = vm.tanColors[tan.tanType];
        tans.push(tan);
      }
      vm.tans = tans;
      vm.tanState = 0;
      vm.tansSnapped = [false, false, false, false, false, false, false];
      vm.flip = 5;
    },

    snapTan: function(index) {
      let vm = this;
      let currentTan = this.tans[index];
      let x = currentTan.x;
      let y = currentTan.y;
      let currentTanPoints = currentTan.points;
      let currentTanPointsObjs = currentTan.tanObj.getPoints();

      let flag = false;
      for (let i = 0; i < 7; i++) {
        if (i == index) {
          continue;
        }
        let otherTanPoints = [...vm.tans[i].points];
        let otherTanPointsObjs = [...vm.tans[i].tanObj.getPoints()];

        for (let j = 0; j < currentTanPoints.length; j += 2) {
          let fl = false;
          for (let k = 0; k < otherTanPoints.length; k += 2) {
            if (Math.abs(currentTanPoints[j] - otherTanPoints[k]) <= vm.snapRange && Math.abs(currentTanPoints[j + 1] - otherTanPoints[k + 1]) <= vm.snapRange) {
              let diff;
              if (!vm.tansSnapped[i]) {
                diff = otherTanPointsObjs[k / 2].dup().subtract(currentTanPointsObjs[j / 2]);
                currentTan.tanObj.anchor.add(diff);
              } else {
                let placedAnchor = null;
                let prevAnchor = currentTan.tanObj.anchor.dup();
                currentTan.tanObj.anchor = k === 0 ?
                  vm.tans[i].tanObj.anchor.dup() : vm.tans[i].tanObj.anchor.dup().add(Directions[vm.tans[i].tanType][vm.tans[i].orientation][k / 2 - 1]);

                placedAnchor = k === 0 ?
                  vm.tans[i].placedAnchor.dup() : vm.tans[i].placedAnchor.dup().add(Directions[vm.tans[i].tanType][vm.tans[i].orientation][k / 2 - 1]);

                if (j != 0) {
                  currentTan.tanObj.anchor.subtract(Directions[currentTan.tanType][currentTan.orientation][j / 2 - 1]);
                  placedAnchor.subtract(Directions[currentTan.tanType][currentTan.orientation][j / 2 - 1]);
                }
                diff = currentTan.tanObj.anchor.dup().subtract(prevAnchor);
                vm.tansSnapped[index] = true;
                vm.$set(vm.tans[index], 'placedAnchor', placedAnchor);
              }
              let dx = diff.toFloatX();
              let dy = diff.toFloatY();
              //update points
              vm.updatePoints(index);
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
              if (Math.abs(currentTanPoints[i] - vm.puzzles[vm.pNo].targetTans[targetTan].points[j]) <= vm.snapRange && Math.abs(currentTanPoints[i + 1] - vm.puzzles[vm.pNo].targetTans[targetTan].points[j + 1]) <= vm.snapRange) {
                let pointObj = new Point(new IntAdjoinSqrt2(vm.puzzles[vm.pNo].targetTans[targetTan].points[j], 0), new IntAdjoinSqrt2(vm.puzzles[vm.pNo].targetTans[targetTan].points[j + 1], 0));
                let placedAnchor = vm.puzzles[vm.pNo].targetTans[targetTan].pointsObjs[j / 2].dup();

                currentTan.tanObj.anchor = pointObj.dup();
                if (i != 0) {
                  placedAnchor.subtract(Directions[currentTan.tanType][currentTan.orientation][i / 2 - 1]);
                  currentTan.tanObj.anchor.subtract(Directions[currentTan.tanType][currentTan.orientation][i / 2 - 1]);
                }
                vm.$set(vm.tans[index], 'placedAnchor', placedAnchor);
                vm.tansSnapped[index] = true;
                //update points
                vm.updatePoints(index);
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
      if (!flag) {
        vm.tansSnapped[index] = false;
        vm.$set(vm.tans[index], 'placedAnchor', null);
      }
    },

    updatePoints: function(index) {
      let vm = this;
      let points = vm.tans[index].tanObj.getPoints();
      let center = vm.tans[index].tanObj.center();
      vm.$set(vm.tans[index], 'points', []);

      for (let j = 0; j < points.length; j++) {
        vm.tans[index].points.push(points[j].toFloatX());
        vm.tans[index].points.push(points[j].toFloatY());
      }
      vm.$set(vm.tans[index], 'offsetX', center.toFloatX());
      vm.$set(vm.tans[index], 'offsetY', center.toFloatY());
      vm.$set(vm.tans[index], 'x', center.toFloatX());
      vm.$set(vm.tans[index], 'y', center.toFloatY());
    },

    moveTan: function(index, dx, dy, diff) {
      let vm = this;
      vm.tans[index].tanObj.anchor.add(new Point(new IntAdjoinSqrt2(dx, 0), new IntAdjoinSqrt2(dy, 0)));
      vm.updatePoints(index);
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
        vm.tans[index].tanObj.anchor = anchor.dup();

        vm.tans[index].tanObj.tanType = vm.tans[index].tanType;
        vm.tans[index].tanObj.orientation = vm.tans[index].orientation;

        let flippedTan = new Tan(vm.tans[index].tanType, anchor, vm.tans[index].orientation);

        vm.updatePoints(index);

        vm.flip = vm.flip == 4 ? 5 : 4;
      } else {
        //rotate tan
        vm.$set(vm.tans[index], 'orientation', (vm.tans[index].orientation + 1) % 8);
        vm.tans[index].tanObj.anchor.subtract(tanCenter).rotate(45).add(tanCenter);
        vm.tans[index].tanObj.orientation = vm.tans[index].orientation;

        vm.updatePoints(index);
      }
    },

    checkIfSolved: function() {
      let vm = this;
      let solved = true;
      let currentTanPoints = [...vm.tans[vm.currentTan].points].sort();
      let tanType = vm.tans[vm.currentTan].tanType;
      let placed = -1;

      for (let i = 0; i < vm.puzzles[vm.pNo].targetTans.length; i++) {
        let targetTan = vm.puzzles[vm.pNo].targetTans[i];
        if (targetTan.tanType === tanType) {
          let tmp = 0;
          let targetPoints = [...targetTan.points].sort();
          for (var j = 0; j < targetPoints.length; j++) {
            if (Math.abs(targetPoints[j] - currentTanPoints[j]) < 0.5) {
              tmp++;
            }
          }
          if (tmp === targetPoints.length) {
            placed = i;
            break;
          }
        }
      }
      vm.$set(vm.tansPlaced, vm.currentTan, placed);
      vm.$emit('remove-tangram-borders', vm.tansPlaced);

      //check if all tans are well placed...
      for (var i = 0; i < 7; i++) {
        if (vm.tansPlaced[i] === -1) {
          solved = false;
          break;
        }
      }
      if (solved) {
        vm.$emit('tangram-status', true);
        return;
      }

      //check the outline
      let tans = [];
      let notFinished = false;
      for (let i = 0; i < vm.tans.length; i++) {
        if (vm.tansSnapped[i]) {
          let point = vm.tans[i].placedAnchor.dup();
          var tan = new Tan(vm.tans[i].tanType, point, vm.tans[i].orientation);
          tans.push(tan);
        } else {
          notFinished = true;
          break;
        }
      }
      if (!notFinished) {
        let currentOut = computeOutline(tans, true);
        if (typeof currentOut === 'undefined' ||
          currentOut.length != vm.puzzles[vm.pNo].outline.length) {
          solved = false;
        } else {
          var tmp = true;
          for (var outlineId = 0; outlineId < vm.puzzles[vm.pNo].outline.length; outlineId++) {
            tmp = tmp && arrayEq(vm.puzzles[vm.pNo].outline[outlineId], currentOut[outlineId], comparePoints);
          }
          solved = tmp;
          /*var tanSegments = computeSegments(getAllPoints(gameOutline), gameOutline);
          for (var segmentId = 0; segmentId < tanSegments.length; segmentId++) {
            for (var otherSegmentsId = segmentId + 1; otherSegmentsId < tanSegments.length; otherSegmentsId++) {
              if (tanSegments[segmentId].intersects(tanSegments[otherSegmentsId])) {
                return false;
              }
            }
          }
          */
          console.log(solved);
        }
      } else {
        solved = false;
      }
      vm.$emit('tangram-status', solved);

    },

    selectTan: function() {
      let vm = this;
      vm.$set(vm.tans[vm.currentTan], 'strokeWidth', vm.selectedTanStrokeWidth);
      vm.$set(vm.tans[vm.currentTan], 'strokeEnabled', true);
      vm.$set(vm.tans[vm.currentTan], 'shadowEnabled', true);
    },

    deSelectTan: function() {
      let vm = this;
      vm.$set(vm.tans[vm.currentTan], 'strokeWidth', vm.nonSelectedTanStrokeWidth);
      vm.$set(vm.tans[vm.currentTan], 'strokeEnabled', false);
      vm.$set(vm.tans[vm.currentTan], 'shadowEnabled', false);
    },

    onClick: function(e, index) {
      let vm = this;
      vm.tanState = 1;
      if (index != vm.currentTan) {
        vm.deSelectTan();
        vm.currentTan = index;
        vm.selectTan();
      }
      if (vm.tanState === 1) {
        vm.rotateTan(index);
      }
    },

    onTap: function(e, index) {
      let vm = this;
      vm.tanState = 1;
      if (index != vm.currentTan) {
        vm.deSelectTan();
        vm.currentTan = index;
        vm.selectTan();
      }
      if (vm.tanState === 1) {
        vm.rotateTan(index);
      }
    },

    onDragStart: function(e, index) {
      let vm = this;
      if (index != vm.currentTan) {
        vm.deSelectTan();
        vm.currentTan = index;
      }
      vm.selectTan();
      vm.tanState = 1;
    },

    onDragEnd: function(e, index) {
      let vm = this;
      let isTanOutsideCanvas = false;
      let finalX = e.target.attrs.x;
      let finalY = e.target.attrs.y;
      let boundingBox = e.target.getClientRect();

      //checking conditions if the tan gets out of canvas boundary
      let scale = vm.configLayer.scaleX;
      if (boundingBox.x < 0) {
        finalX = boundingBox.width / (2 * scale);
        isTanOutsideCanvas = true;
      }
      if (boundingBox.y < 0) {
        finalY = boundingBox.height / (2 * scale);
        isTanOutsideCanvas = true;
      }
      if (boundingBox.y + boundingBox.height > vm.configKonva.height) {
        finalY = (vm.configKonva.height - boundingBox.height / 2) / scale;
        isTanOutsideCanvas = true;
      }
      if (boundingBox.x + boundingBox.width > vm.configKonva.width - vm.infoContainer.width && boundingBox.y < vm.infoContainer.height) {
        let tmpx = (vm.configKonva.width - vm.infoContainer.width - boundingBox.width / 2) / scale;
        let tmpy = (vm.infoContainer.height + boundingBox.height / 2) / scale;
        let d1 = Math.abs(tmpx - vm.tans[index].x);
        let d2 = Math.abs(tmpy - vm.tans[index].y);
        if (d1 <= d2) {
          finalX = tmpx;
        } else {
          finalY = tmpy;
        }
        isTanOutsideCanvas = true;
      }
      if (boundingBox.x + boundingBox.width > vm.configKonva.width && boundingBox.y > vm.infoContainer.height) {
        finalX = (vm.configKonva.width - boundingBox.width / 2) / scale;
        isTanOutsideCanvas = true;
      }

      if (isTanOutsideCanvas) {
        let dx = finalX - this.tans[index].x;
        let dy = finalY - this.tans[index].y;
        setTimeout(() => {
          vm.moveTan(index, dx, dy);
        }, 0);
      }

      setTimeout(() => {
        vm.snapTan(index);
      }, 0);
      setTimeout(() => {
        vm.checkIfSolved();
      }, 0);
    },

    onDragMove: function(e, index) {
      let vm = this;
      let finalX = e.target.attrs.x;
      let finalY = e.target.attrs.y;
      let dx = finalX - this.tans[index].x;
      let dy = finalY - this.tans[index].y;

      setTimeout(() => {
        vm.moveTan(index, dx, dy);
      }, 0);
    },

    onMouseOver: function(e, index) {
      let vm = this;
      vm.deSelectTan();
      vm.currentTan = index;
      vm.selectTan();
      vm.tanState = 0;
    },

    onMouseOut: function(e, index) {
      let vm = this;
      vm.tanState = 0;
      vm.deSelectTan();
    },

    onKeyDown: function(e) {
      let vm = this;
      if (vm.tanState === 0) {
        if (e.keyCode === 37 || e.keyCode === 40) {
          vm.deSelectTan();
          let newTan = (vm.currentTan - 1) % 7;
          vm.currentTan = newTan < 0 ? newTan + 7 : newTan;
          vm.selectTan();
        } else if (e.keyCode === 38 || e.keyCode === 39) {
          vm.deSelectTan();
          vm.currentTan = (vm.currentTan + 1) % 7;
          vm.selectTan();
        } else if (e.keyCode === 13) {
          vm.tanState = 1;
        }
      } else if (vm.tanState === 1) {
        let delta = 4;
        let scale = vm.configLayer.scaleX;
        let dx = delta / scale;
        let dy = delta / scale;

        if (e.keyCode === 37) {
          dx *= -1;
          dy = 0;
        } else if (e.keyCode === 38) {
          dx = 0;
          dy *= -1;
        } else if (e.keyCode === 39) {
          dx *= 1;
          dy = 0;
        } else if (e.keyCode === 40) {
          dx = 0;
          dy *= 1;
        } else {
          dx = 0;
          dy = 0;
        }

        if (e.keyCode === 16) {
          vm.rotateTan(vm.currentTan);
        }

        if (e.keyCode === 13) {
          vm.tanState = 0;
        }
        vm.moveTan(vm.currentTan, dx, dy);
      }
    },

    onKeyUp: function(e) {
      let vm = this;
      if (vm.tanState === 1) {
        setTimeout(() => {
          vm.snapTan(vm.currentTan);
        }, 0);
      }
    },

    onRefresh: function(e) {
      let vm = this;
      if (e.screenX === 0 && e.screenY === 0) {
        return;
      }
      setTimeout(() => {
        vm.initializeTans();
      }, 0);
      setTimeout(() => {
        for (var i = 0; i < 7; i++) {
          vm.currentTan = i;
          vm.checkIfSolved();
        }
      }, 0);
    },

  }
}
