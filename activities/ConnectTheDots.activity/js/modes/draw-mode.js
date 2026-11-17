define([], function () {
	var broadcastCallback = null;
	var currentFillColor = '#ed2529';
	var spacing = 55;
	var activeTool = 'draw';
	var isDrawMode = true;
	var isDrawing = false;
	var strokes = [];
	var currentStroke = null;
	var dots = [];
	var figures = [];
	var shrinkingFigures = [];
	var completedDots = new Set();

	function darkenColor(colorStr, percent) {
		var r = 0, g = 0, b = 0;
		if (colorStr.indexOf('rgb') !== -1) {
			var parts = colorStr.split("(")[1].split(")")[0].split(",");
			r = parseInt(parts[0]);
			g = parseInt(parts[1]);
			b = parseInt(parts[2]);
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

	function serializeStrokes() {
		var serializedStrokes = [];
		for (var i = 0; i < strokes.length; i++) {
			if (strokes[i].isEraseTrail) continue;
			var stroke = [];
			for (var j = 0; j < strokes[i].length; j++) {
				stroke.push(dots.indexOf(strokes[i][j]));
			}
			serializedStrokes.push({ path: stroke, fillColor: strokes[i].fillColor });
		}
		return serializedStrokes;
	}

	function serializeFigures() {
		var serializedFigures = [];
		for (var i = 0; i < figures.length; i++) {
			serializedFigures.push({ key: figures[i].key, fillColor: figures[i].fillColor });
		}
		return serializedFigures;
	}

	function deserializeStrokes(serializedStrokes, serializedFigures, isLiveUpdate) {
		if (!serializedStrokes || !Array.isArray(serializedStrokes)) return;
		strokes = [];
		if (serializedStrokes.length === 0) {
			if (!isLiveUpdate) {
				figures = [];
				shrinkingFigures = [];
			}
			updateFigures(serializedFigures || oldColors, false, isLiveUpdate);
			return;
		}
		var oldColors = {};
		for (var i = 0; i < serializedStrokes.length; i++) {
			var strokeData = serializedStrokes[i];
			var pathData = Array.isArray(strokeData) ? strokeData : strokeData.path;
			var fillColor = Array.isArray(strokeData) ? null : strokeData.fillColor;
			var stroke = [];
			for (var j = 0; j < pathData.length; j++) {
				var dotIndex = pathData[j];
				if (dotIndex >= 0 && dotIndex < dots.length) {
					stroke.push(dots[dotIndex]);
				}
			}
			if (stroke.length > 0) {
				stroke.fillColor = fillColor;
				strokes.push(stroke);
				if (fillColor && stroke.length > 2 && stroke[0] === stroke[stroke.length - 1]) {
					var p = [];
					for (var k = 0; k < stroke.length - 1; k++) p.push(dots.indexOf(stroke[k]));
					if (p.length >= 3) {
						var minIdx = 0;
						for (var k = 1; k < p.length; k++) if (p[k] < p[minIdx]) minIdx = k;
						var rotated = p.slice(minIdx).concat(p.slice(0, minIdx));
						oldColors[rotated.join("_")] = fillColor;
					}
				}
			}
		}
		updateFigures(serializedFigures || oldColors, false, isLiveUpdate);
	}

	function broadcastUpdate() {
		if (typeof broadcastCallback === 'function') {
			broadcastCallback();
		}
	}



	function isCrossingDiagonal(dotA, dotB) {
		var dx = Math.round((dotB.baseX - dotA.baseX) / spacing);
		var dy = Math.round((dotB.baseY - dotA.baseY) / spacing);
		if (Math.abs(dx) !== 1 || Math.abs(dy) !== 1) return false;

		var oppX1 = dotA.baseX + dx * spacing;
		var oppY1 = dotA.baseY;
		var oppX2 = dotA.baseX;
		var oppY2 = dotA.baseY + dy * spacing;

		var oppDot1 = null, oppDot2 = null;
		for (var i = 0; i < dots.length; i++) {
			if (Math.abs(dots[i].baseX - oppX1) < 1 && Math.abs(dots[i].baseY - oppY1) < 1) oppDot1 = dots[i];
			if (Math.abs(dots[i].baseX - oppX2) < 1 && Math.abs(dots[i].baseY - oppY2) < 1) oppDot2 = dots[i];
		}
		if (!oppDot1 || !oppDot2) return false;

		for (var i = 0; i < strokes.length; i++) {
			var s = strokes[i];
			for (var j = 0; j < s.length - 1; j++) {
				if ((s[j] === oppDot1 && s[j + 1] === oppDot2) || (s[j] === oppDot2 && s[j + 1] === oppDot1)) {
					return true;
				}
			}
		}
		return false;
	}

	function updateFigures(savedColors, isErasing, isLiveUpdate) {
		var priorProgressMap = new Map();
		for (var i = 0; i < figures.length; i++) {
			priorProgressMap.set(figures[i].key, figures[i].fillProgress);
		}

		var adj = new Map();
		for (var i = 0; i < dots.length; i++) {
			adj.set(i, new Set());
		}

		var rawEdges = new Set();
		for (var i = 0; i < strokes.length; i++) {
			var s = strokes[i];
			if (s.isEraseTrail) continue;
			for (var j = 0; j < s.length - 1; j++) {
				var u = dots.indexOf(s[j]);
				var v = dots.indexOf(s[j + 1]);
				if (u !== -1 && v !== -1 && u !== v) {
					adj.get(u).add(v);
					adj.get(v).add(u);
					rawEdges.add(Math.min(u, v) + "_" + Math.max(u, v));
				}
			}
		}

		while (true) {
			var pruned = false;
			for (var u = 0; u < dots.length; u++) {
				var neighbors = adj.get(u);
				if (neighbors && neighbors.size === 1) {
					var v = Array.from(neighbors)[0];
					neighbors.delete(v);
					if (adj.has(v)) adj.get(v).delete(u);
					pruned = true;
				}
			}
			if (!pruned) break;
		}

		var adjList = [];
		for (var i = 0; i < dots.length; i++) {
			var neighbors = Array.from(adj.get(i));
			var uDot = dots[i];
			neighbors.sort(function (a, b) {
				var aDot = dots[a];
				var bDot = dots[b];
				var angleA = Math.atan2(aDot.baseY - uDot.baseY, aDot.baseX - uDot.baseX);
				var angleB = Math.atan2(bDot.baseY - uDot.baseY, bDot.baseX - uDot.baseX);
				return angleA - angleB;
			});
			adjList.push(neighbors);
		}

		var visitedEdges = new Set();
		var foundFaces = [];

		for (var u = 0; u < dots.length; u++) {
			var neighbors = adjList[u];
			for (var n = 0; n < neighbors.length; n++) {
				var v = neighbors[n];
				var edgeKey = u + "_" + v;
				if (visitedEdges.has(edgeKey)) continue;

				var currU = u;
				var currV = v;
				var cycleIndices = [currU];
				var validCycle = true;

				while (true) {
					visitedEdges.add(currU + "_" + currV);
					if (currV === u) {
						break;
					}
					cycleIndices.push(currV);

					var nextNeighbors = adjList[currV];
					var idx = nextNeighbors.indexOf(currU);
					if (idx === -1) {
						validCycle = false;
						break;
					}
					var k = nextNeighbors.length;
					var nextV = nextNeighbors[(idx - 1 + k) % k];

					currU = currV;
					currV = nextV;

					if (cycleIndices.length > dots.length + 2) {
						validCycle = false;
						break;
					}
				}

				if (validCycle && cycleIndices.length >= 3) {
					var area = 0;
					for (var k = 0; k < cycleIndices.length; k++) {
						var d1 = dots[cycleIndices[k]];
						var d2 = dots[cycleIndices[(k + 1) % cycleIndices.length]];
						area += (d1.baseX * d2.baseY - d2.baseX * d1.baseY);
					}
					if (area > 0) {
						foundFaces.push(cycleIndices);
					}
				}
			}
		}

		var allOldFigures = figures.slice();
		var unmatchedOldFigures = new Map();
		for (var i = 0; i < figures.length; i++) {
			unmatchedOldFigures.set(figures[i].key, figures[i]);
		}

		var savedColorsMap = null;
		if (savedColors) {
			if (Array.isArray(savedColors)) {
				savedColorsMap = new Map();
				for (var i = 0; i < savedColors.length; i++) {
					savedColorsMap.set(savedColors[i].key, savedColors[i].fillColor);
				}
			} else if (typeof savedColors === 'object') {
				savedColorsMap = new Map(Object.entries(savedColors));
			}
		}

		var newFigures = [];
		var seenKeys = new Set();
		var unmatchedNewFaces = [];

		for (var i = 0; i < foundFaces.length; i++) {
			var faceIndices = foundFaces[i];
			var minIdx = 0;
			for (var k = 1; k < faceIndices.length; k++) {
				if (faceIndices[k] < faceIndices[minIdx]) minIdx = k;
			}
			var rotated = faceIndices.slice(minIdx).concat(faceIndices.slice(0, minIdx));
			var key = rotated.join("_");

			if (seenKeys.has(key)) continue;
			seenKeys.add(key);

			var faceDots = [];
			for (var k = 0; k < rotated.length; k++) {
				faceDots.push(dots[rotated[k]]);
			}

			if (unmatchedOldFigures.has(key)) {
				newFigures.push(unmatchedOldFigures.get(key));
				unmatchedOldFigures.delete(key);
			} else {
				unmatchedNewFaces.push({
					dots: faceDots,
					key: key,
					indices: new Set(rotated)
				});
			}
		}

		var oldList = Array.from(unmatchedOldFigures.values());
		var bestInherit = new Map();
		var anyErased = false;

		for (var o = 0; o < oldList.length; o++) {
			var oldFig = oldList[o];
			var intact = true;
			for (var k = 0; k < oldFig.dots.length; k++) {
				var u = dots.indexOf(oldFig.dots[k]);
				var v = dots.indexOf(oldFig.dots[(k + 1) % oldFig.dots.length]);
				if (!rawEdges.has(Math.min(u, v) + "_" + Math.max(u, v))) {
					intact = false;
					break;
				}
			}
			if (!intact) {
				continue;
			}

			var maxOverlap = 0;
			for (var n = 0; n < unmatchedNewFaces.length; n++) {
				var newFace = unmatchedNewFaces[n];
				var count = 0;
				for (var d = 0; d < oldFig.dots.length; d++) {
					var idx = dots.indexOf(oldFig.dots[d]);
					if (newFace.indices.has(idx)) count++;
				}
				if (count > maxOverlap) maxOverlap = count;
			}

			if (maxOverlap >= Math.ceil(oldFig.dots.length / 2)) {
				for (var n = 0; n < unmatchedNewFaces.length; n++) {
					var newFace = unmatchedNewFaces[n];
					var count = 0;
					for (var d = 0; d < oldFig.dots.length; d++) {
						var idx = dots.indexOf(oldFig.dots[d]);
						if (newFace.indices.has(idx)) count++;
					}
					if (count === maxOverlap && !bestInherit.has(newFace.key)) {
						bestInherit.set(newFace.key, {
							color: oldFig.fillColor,
							progress: oldFig.fillProgress !== undefined ? oldFig.fillProgress : 1500,
							outerColor: oldFig.outerColor,
							oldKey: oldFig.key,
							noFill: oldFig.noFill
						});
					}
				}
			}
		}

		for (var n = 0; n < unmatchedNewFaces.length; n++) {
			var newFace = unmatchedNewFaces[n];
			var color = currentFillColor;
			var progress = 0;
			var outerColor = null;
			var noFill = false;
			var cX = 0, cY = 0;
			for (var d = 0; d < newFace.dots.length; d++) {
				cX += newFace.dots[d].baseX;
				cY += newFace.dots[d].baseY;
			}
			cX /= newFace.dots.length;
			cY /= newFace.dots.length;

			if (isErasing) {
				color = null;
				noFill = true;
			} else if (priorProgressMap.has(newFace.key)) {
				progress = priorProgressMap.get(newFace.key);
				if (savedColorsMap && savedColorsMap.has(newFace.key)) {
					color = savedColorsMap.get(newFace.key);
				}
			} else if (bestInherit.has(newFace.key)) {
				var inherited = bestInherit.get(newFace.key);
				color = inherited.color;
				progress = inherited.progress;
				if (inherited.outerColor) outerColor = inherited.outerColor;
				noFill = inherited.noFill || false;
				if (savedColorsMap && savedColorsMap.has(newFace.key)) {
					color = savedColorsMap.get(newFace.key);
				}
			} else if (savedColorsMap && savedColorsMap.has(newFace.key)) {
				color = savedColorsMap.get(newFace.key);
				progress = isLiveUpdate ? 0 : 1500;
			} else {
				color = currentFillColor;
				progress = 0;
			}

			if (!noFill && color && progress < 1500) {
				var faceArea = getPolygonArea(newFace.dots);
				var minEnclosingArea = Infinity;
				var bestOldF = null;
				for (var k = 0; k < allOldFigures.length; k++) {
					var oldF = allOldFigures[k];
					var oldArea = getPolygonArea(oldF.dots);
					if (!oldF.noFill && oldF.fillColor && oldF.dots && oldF.dots.length >= 3) {
						if (oldArea > faceArea + 1 && oldArea < minEnclosingArea && isFigureInside(newFace.dots, oldF.dots)) {
							minEnclosingArea = oldArea;
							bestOldF = oldF;
						}
					}
				}
				if (bestOldF) {
					outerColor = bestOldF.fillColor;
				}
			}
			var faceClosePt = newFace.dots[newFace.dots.length - 1];
			var recentStroke = currentStroke || (strokes.length > 0 ? strokes[strokes.length - 1] : null);
			if (recentStroke && recentStroke.length >= 2) {
				for (var j = recentStroke.length - 2; j >= 0; j--) {
					var dA = recentStroke[j], dB = recentStroke[j + 1];
					var idxA = newFace.dots.indexOf(dA), idxB = newFace.dots.indexOf(dB);
					if (idxA !== -1 && idxB !== -1) {
						if (Math.abs(idxA - idxB) === 1 || Math.abs(idxA - idxB) === newFace.dots.length - 1) {
							faceClosePt = {
								baseX: (dA.baseX + dB.baseX) / 2,
								baseY: (dA.baseY + dB.baseY) / 2
							};
							break;
						}
					}
				}
			}
			var faceMaxDist = 0;
			for (var d = 0; d < newFace.dots.length; d++) {
				var dx = newFace.dots[d].baseX - faceClosePt.baseX;
				var dy = newFace.dots[d].baseY - faceClosePt.baseY;
				var dist = Math.sqrt(dx * dx + dy * dy);
				if (dist > faceMaxDist) faceMaxDist = dist;
			}
			newFigures.push({
				dots: newFace.dots,
				key: newFace.key,
				fillColor: color,
				fillProgress: progress,
				maxDist: faceMaxDist,
				outerColor: outerColor,
				noFill: noFill,
				closePt: faceClosePt
			});
		}

		newFigures.sort(function (a, b) {
				var areaA = 0, areaB = 0;
				for (var k = 0; k < a.dots.length; k++) {
					var d1 = a.dots[k], d2 = a.dots[(k + 1) % a.dots.length];
					areaA += (d1.baseX * d2.baseY - d2.baseX * d1.baseY);
				}
				for (var k = 0; k < b.dots.length; k++) {
					var d1 = b.dots[k], d2 = b.dots[(k + 1) % b.dots.length];
					areaB += (d1.baseX * d2.baseY - d2.baseX * d1.baseY);
				}
				return Math.abs(areaB) - Math.abs(areaA);
			});

			for (var i = 0; i < newFigures.length; i++) {
				var fig = newFigures[i];
				if (!fig.noFill && fig.fillColor) {
					var cX = 0, cY = 0;
					for (var d = 0; d < fig.dots.length; d++) {
						cX += fig.dots[d].baseX;
						cY += fig.dots[d].baseY;
					}
					cX /= fig.dots.length;
					cY /= fig.dots.length;

					var figArea = getPolygonArea(fig.dots);
					var minEnclosingArea = Infinity;
					var bestLargerFig = null;
					for (var j = 0; j < newFigures.length; j++) {
						if (i === j) continue;
						var largerFig = newFigures[j];
						var largerArea = getPolygonArea(largerFig.dots);
						if (!largerFig.noFill && largerFig.fillColor && largerFig.dots && largerFig.dots.length >= 3) {
							if (largerArea > figArea + 1 && largerArea < minEnclosingArea && isFigureInside(fig.dots, largerFig.dots)) {
								minEnclosingArea = largerArea;
								bestLargerFig = largerFig;
							}
						}
					}
					if (bestLargerFig) {
						fig.outerColor = bestLargerFig.fillColor;
					}
				}
			}

			var survivingKeys = new Set();
			for (var i = 0; i < newFigures.length; i++) {
				survivingKeys.add(newFigures[i].key);
			}
			var inheritedOldKeys = new Set();
			bestInherit.forEach(function (val) {
				if (val.oldKey) inheritedOldKeys.add(val.oldKey);
			});

			for (var i = 0; i < figures.length; i++) {
				var oldFig = figures[i];
				if (!survivingKeys.has(oldFig.key) && !inheritedOldKeys.has(oldFig.key)) {
					if ((isErasing || isLiveUpdate) && oldFig.fillProgress > 0) {
						var missingEdgePt = null;
						if (isErasing && currentStroke && currentStroke.length >= 2) {
							for (var j = 0; j < currentStroke.length - 1; j++) {
								var eA = currentStroke[j], eB = currentStroke[j + 1];
								for (var k = 0; k < oldFig.dots.length; k++) {
									var fA = oldFig.dots[k], fB = oldFig.dots[(k + 1) % oldFig.dots.length];
									if ((eA === fA && eB === fB) || (eA === fB && eB === fA)) {
										missingEdgePt = {
											baseX: (fA.baseX + fB.baseX) / 2,
											baseY: (fA.baseY + fB.baseY) / 2
										};
										break;
									}
								}
								if (missingEdgePt) break;
							}
						}
						if (!missingEdgePt) {
							for (var k = 0; k < oldFig.dots.length; k++) {
								var u = dots.indexOf(oldFig.dots[k]);
								var v = dots.indexOf(oldFig.dots[(k + 1) % oldFig.dots.length]);
								if (!rawEdges.has(Math.min(u, v) + "_" + Math.max(u, v))) {
									missingEdgePt = {
										baseX: (oldFig.dots[k].baseX + oldFig.dots[(k + 1) % oldFig.dots.length].baseX) / 2,
										baseY: (oldFig.dots[k].baseY + oldFig.dots[(k + 1) % oldFig.dots.length].baseY) / 2
									};
									break;
								}
							}
						}

						if (missingEdgePt) {
							var alreadyShrinking = false;
							for (var sIdx = 0; sIdx < shrinkingFigures.length; sIdx++) {
								if (shrinkingFigures[sIdx].key === oldFig.key) {
									alreadyShrinking = true;
									break;
								}
							}
							if (!alreadyShrinking) {
								var shrinkClosePt = missingEdgePt;
								var maxDist = 0;
								for (var d = 0; d < oldFig.dots.length; d++) {
									var dx = oldFig.dots[d].baseX - shrinkClosePt.baseX;
									var dy = oldFig.dots[d].baseY - shrinkClosePt.baseY;
									var dist = Math.sqrt(dx * dx + dy * dy);
									if (dist > maxDist) maxDist = dist;
								}
								shrinkingFigures.push({
									dots: oldFig.dots.slice(),
									key: oldFig.key,
									fillColor: oldFig.fillColor,
									fillProgress: Math.min(oldFig.fillProgress, maxDist),
									maxDist: maxDist,
									outerColor: null,
									closePt: shrinkClosePt,
									shrinking: true
								});
							}
						}
					}
				}
			}

			figures = newFigures;
		}

		function getPolygonArea(polyDots) {
			if (!polyDots || polyDots.length < 3) return 0;
			var area = 0;
			for (var k = 0; k < polyDots.length; k++) {
				var d1 = polyDots[k], d2 = polyDots[(k + 1) % polyDots.length];
				area += (d1.baseX * d2.baseY - d2.baseX * d1.baseY);
			}
			return Math.abs(area) / 2;
		}

		function isPointInPolygon(ptX, ptY, polyDots) {
			if (polyDots.length < 3) return false;
			var isInside = false;
			for (var k = 0, l = polyDots.length - 1; k < polyDots.length; l = k++) {
				var xi = polyDots[k].baseX, yi = polyDots[k].baseY;
				var xj = polyDots[l].baseX, yj = polyDots[l].baseY;
				var intersect = ((yi > ptY) != (yj > ptY)) && (ptX < (xj - xi) * (ptY - yi) / (yj - yi) + xi);
				if (intersect) isInside = !isInside;
			}
			return isInside;
		}

		function isFigureInside(innerFigDots, outerFigDots) {
			if (!innerFigDots || !outerFigDots || innerFigDots.length < 3 || outerFigDots.length < 3) return false;
			for (var d = 0; d < innerFigDots.length; d++) {
				var pt = innerFigDots[d];
				if (!isPointInPolygon(pt.baseX, pt.baseY, outerFigDots)) {
					var onEdge = false;
					for (var k = 0; k < outerFigDots.length; k++) {
						var p1 = outerFigDots[k];
						var p2 = outerFigDots[(k + 1) % outerFigDots.length];
						var distP1P2 = Math.sqrt(Math.pow(p1.baseX - p2.baseX, 2) + Math.pow(p1.baseY - p2.baseY, 2));
						var distPtP1 = Math.sqrt(Math.pow(pt.baseX - p1.baseX, 2) + Math.pow(pt.baseY - p1.baseY, 2));
						var distPtP2 = Math.sqrt(Math.pow(pt.baseX - p2.baseX, 2) + Math.pow(pt.baseY - p2.baseY, 2));
						if (Math.abs((distPtP1 + distPtP2) - distP1P2) < 0.1) {
							onEdge = true;
							break;
						}
					}
					if (!onEdge) return false;
				}
			}
			return true;
		}

		function segmentsIntersect(p1, q1, p2, q2) {
			if (p1 === p2 || p1 === q2 || q1 === p2 || q1 === q2) return false;
			function orientation(a, b, c) {
				var val = (b.baseY - a.baseY) * (c.baseX - b.baseX) - (b.baseX - a.baseX) * (c.baseY - b.baseY);
				if (Math.abs(val) < 1e-6) return 0;
				return (val > 0) ? 1 : 2;
			}
			var o1 = orientation(p1, q1, p2);
			var o2 = orientation(p1, q1, q2);
			var o3 = orientation(p2, q2, p1);
			var o4 = orientation(p2, q2, q1);

			if (o1 !== o2 && o3 !== o4) return true;
			return false;
		}

		function eraseSegment(dotA, dotB) {
			var erasedAny = false;
			for (var i = strokes.length - 1; i >= 0; i--) {
				var s = strokes[i];
				if (s === currentStroke || s.isEraseTrail) continue;
				for (var k = 0; k < s.length - 1; k++) {
					var match = (s[k] === dotA && s[k + 1] === dotB) || (s[k] === dotB && s[k + 1] === dotA);
					if (!match && segmentsIntersect(dotA, dotB, s[k], s[k + 1])) {
						match = true;
					}
					if (match) {
						var part1 = s.slice(0, k + 1);
						var part2 = s.slice(k + 1);
						strokes.splice(i, 1);
						if (part2.length >= 2) {
							part2.fillColor = s.fillColor;
							strokes.splice(i, 0, part2);
						}
						if (part1.length >= 2) {
							part1.fillColor = s.fillColor;
							strokes.splice(i, 0, part1);
						}
						erasedAny = true;
						break;
					}
				}
			}
			return erasedAny;
		}

		function addPointToStroke(mx, my) {
			if (!isDrawMode || !currentStroke) return;

			var minDist = Infinity;
			var nearestDot = null;
			for (var i = 0; i < dots.length; i++) {
				var dx = mx - dots[i].baseX;
				var dy = my - dots[i].baseY;
				var dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < minDist) {
					minDist = dist;
					nearestDot = dots[i];
				}
			}

			if (nearestDot && minDist < 27.5) {
				if (currentStroke.length > 0) {
					var lastPt = currentStroke[currentStroke.length - 1];
					if (lastPt === nearestDot) {
						return;
					}

					var dxGrid = Math.round((nearestDot.baseX - lastPt.baseX) / spacing);
					var dyGrid = Math.round((nearestDot.baseY - lastPt.baseY) / spacing);
					var absDx = Math.abs(dxGrid);
					var absDy = Math.abs(dyGrid);

					if (absDx !== 0 && absDy !== 0 && absDx !== absDy) {
						return;
					}

					var steps = Math.max(absDx, absDy);
					for (var i = 1; i <= steps; i++) {
						var interpX = lastPt.baseX + (dxGrid * spacing) * (i / steps);
						var interpY = lastPt.baseY + (dyGrid * spacing) * (i / steps);

						for (var j = 0; j < dots.length; j++) {
							if (Math.abs(interpX - dots[j].baseX) < 1 && Math.abs(interpY - dots[j].baseY) < 1) {
								var latestDot = currentStroke[currentStroke.length - 1];
								if (latestDot !== dots[j]) {
									if (!isCrossingDiagonal(latestDot, dots[j])) {
										currentStroke.push(dots[j]);
										updateFigures();
									}
								}
								break;
							}
						}
					}
					if (!currentStroke.isEraseTrail) {
						broadcastUpdate();
					}
					return;
				}

				currentStroke.push(nearestDot);
				if (!currentStroke.isEraseTrail) {
					updateFigures();
					broadcastUpdate();
				}
			}
		}

		function drawBehindDots(ctx) {
			if (!ctx) return;

			for (var i = 0; i < dots.length; i++) {
				dots[i].insideClosedFigure = null;
			}

			for (var f = 0; f < figures.length; f++) {
				var fig = figures[f];
				for (var d = 0; d < dots.length; d++) {
					var ptX = dots[d].baseX;
					var ptY = dots[d].baseY;
					var isInside = false;
					for (var k = 0, l = fig.dots.length - 1; k < fig.dots.length; l = k++) {
						var xi = fig.dots[k].baseX, yi = fig.dots[k].baseY;
						var xj = fig.dots[l].baseX, yj = fig.dots[l].baseY;
						var intersect = ((yi > ptY) != (yj > ptY)) && (ptX < (xj - xi) * (ptY - yi) / (yj - yi) + xi);
						if (intersect) isInside = !isInside;
					}
					if (isInside) {
						dots[d].insideClosedFigure = fig;
					}
				}
			}

			completedDots.clear();
			for (var i = 0; i < strokes.length; i++) {
				if (isDrawing && strokes[i] === currentStroke) {
					continue;
				}
				for (var j = 0; j < strokes[i].length; j++) {
					completedDots.add(strokes[i][j]);
				}
			}

			if (isDrawing && currentStroke) {
				for (var j = 0; j < currentStroke.length; j++) {
					completedDots.delete(currentStroke[j]);
				}
			}

			for (var i = shrinkingFigures.length - 1; i >= 0; i--) {
				var shrinkMaxD = shrinkingFigures[i].maxDist || shrinkingFigures[i].fillProgress || 150;
				var shrinkStep = Math.max(1.5, Math.min(12, shrinkMaxD / 35));
				shrinkingFigures[i].fillProgress -= shrinkStep;
				if (shrinkingFigures[i].fillProgress <= 0) {
					shrinkingFigures.splice(i, 1);
				}
			}

			var allRenderFigures = figures.concat(shrinkingFigures);
			allRenderFigures.sort(function (a, b) {
				var areaA = 0, areaB = 0;
				for (var k = 0; k < a.dots.length; k++) {
					var d1 = a.dots[k], d2 = a.dots[(k + 1) % a.dots.length];
					areaA += (d1.baseX * d2.baseY - d2.baseX * d1.baseY);
				}
				for (var k = 0; k < b.dots.length; k++) {
					var d1 = b.dots[k], d2 = b.dots[(k + 1) % b.dots.length];
					areaB += (d1.baseX * d2.baseY - d2.baseX * d1.baseY);
				}
				return Math.abs(areaB) - Math.abs(areaA);
			});

			for (var i = 0; i < allRenderFigures.length; i++) {
				var fig = allRenderFigures[i];
				if (fig.fillProgress === undefined) fig.fillProgress = 0;

				if (!fig.noFill && fig.fillColor && fig.fillProgress < 1500) {
					var cX = 0, cY = 0;
					for (var d = 0; d < fig.dots.length; d++) {
						cX += fig.dots[d].baseX;
						cY += fig.dots[d].baseY;
					}
					cX /= fig.dots.length;
					cY /= fig.dots.length;

					var figArea = getPolygonArea(fig.dots);
					var minEnclosingArea = Infinity;
					var bestLargerFig = null;
					for (var j = 0; j < allRenderFigures.length; j++) {
						if (i === j) continue;
						var largerFig = allRenderFigures[j];
						var largerArea = getPolygonArea(largerFig.dots);
						if (!largerFig.noFill && largerFig.fillColor && largerFig.dots && largerFig.dots.length >= 3) {
							if (largerArea > figArea + 1 && largerArea < minEnclosingArea && isFigureInside(fig.dots, largerFig.dots)) {
								minEnclosingArea = largerArea;
								bestLargerFig = largerFig;
							}
						}
					}
					if (bestLargerFig) {
						fig.outerColor = bestLargerFig.fillColor;
					}
				}

				if (!fig.shrinking && !fig.noFill && fig.fillColor && fig.fillProgress < 1500) {
					if (fig.maxDist === undefined) {
						var maxD = 0;
						var cPt = fig.closePt || (fig.dots && fig.dots[0]);
						if (cPt && fig.dots) {
							for (var d = 0; d < fig.dots.length; d++) {
								var dx = fig.dots[d].baseX - cPt.baseX;
								var dy = fig.dots[d].baseY - cPt.baseY;
								var dist = Math.sqrt(dx * dx + dy * dy);
								if (dist > maxD) maxD = dist;
							}
						}
						fig.maxDist = maxD || 150;
					}
					var targetD = fig.maxDist + 5;
					var step = Math.max(1.5, Math.min(12, targetD / 35));
					fig.fillProgress += step;
					if (fig.fillProgress >= targetD) {
						fig.fillProgress = 1500;
					}
				}

				if (!fig.shrinking && !fig.noFill && fig.fillColor && fig.fillProgress >= 1500) {
					ctx.beginPath();
					ctx.moveTo(fig.dots[0].baseX, fig.dots[0].baseY);
					for (var j = 1; j < fig.dots.length; j++) {
						ctx.lineTo(fig.dots[j].baseX, fig.dots[j].baseY);
					}
					ctx.closePath();
					ctx.fillStyle = fig.fillColor;
					ctx.fill();
				} else if (fig.fillProgress > 0 && !fig.noFill && fig.fillColor) {
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(fig.dots[0].baseX, fig.dots[0].baseY);
					for (var j = 1; j < fig.dots.length; j++) {
						ctx.lineTo(fig.dots[j].baseX, fig.dots[j].baseY);
					}
					ctx.closePath();

					if (!fig.shrinking && fig.outerColor) {
						ctx.fillStyle = fig.outerColor;
						ctx.fill();
					}
					ctx.clip();
					var closePt = fig.closePt || fig.dots[0];
					ctx.beginPath();
					ctx.arc(closePt.baseX, closePt.baseY, fig.fillProgress, 0, Math.PI * 2);
					ctx.fillStyle = fig.fillColor;
					ctx.fill();

					ctx.restore();
				}
			}

			for (var i = strokes.length - 1; i >= 0; i--) {
				if (strokes[i].isEraseTrail && (!isDrawing || strokes[i] !== currentStroke)) {
					strokes.splice(i, 1);
				}
			}

			for (var i = 0; i < strokes.length; i++) {
				var stroke = strokes[i];
				if (stroke.length < 2) continue;
				ctx.beginPath();
				ctx.moveTo(stroke[0].baseX, stroke[0].baseY);
				for (var j = 1; j < stroke.length; j++) {
					ctx.lineTo(stroke[j].baseX, stroke[j].baseY);
				}
				ctx.strokeStyle = (isDrawing && stroke === currentStroke && stroke.isEraseTrail) ? '#808080' : '#282828';
				ctx.lineWidth = 8;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.stroke();
			}
		}

		function stopDrawing() {
			if (isDrawing) {
				isDrawing = false;
				var erasedAny = false;
				if (currentStroke && currentStroke.isEraseTrail && currentStroke.length >= 2) {
					for (var k = 0; k < currentStroke.length - 1; k++) {
						if (eraseSegment(currentStroke[k], currentStroke[k + 1])) {
							erasedAny = true;
						}
					}
				}
				if (currentStroke && (currentStroke.length < 2 || currentStroke.isEraseTrail)) {
					var idx = strokes.indexOf(currentStroke);
					if (idx !== -1) strokes.splice(idx, 1);
				}
				for (var i = strokes.length - 1; i >= 0; i--) {
					if (strokes[i].isEraseTrail) strokes.splice(i, 1);
				}
				currentStroke = null;
				if (erasedAny) {
					updateFigures(null, true);
					broadcastUpdate();
				} else if (activeTool !== 'erase') {
					broadcastUpdate();
				}
			}
		}

		var DrawMode = {
			init: function (sharedDots, onBroadcast, initialFillColor) {
				dots = sharedDots;
				broadcastCallback = onBroadcast;
				if (initialFillColor) currentFillColor = initialFillColor;
				this.setTool('draw');
			},
			onMouseDown: function (x, y) {
				isDrawing = true;
				if (isDrawMode) {
					currentStroke = [];
					currentStroke.fillColor = (activeTool === 'erase') ? '#808080' : currentFillColor;
					if (activeTool === 'erase') currentStroke.isEraseTrail = true;
					strokes.push(currentStroke);
					addPointToStroke(x, y);
				}
			},
			onMouseMove: function (newX, newY, prevX, prevY) {
				if (isDrawing && isDrawMode) {
					if (prevX !== -1000) {
						var dx = newX - prevX;
						var dy = newY - prevY;
						var dist = Math.sqrt(dx * dx + dy * dy);
						var steps = Math.ceil(dist / 5);
						for (var i = 1; i <= steps; i++) {
							var interpX = prevX + dx * (i / steps);
							var interpY = prevY + dy * (i / steps);
							addPointToStroke(interpX, interpY);
						}
					} else {
						addPointToStroke(newX, newY);
					}
				}
			},
			onMouseUp: function () {
				stopDrawing();
			},
			drawBehindDots: function (ctx) {
				drawBehindDots(ctx);
			},
			isDotCompleted: function (dot) {
				return completedDots.has(dot);
			},
			isDrawingActive: function () {
				return isDrawing;
			},
			getDotColor: function (dot) {
				var dotRenderColor = null;
				var isOnBoundary = false;
				var boundaryStroke = null;

				if (isDrawing && currentStroke && currentStroke.indexOf(dot) !== -1 && currentStroke.fillColor) {
					dotRenderColor = currentStroke.fillColor;
				}

				for (var s = strokes.length - 1; s >= 0; s--) {
					if (strokes[s].indexOf(dot) !== -1) {
						isOnBoundary = true;
						boundaryStroke = strokes[s];
						break;
					}
				}

				if (isOnBoundary && boundaryStroke !== currentStroke) {
					for (var f = 0; f < figures.length; f++) {
						var fig = figures[f];
						if (fig.dots.indexOf(dot) !== -1) {
							var closePt = fig.closePt || fig.dots[0];
							var distToClosePt = Math.sqrt(Math.pow(dot.baseX - closePt.baseX, 2) + Math.pow(dot.baseY - closePt.baseY, 2));
							if (fig.fillProgress >= distToClosePt) {
								dotRenderColor = '#282828';
								break;
							}
						}
					}
				}

				if (!isOnBoundary && dot.insideClosedFigure && dot.insideClosedFigure.fillColor) {
					dotRenderColor = darkenColor(dot.insideClosedFigure.fillColor, 0.4);
				}
				return dotRenderColor;
			},
			setFillColor: function (color) {
				currentFillColor = color;
			},
			setTool: function (tool) {
				stopDrawing();
				activeTool = tool;
				isDrawMode = true;
			},
			clear: function () {
				strokes = [];
				currentStroke = null;
				figures = [];
				shrinkingFigures = [];
				updateFigures();
				shrinkingFigures = [];
			},
			stopDrawing: function () {
				stopDrawing();
			},
			serialize: function () {
				return {
					strokes: serializeStrokes(),
					figures: serializeFigures()
				};
			},
			deserialize: function (strokesData, figuresData, isLiveUpdate) {
				deserializeStrokes(strokesData, figuresData, isLiveUpdate);
			}
		};

		return DrawMode;
	});