// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js",
	},
});

// CONSTANTS
const CHART_TYPES = {
	line: "stringLineChart",
	horizontalBar: "stringHorizontalBarChart",
	bar: "stringVerticalBarChart",
	pie: "stringPieChart",
};

// APP
const app = new Vue({
	el: "#app",
	components: {
		chartview: ChartView,
		"csv-view": CsvView,
	},
	data: {
		currentenv: null,
		SugarL10n: null,
		SugarPresence: null,
		activityTitle: "",
		tabularData: [],
		jsonData: {
			data: [],
			header: [],
		},
		pref: {
			chartType: "bar",
			chartColor: { stroke: "", fill: "" },
			labels: {x: "", y: ""},
			font: {
				propertyOrder: ["title", "labels", "tick"],
				title: {fontsize: 26, fontfamily: "Arial", color: "#005fe4"},
				labels: {fontsize: 22, fontfamily: "Arial", color: "#555555"},
				tick: {fontsize: 14, fontfamily: "Arial", color: "#282828"},
			} 
		},
		selectedField: {i: 0, axis: "x"},
		selectedFontIdx: 0,
		l10n: {
			stringChartActivity: "",
			stringAddValue: "",
			stringRemoveValue: "",
			stringVerticalBarChart: "",
			stringHorizontalBarChart: "",
			stringLineChart: "",
			stringPieChart: "",
			stringPieChartText: "",
			stringChartColor: "",
			stringLineColor: "",
			stringHorizontalLabel: "",
			stringVerticalLabel: "",
			stringFontColor: "",
			stringFontColorText: "",
			stringSelectFont: "",
			stringSelectFontText: "",
			stringTitleFont: "",
			stringTitleFontText: "",
			stringLabelsFont: "",
			stringLabelsFontText: "",
			stringTickFont: "",
			stringTickFontText: "",
			stringFontMinusButton: "",
			stringFontPlusButton: "",
			stringFullscreen: "",
			stringNetwork: "",
			stringMoveUp: "",
			stringMoveDown: "",
			stringLabel: "",
			stringValue: "",
			stringHelp: "",
			stringConfigs: "",
			stringTextPalette: "",
			stringTextPaletteText: "",
			stringTutoPrev: "",
			stringTutoNext: "",
			stringTutoEnd: "",
			stringTutoExplainContent: "",
			stringTutoAddData: "",
			stringTutoAddButton: "",
			stringTutoRemoveButton: "",
			stringTutoChartTitle: "",
			stringTutoChartType: "",
			stringTutoConfig: "",
			stringTutoSaveImage: "",
			stringTutoExportCsv: "",
			stringexportAsCSV: "",
			stringSaveImage: "",
			stringInsertChart: "",
			stringTutoViewCsv: "",
			stringLines: "",
			stringVerticalBars: "",
			stringHorizontalBars: "",
			stringExportSettings: "",
			stringViewCsv: "",
			stringTutoCsvColumn1: "",
			stringTutoCsvColumn2: "",
			stringTutoCsvNumOnly: "",
			stringTutoCsvRightArr: "",
			stringTutoCsvLeftArr: "",
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
		this.SugarPopup = this.$refs.SugarPopup;
		this.SugarJournal = this.$refs.SugarJournal;
		this.chartview = this.$refs.chartview;
	},
	methods: {
		initialized() {
			const refs = this.$refs;
			this.palettes.strokeColor = refs.strokeColorPal.paletteObject;
			this.palettes.fillColor = refs.fillColorPal.paletteObject;
			this.palettes.textColor = refs.textColorPal.paletteObject;
			this.palettes.font = refs.fontPal.paletteObject;
			this.palettes.share = refs.sharedPal.paletteObject;
			this.palettes.export = refs.exportPal.paletteObject;

			this.currentenv = refs.SugarActivity.getEnvironment();
			const { stroke, fill } = this.currentenv.user.colorvalue;

			this.pref.chartColor = { stroke, fill };
			this.updateActivityTitle(this.currentenv.activityName)
			this.updatePalletes();

			const that = this;
			this.activityInput = document.querySelector("#activity-palette .container input");
			this.activityInput.addEventListener("input", (e) => {
				this.updateActivityTitle(e.target.value)
				e.target.value = this.activityInput.value;
			});
		},
		localized() {
			this.SugarL10n.localize(this.l10n);
			document.getElementById("export-csv-button").title = this.l10n.stringexportAsCSV;
			document.getElementById("export-img-button").title = this.l10n.stringSaveImage;

		},

		addData() {
			const obj = {
				x: (this.tabularData.length + 1),
				y: Math.floor((Math.random() * 10 + 1))+"",
			}
			this.executeAndSendAction(Action_Types.ADD_TABLE_DATA, { obj })

			var lastIdx = this.tabularData.length - 1;
			this.$nextTick(function () {
				this.$refs.input[lastIdx].focus();
			});
			this.selectedField.i = lastIdx;
		},
		removeData() {
			if (this.selectedField.i < 0) return;
			this.executeAndSendAction(Action_Types.REMOVE_TABLE_DATA, {
				idx: this.selectedField.i,
			});			 

			this.selectedField.i--;
			if (this.selectedField.i < 0)
				this.selectedField.i += this.tabularData.length;
		},

		validateInput(e) {
			e.target.value = e.target.value
				.replace(/[^0-9.-]/g, "") //Remove char that are not digits, points, or negative sign
				.replace(/(\..*?)\..*/g, "$1") // Keep only the first occurrence of a "." 	
				.replace(/(?!^)-/g, ''); //Remove "-" sign (if not at the beginning)
			this.updateInput(e);
		},
		updateInput(e) {
			const data = {
				selectedField: this.selectedField,
				value: e.target.value,
			};
			this.executeAndSendAction(Action_Types.UPDATE_TABLE_DATA, data);
		},

		swapUp() {
	        const arr = this.tabularData;
	        let idx = this.selectedField.i;
	        if (idx < 1) return;

			this.executeAndSendAction(Action_Types.SWAP_DATA, {
				a: idx,
				b: idx - 1,
			});			
	        idx--;
	        this.selectedField.i = idx;
		},
		swapDown() {
	        const arr = this.tabularData;
	        let idx = this.selectedField.i;
	        if (!arr.length || idx > arr.length - 2) return;

			this.executeAndSendAction(Action_Types.SWAP_DATA, {
				a: idx,
				b: idx + 1,
			});			
	        idx++;
	        this.selectedField.i = idx;
		},

		popDownPal() {
			for (const key in this.palettes)
				this.palettes[key] && this.palettes[key].popDown();				
		},
		toggleConfig() {
			this.executeAndSendAction(Action_Types.TOGGLE_PALETTE, {
				configActive: !this.configActive,
				textPalActive: false,
			});			
		},
		toggleTextPal() {
			this.executeAndSendAction(Action_Types.TOGGLE_PALETTE, {
				textPalActive: !this.textPalActive,
				configActive: false,
			});			
		},

		onNetworkDataReceived(msg) {
			Execute[msg.content.action](this, msg);
		},

		onNetworkUserChanged(msg) {
			if (this.SugarPresence.isHost) {
				const message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: Action_Types.INIT,
						data: {
							tabularData: this.tabularData,
							pref: this.pref,
							title: this.activityTitle,
							csvJsonData: this.jsonData,
						}
					},
				};
				this.SugarPresence.sendMessage(message);
			}
		},

		executeAndSendAction(action, data) {
			const message = {
				content: {
					action,
					data,
				},
			};
			Execute[action](this, message);

			if (!this.SugarPresence.isShared()) return;
			message.user = this.SugarPresence.getUserInfo();
			this.SugarPresence.sendMessage(message);
		},


		onJournalNewInstance() {
			const randArr = this.shuffleArray([1, 2, 3, 4, 5, 6]);
			for(let i = 0; i < 3; i++) {
				const label = "EgLabel" + randArr[i];
				this.tabularData.push({
					x: this.SugarL10n.get(label),
					y: randArr[i] + 6 + "",
				})
			}
			this.pref.labels.x = this.SugarL10n.get("Sports"); 
			this.pref.labels.y = this.SugarL10n.get("Students");
			this.updateActivityTitle(this.l10n.stringChartActivity)

			const header = [this.pref.labels.x, this.pref.labels.y];
			this.$refs.csvView.updateJsonData(this.tabularData, header, true);
		},
		onJournalDataLoaded(data, metadata) {
			this.LZ = this.SugarJournal.LZString;
			if (metadata.mimetype === "text/csv") {
				this.isCsvFile = true;
				this.csvTitle = this.currentenv.activityName;
				this.pref.chartType = "csvMode";
				const json = CSVParser.csvToJson(data);
				this.$refs.csvView.updateJsonData(json.data, json.headers);
				return;
			}
			const parsedData = JSON.parse(this.LZ.decompressFromUTF16(data));
			const pref = parsedData.pref;

			let xKey = pref.labels.x;
			if (xKey == pref.labels.y) xKey += "__";
			this.$refs.csvView.updateJsonData(parsedData.tabularData, [xKey, pref.labels.y], true);
			this.updatePreference(pref);
		},

		exportFile(e) {
			switch (e.format) {
				case "csv":
					this.exportAsCsv();
					break;
				case "png":
					this.exportAsImage();
					break;
			}
		},
		exportAsImage() {
			const { imgData, metadata } = this.chartview.getImgData();
			this.createJournalEntry(imgData, metadata, this.SugarL10n.get("exportImage"));
		},
		exportAsCsv() {
			const header = [this.pref.labels.x, this.pref.labels.y];
			const csvContent = CSVParser.jsonToCsv(this.tabularData, header);
			const metadata = {
				mimetype: "text/csv",
				title: this.activityTitle + ".csv",
				activity: "org.sugarlabs.ChartActivity",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			this.createJournalEntry(csvContent, metadata, this.SugarL10n.get("exportedLogAsCSV"));
		},
		createJournalEntry(content, metadata, msg) {
			this.SugarJournal.createEntry(content, metadata).then(() => {
				msg && this.SugarPopup.log(msg);
			});
		},

		// Handlers
		handleDataChange(field, key) {
			let axis = field === "label" ? "x" : "y";
			this.pref.labels[axis] = !key.startsWith("__") ? key : "";
			this.jsonData.data.forEach((obj, i) => {
				let value = obj[key];
				if (axis === "y" && value !== undefined) value = value.replace(/,/g, "");
				if (!this.tabularData[i]) {
					this.tabularData.push({
						x: "", y: "",
					})
				}
				this.tabularData[i][axis] = value;
			});
		},
		handleColSwap(a, b) {
			this.executeAndSendAction(Action_Types.SWAP_COLUMN, {
				a,
				b,
			});			
		},

		handleLabel(e, axis) {
			this.executeAndSendAction(Action_Types.UPDATE_LABEL, {
				value: e.target.value,
				axis: axis,
			});
		},
		handleChartColor(e, type) {
			this.executeAndSendAction(Action_Types.UPDATE_CHART_COLOR, {
				color: e.detail.color,
				type: type,
			});
		},
		setChartType(type) {
			this.executeAndSendAction(Action_Types.UPDATE_CHART_TYPE, {
				chartType: type,
			});
		},

		handleTextColor(e) {
			this.executeAndSendAction(Action_Types.UPDATE_TEXT_COLOR, {
				selectedFontIdx: this.selectedFontIdx,	
				color: e.detail.color,
			});
		}, 
		handleFontFamily(e) {
			this.executeAndSendAction(Action_Types.UPDATE_FONT_FAMILY, {
				selectedFontIdx: this.selectedFontIdx,	
				family: e.detail.family,
			});
		},
		handleFontSize(value) {
			this.executeAndSendAction(Action_Types.UPDATE_FONT_SIZE, {
				selectedFontIdx: this.selectedFontIdx,	
				value: value,
			});
		},

		updateActivityTitle(title) {
			this.executeAndSendAction(Action_Types.UPDATE_TITLE, { title });
		},
		updateTitleInput (value) {
			const activeEle = document.activeElement;
			this.activityInput.style.visibility = "visible";
			this.activityInput.value = value;
			this.activityInput.focus();
			this.activityInput.blur(); //to update the title in activitypalette.js
			activeEle.focus();
			this.activityInput.style.visibility = "unset";
		},
		updatePalletes() {
			this.palettes.strokeColor.setColor(this.pref.chartColor.stroke);
			this.palettes.fillColor.setColor(this.pref.chartColor.fill);
			this.palettes.textColor.setColor(this.pref.font.title.color);
			this.palettes.font.setFont(this.pref.font.title.fontfamily);
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
		setSelectedField(i, axis) {
			this.selectedField.i = i;
			this.selectedField.axis = axis;
		},

		onHelp() {
			const steps = [
				{
					title: this.l10n.stringChartActivity,
					intro: this.l10n.stringTutoExplainContent,
				},
				{
					element: "#activity-button",
					position: "bottom",
					title: this.l10n.stringChartActivity,
					intro: this.l10n.stringTutoChartTitle,
				},
				{
					element: "#add-button",
					position: "bottom",
					title: this.l10n.stringAddValue,
					intro: this.l10n.stringTutoAddData,
				},
				{
					element: "#remove-button",
					position: "bottom",
					title: this.l10n.stringRemoveValue,
					intro: this.l10n.stringTutoRemoveButton,
				},
				{
					title: this.l10n.stringChartActivity,
					intro: this.l10n.stringTutoChartType,
				},
				{
					element: "#line-chart-button",
					position: "bottom",
					title: this.l10n.stringLineChart,
					intro: this.l10n.stringLines,
				},
				{
					element: "#horizontalBar-chart-button",
					position: "bottom",
					title: this.l10n.stringHorizontalBarChart,
					intro: this.l10n.stringHorizontalBars,
				},
				{
					element: "#bar-chart-button",
					position: "bottom",
					title: this.l10n.stringVerticalBarChart,
					intro: this.l10n.stringVerticalBars,
				},
				{
					element: "#pie-chart-button",
					position: "bottom",
					title: this.l10n.stringPieChart,
					intro: this.l10n.stringPieChartText,
				},
				{
					element: "#csv-button",
					position: "bottom",
					title: this.l10n.stringViewCsv,
					intro: this.l10n.stringTutoViewCsv,
				},
				{
					element: ".csv-header #header0",
					position: "right",
					title: this.l10n.stringViewCsv,
					intro: this.l10n.stringTutoCsvColumn1,
				},
				{
					element: ".csv-header #header1",
					position: "right",
					title: this.l10n.stringViewCsv,
					intro: `${this.l10n.stringTutoCsvColumn2}. ${this.l10n.stringTutoCsvNumOnly}`,
				},
				{
					element: ".csv-view #up-button",
					position: "top",
					title: this.l10n.stringViewCsv,
					intro: this.l10n.stringTutoCsvLeftArr,
				},
				{
					element: ".csv-view #down-button",
					position: "top",
					title: this.l10n.stringViewCsv,
					intro: this.l10n.stringTutoCsvRightArr,
				},
				{
					element: "#config-button",
					position: "bottom",
					title: this.l10n.stringConfigs,
					intro: this.l10n.stringTutoConfig,
				},
				{
					element: "#text-palette-button",
					position: "bottom",
					title: this.l10n.stringTextPalette,
					intro: this.l10n.stringTextPaletteText,
				},
				{
					element: "#title-font-button",
					position: "bottom",
					title: this.l10n.stringTitleFont,
					intro: this.l10n.stringTitleFontText,
				},
				{
					element: "#labels-font-button",
					position: "bottom",
					title: this.l10n.stringLabelsFont,
					intro: this.l10n.stringLabelsFontText,
				},
				{
					element: "#tick-font-button",
					position: "bottom",
					title: this.l10n.stringTickFont,
					intro: this.l10n.stringTickFontText,
				},
				{
					element: "#font-button",
					position: "bottom",
					title: this.l10n.stringSelectFont,
					intro: this.l10n.stringSelectFontText,
				},
				{
					element: "#text-color",
					position: "bottom",
					title: this.l10n.stringFontColor,
					intro: this.l10n.stringFontColorText,
				},
				{
					element: "#export-img-button",
					position: "bottom",
					title: this.l10n.stringSaveImage,
					intro: this.l10n.stringTutoSaveImage,
				},
				{
					element: "#export-csv-button",
					position: "bottom",
					title: this.l10n.stringexportAsCSV,
					intro: this.l10n.stringTutoExportCsv,
				},
			];
			const introJs = this.$refs.SugarTutorial.introJs;
			introJs.onbeforechange((targetEle) => {
				switch (targetEle.id) {
					case "pie-chart-button":
					case "config-button":
						this.$refs.csvView.$refs.csvView.style.zIndex = "unset";
						this.textPalActive = false;
						break;
					case "header0":
					case "header1":
						setTimeout(() => {
							document.querySelector(".introjs-helperLayer").style.height = "calc(100vh - 95px)"
						},0);
					case "down-button":
						this.pref.chartType = "csvMode";
						this.$refs.csvView.$refs.csvView.style.zIndex = "9999991";
						break;
					case "title-font-button":
						this.pref.chartType = CHART_TYPES.line;
						this.textPalActive = true;
						this.palettes.export.popDown();
						break;
					case "export-img-button":
						this.palettes.export.popUp();
						break;
				}
			})
			introJs.onexit(() => {
				this.textPalActive = false;
				this.palettes.export.popDown();
			});			
			this.configActive = this.textPalActive = false;
			this.$refs.SugarTutorial.show(steps);
		},
		onStop() {
			const context = {
				tabularData: this.tabularData,
				pref: this.pref,
			};
			if (this.isCsvFile) {
				const metadata = {
					title: this.activityTitle, 
					activity: "org.sugarlabs.ChartActivity",
					timestamp: new Date().getTime()+1000,
					creation_time: new Date().getTime()+1000,
					file_size: 0,
				};
				var data = this.LZ.compressToUTF16(JSON.stringify(context));
				this.createJournalEntry(data, metadata);
				this.updateTitleInput(this.csvTitle);
				return;
			}
			this.$refs.SugarJournal.saveData(context);
		},
		shuffleArray(array) {
		    for (let i = array.length - 1; i > 0; i--) {
		        const j = Math.floor(Math.random() * (i + 1));
		        [array[i], array[j]] = [array[j], array[i]];
		    }
		    return array;
		}
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
			if (this.pref.chartType === "csvMode") return;
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
	},
});
