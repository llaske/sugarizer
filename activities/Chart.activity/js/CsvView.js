const CsvView = {
	template: `
		<div ref="csvView" class="csv-view">
	    	<div class="csv-container">
				<div class="cell-group csv-header">
					<span class="marker">1</span>
					<div v-for="(key, i) in jsonData.header" :key="'header'+i" :id="'header'+i" @click="selectedIdx = i" :class="{active: isActive(i), invalid: isInvalid(i), last: !jsonData.data[1]}" class="cell">
						{{ key.startsWith("__") ? "" : key }}
					</div>
				</div>
				<div v-for="(dataRow, i) in jsonData.data" :key="'row'+i" class="cell-group">
					<span class="marker">{{ i+2 }}</span>
					<div v-for="(key, j) in jsonData.header" :key="'col'+j" @click="selectedIdx = j" :class="{active: isActive(j), last: i == jsonData.data.length-1}" class="cell">
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
			selectedIdx: 0,
			invalid: false,
		}
	},
	methods: {
		swapRight() {
	        const arr = this.jsonData.header;
	        let idx = this.selectedIdx;
	        if (!arr.length || idx > arr.length - 2) return;
			this.$emit("swap-data", idx, idx + 1);
	        this.selectedIdx++;
		},	
		swapLeft() {
	        let idx = this.selectedIdx;
	        if (idx < 1) return;
			this.$emit("swap-data", idx, idx - 1);
	        this.selectedIdx--;
		},

		updateTableData() {
			const labelKey = this.jsonData.header[0];
			const valueKey = this.jsonData.header[1];
			if (labelKey !== undefined) this.$emit("data-change", "label", labelKey)

			if (valueKey === undefined || this.invalidKeys.includes(valueKey)) {
				this.invalid = true;
			} else {
				this.invalid = false;
				this.$emit("data-change", "value", valueKey);
			}
		},
		updateJsonData(data, header, mapKeys, updateViewOnly) {
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
			if (!updateViewOnly) this.updateTableData();
			else this.invalid = this.invalidKeys.includes(this.jsonData.header[1]);
		},
		isActive(idx) {
			return this.selectedIdx === idx;
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
					if (typeof obj[key] == "string" && obj[key].match(/[^0-9.\-,]/g)) {
						invalidKeys.push(key);
						break;
					}
				}
			}
			return invalidKeys;
		}
	}
};
