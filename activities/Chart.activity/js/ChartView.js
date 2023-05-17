var ChartView = {
	template: `
    	<div class="canvas-container">
		    <canvas ref="canvas"></canvas>
    	</div>
    `,
	props: ["tabularData", "pref"],
	data() {
		return {
			indexAxis: "x",
		}
	},
	mounted() {
		const c = this.$refs.canvas;
		const ctx = c.getContext("2d");
		this.chart = new Chart(ctx, {
			type: this.pref.chartType,
			data: {
				datasets: [
					{
						label: "",
						fill: "origin",
						data: this.values,
						borderWidth: 4,
						pointHoverBorderWidth: 4,
						pointRadius: 4,
						pointHoverRadius: 6,
						hoverOffset: 8,
					},
				],
				labels: this.labels,
			},
			options: this.chartOptions,
		});
	},
	methods: {
		// Update Handlers
		updateTitle(title) {
			this.chart.data.datasets[0].label = title;
			this.chart.update();
		},
		updateLabel(axis) {
			this.chart.options.scales[axis].title.text = this.pref.labels[axis];
			this.chart.update();
		},
		updateChartColor() {
			this.chart.data.datasets[0].backgroundColor =
				this.pref.chartColor.fill;
			this.chart.data.datasets[0].borderColor =
				this.pref.chartColor.stroke;
			this.chart.update();
		},
		updateFontValues(fieldName, valueName) {
			let fieldStr1 = "font";
			let fieldStr2;
			switch (valueName) {
				case "fontsize":
					fieldStr2 = "size";
					break;
				case "fontfamily":
					fieldStr2 = "family";
					break;
				case "color":
					fieldStr1 = "color";
					break;
			}

			const propValue = this.pref.font[fieldName][valueName];
			switch (fieldName) {
				case "title":
					let titleObj = this.chart.options.plugins.legend.labels;
					if (fieldStr2) titleObj[fieldStr1][fieldStr2] = propValue;
					else titleObj[fieldStr1] = propValue;
					break;

				case "labels":
					["x", "y"].forEach((axis) => {
						let labelsObj = this.chart.options.scales[axis].title;
						if (fieldStr2)
							labelsObj[fieldStr1][fieldStr2] = propValue;
						else labelsObj[fieldStr1] = propValue;
					});
					break;

				case "tick":
					["x", "y"].forEach((axis) => {
						let ticksObj = this.chart.options.scales[axis].ticks;
						if (fieldStr2)
							ticksObj[fieldStr1][fieldStr2] = propValue;
						else ticksObj[fieldStr1] = propValue;
					});
					break;
			}
			this.chart.update();
		},
		updateChartType() {
			this.chart.data.labels = this.labels;

			switch (this.pref.chartType) {
				case "horizontal-bar":
					this.indexAxis = "y";
					this.chart.config.type = "bar";
					this.chart.config.options = this.chartOptionsY;
					break;
				case "bar":
					this.indexAxis = "x";
					this.chart.config.type = this.pref.chartType;
					this.chart.config.options = this.chartOptionsX;
					this.chart.config.options.scales.x.offset = true;
					break;
				case "line":
					this.indexAxis = "x";
					this.chart.config.type = this.pref.chartType;
					this.chart.config.options = this.chartOptionsX;
					this.chart.config.options.scales.x.offset = false;
					break;
				case "pie":
					// this.chart.data.datasets[0].backgroundColor = this.createGradient();
					this.chart.config.type = this.pref.chartType;
					this.chart.config.options = this.chartOptionsPie;
					this.chart.data.labels = [this.chart.data.datasets[0].label];
					break;
			}
			this.chart.update();
		},

		getImgData() {
			const canvas = this.$refs.canvas;
			const con = document.querySelector(".canvas-container");
			// con.style.width = "130%";
			// this.chart.resize();
			var mimetype = "image/png";
			var imgData = canvas.toDataURL(mimetype, 1);
			var metadata = {
				mimetype: mimetype,
				title: "Chart image",
				activity: "org.olpcfrance.MediaViewerActivity",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0,
			};
			// con.style.width = "auto";
			// this.chart.resize();
			return { imgData, metadata };
		},
	},
	computed: {
		chartOptions() {
			return {
				responsive: true,
				maintainAspectRatio: false,
				layout: { padding: 18 },
				indexAxis: this.indexAxis,
				plugins: {
					legend: {
						onClick: null,
						labels: {
							font: {
								size: this.pref.font.title.fontsize,
								family: this.pref.font.title.fontfamily,
							},
							color: this.pref.font.title.color,
							boxWidth: 0,
						},
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							color: this.pref.font.tick.color,
							font: { size: this.pref.font.tick.fontsize },
						},
						title: {
							display: true,
							text: this.pref.labels.y,
							color: this.pref.font.labels.color,
							font: { size: this.pref.font.labels.fontsize },
						},
					},
					x: {
						ticks: {
							color: this.pref.font.tick.color,
							font: { size: this.pref.font.tick.fontsize },
						},
						title: {
							display: true,
							text: this.pref.labels.x,
							color: this.pref.font.labels.color,
							font: { size: this.pref.font.labels.fontsize },
						},
					},
				},
			};
		},
		chartOptionsY() {
			return {
				...this.chartOptions,
				scales: {
					x: { ...this.chartOptions.scales.x, beginAtZero: true },
					y: { ...this.chartOptions.scales.y, offset: true },
				},
			};
		},
		chartOptionsX() {
			return {
				...this.chartOptions,
				scales: {
					x: { ...this.chartOptions.scales.x, offset: true },
					y: { ...this.chartOptions.scales.y, beginAtZero: true },
				},
			};
		},
		chartOptionsPie() {
			return {
				...this.chartOptions,
				scales: {
					x: { display: false },
					y: { display: false },
				},
			};
		},
		labels() {
			return this.tabularData.map((data) => data.x);
		},
		values() {
			return this.tabularData.map((data) => data.y);
		},
	},
	watch: {
		labels() {
			switch (this.pref.chartType) {
				case "pie":
					this.chart.data.labels = [this.chart.data.datasets[0].label];
					break;
				default:
					this.chart.data.labels = this.labels;
					break;
			}
			this.chart.update();
		},
		values() {
			this.chart.data.datasets[0].data = this.values;
			this.chart.update();
		},
	},
};
