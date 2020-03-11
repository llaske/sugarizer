// Chess component
let SlopeTemplate = {
	template: `
		<canvas id="slopeCanvas"></canvas>
	`,
	props: ['height', 'parts', 'answer', 'radius', 'cx', 'correctAnswers', 'mode'],
	data: function() {
		return {
			context: null
		}
	},
	computed: {
		lengthOfDivision: function() {
			return Math.floor(slopeCanvas.width/this.parts);
		},
		tolerance: function() {
			// return 0.1 * this.lengthOfDivision;
			return 30;
		}
	},
	mounted: function() {
		let vm = this;
	},
	methods: {
		localized: function (localization) {
			localization.localize(this.l10n);
		},

		initSlope: function() {
			this.context = slopeCanvas.getContext('2d');
	
			slopeCanvas.width = mainCanvas.width;
			slopeCanvas.height = mainCanvas.height;

			this.drawSlope();
			if(this.correctAnswers < 100) {
				this.drawDivisions();
			}
		},

		checkAnswer: function() {
			let i = Math.floor(this.cx/(this.lengthOfDivision-this.tolerance));
			if(this.cx > i*this.lengthOfDivision-this.tolerance && this.cx < i*this.lengthOfDivision+this.tolerance) {
				this.drawAnswer(i);
				return i;
			}
			this.drawAnswer(-1);
			return -1;
		},
		
		drawSlope: function() {
			this.context.fillStyle = '#282828';
			this.context.beginPath(); 
			this.context.moveTo(0, this.calcY(0));
			this.context.lineTo(slopeCanvas.width, this.calcY(slopeCanvas.width));
			this.context.lineTo(slopeCanvas.width, slopeCanvas.height);
			this.context.closePath();
			this.context.fill();
			this.context.strokeStyle = '#ffffff';
			this.context.stroke();
			// 0 and 1/100% text
			this.context.font = "28px Times New Roman";
			this.context.fillStyle = "#000";
			this.context.textAlign = "center";
			this.context.fillText("0", 20, slopeCanvas.height - 20);
			this.context.fillStyle = "#fff";
			if(this.mode == 'percents') {
				this.context.fillText("100%", slopeCanvas.width-40, slopeCanvas.height - 20);
			} else {
				this.context.fillText("1", slopeCanvas.width-20, slopeCanvas.height - 20);
			}
		},

		drawDivisions: function(i = 0) {
			this.context.beginPath(); 
			if(i != 0) {
				i *= this.lengthOfDivision;
				this.context.strokeStyle = '#ff0000';
				this.context.moveTo(i-this.tolerance, slopeCanvas.height);
				this.context.lineTo(i-this.tolerance, this.calcY(i-this.tolerance));
				this.context.stroke();
				this.context.moveTo(i+this.tolerance, slopeCanvas.height);
				this.context.lineTo(i+this.tolerance, this.calcY(i+this.tolerance));
				this.context.stroke();
				this.context.strokeStyle = '#000000';
				return;
			}
			this.context.strokeStyle = '#ffffff';
			for(i=this.lengthOfDivision; i<slopeCanvas.width; i += this.lengthOfDivision) {
				this.context.moveTo(i, slopeCanvas.height);
				this.context.lineTo(i, this.calcY(i));
				this.context.stroke();
			}
			this.context.strokeStyle = '#000000';
		},

		drawAnswer: function(landedOn) {
			let i = this.answer*this.lengthOfDivision;
			this.context.beginPath();
			if(landedOn == this.answer) {
				this.context.strokeStyle = '#00ff00';
			} else {
				this.context.strokeStyle = '#ff0000';
			}
			this.context.lineWidth = 10;
			this.context.moveTo(i-this.tolerance, this.calcY(i-this.tolerance));
			this.context.lineTo(i+this.tolerance, this.calcY(i+this.tolerance));
			this.context.stroke();
			this.context.strokeStyle = '#000000';
			this.context.lineWidth = 1;
			this.context.closePath();
		},

		updateSlope: function(parts) {
			this.parts = parts;
			this.context.clearRect(0, 0, slopeCanvas.width, slopeCanvas.height);
			this.drawSlope();
			if(this.correctAnswers < 100) {
				this.drawDivisions();
			}
		},

		calcY: function(x) {
			return ((-this.height/slopeCanvas.width)*x + slopeCanvas.height);
		},
	}
};