const util = {
	swapToNext: function (arr, idx) {
		if (!arr.length || idx > arr.length - 2) return idx;
		this.swapIndex(arr, idx, idx + 1);
		idx++;
		return idx;
	},
	swapToPrev: function (arr, idx) {
		if (idx < 1) return idx;
		this.swapIndex(arr, idx, idx - 1);
		idx--;
		return idx;
	},
	swapIndex: function (arr, a, b) {
		let tmp = arr[a];
		arr[a] = arr[b];
		arr[b] = tmp;
		return arr;
	},
};
