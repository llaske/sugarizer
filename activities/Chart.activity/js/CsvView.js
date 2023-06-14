const CsvView = {
	template: `
    	<div class="csv-container">
    		<div class="cell-group select">
				<span class="marker"></span>
				<div v-for="(key,i) in jsonData.header" :key="'select'+i" class="cell select-group">
					<div @click="updateLabel(key)" :class="{active: labelKey === key}" class="data-label">Label</div>
					<div @click="updateValue(key)" :class="{active: valueKey === key, disabled: invalidKeys.includes(key)}" class="data-label">Value</div>
				</div>
    		</div>
    		<div class="cell-group csv-header">
				<span class="marker">1</span>
				<div v-for="(key,i) in jsonData.header" :key="'header'+i" class="cell">
					{{ key.startsWith("__") ? "" : key }}
				</div>
    		</div>
			<div v-for="(dataRow, i) in jsonData.data" :key="'row'+i" class="cell-group">
				<span class="marker">{{ i+2 }}</span>
				<div v-for="(key, j) in jsonData.header" :key="'col'+j" class="cell">
					{{ dataRow[key] }}
				</div>
			</div>
    	</div>
    `,
	props: ["jsonData"],
	data() {
		return {
			labelKey: "",
			valueKey: "",
		}
	},
	methods: {
		updateLabel(key) {
			this.labelKey = key;
			this.$emit("data-change", "label", key)
		},
		updateValue(key) {
			if (this.invalidKeys.includes(key)) return;
			this.valueKey = key;
			this.$emit("data-change", "value", key)
		},
		updateKeys(labelKey, valueKey) {
			if (labelKey !== undefined) this.updateLabel(labelKey);
			if (valueKey !== undefined) this.updateValue(valueKey);
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
			this.updateKeys(header[0], header[1]);
		},
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
