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
	var buddyStrokeColor = '#005fe4';
	var buddyFillColor = '#ff2b34';

	function triggerConfetti() {
		if (typeof confetti === 'function') {
			confetti({
				particleCount: 150,
				spread: 100,
				origin: { x: 0.5, y: 0.85 }
			});
		}
	}

	function darkenColor(colorStr, percent) {
		var r = 0, g = 0, b = 0;
		if (colorStr.indexOf('rgb') !== -1) {
			var parts = colorStr.split("(")[1].split(")")[0].split(",");
			r = parseInt(parts[0]); g = parseInt(parts[1]); b = parseInt(parts[2]);
		} else if (colorStr[0] === '#') {
			var num = parseInt(colorStr.slice(1), 16);
			r = (num >> 16) & 255;
			g = (num >> 8) & 255;
			b = num & 255;
		} else {
			return colorStr;
		}
		r = Math.floor(r * (1 - percent));
		g = Math.floor(g * (1 - percent));
		b = Math.floor(b * (1 - percent));
		return "rgb(" + r + "," + g + "," + b + ")";
	}

	var libraries = {
		'basic-shapes': [
			{ name: 'Square', points: [[3,2], [11,2], [11,10], [3,10]], closed: true },
			{ name: 'Rectangle', points: [[2,3], [12,3], [12,9], [2,9]], closed: true },
			{ name: 'Right Triangle', points: [[3,2], [3,10], [11,10]], closed: true },
			{ name: 'Trapezoid', points: [[4,3], [10,3], [12,9], [2,9]], closed: true },
			{ name: 'Parallelogram', points: [[4,3], [12,3], [10,9], [2,9]], closed: true },
			{ name: 'Diamond', points: [[7,1], [12,6], [7,11], [2,6]], closed: true },
			{ name: 'Hexagon', points: [[4,2], [10,2], [13,6], [10,10], [4,10], [1,6]], closed: true },
			{ name: 'Octagon', points: [[5,1], [9,1], [12,4], [12,8], [9,11], [5,11], [2,8], [2,4]], closed: true },
			{ name: 'L-Shape', points: [[4,2], [7,2], [7,7], [11,7], [11,10], [4,10]], closed: true }
		],
		'objects': [
			{ name: 'Star', points: [[7,1], [8,5], [12,5], [9,7], [10,11], [7,9], [4,11], [5,7], [2,5], [6,5]], closed: true },
			{ name: 'Fish', points: [[2,6], [6,2], [10,5], [13,2], [13,10], [10,7], [6,10]], closed: true },
			{ name: 'Crown', points: [[3,9], [2,4], [5,6], [7,2], [9,6], [12,4], [11,9]], closed: true }
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
				if (Math.sqrt(dx * dx + dy * dy) < 45) {
					return i;
				}
			}
		}
		return -1;
	}

	function getDotsOnSegment(dot1, dot2) {
		var lineDots = [];
		if (!dot1 || !dot2) return lineDots;
		var dx = dot2.x - dot1.x;
		var dy = dot2.y - dot1.y;
		var len = Math.sqrt(dx * dx + dy * dy);
		if (len === 0) return [dot1];
		for (var i = 0; i < dots.length; i++) {
			var d = dots[i];
			var dist1 = Math.sqrt(Math.pow(d.x - dot1.x, 2) + Math.pow(d.y - dot1.y, 2));
			var dist2 = Math.sqrt(Math.pow(d.x - dot2.x, 2) + Math.pow(d.y - dot2.y, 2));
			if (Math.abs(dist1 + dist2 - len) < 1.0) {
				lineDots.push(d);
			}
		}
		return lineDots;
	}

	function tryConnectPoint(ptIdx) {
		if (!currentDrawing || isFinished) return;
		var totalPts = currentDrawing.points.length;
		if (currentStep === 0) {
			if (ptIdx === 0) {
				currentStep = 1;
				broadcastUpdate();
			}
			return;
		}
		var targetIdx = (currentStep === totalPts && currentDrawing.closed) ? 0 : (currentStep < totalPts ? currentStep : -1);
		if (ptIdx !== -1 && ptIdx === targetIdx) {
			var dot1 = getDotByIndex(currentDrawing.points[currentStep - 1][0], currentDrawing.points[currentStep - 1][1]);
			var dot2 = getDotByIndex(currentDrawing.points[targetIdx][0], currentDrawing.points[targetIdx][1]);
			if (dot1 && dot2) {
				userStrokes.push({ from: dot1, to: dot2, dots: getDotsOnSegment(dot1, dot2) });
			}
			if (currentStep < totalPts) currentStep++;
			if ((currentStep === totalPts && !currentDrawing.closed) || targetIdx === 0) {
				isFinished = true;
				currentDrawing.fillProgress = 0;
				currentDrawing.closePt = dot2 || dot1 || getDotByIndex(currentDrawing.points[0][0], currentDrawing.points[0][1]);
			}
			broadcastUpdate();
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
			gallery.style.backgroundColor = buddyStrokeColor;
			header.style.backgroundColor = buddyFillColor;
			header.style.color = "#ffffff";

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

				var vBoxW = (maxCol - minCol) + 2, vBoxH = (maxRow - minRow) + 2;

				var svgNS = "http://www.w3.org/2000/svg";
				var svg = document.createElementNS(svgNS, "svg");
				svg.setAttribute("viewBox", (minCol - 1) + " " + (minRow - 1) + " " + vBoxW + " " + vBoxH);
				svg.style.width = svg.style.height = "100px";

				var shapeEl = document.createElementNS(svgNS, drawing.closed ? "polygon" : "polyline");
				var attrs = {
					points: drawing.points.map(function (pt) { return pt[0] + "," + pt[1]; }).join(" "),
					fill: drawing.closed ? (buddyFillColor || drawing.fillColor || "#ffcccc") : "none",
					stroke: buddyStrokeColor || drawing.strokeColor || "#cc0000",
					"stroke-width": Math.max(vBoxW, vBoxH) * 0.06,
					"stroke-linecap": "round",
					"stroke-linejoin": "round"
				};
				for (var k in attrs) shapeEl.setAttribute(k, attrs[k]);
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
			currentDrawing = JSON.parse(JSON.stringify(drawing));
			if (buddyStrokeColor) currentDrawing.strokeColor = buddyStrokeColor;
			if (buddyFillColor) currentDrawing.fillColor = buddyFillColor;
			currentStep = 0;
			userStrokes = [];
			isFinished = false;
			for (var i = 0; i < dots.length; i++) {
				dots[i].insideClosedFigure = null;
			}
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

			function tracePolygonPath(context, drawing) {
				context.beginPath();
				for (var i = 0; i < drawing.points.length; i++) {
					var pt = drawing.points[i];
					var dot = getDotByIndex(pt[0], pt[1]);
					if (dot) {
						if (i === 0) context.moveTo(dot.x, dot.y);
						else context.lineTo(dot.x, dot.y);
					}
				}
				if (drawing.closed) context.closePath();
			}

			if (isFinished && currentDrawing.points.length > 0) {
				for (var d = 0; d < dots.length; d++) {
					var ptX = dots[d].x, ptY = dots[d].y, isInside = false;
					var figPts = [];
					for (var k = 0; k < currentDrawing.points.length; k++) {
						var pDot = getDotByIndex(currentDrawing.points[k][0], currentDrawing.points[k][1]);
						if (pDot) figPts.push(pDot);
					}
					for (var k = 0, l = figPts.length - 1; k < figPts.length; l = k++) {
						var xi = figPts[k].x, yi = figPts[k].y, xj = figPts[l].x, yj = figPts[l].y;
						if (((yi > ptY) != (yj > ptY)) && (ptX < (xj - xi) * (ptY - yi) / (yj - yi) + xi)) isInside = !isInside;
					}
					dots[d].insideClosedFigure = isInside ? currentDrawing : null;
				}

				if (currentDrawing.fillProgress === undefined) currentDrawing.fillProgress = 0;
				if (currentDrawing.maxDist === undefined) {
					var maxD = 0, cPt = currentDrawing.closePt || getDotByIndex(currentDrawing.points[0][0], currentDrawing.points[0][1]);
					for (var i = 0; i < currentDrawing.points.length; i++) {
						var pt = currentDrawing.points[i];
						var dot = getDotByIndex(pt[0], pt[1]);
						if (dot && cPt) {
							var dist = Math.sqrt(Math.pow(dot.x - cPt.x, 2) + Math.pow(dot.y - cPt.y, 2));
							if (dist > maxD) maxD = dist;
						}
					}
					currentDrawing.maxDist = maxD || 300;
				}

				var targetD = currentDrawing.maxDist + 5;
				if (currentDrawing.fillProgress < 1500) {
					currentDrawing.fillProgress += Math.max(1.5, Math.min(7, targetD / 60));
					if (currentDrawing.fillProgress >= targetD) {
						currentDrawing.fillProgress = 1500;
						triggerConfetti();
					}
				}
				if (currentDrawing.closed) {
					ctx.save();
					tracePolygonPath(ctx, currentDrawing);
					if (currentDrawing.fillProgress >= 1500) {
						ctx.fillStyle = currentDrawing.fillColor || '#ffcccc';
						ctx.fill();
					} else {
						ctx.clip();
						var closePt = currentDrawing.closePt || getDotByIndex(currentDrawing.points[0][0], currentDrawing.points[0][1]);
						if (closePt && currentDrawing.fillProgress > 0) {
							ctx.beginPath();
							ctx.arc(closePt.x, closePt.y, currentDrawing.fillProgress, 0, Math.PI * 2);
							ctx.fillStyle = currentDrawing.fillColor || '#ffcccc';
							ctx.fill();
						}
					}
					ctx.restore();
				}

				ctx.save();
				tracePolygonPath(ctx, currentDrawing);
				ctx.strokeStyle = currentDrawing.strokeColor || '#cc0000';
				ctx.lineWidth = 6;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.stroke();
				ctx.restore();
			} else {
				ctx.save();
				ctx.strokeStyle = currentDrawing.strokeColor || '#cc0000';
				ctx.lineWidth = 6;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				if (userStrokes.length > 0) {
					ctx.beginPath();
					for (var j = 0; j < userStrokes.length; j++) {
						ctx.moveTo(userStrokes[j].from.x, userStrokes[j].from.y);
						ctx.lineTo(userStrokes[j].to.x, userStrokes[j].to.y);
					}
					ctx.stroke();
				}
				if (isDrawing && currentStep > 0 && currMouseX !== -1000) {
					var lastPtIdx = currentStep - 1;
					if (lastPtIdx >= 0 && lastPtIdx < currentDrawing.points.length) {
						var lastDot = getDotByIndex(currentDrawing.points[lastPtIdx][0], currentDrawing.points[lastPtIdx][1]);
						if (lastDot) {
							ctx.beginPath();
							ctx.moveTo(lastDot.x, lastDot.y);
							ctx.lineTo(currMouseX, currMouseY);
							ctx.stroke();
						}
					}
				}
				ctx.restore();
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
					var dotRadius = isActive ? 10 : 6;
					var fontSize = isActive ? 34 : 26;
					var offsetY = isActive ? 34 : 26;

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
			if (!currentDrawing) return null;
			var isDrawn = (currentStep >= 1 && dot === getDotByIndex(currentDrawing.points[0][0], currentDrawing.points[0][1]));
			for (var j = 0; !isDrawn && j < userStrokes.length; j++) {
				var seg = userStrokes[j];
				if (seg.from === dot || seg.to === dot || (seg.dots && seg.dots.indexOf(dot) !== -1)) isDrawn = true;
			}
			var isTarget = false;
			for (var i = 0; !isDrawn && !isTarget && i < currentDrawing.points.length; i++) {
				if (getDotByIndex(currentDrawing.points[i][0], currentDrawing.points[i][1]) === dot) isTarget = true;
			}

			if (!isFinished) {
				if (isDrawn) return currentDrawing.strokeColor || '#cc0000';
				if (isTarget) return '#000000';
				return null;
			}

			var closePt = currentDrawing.closePt || getDotByIndex(currentDrawing.points[0][0], currentDrawing.points[0][1]);
			var distToClosePt = closePt ? Math.sqrt(Math.pow(dot.x - closePt.x, 2) + Math.pow(dot.y - closePt.y, 2)) : 0;
			var progress = currentDrawing.fillProgress !== undefined ? currentDrawing.fillProgress : 1500;

			if (isDrawn || isTarget) {
				return 'transparent';
			}
			if (dot.insideClosedFigure && dot.insideClosedFigure === currentDrawing && currentDrawing.fillColor) {
				if (progress >= distToClosePt) return darkenColor(currentDrawing.fillColor, 0.4);
			}
			return null;
		},
		setBuddyColors: function (stroke, fill) {
			if (stroke) buddyStrokeColor = stroke;
			if (fill) buddyFillColor = fill;
			if (currentDrawing) {
				if (stroke) currentDrawing.strokeColor = stroke;
				if (fill) currentDrawing.fillColor = fill;
			}
		},
		clear: function () {
			currentDrawing = null;
			currentStep = 0;
			userStrokes = [];
			isFinished = false;
			for (var i = 0; i < dots.length; i++) {
				dots[i].insideClosedFigure = null;
			}
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
				if (buddyStrokeColor) currentDrawing.strokeColor = buddyStrokeColor;
				if (buddyFillColor) currentDrawing.fillColor = buddyFillColor;
				currentStep = data.currentStep || 0;
				isFinished = !!data.isFinished;
			}
		}
	};

	return NumberMode;
});