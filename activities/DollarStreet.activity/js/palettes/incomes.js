
define(['sugar-web/graphics/palette',"text!activity/palettes/incomes.html"], function(palette,template) {

	var incomepalette = {};

	incomepalette.IncomePalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "incomepalette";
		this.incomeEvent = document.createEvent('CustomEvent');
		this.incomeEvent.initCustomEvent('income', true, true, {'max': 100, 'min': 0});

		var incomeElem = document.createElement('div');
		incomeElem.innerHTML = template;
		this.setContent([incomeElem]);

		var that = this;
		let children = document.getElementById("slider-incomes").childNodes;
		let minrange = children[3];
		let maxrange = children[5];
		minrange.addEventListener('input', function(e) {
			_computeMinRange(minrange);
			that.incomeEvent.detail.min = minrange.value;
			that.incomeEvent.detail.max = maxrange.value;
			that.getPalette().dispatchEvent(that.incomeEvent);
		});
		maxrange.addEventListener('input', function(e) {
			_computeMaxRange(maxrange);
			that.incomeEvent.detail.min = minrange.value;
			that.incomeEvent.detail.max = maxrange.value;
			that.getPalette().dispatchEvent(that.incomeEvent);
		});

		this.getPalette().childNodes[1].style.width = "500px";
		invoker.addEventListener('click', function(e) {
			_initSlider(25, 65, "#0000ff");
		});
	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	incomepalette.IncomePalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return incomepalette;
});

function _computeMinRange(minrange) {
	minrange.value=Math.min(minrange.value,minrange.parentNode.childNodes[5].value-1);
	var value=(100/(parseInt(minrange.max)-parseInt(minrange.min)))*parseInt(minrange.value)-(100/(parseInt(minrange.max)-parseInt(minrange.min)))*parseInt(minrange.min);
	var children = minrange.parentNode.childNodes[1].childNodes;
	children[1].style.width=value+'%';
	children[5].style.left=value+'%';
	children[7].style.left=value+'%';
}

function _computeMaxRange(maxrange) {
	maxrange.value=Math.max(maxrange.value,maxrange.parentNode.childNodes[3].value-(-1));
	var value=(100/(parseInt(maxrange.max)-parseInt(maxrange.min)))*parseInt(maxrange.value)-(100/(parseInt(maxrange.max)-parseInt(maxrange.min)))*parseInt(maxrange.min);
	var children = maxrange.parentNode.childNodes[1].childNodes;
	children[3].style.width=(100-value)+'%';
	children[5].style.right=(100-value)+'%';
	children[9].style.left=value+'%';
}

function _initSlider(mymin, mymax, color) {
	let children = document.getElementById("slider-incomes").childNodes;
	children[1].childNodes[7].style.left = mymin+"%";
	children[3].value = mymin;
	children[1].childNodes[9].style.left = mymax+"%";
	children[5].value = mymax;
	children[1].childNodes[5].style.backgroundColor = color;
	_computeMinRange(children[3]);
	_computeMaxRange(children[5]);
}
