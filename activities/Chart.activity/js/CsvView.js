const CsvView = {
	template: `
		<div class="csv-view">
	    	<div class="csv-container">
				<div class="cell-group csv-header">
					<span class="marker">1</span>
					<div v-for="(key, i) in jsonData.header" :key="'header'+i" @click="setIndex(0, i)" :class="{active: isActive(0, i), invalid: isInvalid(i)}" class="cell">
						{{ key.startsWith("__") ? "" : key }}
					</div>
				</div>
				<div v-for="(dataRow, i) in jsonData.data" :key="'row'+i" class="cell-group">
					<span class="marker">{{ i+2 }}</span>
					<div v-for="(key, j) in jsonData.header" :key="'col'+j" @click="setIndex(i+1, j)" :class="{active: isActive(i+1, j)}" class="cell">
						{{ dataRow[key] }}
					</div>
				</div>
	    	</div>
			<div class="toolbar swap-fields">
				<button id="up-button" class="toolbutton" @click="swapLeft"></button>
				<button id="down-button" class="toolbutton" @click="swapRight"></button>
			</div>
		</div>
    `,
	props: ["jsonData"],
	data() {
		return {
			selectedIdx: { i: 0, j: 0 },
			invalid: false,
		}
	},
	methods: {
		swapRight() {
			this.selectedIdx.j = util.swapToNext(this.jsonData.header, this.selectedIdx.j);	
			this.updateKeys();
		},	
		swapLeft() {
			this.selectedIdx.j = util.swapToPrev(this.jsonData.header, this.selectedIdx.j);
			this.updateKeys();
		},

		updateData(labelKey, valueKey) {
			const header = this.jsonData.header;
			if (labelKey !== undefined) this.$emit("data-change", "label", labelKey)

			if (valueKey === undefined || this.invalidKeys.includes(valueKey)) {
				this.invalid = true;
			} else {
				this.invalid = false;
				this.$emit("data-change", "value", valueKey);
			}
		},
		updateKeys() {
			const header = this.jsonData.header;
			this.updateData(header[0], header[1]);
		},
		updateJsonData(data, header, mapKeys) {
			if (mapKeys) {
				data = data.map(obj => {
					const tmp = {};
					Object.keys(obj).forEach((key, i) => {
						if (header[i] !== undefined) {
							tmp[header[i]] = obj[key];
						}
					})
					return tmp;
				})
			}
			this.jsonData.data = data;
			this.jsonData.header = header;
			this.updateKeys();
		},
		setIndex(i, j) {
			this.selectedIdx.i = i;
			this.selectedIdx.j = j;
		},
		isActive(i, j) {
			return this.selectedIdx.i === i && this.selectedIdx.j === j;
		},
		isInvalid(i) {
			return i === 1 && this.invalid;
		}
	},
	computed: {
		invalidKeys() {
			const invalidKeys = [];
			for (const key of this.jsonData.header) {
				for (const obj of this.jsonData.data) {
					if (obj[key] && obj[key].match(/[^0-9.\-,]/g)) {
						invalidKeys.push(key);
						break;
					}
				}
			}
			return invalidKeys;
		}
	}
};
