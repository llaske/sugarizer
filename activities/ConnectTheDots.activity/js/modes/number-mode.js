define([], function () {
	var broadcastCallback = null;
	var dots = [];
	var isDrawing = false;
	var currentDrawing = null;
	var currentStep = 0;
	var userStrokes = [];
	var isFinished = false;
	var currMouseX = -1000;
	var currMouseY = -1000;
	var l10nRef = null;

	var libraries = {
		'basic-shapes': [
			{ name: 'Square', points: [[3,2], [11,2], [11,10], [3,10]], closed: true, strokeColor: '#cc0000', fillColor: '#ffcccc' },
			{ name: 'Rectangle', points: [[2,3], [12,3], [12,9], [2,9]], closed: true, strokeColor: '#cccc00', fillColor: '#ffffcc' },
			{ name: 'Right Triangle', points: [[3,2], [3,10], [11,10]], closed: true, strokeColor: '#00cc00', fillColor: '#ccffcc' },
			{ name: 'Trapezoid', points: [[4,3], [10,3], [12,9], [2,9]], closed: true, strokeColor: '#00cccc', fillColor: '#ccffff' },
			{ name: 'Parallelogram', points: [[4,3], [12,3], [10,9], [2,9]], closed: true, strokeColor: '#0000cc', fillColor: '#ccccff' },
			{ name: 'Diamond', points: [[7,1], [12,6], [7,11], [2,6]], closed: true, strokeColor: '#800080', fillColor: '#f2e6ff' },
			{ name: 'Hexagon', points: [[4,2], [10,2], [13,6], [10,10], [4,10], [1,6]], closed: true, strokeColor: '#cc0066', fillColor: '#ffcce6' },
			{ name: 'Octagon', points: [[5,1], [9,1], [12,4], [12,8], [9,11], [5,11], [2,8], [2,4]], closed: true, strokeColor: '#cc6600', fillColor: '#ffe6cc' },
			{ name: 'L-Shape', points: [[4,2], [7,2], [7,7], [11,7], [11,10], [4,10]], closed: true, strokeColor: '#009966', fillColor: '#ccffe6' }
		],
		'objects': [
			{ name: 'Star', points: [[7,1], [8,5], [12,5], [9,7], [10,11], [7,9], [4,11], [5,7], [2,5], [6,5]], closed: true, strokeColor: '#e6b800', fillColor: '#fff2b3' },
			{ name: 'Fish', points: [[2,6], [6,2], [10,5], [13,2], [13,10], [10,7], [6,10]], closed: true, strokeColor: '#008080', fillColor: '#b3ffff' },
			{ name: 'Crown', points: [[3,9], [2,4], [5,6], [7,2], [9,6], [12,4], [11,9]], closed: true, strokeColor: '#d9b300', fillColor: '#ffffe0' }
		]
	};

	function broadcastUpdate() {
		if (typeof broadcastCallback === 'function') {
			broadcastCallback();
		}
	}

	function getDotByIndex(col, row) {
		var idx = col * 13 + row;
		if (idx >= 0 && idx < dots.length) return dots[idx];
		return null;
	}

	function findHoveredPointIndex(mouseX, mouseY) {
		if (!currentDrawing || !currentDrawing.points) return -1;
		for (var i = 0; i < currentDrawing.points.length; i++) {
			var pt = currentDrawing.points[i];
			var dot = getDotByIndex(pt[0], pt[1]);
			if (dot) {
				var dx = mouseX - dot.x;
				var dy = mouseY - dot.y;
				if (Math.sqrt(dx * dx + dy * dy) < 30) {
					return i;
				}
			}
		}
		return -1;
	}

	function tryConnectPoint(ptIdx) {
		if (!currentDrawing || isFinished) return;
		var totalPts = currentDrawing.points.length;

		if (currentStep === 0) {
			if (ptIdx === 0) {
				currentStep = 1;
				broadcastUpdate();
			}
		} else if (currentStep < totalPts) {
			if (ptIdx === currentStep) {
				var prevPt = currentDrawing.points[currentStep - 1];
				var currPt = currentDrawing.points[currentStep];
				var dot1 = getDotByIndex(prevPt[0], prevPt[1]);
				var dot2 = getDotByIndex(currPt[0], currPt[1]);
				if (dot1 && dot2) {
					userStrokes.push({ from: dot1, to: dot2 });
				}
				currentStep++;
				if (currentStep === totalPts) {
					if (!currentDrawing.closed) {
						isFinished = true;
					}
				}
				broadcastUpdate();
			}
		} else if (currentStep === totalPts && currentDrawing.closed) {
			if (ptIdx === 0) {
				var prevPt = currentDrawing.points[totalPts - 1];
				var currPt = currentDrawing.points[0];
				var dot1 = getDotByIndex(prevPt[0], prevPt[1]);
				var dot2 = getDotByIndex(currPt[0], currPt[1]);
				if (dot1 && dot2) {
					userStrokes.push({ from: dot1, to: dot2 });
				}
				isFinished = true;
				broadcastUpdate();
			}
		}
	}

	var NumberMode = {
		init: function (dotsArray, callback, fillColor) {
			dots = dotsArray || [];
			broadcastCallback = callback;
		},
		showGallery: function (categoryKey, l10n) {
			if (l10n) l10nRef = l10n;
			var gallery = document.getElementById('library-gallery');
			var header = document.getElementById('gallery-header');
			var grid = document.getElementById('gallery-grid');
			if (!gallery || !header || !grid) return;

			var titleMap = {
				'basic-shapes': (l10nRef && l10nRef.get('BasicShapes')) || 'Basic Shapes',
				'objects': (l10nRef && l10nRef.get('Objects')) || 'Objects'
			};
			header.textContent = titleMap[categoryKey] || 'Basic Shapes';
			grid.innerHTML = '';

			var items = libraries[categoryKey] || libraries['basic-shapes'];
			items.forEach(function (drawing) {
				var card = document.createElement('div');
				card.className = 'gallery-card';

				var inner = document.createElement('div');
				inner.className = 'gallery-card-inner';

				var minCol = 15, maxCol = 0, minRow = 13, maxRow = 0;
				drawing.points.forEach(function (pt) {
					if (pt[0] < minCol) minCol = pt[0];
					if (pt[0] > maxCol) maxCol = pt[0];
					if (pt[1] < minRow) minRow = pt[1];
					if (pt[1] > maxRow) maxRow = pt[1];
				});

				var vBoxX = minCol - 1;
				var vBoxY = minRow - 1;
				var vBoxW = (maxCol - minCol) + 2;
				var vBoxH = (maxRow - minRow) + 2;

				var svgNS = "http://www.w3.org/2000/svg";
				var svg = document.createElementNS(svgNS, "svg");
				svg.setAttribute("viewBox", vBoxX + " " + vBoxY + " " + vBoxW + " " + vBoxH);
				svg.style.width = "100px";
				svg.style.height = "100px";

				var ptsStr = drawing.points.map(function (pt) { return pt[0] + "," + pt[1]; }).join(" ");
				var shapeEl = document.createElementNS(svgNS, drawing.closed ? "polygon" : "polyline");
				shapeEl.setAttribute("points", ptsStr);
				shapeEl.setAttribute("fill", drawing.closed ? (drawing.fillColor || "#ffcccc") : "none");
				shapeEl.setAttribute("stroke", drawing.strokeColor || "#cc0000");
				shapeEl.setAttribute("stroke-width", Math.max(vBoxW, vBoxH) * 0.06);
				shapeEl.setAttribute("stroke-linecap", "round");
				shapeEl.setAttribute("stroke-linejoin", "round");
				svg.appendChild(shapeEl);

				inner.appendChild(svg);
				card.appendChild(inner);

				card.addEventListener('click', function () {
					gallery.style.display = 'none';
					NumberMode.selectDrawing(drawing);
				});

				grid.appendChild(card);
			});

			gallery.style.display = '';
		},
		selectDrawing: function (drawing) {
			currentDrawing = drawing;
			currentStep = 0;
			userStrokes = [];
			isFinished = false;
			broadcastUpdate();
		},
		onMouseDown: function (mouseX, mouseY) {
			isDrawing = true;
			currMouseX = mouseX;
			currMouseY = mouseY;
			var ptIdx = findHoveredPointIndex(mouseX, mouseY);
			if (ptIdx !== -1) {
				tryConnectPoint(ptIdx);
			}
		},
		onMouseMove: function (mouseX, mouseY, prevX, prevY) {
			if (!isDrawing) return;
			currMouseX = mouseX;
			currMouseY = mouseY;
			var ptIdx = findHoveredPointIndex(mouseX, mouseY);
			if (ptIdx !== -1) {
				tryConnectPoint(ptIdx);
			}
		},
		onMouseUp: function () {
			isDrawing = false;
			currMouseX = -1000;
			currMouseY = -1000;
		},
		drawBehindDots: function (ctx) {
			if (!ctx || !currentDrawing) return;

			if (isFinished && currentDrawing.points.length > 0) {
				ctx.save();
				ctx.beginPath();
				for (var i = 0; i < currentDrawing.points.length; i++) {
					var pt = currentDrawing.points[i];
					var dot = getDotByIndex(pt[0], pt[1]);
					if (dot) {
						if (i === 0) ctx.moveTo(dot.x, dot.y);
						else ctx.lineTo(dot.x, dot.y);
					}
				}
				if (currentDrawing.closed) {
					ctx.closePath();
					ctx.fillStyle = currentDrawing.fillColor || '#ffcccc';
					ctx.fill();
				}
				ctx.strokeStyle = currentDrawing.strokeColor || '#cc0000';
				ctx.lineWidth = 6;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.stroke();
				ctx.restore();
			} else {
				if (userStrokes.length > 0) {
					ctx.save();
					ctx.strokeStyle = currentDrawing.strokeColor || '#cc0000';
					ctx.lineWidth = 6;
					ctx.lineCap = 'round';
					ctx.lineJoin = 'round';
					ctx.beginPath();
					for (var j = 0; j < userStrokes.length; j++) {
						var seg = userStrokes[j];
						ctx.moveTo(seg.from.x, seg.from.y);
						ctx.lineTo(seg.to.x, seg.to.y);
					}
					ctx.stroke();
					ctx.restore();
				}
				if (isDrawing && currentStep > 0 && currMouseX !== -1000 && !isFinished) {
					var lastPtIdx = currentStep - 1;
					if (lastPtIdx >= 0 && lastPtIdx < currentDrawing.points.length) {
						var pt = currentDrawing.points[lastPtIdx];
						var lastDot = getDotByIndex(pt[0], pt[1]);
						if (lastDot) {
							ctx.save();
							ctx.strokeStyle = currentDrawing.strokeColor || '#cc0000';
							ctx.lineWidth = 6;
							ctx.lineCap = 'round';
							ctx.beginPath();
							ctx.moveTo(lastDot.x, lastDot.y);
							ctx.lineTo(currMouseX, currMouseY);
							ctx.stroke();
							ctx.restore();
						}
					}
				}
			}
		},
		drawFrontDots: function (ctx) {
			if (!ctx || !currentDrawing || isFinished) return;

			for (var k = 0; k < currentDrawing.points.length; k++) {
				var pt = currentDrawing.points[k];
				var dot = getDotByIndex(pt[0], pt[1]);
				if (dot) {
					ctx.save();
					var isActive = (k === currentStep || (currentStep === currentDrawing.points.length && currentDrawing.closed && k === 0));
					var dotRadius = isActive ? 8 : 4;
					var fontSize = isActive ? 16 : 14;
					var offsetY = isActive ? 18 : 15;

					ctx.beginPath();
					ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
					ctx.fillStyle = "#000000";
					ctx.fill();

					ctx.font = "bold " + fontSize + "px Arial";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.fillStyle = "#000000";
					ctx.fillText(k + 1, dot.x, dot.y - offsetY);
					ctx.restore();
				}
			}
		},
		isDotCompleted: function (dot) {
			return false;
		},
		isDrawingActive: function () {
			return isDrawing;
		},
		getDotColor: function (dot) {
			if (!currentDrawing || isFinished) return null;
			for (var i = 0; i < currentDrawing.points.length; i++) {
				var pt = currentDrawing.points[i];
				var targetDot = getDotByIndex(pt[0], pt[1]);
				if (targetDot === dot) {
					return '#000000';
				}
			}
			return null;
		},
		clear: function () {
			currentDrawing = null;
			currentStep = 0;
			userStrokes = [];
			isFinished = false;
			var gallery = document.getElementById('library-gallery');
			if (gallery) gallery.style.display = 'none';
		},
		stopDrawing: function () {
			isDrawing = false;
		},
		serialize: function () {
			return {
				currentDrawing: currentDrawing,
				currentStep: currentStep,
				isFinished: isFinished
			};
		},
		deserialize: function (data) {
			if (data && data.currentDrawing) {
				currentDrawing = data.currentDrawing;
				currentStep = data.currentStep || 0;
				isFinished = !!data.isFinished;
			}
		}
	};

	return NumberMode;
});
