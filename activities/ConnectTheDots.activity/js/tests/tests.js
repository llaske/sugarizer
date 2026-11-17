if (typeof define !== 'function') {
	var fs = require('fs');
	var path = require('path');
	global.define = function (deps, factory) {
		var loadedDeps = deps.map(function (dep) {
			if (dep.indexOf('draw-mode') !== -1) {
				var filePath = path.resolve(__dirname, '../modes/draw-mode.js');
				var content = fs.readFileSync(filePath, 'utf8');
				var modFunc;
				var oldDef = global.define;
				global.define = function (d, f) { modFunc = f || d; };
				eval(content);
				global.define = oldDef;
				return modFunc();
			}
			return {};
		});
		var instance = factory.apply(null, loadedDeps);
		if (typeof require !== 'undefined' && require.main === module) {
			var results = instance.runTests();
			var allPassed = true;
			for (var i = 0; i < results.length; i++) {
				if (!results[i].passed) allPassed = false;
			}
			process.exit(allPassed ? 0 : 1);
		}
		return instance;
	};
}

define(['activity/modes/draw-mode'], function (drawMode) {
	// Dots positioned on exact grid
	function setupDots() {
		return [
			{ id: 0, baseX: 0, baseY: 0 },
			{ id: 1, baseX: 220, baseY: 0 },
			{ id: 2, baseX: 220, baseY: 220 },
			{ id: 3, baseX: 0, baseY: 220 },
			{ id: 4, baseX: 55, baseY: 55 },
			{ id: 5, baseX: 165, baseY: 55 },
			{ id: 6, baseX: 110, baseY: 110 }
		];
	}

	// simulate drawing a link between two dots using standard mouse event handlers
	function addLink(dotA, dotB, color) {
		if (color) drawMode.setFillColor(color);
		drawMode.setTool('draw');
		drawMode.onMouseDown(dotA.baseX, dotA.baseY);
		drawMode.onMouseMove(dotB.baseX, dotB.baseY, dotA.baseX, dotA.baseY);
		drawMode.onMouseUp();
	}

	// simulate erasing a link between two dots using standard erase mouse handlers
	function eraseLink(dotA, dotB) {
		drawMode.setTool('erase');
		drawMode.onMouseDown(dotA.baseX, dotA.baseY);
		drawMode.onMouseMove(dotB.baseX, dotB.baseY, dotA.baseX, dotA.baseY);
		drawMode.onMouseUp();
		drawMode.setTool('draw');
	}

	function runTests() {
		var results = [];

		// Save current board state before running tests so activity state isn't disrupted
		var origState = drawMode.serialize();

		// Rule 1: When closing a figure, the current paint color fills the figure(s) closed
		(function testRule1() {
			var dots = setupDots();
			drawMode.init(dots, function () { }, '#ff0000');
			drawMode.clear();
			addLink(dots[0], dots[1]);
			addLink(dots[1], dots[2]);
			addLink(dots[2], dots[3]);
			var beforeCount = drawMode.serialize().figures.length;
			addLink(dots[3], dots[0]);
			var figures = drawMode.serialize().figures;
			var passed = (beforeCount === 0 && figures.length === 1 && figures[0].fillColor === '#ff0000');
			results.push({ rule: 1, name: "Closing a figure fills with current paint color", passed: passed, details: "Figures count: " + figures.length });
		})();

		// Rule 2: When closing a figure inside another figure, the new closed figure(s) are filled with the current paint color
		(function testRule2() {
			var dots = setupDots();
			drawMode.init(dots, function () { }, '#ff0000');
			drawMode.clear();
			addLink(dots[0], dots[1]);
			addLink(dots[1], dots[2]);
			addLink(dots[2], dots[3]);
			addLink(dots[3], dots[0]);

			drawMode.setFillColor('#0000ff');
			addLink(dots[4], dots[5], '#0000ff');
			addLink(dots[5], dots[6], '#0000ff');
			addLink(dots[6], dots[4], '#0000ff');

			var figures = drawMode.serialize().figures;
			var innerFig = null, outerFig = null;
			for (var i = 0; i < figures.length; i++) {
				var dotCount = figures[i].key.split("_").length;
				if (dotCount === 3) innerFig = figures[i];
				if (dotCount === 4) outerFig = figures[i];
			}
			var passed = (innerFig && innerFig.fillColor === '#0000ff' && outerFig && outerFig.fillColor === '#ff0000');
			results.push({ rule: 2, name: "Closing a figure inside another fills inner figure with current paint color", passed: passed });
		})();

		// Rule 3: When closing a figure outside another figure, the new closed figure is filled with current paint color without affecting inner figures
		(function testRule3() {
			var dots = setupDots();
			drawMode.init(dots, function () { }, '#0000ff');
			drawMode.clear();
			addLink(dots[4], dots[5]);
			addLink(dots[5], dots[6]);
			addLink(dots[6], dots[4]);

			drawMode.setFillColor('#00ff00');
			addLink(dots[0], dots[1], '#00ff00');
			addLink(dots[1], dots[2], '#00ff00');
			addLink(dots[2], dots[3], '#00ff00');
			addLink(dots[3], dots[0], '#00ff00');

			var figures = drawMode.serialize().figures;
			var innerFig = null, outerFig = null;
			for (var i = 0; i < figures.length; i++) {
				var dotCount = figures[i].key.split("_").length;
				if (dotCount === 3) innerFig = figures[i];
				if (dotCount === 4) outerFig = figures[i];
			}
			var passed = (innerFig && innerFig.fillColor === '#0000ff' && outerFig && outerFig.fillColor === '#00ff00');
			results.push({ rule: 3, name: "Closing outer figure does not affect inner figure fill color", passed: passed });
		})();

		// Rule 4: When a closed figure is erased, its fill color shrinks
		(function testRule4() {
			var dots = setupDots();
			drawMode.init(dots, function () { }, '#ff0000');
			drawMode.clear();
			addLink(dots[0], dots[1]);
			addLink(dots[1], dots[2]);
			addLink(dots[2], dots[3]);
			addLink(dots[3], dots[0]);

			eraseLink(dots[0], dots[1]);

			var figures = drawMode.serialize().figures;
			var passed = (figures.length === 0);
			results.push({ rule: 4, name: "Erasing a closed figure removes it from active figures to shrink away", passed: passed });
		})();

		// Rule 5: When an outer closed figure is erased, its fill color shrinks away without affecting inner figure(s) fill
		(function testRule5() {
			var dots = setupDots();
			drawMode.init(dots, function () { }, '#ff0000');
			drawMode.clear();
			addLink(dots[0], dots[1]);
			addLink(dots[1], dots[2]);
			addLink(dots[2], dots[3]);
			addLink(dots[3], dots[0]);

			drawMode.setFillColor('#0000ff');
			addLink(dots[4], dots[5], '#0000ff');
			addLink(dots[5], dots[6], '#0000ff');
			addLink(dots[6], dots[4], '#0000ff');

			eraseLink(dots[0], dots[1]);

			var figures = drawMode.serialize().figures;
			var innerStillActive = (figures.length === 1 && figures[0].key.split("_").length === 3 && figures[0].fillColor === '#0000ff');
			results.push({ rule: 5, name: "Erasing outer figure shrinks outer fill without affecting inner figure fill", passed: innerStillActive });
		})();

		// Restore original state if needed
		drawMode.clear();
		drawMode.deserialize(origState.strokes, origState.figures);

		if (typeof console !== 'undefined') {
			var allPassed = true;
			for (var i = 0; i < results.length; i++) {
				var r = results[i];
				console.log("Rule " + r.rule + " (" + r.name + "): " + (r.passed ? "PASSED" : "FAILED"));
				if (!r.passed) allPassed = false;
			}
		}

		return results;
	}

	if (typeof window !== 'undefined') {
		window.runConnectTheDotsTests = runTests;
	}

	return {
		runTests: runTests
	};
});
