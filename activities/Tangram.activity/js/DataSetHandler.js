Vue.component('data-set-handler', {
	name: 'DataSetHandler',
	data: function() {
		return {
			tangramSet: [],
      dataSet: [],
      currentCategories: ["Animals"],
      AllCategories: [],
			puzzlePointer: 0,
		}
	},
	mounted() {
    this.loadDataSet();
	},
	methods: {
    loadList() {
			return new Promise((resolve, reject) => {
				requirejs(["text!../data/dataSet.json"], function(dataSet) {
					resolve(dataSet);
				});
			});
		},

    loadDataSet: function () {
      let vm = this;
      this.loadList()
  			.then(async (dataSet) => {
  				dataSet = JSON.parse(dataSet);
          vm.dataSet = dataSet["data"];
          vm.AllCategories = vm.dataSet.map(ele => ele.name);
          vm.loadTangramSet();
  			});
    },

		loadTangramSet: function () {
			let vm = this;
			vm.tangramSet = [];
			for (var i = 0; i < vm.dataSet.length; i++) {
				if (vm.currentCategories.includes(vm.dataSet[i].name)) {
					for(let tangram of vm.dataSet[i]["tangrams"]) {
		        vm.tangramSet.push(tangram);
		      }
				}
			}
			vm.tangramSet = shuffleArray(vm.tangramSet);
			vm.puzzlePointer = 0;
		},

    generateTangramFromSet: function () {
			if (this.puzzlePointer >= this.tangramSet.length) {
				this.puzzlePointer = 0;
			}
      let index = this.puzzlePointer;
			this.puzzlePointer++;
      return this.buildTangramPuzzle(index);
    },

		getTangramPuzzle: function (id) {
			let vm = this;
			let index = vm.tangramSet.findIndex(ele => ele.id === id);
			if (index === -1) return null;
			return vm.buildTangramPuzzle(index);
		},

    buildTangramPuzzle: function (index) {
      let vm = this;
      if (vm.tangramSet.length === 0) {
        return;
      }
      let tang = vm.tangramSet[index];
      let tans = [];
      for (var i = 0; i < tang.targetTans.length; i++) {
        let coeffIntX = tang.targetTans[i].anchor.x[0];
        let coeffSqrtX = tang.targetTans[i].anchor.x[1];
        let coeffIntY = tang.targetTans[i].anchor.y[0];
        let coeffSqrtY = tang.targetTans[i].anchor.y[1];
        let anchor = new Point(new IntAdjoinSqrt2(coeffIntX, coeffSqrtX), new IntAdjoinSqrt2(coeffIntY, coeffSqrtY));
        let tan = new Tan(tang.targetTans[i].tanType, anchor.dup(), tang.targetTans[i].orientation);
        tans.push(tan);
      }
			let categoryId = parseInt(tang.id.substr(0,1));
			let category = vm.dataSet.find(ele => ele.id === categoryId).name;
      let tangramPuzzle = {
				id: tang.id,
        name: tang.name,
        tangram: new Tangram(tans),
				category: category
      }
			tangramPuzzle.tangram.positionCentered();
      return tangramPuzzle;
    },


    onChangeCategory: function (newCats) {
      let vm = this;
			vm.currentCategories = newCats;
      vm.loadTangramSet();
    },

		deleteTangramPuzzle: function (id) {
			let vm = this;
			let categoryId = parseInt(id.substr(0,1));
			let index = vm.dataSet.findIndex(ele => ele.id === categoryId);
			if (index !== -1 && vm.dataSet[index]["tangrams"].length > 1) {
				let tangramIndex = vm.dataSet[index]["tangrams"].findIndex(ele => ele.id === id);
				vm.dataSet[index]["tangrams"].splice(tangramIndex, 1);
				let tangramIndex2 = vm.tangramSet.findIndex(ele => ele.id === id);
				vm.tangramSet.splice(tangramIndex2, 1);
			}
		},

    addTangramPuzzle: function(puzzle) {
			let vm = this;
			let newDataSetElem = {
				id: null,
				name: puzzle.name,
				targetTans: []
			}
			let index = vm.dataSet.findIndex(ele => ele.name === puzzle.category);
			if (index === -1) return;
			newDataSetElem.id = vm.dataSet[index].id+"#"+Date.now();

			for (var i = 0; i < puzzle.tangram.tans.length; i++) {
				let tan = puzzle.tangram.tans[i]
				newDataSetElem.targetTans.push({
					anchor: {
						x: [tan.anchor.x.coeffInt, tan.anchor.x.coeffSqrt],
						y: [tan.anchor.y.coeffInt, tan.anchor.y.coeffSqrt]
					},
					tanType: tan.tanType,
					orientation: tan.orientation
				});
			}

			vm.dataSet[index]["tangrams"].push(newDataSetElem);
			vm.tangramSet.push(newDataSetElem);
			console.log(JSON.stringify(newDataSetElem));
		}
	}
})
