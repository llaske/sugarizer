const ChartView = {
	template: `
    	<div class="canvas-container">
		    <canvas ref="canvas"></canvas>
    	</div>
    `,
	props: ["tabularData", "activityTitle", "pref"],
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
						data: this.values.signValues,
						borderWidth: 3,
						pointHoverBorderWidth: 4,
						pointRadius: 4,
						pointHoverRadius: 6,
						hoverOffset: 8,
					},
				],
				labels: this.labels,
			},
			options: this.chartOpVertical,
		});
		Chart.defaults.scale.grid.lineWidth = 2;
	},
	methods: {
		// Update Handlers
		updateTitle(title) {
			this.chart.options.plugins.title.text = title;
			this.chart.update();
		},
		updateLabel(axis) {
			this.chart.options.scales[axis].title.text = this.pref.labels[axis];
			this.chart.update();
		},
		setPieBgColor() {
			this.chart.data.datasets[0].backgroundColor = this.createGradient(
				this.pref.chartColor.fill,
				this.labels.length
			);
		},
		setChartBgColor() {
			this.chart.data.datasets[0].backgroundColor =
				this.pref.chartColor.fill;
		},
		updateChartColor() {
			this.pref.chartType === "pie" ? this.setPieBgColor() : this.setChartBgColor();			
			this.chart.data.datasets[0].borderColor =
				this.pref.chartColor.stroke;
			this.chart.update();
		},
		updateFontValues(fieldName, valueName) {
			let fieldStr1 = "font";
			let fieldStr2, fullStr;
			switch (valueName) {
				case "fontsize":
					fieldStr2 = "size";
					fullStr = "fontSize";
					break;
				case "fontfamily":
					fieldStr2 = "family";
					fullStr = "fontFamily";
					break;
				case "color":
					fieldStr1 = "color";
					fullStr = "fontColor";
					break;
			}

			const propValue = this.pref.font[fieldName][valueName];
			switch (fieldName) {
				case "title":
					let titleObj = this.chart.options.plugins.title;
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
					// Tick values for Pie
					const pieLabelObj = this.chart.options.plugins.labels;
					pieLabelObj[fullStr] = propValue;

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
			// Reset values set by pie chart
			this.chart.data.datasets[0].data = this.values.signValues;
			this.setChartBgColor();

			switch (this.pref.chartType) {
				case "horizontalBar":
					this.indexAxis = "y";
					this.chart.config.type = "bar";
					this.chart.config.options = this.chartOpHorizontal;
					break;
				case "bar":
					this.indexAxis = "x";
					this.chart.config.type = this.pref.chartType;
					this.chart.config.options = this.chartOpVertical;
					this.chart.config.options.scales.x.offset = true;
					break;
				case "line":
					this.indexAxis = "x";
					this.chart.config.type = this.pref.chartType;
					this.chart.config.options = this.chartOpVertical;
					this.chart.config.options.scales.x.offset = false;
					break;
				case "pie":
					this.chart.config.type = this.pref.chartType;
					this.chart.config.options = this.chartOpPie;
					this.chart.data.datasets[0].data = this.values.absValues;
					this.setPieBgColor();
					break;
			}
			this.chart.update();
		},

		getImgData() {
			const canvas = this.$refs.canvas;
			const app = document.getElementById("app");
			app.classList.add("fullscreen");
			this.chart.resize();
			const mimetype = "image/png";
			const imgData = canvas.toDataURL(mimetype, 1);
			app.classList.remove("fullscreen");
			this.chart.resize();

			const metadata = {
				mimetype: mimetype,
				title: this.activityTitle,
				activity: "org.olpcfrance.MediaViewerActivity",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0,
			};
			return { imgData, metadata };
		},
		createGradient(baseColor, numberOfColors) {
			let baseRGB = baseColor;
			if (baseColor.startsWith("#")) {
				baseRGB = Chart.helpers.color(baseColor).rgbString();			
			}

			let rgbArr = baseRGB
				.substring(4, baseRGB.length - 1)
				.replace(/ /g, "")
				.split(",");			
			rgbArr = rgbArr.map(value => parseInt(value));

			const gradientColors = [];
			const brightness = .6; 
			for (let i = 0; i < numberOfColors; i++) {
				const ratio = i / (numberOfColors - 1);
				const r = Math.round(rgbArr[0] + (190 - rgbArr[0]) * ratio * brightness);
				const g = Math.round(rgbArr[1] + (255 - rgbArr[1]) * ratio * brightness);
				const b = Math.round(rgbArr[2] + (230 - rgbArr[2]) * ratio * brightness);

				gradientColors.push(`rgb(${r},${g},${b})`);
			}

			return gradientColors;
		}
	},
	computed: {
		chartOptions() {
			return {
				responsive: true,
				maintainAspectRatio: false,
				layout: { padding: {top: 15, left: 18, right: 18, bottom: 40} },
				indexAxis: this.indexAxis,
				plugins: {
					tooltip: {
						titleFont: {size: 18},
						bodyFont: {size: 18}
					},
					title: {
						display: true,
						text: this.activityTitle,
						padding: { bottom: 35 },
						font: {
							size: this.pref.font.title.fontsize,
							family: this.pref.font.title.fontfamily,
						},
						color: this.pref.font.title.color,
					},
					legend: { display: false },
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
		chartOpHorizontal() {
			return {
				...this.chartOptions,
				plugins: {
					...this.chartOptions.plugins,
					labels: { ...this.chartOptions.plugins.labels, render: () => {} },
				},
				scales: {
					x: {
						...this.chartOptions.scales.x,
						beginAtZero: true,
						grid: {
							color: (ctx) => (ctx.tick && ctx.tick.value === 0 ? "rgb(50,50,50)" : "rgb(240,240,240)"),
						},
					},
					y: { ...this.chartOptions.scales.y, offset: true },
				},
			};
		},
		chartOpVertical() {
			return {
				...this.chartOptions,
				plugins: {
					...this.chartOptions.plugins,
					labels: { ...this.chartOptions.plugins.labels, render: () => {} },
				},
				scales: {
					x: { ...this.chartOptions.scales.x, offset: true },
					y: {
						...this.chartOptions.scales.y,
						beginAtZero: true,
						grid: {
							color: (ctx) => (ctx.tick && ctx.tick.value === 0 ? "rgb(50,50,50)" : "rgb(240,240,240)"),
						},
					},
				},
			};
		},
		chartOpPie() {
			return {
				...this.chartOptions,
				plugins: { 
					...this.chartOptions.plugins,
					labels: {
						render: (ctx) => (`${ctx.label} (${ctx.percentage}%)`),
						precision: 2,
						position: "outside",
				        textMargin: 15,
						fontColor: this.pref.font.tick.color,
						fontSize: this.pref.font.tick.fontsize,
						fontFamily: this.pref.font.tick.fontfamily,
				    }
    			},
				scales: {
					x: { ...this.chartOptions.scales.x, display: false },
					y: { ...this.chartOptions.scales.y, display: false },
				},
			}
		},
		labels() {
			return this.tabularData.map((data) => data.x || "");
		},
		values() {
			const values = { signValues: [], absValues: [] };
			this.tabularData.forEach((data) => {
			  const value = data.y ? parseFloat(data.y) : 0;
			  values.signValues.push(value);
			  values.absValues.push(Math.abs(value));
			});
			return values;
		},
	},
	watch: {
		labels() {
			this.chart.data.labels = this.labels;
			this.chart.update();
		},
		values() {
			if (this.pref.chartType === "pie") {
				this.chart.data.datasets[0].backgroundColor = this.createGradient(
					this.pref.chartColor.fill,
					this.labels.length
				);					
				this.chart.data.datasets[0].data = this.values.absValues;
			} else {
				this.chart.data.datasets[0].data = this.values.signValues;
			}
			this.chart.update();
		},
	},
};
