Vue.component('data-set-handler', {
	name: 'DataSetHandler',
	data: function() {
		return {
			tangramSet: [],
      dataSet: [],
      category: "Animals",
      categories: []
		}
	},
	mounted() {
    this.fillTangramSet();
	},
	methods: {
    loadList() {
			return new Promise((resolve, reject) => {
				requirejs(["text!../data/dataSet.json"], function(dataSet) {
					resolve(dataSet);
				});
			});
		},

    fillTangramSet: function () {
      let vm = this;
      this.loadList()
  			.then(async (dataSet) => {
  				dataSet = JSON.parse(dataSet);
          vm.dataSet = dataSet["data"];
          vm.categories = Object.keys(vm.dataSet);
          vm.onChangeCategory(vm.category);
  			});
    },

    generateTangramFromSet: function () {
      let index = Math.floor(Math.random() * (this.tangramSet.length))
      return this.buildTangramPuzzle(index);
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
      let tangram = new Tangram(tans);
      let tangramName = tang.name;
      let tangramPuzzle = {
        name: tangramName,
        tangram: tangram,
      }
      return tangramPuzzle;
    },

    onChangeCategory: function (newCat) {
      let vm = this;
      vm.category = newCat;
      vm.tangramSet = [];
      for(let tangram of vm.dataSet[vm.category]) {
        vm.tangramSet.push(tangram);
      }
    },


    addTangramPuzzle: function() {
			var vm = this;
			/*requirejs([`text!${vm.templateURL}`], function(template) {
				template = JSON.parse(template);
				var data = JSON.parse(vm.$root.$refs.SugarJournal.LZString.decompressFromUTF16(template.text))
				vm.$emit('template-selected', {
					fromURL: true,
					templateTitle: template.metadata.title,
					templateImage: data.templateImage,
					categories: data.categories,
					notationLevel: data.notationLevel
				});
				showPopup = false;
			});
      */
		}
	}
})
