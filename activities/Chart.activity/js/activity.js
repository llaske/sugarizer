// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js",
	},
});

// CONSTANTS
const CHART_TYPES = {
	line: "line",
	horizontalBar: "horizontal-bar",
	bar: "bar",
	pie: "pie",
};

// APP
const app = new Vue({
	el: "#app",
	components: {
		chartview: ChartView,
	},
	data: {
		currentenv: null,
		SugarL10n: null,
		SugarPresence: null,
		activityTitle: "Chart Activity",
		tabularData: [],
		pref: {
			chartType: "bar",
			chartColor: { stroke: "", fill: "" },
			labels: {x: "X →", y: "Y →"},
			font: {
				propertyOrder: ["title", "labels", "tick"],
				title: {fontsize: 26, fontfamily: "Arial", color: "#005fe4"},
				labels: {fontsize: 20, fontfamily: "Arial", color: "#FF5733"},
				tick: {fontsize: 14, fontfamily: "Arial", color: "#282828"},
			} 
		},
		selectedField: 0,
		selectedFontIdx: 0,
		// TODO: implement collaboration
		isUpdated: false,
		l10n: {
			stringAddData: "",
			stringRemoveData: "",
			stringTutoExplainTitle: "",
			stringTutoExplainContent: "",
			stringTutoAddTitle: "",
			stringTutoAddContent: "",
			stringTutoBackgroundTitle: "",
			stringTutoBackgroundContent: "",
		},
		configActive: false,
		textPalActive: false,
		isFullscreen: false,
	},
	created() {
		this.palettes = {};
	},
	mounted() {
		this.SugarL10n = this.$refs.SugarL10n;
		this.SugarPresence = this.$refs.SugarPresence;
	},
	methods: {
		initialized() {
			const refs = this.$refs;
			this.chartview = refs.chartview;
			this.palettes.strokeColor = refs.strokeColorPal.paletteObject;
			this.palettes.fillColor = refs.fillColorPal.paletteObject;
			this.palettes.textColor = refs.textColorPal.paletteObject;
			this.palettes.font = refs.fontPal.paletteObject;
			this.palettes.share = refs.sharedPal.paletteObject;

			this.currentenv = refs.SugarActivity.getEnvironment();
			const { stroke, fill } = this.currentenv.user.colorvalue;

			this.pref.chartColor = { stroke, fill };
			this.activityTitle = this.currentenv.activityName;
			this.updatePalletes();

			const that = this;
			const input = document.querySelector("#activity-palette .container input");
			input.addEventListener("input", (e) => {
				that.activityTitle = e.target.value;
				this.chartview.updateTitle(e.target.value);
			});
		},
		updatePalletes() {
			this.palettes.strokeColor.setColor(this.pref.chartColor.stroke);
			this.palettes.fillColor.setColor(this.pref.chartColor.fill);
			this.palettes.textColor.setColor(this.pref.font.title.color);
			this.palettes.font.setFont(this.pref.font.title.fontfamily);
		},
		localized() {
			// this.activityTitle = this.SugarL10n.get("UserJoined", {
			// 	name: this.currentenv.user.name,
			// });
			this.SugarL10n.localize(this.l10n);
		},

		addData() {
			this.tabularData.push({
				x: (this.tabularData.length + 1),
				y: Math.floor((Math.random() * 10 + 1))+"",
			});
			var lastIdx = this.tabularData.length - 1;
			this.$nextTick(function () {
				this.$refs.input[lastIdx].focus();
			});
			this.selectedField = lastIdx;
		},
		removeData() {
			if (this.selectedField < 0) return;
			this.tabularData.splice(this.selectedField, 1);
			this.selectedField--;
			if (this.selectedField < 0)
				this.selectedField += this.tabularData.length;
		},
		validateInput(e, index) {
			const value = e.target.value
				.replace(/[^0-9.-]/g, "") //Remove char that are not digits, points, or negative sign
				.replace(/(\..*?)\..*/g, "$1") // Keep only the first occurrence of a "." 	
				.replace(/(?!^)-/g, ''); //Remove "-" sign (if not at the beginning)
			this.tabularData[index].y = value;
			e.target.value = value;
		},

		swapData(a, b) {
			let tmp = this.tabularData[a];
			this.tabularData[a] = this.tabularData[b];
			this.$set(this.tabularData, b, tmp);
		},
		swapUp() {
			const i = this.selectedField;
			if (i >= 1) {
				this.swapData(i, i - 1);
				this.selectedField--;
			}
		},
		swapDown() {
			const i = this.selectedField;
			if (i <= this.tabularData.length - 2) {
				this.swapData(i, i + 1);
				this.selectedField++;
			}
		},

		popDownPal() {
			for (const key in this.palettes)
				this.palettes[key] && this.palettes[key].popDown();				
		},
		toggleConfig() {
			this.configActive = !this.configActive;
			this.textPalActive = false;
			this.popDownPal();
		},
		toggleTextPal() {
			this.textPalActive = !this.textPalActive;
			this.configActive = false;
			this.popDownPal();
		},

		onNetworkDataReceived(msg) {
			this.isUpdated = true;
			const data = msg.content.data;
			switch (msg.content.action) {
				case "init":
					this.tabularData = data;
					break;
				case "update":
					this.$set(this.tabularData, data.index, data.values);
					break;
			}
		},
		onNetworkUserChanged(msg) {
			// Handling only by the host
			if (this.SugarPresence.isHost) {
				this.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: "init",
						data: this.tabularData,
					},
				});
			}
		},

		onStop() {
			var context = {
				tabularData: this.tabularData,
				pref: this.pref,
			};
			this.$refs.SugarJournal.saveData(context);
		},

		onJournalSharedInstance() {},

		onJournalNewInstance() {
			this.chartview.updateTitle("Chart Activity");
		},
		onJournalDataLoaded(data, metadata) {
			this.tabularData = data.tabularData;
			this.updatePreference(data.pref);
		},
		insertBackground() {
			var filters = [
				// { activity: "org.sugarlabs.StopwatchActivity" },
				{ mimetype: "text/plain" },
			];

			this.$refs.SugarJournal.insertFromJournal(filters).then((data, metadata) => {
				console.log("Jounal Dialog data");
				console.log(data);
				// document.getElementById("app").style.backgroundImage = `url(${data})`;
			});
		},

		onHelp() {
			var steps = [
				{
					title: this.l10n.stringTutoExplainTitle,
					intro: this.l10n.stringTutoExplainContent,
				},
				{
					element: "#add-button",
					position: "right",
					title: this.l10n.stringTutoAddTitle,
					intro: this.l10n.stringTutoAddContent,
				},
				{
					element: "#insert-button",
					position: "bottom",
					title: this.l10n.stringTutoBackgroundTitle,
					intro: this.l10n.stringTutoBackgroundContent,
				},
			];
			this.$refs.SugarTutorial.show(steps);
		},

		onAddImage() {
			const { imgData, metadata } = this.chartview.getImgData();
			this.$refs.SugarJournal.createEntry(imgData, metadata);
		},

		sendPresenceMessage(action, data) {
			if (this.SugarPresence.isShared()) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action,
						data,
					},
				};
				this.SugarPresence.sendMessage(message);
			}
		},

		// Handlers
		handleChartColor(e, type) {
			this.pref.chartColor[type] = e.detail.color;
		},
		handleTextColor(e) {
			this.selectedFontField.color = e.detail.color;	
		}, 
		handleFontFamily(e) {
			this.selectedFontField.fontfamily = e.detail.family;	
		},
		handleFontSize(value) {
			let fontsize = this.selectedFontField.fontsize;
			fontsize += value;
			this.selectedFontField.fontsize = Math.min(Math.max(10, fontsize), 55);
		},
		updateFontField(index) {
			this.selectedFontIdx = index;
			this.palettes.textColor.setColor(this.selectedFontField.color);
			this.palettes.font.setFont(this.selectedFontField.fontfamily);
		},
		updatePreference(prefObj) {
			this.pref = prefObj;
			this.$nextTick(function () {
				// Maintain order so chartType pie can update colors
				this.chartview.updateChartColor();
				this.chartview.updateChartType();
				this.updatePalletes();
				["x", "y"].forEach(axis => {
					this.chartview.updateLabel(axis);
				});
				["color", "fontsize", "fontfamily"].forEach(field => {
					this.pref.font.propertyOrder.forEach(property  => {
						this.chartview.updateFontValues(property, field);
					});
				});
			});
		},
	},
	computed: {
		selectedFontField() {
			return this.pref.font[this.selectedFontName];	
		},
		selectedFontName() {
			const index = this.selectedFontIdx;
			return this.pref.font.propertyOrder[index];
		},
	},
	watch: {
		"pref.labels.x"() {
			this.chartview.updateLabel("x");
		},
		"pref.labels.y"() {
			this.chartview.updateLabel("y");
		},
		"pref.chartType"() {
			this.chartview.updateChartType();
		},
		"pref.chartColor": {
			handler() {
				this.chartview.updateChartColor();
			},
			deep: true,
		},
		"selectedFontField.color"() {
			this.chartview.updateFontValues(this.selectedFontName, "color");
		},
		"selectedFontField.fontfamily"() {
			this.chartview.updateFontValues(this.selectedFontName, "fontfamily");
		},
		"selectedFontField.fontsize"() {
			this.chartview.updateFontValues(this.selectedFontName, "fontsize");
		},
	// 	tabularData: {
	// 		handler() {
	// 			if (this.isUpdated) {
	// 				this.isUpdated = false;
	// 				return;
	// 			}
	// 			this.sendPresenceMessage("update", {
	// 				index: this.selectedField,
	// 				values: this.tabularData[this.selectedField],
	// 			});
	// 		},
	// 		deep: true,
	// 	},
	},
});
