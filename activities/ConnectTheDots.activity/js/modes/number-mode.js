define(["activity/palettes/timerPalette", "sugar-web/graphics/icon"], function (timerPalette, icon) {
	var broadcastCallback = null;
	var onFinishedCallback = null;
	var challengeActive = false;
	var challengeCategory = 'basic-shapes';
	var challengeIndex = 0;
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
	var view = 'play';
	var currentCategoryKey = 'basic-shapes';
	var isCreatingFigure = false;
	var activeDrawingIndex = -1;
	// Challenge and Leaderboard state
	var challengeDuration = 0;
	var challengeRemaining = 0;
	var challengeInterval = null;
	var challengeScores = [];
	var currentChallengeScore = 0;
	var completedFigures = [];
	
	// Network state
	var presence = null;
	var isHost = false;
	var timerPal = null;
	var isActiveMode = false;

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

	var libraries = JSON.parse(JSON.stringify(initialDataSet));

	var categoryNames = {};

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

	function findHoveredPointIndex(mouseX, mouseY, targetIdx) {
		if (!currentDrawing || !currentDrawing.points) return -1;
		var hoveredIndices = [];
		for (var i = 0; i < currentDrawing.points.length; i++) {
			var pt = currentDrawing.points[i];
			var dot = getDotByIndex(pt[0], pt[1]);
			if (dot) {
				var dx = mouseX - dot.x;
				var dy = mouseY - dot.y;
				if (Math.sqrt(dx * dx + dy * dy) < 22.5) {
					hoveredIndices.push(i);
				}
			}
		}
		if (hoveredIndices.length > 0) {
			if (targetIdx !== undefined && hoveredIndices.indexOf(targetIdx) !== -1) {
				return targetIdx;
			}
			return hoveredIndices[0];
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
			var crossProduct = Math.abs((d.x - dot1.x) * dy - (d.y - dot1.y) * dx);
			if (crossProduct < 0.01 && Math.abs(dist1 + dist2 - len) < 0.01) {
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
		setEnvironment: function(envObj) {
			NumberMode.currentenv = envObj;
		},
		onChallengeStarted: function(duration, skipInit) {
			challengeActive = true;
			NumberMode.setView('play', true);
			
			var btnsToDisable = ['library-button', 'timer-button', 'mode-button', 'view-button', 'create-category-button'];
			for (var i=0; i<btnsToDisable.length; i++) {
				var b = document.getElementById(btnsToDisable[i]);
				if (b) b.disabled = true;
			}
			
			if (!skipInit) {
				challengeCategory = currentCategoryKey || 'basic-shapes';
				challengeIndex = 0;
				var d = libraries[challengeCategory] && libraries[challengeCategory][challengeIndex];
				if (d) {
					NumberMode.selectDrawing(d, challengeIndex, true);
				}
				broadcastUpdate();
			}
		},
		nextChallengeFigure: function() {
			if (!challengeActive) return;
			challengeIndex++;
			if (libraries[challengeCategory] && challengeIndex >= libraries[challengeCategory].length) {
				// Cycle to the next available category
				var allCatKeys = Object.keys(libraries);
				var currentCatIdx = allCatKeys.indexOf(challengeCategory);
				var nextCatIdx = (currentCatIdx + 1) % allCatKeys.length;
				challengeCategory = allCatKeys[nextCatIdx];
				challengeIndex = 0;
			}
			if (libraries[challengeCategory] && libraries[challengeCategory].length > 0) {
				NumberMode.selectDrawing(libraries[challengeCategory][challengeIndex], challengeIndex);
			}
		},
		onChallengeStopped: function() {
			challengeActive = false;
			
			var btnsToDisable = ['library-button', 'timer-button', 'mode-button', 'view-button', 'create-category-button'];
			for (var i=0; i<btnsToDisable.length; i++) {
				var b = document.getElementById(btnsToDisable[i]);
				if (b) b.disabled = false;
			}
		},
		getView: function () {
			return view;
		},
		backToGallery: function () {
			currentDrawing = null;
			currentStep = 0;
			userStrokes = [];
			isFinished = false;
			for (var i = 0; i < dots.length; i++) {
				dots[i].insideClosedFigure = null;
			}
			var playBackBtn = document.getElementById('play-figure-back-button');
			if (playBackBtn) playBackBtn.style.display = 'none';

			NumberMode.showGallery(currentCategoryKey, l10nRef);
			broadcastUpdate();
		},

		setView: function (newView, skipBroadcast) {
			view = newView;
			var viewBtn = document.getElementById('view-button');
			var createCatBtn = document.getElementById('create-category-button');
			if (viewBtn) {
				if (view === 'setting') {
					viewBtn.classList.add('setting-mode');
					viewBtn.title = (l10nRef && l10nRef.get('Play')) || 'Play';
				} else {
					viewBtn.classList.remove('setting-mode');
					viewBtn.title = (l10nRef && l10nRef.get('View')) || 'View';
				}
			}
			if (createCatBtn) {
				createCatBtn.style.display = (view === 'setting') ? '' : 'none';
			}
			var gallery = document.getElementById('library-gallery');
			if (gallery && gallery.style.display !== 'none') {
				NumberMode.showGallery(currentCategoryKey, l10nRef, skipBroadcast);
			} else if (view === 'play' && currentDrawing && !isCreatingFigure) {
				var playBackBtn = document.getElementById('play-figure-back-button');
				if (playBackBtn) {
					playBackBtn.style.display = presence ? 'none' : '';
					playBackBtn.onclick = function () {
						NumberMode.backToGallery();
					};
				}
			} else if (view === 'setting') {
				var playBackBtn = document.getElementById('play-figure-back-button');
				if (playBackBtn) playBackBtn.style.display = 'none';
			}
			if (!skipBroadcast) {
				broadcastUpdate();
			}
		},
		toggleView: function () {
			if (view === 'play') {
				var gallery = document.getElementById('library-gallery');
				if (currentDrawing && !isCreatingFigure && gallery && gallery.style.display === 'none') {
					NumberMode.startEditingFigure(activeDrawingIndex, currentDrawing);
					return;
				}
				NumberMode.setView('setting');
				if (!gallery || gallery.style.display === 'none') {
					NumberMode.showGallery(currentCategoryKey, l10nRef);
				}
			} else {
				if (isCreatingFigure) {
					NumberMode.stopCreatingFigure();
					return;
				}
				NumberMode.setView('play');
			}
		},
		deleteFigure: function (categoryKey, index) {
			if (libraries[categoryKey] && libraries[categoryKey][index]) {
				libraries[categoryKey].splice(index, 1);
				NumberMode.showGallery(categoryKey, l10nRef);
				broadcastUpdate();
			}
		},
		addFigure: function (categoryKey, name, points, closed, skipBroadcast) {
			if (!libraries[categoryKey]) libraries[categoryKey] = [];
			libraries[categoryKey].push({
				name: name || 'New Figure',
				points: points || [[4, 3], [10, 3], [10, 9], [4, 9]],
				closed: closed !== undefined ? closed : true
			});
			if (!skipBroadcast) {
				broadcastUpdate();
			}
			if (l10nRef) {
				NumberMode.showGallery(categoryKey, l10nRef, skipBroadcast);
			}
		},
		getAllCategories: function (l10n) {
			var titleMap = {
				'basic-shapes': (l10n && l10n.get('BasicShapes')) || (l10nRef && l10nRef.get('BasicShapes')) || 'Basic Shapes',
				'objects': (l10n && l10n.get('Objects')) || (l10nRef && l10nRef.get('Objects')) || 'Objects',
				'Numbers': (l10n && l10n.get('Numbers')) || (l10nRef && l10nRef.get('Numbers')) || 'Numbers',
				'Alphabets': (l10n && l10n.get('Alphabets')) || (l10nRef && l10nRef.get('Alphabets')) || 'Alphabets',
				'Symbols / Signs': (l10n && l10n.get('Symbols / Signs')) || (l10nRef && l10nRef.get('Symbols / Signs')) || 'Symbols / Signs',
				'Tools': (l10n && l10n.get('Tools')) || (l10nRef && l10nRef.get('Tools')) || 'Tools',
				'Home': (l10n && l10n.get('Home')) || (l10nRef && l10nRef.get('Home')) || 'Home'
			};
			var list = [];
			for (var key in libraries) {
				if (libraries.hasOwnProperty(key)) {
					list.push({
						key: key,
						name: categoryNames[key] || titleMap[key] || key
					});
				}
			}
			return list;
		},
		updateLibraryMenu: function (libraryPalette, l10n) {
			if (!libraryPalette || typeof NumberMode.getAllCategories !== 'function') return;
			var cats = NumberMode.getAllCategories(l10n);
			var seen = {};
			var uniqueCats = [];
			for (var i = 0; i < cats.length; i++) {
				var k = cats[i].key;
				if (!seen[k]) {
					seen[k] = true;
					uniqueCats.push(cats[i]);
				}
			}
			var menuData = uniqueCats.map(function (c) {
				return { id: "lib-" + c.key, label: c.name };
			});
			var menuElem = document.createElement('ul');
			menuElem.className = "menu";
			var htmlStr = '';
			for (var j = 0; j < menuData.length; j++) {
				var isSelected = (menuData[j].id === "lib-" + currentCategoryKey) ? ' palette-item-selected' : '';
				htmlStr += '<li><button id="' + menuData[j].id + '" class="' + isSelected + '">' + menuData[j].label + '</button></li>';
			}
			menuElem.innerHTML = htmlStr;
			if (typeof libraryPalette.setContent === 'function') {
				libraryPalette.setContent([menuElem]);
			} else {
				var containerElem = libraryPalette.getPalette().querySelector('.container');
				if (containerElem) {
					containerElem.innerHTML = '';
					containerElem.appendChild(menuElem);
				}
			}
			var buttons = menuElem.querySelectorAll('button');
			for (var b = 0; b < buttons.length; b++) {
				buttons[b].addEventListener('click', function (e) {
					var target = e.target;
					while (target && target.tagName !== 'BUTTON' && target.parentElement) {
						target = target.parentElement;
					}
					var selectedId = target ? target.id : '';
					var catKey = null;
					if (selectedId === 'lib-basic-shapes') {
						catKey = 'basic-shapes';
					} else if (selectedId === 'lib-objects') {
						catKey = 'objects';
					} else if (selectedId && selectedId.indexOf('lib-') === 0) {
						catKey = selectedId.substring(4);
					}
					if (catKey) {
						var allBtns = menuElem.querySelectorAll('button');
						for (var k = 0; k < allBtns.length; k++) {
							allBtns[k].classList.remove('palette-item-selected');
						}
						target.classList.add('palette-item-selected');
						
						var endScreen = document.getElementById('end-screen');
						if (endScreen && endScreen.style.display !== 'none') {
							currentCategoryKey = catKey;
							challengeCategory = catKey;
						} else {
							NumberMode.showGallery(catKey, l10n);
						}
					}
					libraryPalette.popDown();
				});
			}
		},
		showCategoryForm: function (l10n, editingKey, editingCurrentName) {
			if (l10n) l10nRef = l10n;
			var gallery = document.getElementById('library-gallery');
			if (gallery) gallery.style.display = 'none';
			var gridCanvas = document.getElementById('gridCanvas');
			if (gridCanvas) gridCanvas.style.display = 'none';

			var idsToHide = ['mode-button', 'library-button', 'view-button', 'create-category-button', 'create-figure-minus-button', 'colors-button-fill', 'draw-button', 'erase-button', 'clear-button', 'stop-game-button'];
			for (var i = 0; i < idsToHide.length; i++) {
				var btn = document.getElementById(idsToHide[i]);
				if (btn) btn.style.display = 'none';
			}
			var actBtn = document.getElementById('activity-button');
			if (actBtn) actBtn.style.display = '';
			var netBtn = document.getElementById('network-button');
			if (netBtn) netBtn.style.display = '';
			var playBackBtn = document.getElementById('play-figure-back-button');
			if (playBackBtn) playBackBtn.style.display = 'none';
			var createBackBtn = document.getElementById('create-figure-back-button');
			if (createBackBtn) createBackBtn.style.display = 'none';

			var formScreen = document.getElementById('category-form-screen');
			if (!formScreen) return;
			formScreen.style.backgroundColor = buddyStrokeColor || '#005fe4';
			var barBlock = formScreen.querySelector('.category-form-bar-block');
			if (barBlock) barBlock.style.backgroundColor = buddyFillColor || '#ff2b34';

			var isEditing = !!editingKey;
			var titleEl = document.getElementById('category-form-title');
			var newTitleString = (l10nRef && l10nRef.get("NewTitle")) || "New Category";
			if (titleEl) titleEl.textContent = isEditing ? (editingCurrentName || editingKey) : newTitleString;
			var labelEl = document.getElementById('category-form-label');
			if (labelEl) labelEl.textContent = (l10nRef && l10nRef.get("Title")) || "Title";
			var confirmSpan = document.getElementById('category-confirm-span');
			if (confirmSpan) confirmSpan.textContent = (l10nRef && l10nRef.get("Confirm")) || "Confirm";
			var cancelSpan = document.getElementById('category-cancel-span');
			if (cancelSpan) cancelSpan.textContent = (l10nRef && l10nRef.get("Cancel")) || "Cancel";

			var inputEl = document.getElementById('category-title-input');
			var confirmBtn = document.getElementById('category-confirm-btn');
			var cancelBtn = document.getElementById('category-cancel-btn');

			if (inputEl && confirmBtn) {
				// pre-fill for edit, placeholder for new
				inputEl.value = isEditing ? (editingCurrentName || editingKey) : newTitleString;
				confirmBtn.disabled = true;

				var validateInput = function () {
					var val = inputEl.value;
					if (!val || val.trim() === '') {
						confirmBtn.disabled = true;
						return;
					}
					// editing: enable only if name changed
					if (isEditing) {
						var originalName = editingCurrentName || editingKey;
						if (val === originalName) {
							confirmBtn.disabled = true;
							return;
						}
						confirmBtn.disabled = false;
						return;
					}
					// new: reject placeholder or duplicate
					if (val === newTitleString) {
						confirmBtn.disabled = true;
						return;
					}
					var exists = false;
					var allCats = NumberMode.getAllCategories(l10nRef);
					for (var j = 0; j < allCats.length; j++) {
						if (allCats[j].name === val || allCats[j].key === val.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
							exists = true;
							break;
						}
					}
					confirmBtn.disabled = exists;
				};

				inputEl.oninput = validateInput;
				inputEl.onkeyup = validateInput;
				inputEl.onpropertychange = validateInput;

				confirmBtn.onclick = function (e) {
					if (e) {
						e.stopPropagation();
						e.preventDefault();
					}
					if (confirmBtn.disabled) return;
					var catName = inputEl.value.trim();
					if (!catName) return;
					if (isEditing) {
						NumberMode.confirmRenameCategory(editingKey, catName, l10nRef);
					} else {
						NumberMode.confirmAddCategory(catName, l10nRef);
					}
				};

				var formEl = document.getElementById('category-form');
				if (formEl) {
					formEl.onsubmit = function (e) {
						if (e) e.preventDefault();
						if (!confirmBtn.disabled) {
							confirmBtn.onclick();
						}
						return false;
					};
				}
			}

			if (cancelBtn) {
				cancelBtn.onclick = function (e) {
					if (e) e.stopPropagation();
					NumberMode.hideCategoryForm();
				};
			}

			formScreen.style.display = 'flex';
		},
		hideCategoryForm: function () {
			var formScreen = document.getElementById('category-form-screen');
			if (formScreen) formScreen.style.display = 'none';

			NumberMode.showGallery(currentCategoryKey, l10nRef);

			var createCatBtn = document.getElementById('create-category-button');
			if (createCatBtn && view === 'setting') createCatBtn.style.display = '';
			var viewBtn = document.getElementById('view-button');
			if (viewBtn) viewBtn.style.display = '';
			var libBtn = document.getElementById('library-button');
			if (libBtn) libBtn.style.display = '';
			var actBtn = document.getElementById('activity-button');
			if (actBtn) actBtn.style.display = '';
			var modeBtn = document.getElementById('mode-button');
			if (modeBtn) modeBtn.style.display = '';
			var netBtn = document.getElementById('network-button');
			if (netBtn) netBtn.style.display = '';
		},

		showFigureForm: function (defaultName, onConfirm, onCancel) {
			var formScreen = document.getElementById('figure-form-screen');
			if (!formScreen) return;
			formScreen.style.backgroundColor = buddyStrokeColor || '#005fe4';
			var barBlock = formScreen.querySelector('.category-form-bar-block');
			if (barBlock) barBlock.style.backgroundColor = buddyFillColor || '#ff2b34';

			var titleEl = document.getElementById('figure-form-title');
			if (titleEl) titleEl.textContent = (l10nRef && l10nRef.get("NewFigure")) || "New Figure";
			var labelEl = document.getElementById('figure-form-label');
			if (labelEl) labelEl.textContent = (l10nRef && l10nRef.get("Name")) || "Name";
			var confirmSpan = document.getElementById('figure-confirm-span');
			if (confirmSpan) confirmSpan.textContent = (l10nRef && l10nRef.get("Confirm")) || "Confirm";
			var cancelSpan = document.getElementById('figure-cancel-span');
			if (cancelSpan) cancelSpan.textContent = (l10nRef && l10nRef.get("Cancel")) || "Cancel";

			var inputEl = document.getElementById('figure-title-input');
			var confirmBtn = document.getElementById('figure-confirm-btn');
			var cancelBtn = document.getElementById('figure-cancel-btn');

			if (inputEl && confirmBtn) {
				inputEl.value = defaultName || '';
				confirmBtn.disabled = false;

				var validateInput = function () {
					var val = inputEl.value;
					if (!val || val.trim() === '') {
						confirmBtn.disabled = true;
					} else {
						confirmBtn.disabled = false;
					}
				};

				inputEl.oninput = validateInput;
				inputEl.onkeyup = validateInput;
				inputEl.onpropertychange = validateInput;

				confirmBtn.onclick = function (e) {
					if (e) {
						e.stopPropagation();
						e.preventDefault();
					}
					if (confirmBtn.disabled) return;
					var figName = inputEl.value.trim();
					if (!figName) return;
					formScreen.style.display = 'none';
					if (onConfirm) onConfirm(figName);
				};

				var formEl = document.getElementById('figure-form');
				if (formEl) {
					formEl.onsubmit = function (e) {
						if (e) e.preventDefault();
						if (!confirmBtn.disabled) {
							confirmBtn.onclick();
						}
						return false;
					};
				}
			}

			if (cancelBtn) {
				cancelBtn.onclick = function (e) {
					if (e) e.stopPropagation();
					formScreen.style.display = 'none';
					if (onCancel) onCancel();
				};
			}

			var gridCanvas = document.getElementById('gridCanvas');
			if (gridCanvas) gridCanvas.style.display = 'none';
			
			var backBtn = document.getElementById('create-figure-back-button');
			if (backBtn) backBtn.style.display = 'none';
			var minusBtn = document.getElementById('create-figure-minus-button');
			if (minusBtn) minusBtn.style.display = 'none';

			formScreen.style.display = 'flex';
		},

		confirmAddCategory: function (catName, l10n) {
			if (l10n) l10nRef = l10n;
			var key = catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
			if (!key) key = 'cat-' + Date.now();
			var origKey = key;
			var count = 1;
			while (libraries[key]) {
				key = origKey + '-' + count;
				count++;
			}
			categoryNames[key] = catName;
			libraries[key] = [];
			currentCategoryKey = key;

			var formScreen = document.getElementById('category-form-screen');
			if (formScreen) formScreen.style.display = 'none';

			NumberMode.showGallery(key, l10nRef, true);

			var createCatBtn = document.getElementById('create-category-button');
			if (createCatBtn && view === 'setting') createCatBtn.style.display = '';
			var viewBtn = document.getElementById('view-button');
			if (viewBtn) viewBtn.style.display = '';
			var libBtn = document.getElementById('library-button');
			if (libBtn) libBtn.style.display = '';
			var actBtn = document.getElementById('activity-button');
			if (actBtn) actBtn.style.display = '';
			var modeBtn = document.getElementById('mode-button');
			if (modeBtn) modeBtn.style.display = '';
			var netBtn = document.getElementById('network-button');
			if (netBtn) netBtn.style.display = '';
			NumberMode.updateLibraryMenu();
			broadcastUpdate();
		},
		confirmRenameCategory: function (oldKey, newName, l10n) {
			if (l10n) l10nRef = l10n;
			// update display name
			categoryNames[oldKey] = newName;
			if (currentCategoryKey === oldKey) {
				currentCategoryKey = oldKey;
			}

			var formScreen = document.getElementById('category-form-screen');
			if (formScreen) formScreen.style.display = 'none';

			NumberMode.showGallery(oldKey, l10nRef, true);

			var createCatBtn = document.getElementById('create-category-button');
			if (createCatBtn && view === 'setting') createCatBtn.style.display = '';
			var viewBtn = document.getElementById('view-button');
			if (viewBtn) viewBtn.style.display = '';
			var libBtn = document.getElementById('library-button');
			if (libBtn) libBtn.style.display = '';
			var actBtn = document.getElementById('activity-button');
			if (actBtn) actBtn.style.display = '';
			var modeBtn = document.getElementById('mode-button');
			if (modeBtn) modeBtn.style.display = '';
			var netBtn = document.getElementById('network-button');
			if (netBtn) netBtn.style.display = '';
			NumberMode.updateLibraryMenu();
			broadcastUpdate();
		},
		deleteCategory: function (categoryKey) {
			var allKeys = Object.keys(libraries);
			if (allKeys.length <= 1) return; // keep at least one
			if (!libraries[categoryKey]) return;

			delete libraries[categoryKey];
			if (categoryNames[categoryKey]) delete categoryNames[categoryKey];

			// switch to next available
			var remainingKeys = Object.keys(libraries);
			var nextKey = remainingKeys[0] || 'basic-shapes';
			currentCategoryKey = nextKey;

			NumberMode.updateLibraryMenu();
			NumberMode.showGallery(nextKey, l10nRef);
			broadcastUpdate();
		},
		showGallery: function (categoryKey, l10n, skipBroadcast) {
			if (l10n) l10nRef = l10n;
			if (categoryKey) currentCategoryKey = categoryKey;
			else categoryKey = currentCategoryKey;

			var gallery = document.getElementById('library-gallery');
			var header = document.getElementById('gallery-header');
			var grid = document.getElementById('gallery-grid');
			if (!gallery || !header || !grid) return;
			var gridCanvas = document.getElementById('gridCanvas');
			if (gridCanvas) gridCanvas.style.display = 'none';


			var playBackBtn = document.getElementById('play-figure-back-button');
			if (playBackBtn) playBackBtn.style.display = 'none';

			gallery.style.backgroundColor = buddyStrokeColor;
			header.style.backgroundColor = buddyFillColor;
			header.style.color = "#ffffff";

			var titleMap = {
				'basic-shapes': (l10nRef && l10nRef.get('BasicShapes')) || 'Basic Shapes',
				'objects': (l10nRef && l10nRef.get('Objects')) || 'Objects',
				'Numbers': (l10nRef && l10nRef.get('Numbers')) || 'Numbers',
				'Alphabets': (l10nRef && l10nRef.get('Alphabets')) || 'Alphabets',
				'Symbols / Signs': (l10nRef && l10nRef.get('Symbols / Signs')) || 'Symbols / Signs',
				'Tools': (l10nRef && l10nRef.get('Tools')) || 'Tools',
				'Home': (l10nRef && l10nRef.get('Home')) || 'Home'
			};
			// custom name takes priority over default
			var categoryDisplayName = categoryNames[categoryKey] || titleMap[categoryKey] || categoryKey || 'Basic Shapes';

			// rebuild header (add edit/delete in setting mode)
			header.innerHTML = '';
			header.style.display = 'flex';
			header.style.alignItems = 'center';
			header.style.justifyContent = 'center';
			header.style.gap = '10px';

			var titleSpan = document.createElement('span');
			titleSpan.className = 'gallery-header-title';
			titleSpan.textContent = categoryDisplayName;
			header.appendChild(titleSpan);

			if (view === 'setting') {
				var allCategoryKeys = Object.keys(libraries);

				// edit category name
				var editCatBtn = document.createElement('button');
				editCatBtn.className = 'gallery-header-edit-btn';
				editCatBtn.title = (l10nRef && l10nRef.get('Edit')) || 'Edit';
				editCatBtn.addEventListener('click', function (e) {
					e.stopPropagation();
					var currentName = titleSpan.textContent || categoryDisplayName;
					NumberMode.showCategoryForm(l10nRef, categoryKey, currentName);
				});
				header.appendChild(editCatBtn);

				var deleteCatBtn = document.createElement('button');
				deleteCatBtn.className = 'gallery-header-delete-btn';
				deleteCatBtn.title = (l10nRef && l10nRef.get('Delete')) || 'Delete';
				deleteCatBtn.disabled = (allCategoryKeys.length <= 1);
				deleteCatBtn.addEventListener('click', function (e) {
					e.stopPropagation();
					if (allCategoryKeys.length > 1) {
						NumberMode.deleteCategory(categoryKey);
					}
				});
				header.appendChild(deleteCatBtn);
			}

			grid.innerHTML = '';

			var items = libraries[categoryKey];
			if (!items && libraries['basic-shapes']) items = libraries['basic-shapes'];
			if (!items) items = [];
			items.forEach(function (drawing, index) {
				var card = document.createElement('div');
				card.className = 'gallery-card';

				if (view === 'setting') {
					var infoBar = document.createElement('div');
					infoBar.className = 'gallery-card-info-bar';

					var btnGroup = document.createElement('div');
					btnGroup.className = 'btn-group';

					var editBtn = document.createElement('button');
					editBtn.className = 'edit-btn';
					editBtn.title = (l10nRef && l10nRef.get('Edit')) || 'Edit';
					editBtn.addEventListener('click', function (e) {
						e.stopPropagation();
						NumberMode.startEditingFigure(index, drawing);
					});
					var deleteBtn = document.createElement('button');
					deleteBtn.className = 'delete-btn';
					deleteBtn.title = (l10nRef && l10nRef.get('Delete')) || 'Delete';
					deleteBtn.addEventListener('click', function (e) {
						e.stopPropagation();
						NumberMode.deleteFigure(categoryKey, index);
					});
					btnGroup.appendChild(editBtn);
					btnGroup.appendChild(deleteBtn);
					infoBar.appendChild(btnGroup);
					card.appendChild(infoBar);
				}

				var inner = document.createElement('div');
				inner.className = 'gallery-card-inner';

				var svg = NumberMode.createFigureThumbnail(drawing, buddyFillColor, buddyStrokeColor);
				if (svg) {
					svg.style.maxHeight = "205px";
					inner.appendChild(svg);
				}

				card.appendChild(inner);

				var titleLabel = document.createElement('div');
				titleLabel.className = 'gallery-title';
				titleLabel.textContent = (l10nRef && l10nRef.get(drawing.name)) || drawing.name;
				card.appendChild(titleLabel);

				card.addEventListener('click', function () {
					if (view === 'setting') return;
					NumberMode.selectDrawing(drawing, index);
				});

				grid.appendChild(card);
			});

			var footer = document.getElementById('gallery-footer');
			if (!footer) {
				footer = document.createElement('div');
				footer.id = 'gallery-footer';
				footer.className = 'gallery-footer';
				gallery.appendChild(footer);
			}
			footer.innerHTML = '';
			if (view === 'setting') {
				var addBtn = document.createElement('button');
				addBtn.className = 'btn-add-figure';
				addBtn.title = (l10nRef && l10nRef.get('AddFigure')) || 'Add Figure';
				addBtn.addEventListener('click', function (e) {
					e.stopPropagation();
					NumberMode.startCreatingFigure();
				});
				footer.appendChild(addBtn);
				footer.style.display = '';
			} else {
				footer.style.display = 'none';
			}

			gallery.style.display = '';
			if (!skipBroadcast) {
				broadcastUpdate();
			}
		},
		selectDrawing: function (drawing, index, skipBroadcast) {
			activeDrawingIndex = (index !== undefined) ? index : -1;
			var gridCanvas = document.getElementById('gridCanvas');
			if (gridCanvas) gridCanvas.style.display = '';
			currentDrawing = JSON.parse(JSON.stringify(drawing));
			if (buddyStrokeColor) currentDrawing.strokeColor = buddyStrokeColor;
			if (buddyFillColor) currentDrawing.fillColor = buddyFillColor;
			currentStep = 0;
			userStrokes = [];
			isFinished = false;
			if (challengeActive) {
				NumberMode.figureStartTime = Date.now();
			}
			for (var i = 0; i < dots.length; i++) {
				dots[i].insideClosedFigure = null;
			}
			var playBackBtn = document.getElementById('play-figure-back-button');
			if (playBackBtn) {
				playBackBtn.style.display = presence ? 'none' : '';
				playBackBtn.onclick = function () {
					NumberMode.backToGallery();
				};
			}
			var gallery = document.getElementById('library-gallery');
			if (gallery) gallery.style.display = 'none';
			if (!skipBroadcast) broadcastUpdate();
		},
		onMouseDown: function (mouseX, mouseY) {
			isDrawing = true;
			currMouseX = mouseX;
			currMouseY = mouseY;
			if (isCreatingFigure) {
				for (var i = 0; i < dots.length; i++) {
					var dot = dots[i];
					var dx = mouseX - dot.x;
					var dy = mouseY - dot.y;
					if (Math.sqrt(dx * dx + dy * dy) < 22.5) {
						NumberMode.addCreationDot(dot);
						break;
					}
				}
				return;
			}

			var totalPts = currentDrawing && currentDrawing.points ? currentDrawing.points.length : 0;
			var targetIdx = (currentStep === totalPts && currentDrawing && currentDrawing.closed) ? 0 : (currentStep < totalPts ? currentStep : -1);
			var ptIdx = findHoveredPointIndex(mouseX, mouseY, targetIdx);
			if (ptIdx !== -1) {
				tryConnectPoint(ptIdx);
			}
		},
		onMouseMove: function (mouseX, mouseY) {
			if (!isDrawing) return;
			currMouseX = mouseX;
			currMouseY = mouseY;
			if (isCreatingFigure) {
				if (!isFinished) {
					for (var i = 0; i < dots.length; i++) {
						var dot = dots[i];
						var dx = mouseX - dot.x;
						var dy = mouseY - dot.y;
						if (Math.sqrt(dx * dx + dy * dy) < 22.5) {
							NumberMode.addCreationDot(dot);
							break;
						}
					}
				}
				return;
			}
			var totalPts = currentDrawing && currentDrawing.points ? currentDrawing.points.length : 0;
			var targetIdx = (currentStep === totalPts && currentDrawing && currentDrawing.closed) ? 0 : (currentStep < totalPts ? currentStep : -1);
			var ptIdx = findHoveredPointIndex(mouseX, mouseY, targetIdx);
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
						if (!isCreatingFigure) {
							triggerConfetti();
							var timeTaken = 0;
							if (NumberMode.figureStartTime) {
								timeTaken = Math.round((Date.now() - NumberMode.figureStartTime) / 1000);
							}
							setTimeout(function() {
								NumberMode.reportChallengeFinish(currentDrawing, timeTaken);
							}, 1000);
						}
					}
				}
				if (currentDrawing.closed || currentDrawing.forceFill) {
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
				if (isDrawing && currentStep > 0 && currMouseX !== -1000 && (!isCreatingFigure || !isFinished)) {
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

			var dotCounts = [];
			for (var k = 0; k < currentDrawing.points.length; k++) {
				var pt = currentDrawing.points[k];
				var dot = getDotByIndex(pt[0], pt[1]);
				if (dot) {
					var found = false;
					for (var i = 0; i < dotCounts.length; i++) {
						if (dotCounts[i].dot === dot) {
							dotCounts[i].total++;
							found = true;
							break;
						}
					}
					if (!found) {
						dotCounts.push({ dot: dot, total: 1, current: 0 });
					}
				}
			}

			for (var k = 0; k < currentDrawing.points.length; k++) {
				var pt = currentDrawing.points[k];
				var dot = getDotByIndex(pt[0], pt[1]);
				if (dot) {
					var dotInfo = null;
					for (var i = 0; i < dotCounts.length; i++) {
						if (dotCounts[i].dot === dot) {
							dotInfo = dotCounts[i];
							break;
						}
					}

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

					var textX = dot.x;
					var textY = dot.y - offsetY;

					if (dotInfo && dotInfo.total > 1) {
						var startAngle = (dotInfo.total === 2) ? Math.PI : -(Math.PI * 3 / 4);
						var angle = (2 * Math.PI / dotInfo.total) * dotInfo.current + startAngle;
						var radius = offsetY * Math.SQRT2;
						
						// Expand radius slightly for many points to prevent overlap
						if (dotInfo.total > 6) {
							radius += (dotInfo.total - 6) * 4;
						}
						
						textX = dot.x + Math.cos(angle) * radius;
						textY = dot.y + Math.sin(angle) * radius;
						dotInfo.current++;
					}

					ctx.fillText(k + 1, textX, textY);
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
		clear: function (skipBroadcast) {
			if (isCreatingFigure && currentDrawing) {
				currentDrawing.points = [];
				currentStep = 0;
				userStrokes = [];
				isFinished = false;
				currentDrawing.closed = false;
				for (var i = 0; i < dots.length; i++) {
					dots[i].insideClosedFigure = null;
				}
				if (!skipBroadcast) broadcastUpdate();
				return;
			}
			if (currentDrawing != null) {
				currentStep = 0;
				userStrokes = [];
				isFinished = false;
				for (var i = 0; i < dots.length; i++) {
					dots[i].insideClosedFigure = null;
				}
				if (!skipBroadcast) broadcastUpdate();
				return;
			}
			var gallery = document.getElementById('library-gallery');
			if (gallery && gallery.style.display === 'none') {
				NumberMode.showGallery(currentCategoryKey, l10nRef, skipBroadcast);
			}
		},
		startCreatingFigure: function () {
			activeDrawingIndex = -1;
			isCreatingFigure = true;
			var playBackBtn = document.getElementById('play-figure-back-button');
			if (playBackBtn) playBackBtn.style.display = 'none';
			currentDrawing = {
				name: 'New Figure',
				points: [],
				closed: false,
				strokeColor: buddyStrokeColor,
				fillColor: buddyFillColor
			};
			currentStep = 0;
			userStrokes = [];
			isFinished = false;
			for (var i = 0; i < dots.length; i++) {
				dots[i].insideClosedFigure = null;
			}
			var gallery = document.getElementById('library-gallery');
			if (gallery) gallery.style.display = 'none';

			var gridCanvas = document.getElementById('gridCanvas');
			if (gridCanvas) gridCanvas.style.display = '';

			var idsToHide = ['mode-button', 'library-button', 'view-button', 'create-category-button', 'colors-button-fill', 'draw-button', 'erase-button', 'clear-button', 'stop-game-button'];
			for (var i = 0; i < idsToHide.length; i++) {
				var el = document.getElementById(idsToHide[i]);
				if (el) el.style.display = 'none';
			}
			var elNet = document.getElementById('network-button'); if (elNet) elNet.style.display = '';
			var elFull = document.getElementById('fullscreen-button'); if (elFull) elFull.style.display = '';
			var elHelp = document.getElementById('help-button'); if (elHelp) elHelp.style.display = '';

			var backBtn = document.getElementById('create-figure-back-button');
			var minusBtn = document.getElementById('create-figure-minus-button');
			if (backBtn) {
				backBtn.style.display = '';
				backBtn.onclick = function () {
					if (currentDrawing && currentDrawing.points && currentDrawing.points.length >= 2) {
						var defaultName = 'Figure ' + ((libraries[currentCategoryKey] ? libraries[currentCategoryKey].length : 0) + 1);
						if (l10nRef && l10nRef.get('Figure')) {
							defaultName = l10nRef.get('Figure') + ' ' + ((libraries[currentCategoryKey] ? libraries[currentCategoryKey].length : 0) + 1);
						}
						NumberMode.showFigureForm(defaultName, function (name) {
							if (activeDrawingIndex >= 0 && libraries[currentCategoryKey] && libraries[currentCategoryKey][activeDrawingIndex]) {
								libraries[currentCategoryKey][activeDrawingIndex].name = name;
								libraries[currentCategoryKey][activeDrawingIndex].points = currentDrawing.points;
								libraries[currentCategoryKey][activeDrawingIndex].closed = currentDrawing.closed;
							} else {
								NumberMode.addFigure(currentCategoryKey, name, currentDrawing.points, currentDrawing.closed, true);
							}
							NumberMode.stopCreatingFigure();
						}, function () {
							var gridCanvas = document.getElementById('gridCanvas');
							if (gridCanvas) gridCanvas.style.display = '';
							if (backBtn) backBtn.style.display = '';
							if (minusBtn) minusBtn.style.display = '';
						});
					} else {
						NumberMode.stopCreatingFigure();
					}
				};
			}
			if (minusBtn) {
				minusBtn.style.display = '';
				minusBtn.onclick = function () {
					NumberMode.removeRecentCreationDot();
				};
			}
			broadcastUpdate();
		},
		startEditingFigure: function (index, drawing) {
			if (!drawing) return;
			activeDrawingIndex = (index !== undefined && index !== null) ? index : -1;
			isCreatingFigure = true;
			var playBackBtn = document.getElementById('play-figure-back-button');
			if (playBackBtn) playBackBtn.style.display = 'none';

			currentDrawing = JSON.parse(JSON.stringify(drawing));
			if (buddyStrokeColor) currentDrawing.strokeColor = buddyStrokeColor;
			if (buddyFillColor) currentDrawing.fillColor = buddyFillColor;

			userStrokes = [];
			var pts = currentDrawing.points || [];
			for (var j = 1; j < pts.length; j++) {
				var prevDot = getDotByIndex(pts[j - 1][0], pts[j - 1][1]);
				var currDot = getDotByIndex(pts[j][0], pts[j][1]);
				if (prevDot && currDot) {
					userStrokes.push({ from: prevDot, to: currDot, dots: getDotsOnSegment(prevDot, currDot) });
				}
			}
			if (currentDrawing.closed && pts.length >= 3) {
				var lastDot = getDotByIndex(pts[pts.length - 1][0], pts[pts.length - 1][1]);
				var firstDot = getDotByIndex(pts[0][0], pts[0][1]);
				if (lastDot && firstDot) {
					userStrokes.push({ from: lastDot, to: firstDot, dots: getDotsOnSegment(lastDot, firstDot) });
					currentDrawing.closePt = firstDot;
				}
			}

			currentStep = pts.length;
			isFinished = !!currentDrawing.closed;
			if (currentDrawing.closed) {
				currentDrawing.fillProgress = 1500;
			}
			for (var i = 0; i < dots.length; i++) {
				dots[i].insideClosedFigure = null;
			}

			var gallery = document.getElementById('library-gallery');
			if (gallery) gallery.style.display = 'none';

			var gridCanvas = document.getElementById('gridCanvas');
			if (gridCanvas) gridCanvas.style.display = '';

			var idsToHide = ['mode-button', 'library-button', 'view-button', 'create-category-button', 'colors-button-fill', 'draw-button', 'erase-button', 'clear-button', 'stop-game-button'];
			for (var i = 0; i < idsToHide.length; i++) {
				var el = document.getElementById(idsToHide[i]);
				if (el) el.style.display = 'none';
			}
			var elNet = document.getElementById('network-button'); if (elNet) elNet.style.display = '';
			var elFull = document.getElementById('fullscreen-button'); if (elFull) elFull.style.display = '';
			var elHelp = document.getElementById('help-button'); if (elHelp) elHelp.style.display = '';

			var backBtn = document.getElementById('create-figure-back-button');
			var minusBtn = document.getElementById('create-figure-minus-button');
			if (backBtn) {
				backBtn.style.display = '';
				backBtn.onclick = function () {
					if (currentDrawing && currentDrawing.points && currentDrawing.points.length >= 2) {
						var defaultName = currentDrawing.name || ('Figure ' + ((libraries[currentCategoryKey] ? libraries[currentCategoryKey].length : 0) + 1));
						NumberMode.showFigureForm(defaultName, function (name) {
							if (activeDrawingIndex >= 0 && libraries[currentCategoryKey] && libraries[currentCategoryKey][activeDrawingIndex]) {
								libraries[currentCategoryKey][activeDrawingIndex].name = name;
								libraries[currentCategoryKey][activeDrawingIndex].points = currentDrawing.points;
								libraries[currentCategoryKey][activeDrawingIndex].closed = currentDrawing.closed;
							} else {
								NumberMode.addFigure(currentCategoryKey, name, currentDrawing.points, currentDrawing.closed, true);
							}
							NumberMode.stopCreatingFigure();
						}, function () {
							var gridCanvas = document.getElementById('gridCanvas');
							if (gridCanvas) gridCanvas.style.display = '';
							if (backBtn) backBtn.style.display = '';
							if (minusBtn) minusBtn.style.display = '';
						});
					} else {
						NumberMode.stopCreatingFigure();
					}
				};
			}
			if (minusBtn) {
				minusBtn.style.display = '';
				minusBtn.onclick = function () {
					NumberMode.removeRecentCreationDot();
				};
			}
			broadcastUpdate();
		},
		stopCreatingFigure: function () {
			isCreatingFigure = false;
			activeDrawingIndex = -1;
			currentDrawing = null;
			currentStep = 0;
			userStrokes = [];
			isFinished = false;
			for (var i = 0; i < dots.length; i++) {
				dots[i].insideClosedFigure = null;
			}
			var backBtn = document.getElementById('create-figure-back-button');
			var minusBtn = document.getElementById('create-figure-minus-button');
			var playBackBtn = document.getElementById('play-figure-back-button');
			if (backBtn) backBtn.style.display = 'none';
			if (minusBtn) minusBtn.style.display = 'none';
			if (playBackBtn) playBackBtn.style.display = 'none';

			var elMode = document.getElementById('mode-button'); if (elMode) elMode.style.display = '';
			var elNet = document.getElementById('network-button'); if (elNet) elNet.style.display = '';
			var elView = document.getElementById('view-button'); if (elView) elView.style.display = presence ? 'none' : '';
			var elLib = document.getElementById('library-button'); if (elLib) elLib.style.display = '';
			var elFull = document.getElementById('fullscreen-button'); if (elFull) elFull.style.display = '';
			var elHelp = document.getElementById('help-button'); if (elHelp) elHelp.style.display = '';

			NumberMode.setView('setting', true);
			var gallery = document.getElementById('library-gallery');
			if (gallery) {
				NumberMode.showGallery(currentCategoryKey, l10nRef, true);
			}
			broadcastUpdate();
		},
		addCreationDot: function (dot) {
			if (!isCreatingFigure || !currentDrawing || isFinished) return;
			var col = dot.col !== undefined ? dot.col : Math.round((dot.baseX - ((900 - 14 * 50) / 2)) / 50);
			var row = dot.row !== undefined ? dot.row : Math.round((dot.baseY - ((748 - 12 * 50) / 2)) / 50);
			var pts = currentDrawing.points;
			if (pts.length === 0) {
				pts.push([col, row]);
				currentStep = 1;
				broadcastUpdate();
				return;
			}
			var lastPt = pts[pts.length - 1];
			if (lastPt[0] === col && lastPt[1] === row) return;

			var firstPt = pts[0];
			if (pts.length >= 3 && firstPt[0] === col && firstPt[1] === row) {
				var prevDot = getDotByIndex(lastPt[0], lastPt[1]);
				if (prevDot && dot) {
					userStrokes.push({ from: prevDot, to: dot, dots: getDotsOnSegment(prevDot, dot) });
				}
				currentDrawing.closed = true;
				isFinished = true;
				currentDrawing.fillProgress = 0;
				currentDrawing.closePt = dot;
				broadcastUpdate();
				return;
			}

			var prevDot = getDotByIndex(lastPt[0], lastPt[1]);
			pts.push([col, row]);
			if (prevDot && dot) {
				userStrokes.push({ from: prevDot, to: dot, dots: getDotsOnSegment(prevDot, dot) });
			}
			currentStep++;
			broadcastUpdate();
		},
		removeRecentCreationDot: function () {
			if (!isCreatingFigure || !currentDrawing || !currentDrawing.points || currentDrawing.points.length === 0) return;
			if (currentDrawing.closed) {
				currentDrawing.closed = false;
				isFinished = false;
				if (userStrokes.length > 0) userStrokes.pop();
				for (var i = 0; i < dots.length; i++) {
					dots[i].insideClosedFigure = null;
				}
				broadcastUpdate();
				return;
			}
			if (userStrokes.length > 0) userStrokes.pop();
			if (currentDrawing.points.length > 0) currentDrawing.points.pop();
			if (currentStep > 0) currentStep--;
			if (currentDrawing.points.length === 0) {
				currentStep = 0;
			}
			for (var i = 0; i < dots.length; i++) {
				dots[i].insideClosedFigure = null;
			}
			broadcastUpdate();
		},
		stopDrawing: function () {
			isDrawing = false;
		},
		serialize: function () {
			return {
				currentDrawing: currentDrawing,
				currentStep: currentStep,
				isFinished: isFinished,
				isCreatingFigure: isCreatingFigure,
				activeDrawingIndex: activeDrawingIndex,
				currentCategoryKey: currentCategoryKey,
				challengeCategory: challengeCategory,
				challengeIndex: challengeIndex,
				view: isCreatingFigure ? 'setting' : 'play',
				libraries: libraries,
				categoryNames: categoryNames
			};
		},
		deserialize: function (data, isNetworkInit) {
			
			if (!data) return;
			if (data.libraries) {
				libraries = data.libraries;
				if (typeof initialDataSet !== 'undefined') {
					for (var cat in initialDataSet) {
						if (!libraries[cat]) {
							libraries[cat] = JSON.parse(JSON.stringify(initialDataSet[cat]));
						}
					}
				}
			}
			if (data.categoryNames) {
				categoryNames = data.categoryNames;
			}
			if (data.currentCategoryKey) {
				currentCategoryKey = data.currentCategoryKey;
			}
			if (data.challengeCategory) {
				challengeCategory = data.challengeCategory;
			} else if (data.currentCategoryKey) {
				challengeCategory = data.currentCategoryKey;
			}

			if (isNetworkInit) {
				if (libraries && libraries[currentCategoryKey] && libraries[currentCategoryKey].length > 0) {
					NumberMode.selectDrawing(libraries[currentCategoryKey][0], 0, true);
				}
				if (data.view && data.view !== view) {
					if (!(data.view === 'leaderboard' && challengeActive)) {
						NumberMode.setView(data.view, true);
					}
				}
				return;
			}

			if (data.activeDrawingIndex !== undefined) {
				activeDrawingIndex = data.activeDrawingIndex;
			}
			if (data.challengeIndex !== undefined) {
				challengeIndex = data.challengeIndex;
			} else if (data.activeDrawingIndex !== undefined) {
				challengeIndex = data.activeDrawingIndex;
			}
			if (data.view && data.view !== view) {
				if (!(data.view === 'leaderboard' && challengeActive)) {
					var targetView = data.view;
					if (!isNetworkInit && targetView === 'setting') {
						targetView = 'play';
					}
					NumberMode.setView(targetView, true);
				}
			}
			isCreatingFigure = isNetworkInit ? !!data.isCreatingFigure : false;

			if (data.currentDrawing && (!data.isCreatingFigure || isNetworkInit)) {
				currentDrawing = data.currentDrawing;
				if (buddyStrokeColor) currentDrawing.strokeColor = buddyStrokeColor;
				if (buddyFillColor) currentDrawing.fillColor = buddyFillColor;
				currentStep = data.currentStep || 0;
				isFinished = !!data.isFinished;

				var gallery = document.getElementById('library-gallery');
				if (gallery) gallery.style.display = 'none';
				var formScreen = document.getElementById('category-form-screen');
				if (formScreen) formScreen.style.display = 'none';
				var gridCanvas = document.getElementById('gridCanvas');
				if (gridCanvas) gridCanvas.style.display = '';

				var playBackBtn = document.getElementById('play-figure-back-button');
				var backBtn = document.getElementById('create-figure-back-button');
				var minusBtn = document.getElementById('create-figure-minus-button');

				if (isCreatingFigure) {
					var idsToHide = ['mode-button', 'library-button', 'view-button', 'create-category-button', 'colors-button-fill', 'draw-button', 'erase-button', 'clear-button', 'stop-game-button'];
					for (var i = 0; i < idsToHide.length; i++) {
						var el = document.getElementById(idsToHide[i]);
						if (el) el.style.display = 'none';
					}
					var elNet = document.getElementById('network-button'); if (elNet) elNet.style.display = '';
					var elFull = document.getElementById('fullscreen-button'); if (elFull) elFull.style.display = '';
					var elHelp = document.getElementById('help-button'); if (elHelp) elHelp.style.display = '';

					if (playBackBtn) playBackBtn.style.display = 'none';
					if (backBtn) {
						backBtn.style.display = '';
						backBtn.onclick = function () {
							if (currentDrawing && currentDrawing.points && currentDrawing.points.length >= 2) {
								var defaultName = currentDrawing.name || ('Figure ' + ((libraries[currentCategoryKey] ? libraries[currentCategoryKey].length : 0) + 1));
								if (activeDrawingIndex >= 0 && libraries[currentCategoryKey] && libraries[currentCategoryKey][activeDrawingIndex]) {
									libraries[currentCategoryKey][activeDrawingIndex].name = defaultName;
									libraries[currentCategoryKey][activeDrawingIndex].points = currentDrawing.points;
									libraries[currentCategoryKey][activeDrawingIndex].closed = currentDrawing.closed;
								} else {
									NumberMode.addFigure(currentCategoryKey, defaultName, currentDrawing.points, currentDrawing.closed, true);
								}
							}
							NumberMode.stopCreatingFigure();
						};
					}
					if (minusBtn) {
						minusBtn.style.display = '';
						minusBtn.onclick = function () {
							NumberMode.removeRecentCreationDot();
						};
					}
				} else {
					var idsToShow = ['network-button'];
					if (!presence || isHost) {
						idsToShow.push('mode-button');
						idsToShow.push('library-button');
					}
					if (!presence) idsToShow.push('view-button');
					else if (isHost) idsToShow.push('timer-button');
					for (var i = 0; i < idsToShow.length; i++) {
						var el = document.getElementById(idsToShow[i]);
						if (el) el.style.display = '';
					}
					var createCatBtn = document.getElementById('create-category-button');
					if (createCatBtn) createCatBtn.style.display = (view === 'setting') ? '' : 'none';

					if (backBtn) backBtn.style.display = 'none';
					if (minusBtn) minusBtn.style.display = 'none';
					if (playBackBtn) {
						playBackBtn.style.display = (view === 'play' && !presence) ? '' : 'none';
						playBackBtn.onclick = function () {
							NumberMode.backToGallery();
						};
					}
				}

				for (var i = 0; i < dots.length; i++) {
					dots[i].insideClosedFigure = null;
				}
				userStrokes = [];
				var pts = currentDrawing.points || [];
				var maxSegs = isCreatingFigure ? (pts.length - 1) : Math.min(currentStep - 1, pts.length - 1);
				for (var j = 1; j <= maxSegs; j++) {
					var prevDot = getDotByIndex(pts[j - 1][0], pts[j - 1][1]);
					var currDot = getDotByIndex(pts[j][0], pts[j][1]);
					if (prevDot && currDot) {
						userStrokes.push({ from: prevDot, to: currDot, dots: getDotsOnSegment(prevDot, currDot) });
					}
				}
				if (isFinished && currentDrawing.closed && pts.length >= 3) {
					var lastDot = getDotByIndex(pts[pts.length - 1][0], pts[pts.length - 1][1]);
					var firstDot = getDotByIndex(pts[0][0], pts[0][1]);
					if (lastDot && firstDot) {
						userStrokes.push({ from: lastDot, to: firstDot, dots: getDotsOnSegment(lastDot, firstDot) });
						currentDrawing.closePt = firstDot;
					}
				}
				if (isFinished && currentDrawing.closed) {
					currentDrawing.fillProgress = 1500;
				}
			} else {
				currentDrawing = null;
				currentStep = 0;
				userStrokes = [];
				isFinished = false;
				for (var i = 0; i < dots.length; i++) {
					dots[i].insideClosedFigure = null;
				}
				var playBackBtn = document.getElementById('play-figure-back-button');
				if (playBackBtn) playBackBtn.style.display = 'none';
				var backBtn = document.getElementById('create-figure-back-button');
				if (backBtn) backBtn.style.display = 'none';
				var minusBtn = document.getElementById('create-figure-minus-button');
				if (minusBtn) minusBtn.style.display = 'none';

				if (!isCreatingFigure) {
					var idsToShow = ['network-button'];
					if (!presence || isHost) {
						idsToShow.push('mode-button');
						idsToShow.push('library-button');
					}
					if (!presence) idsToShow.push('view-button');
					else if (isHost) idsToShow.push('timer-button');
					for (var i = 0; i < idsToShow.length; i++) {
						var el = document.getElementById(idsToShow[i]);
						if (el) el.style.display = '';
					}
					var createCatBtn = document.getElementById('create-category-button');
					if (createCatBtn) createCatBtn.style.display = (view === 'setting') ? '' : 'none';
				}

				var gallery = document.getElementById('library-gallery');
				if (gallery) {
					NumberMode.showGallery(currentCategoryKey, l10nRef, true);
				}
			}
		},
		createFigureThumbnail: function (drawing, fill, stroke) {
			var minCol = 15, maxCol = 0, minRow = 13, maxRow = 0;
			if (drawing && drawing.points) {
				drawing.points.forEach(function (pt) {
					if (pt[0] < minCol) minCol = pt[0];
					if (pt[0] > maxCol) maxCol = pt[0];
					if (pt[1] < minRow) minRow = pt[1];
					if (pt[1] > maxRow) maxRow = pt[1];
				});
			}

			var vBoxW = (maxCol - minCol) + 2, vBoxH = (maxRow - minRow) + 2;
			var svgNS = "http://www.w3.org/2000/svg";
			var svg = document.createElementNS(svgNS, "svg");
			svg.setAttribute("viewBox", (minCol - 1) + " " + (minRow - 1) + " " + vBoxW + " " + vBoxH);
			svg.style.width = "82%";
			svg.style.height = "82%";

			if (drawing && drawing.points && drawing.points.length > 0) {
				var shapeEl = document.createElementNS(svgNS, drawing.closed ? "polygon" : "polyline");
				var attrs = {
					points: drawing.points.map(function (pt) { return pt[0] + "," + pt[1]; }).join(" "),
					fill: (drawing.closed || drawing.forceFill) ? (fill || drawing.fillColor || "#ffcccc") : "none",
					stroke: stroke || drawing.strokeColor || "#cc0000",
					"stroke-width": Math.max(vBoxW, vBoxH) * 0.06,
					"stroke-linecap": "round",
					"stroke-linejoin": "round"
				};
				for (var k in attrs) shapeEl.setAttribute(k, attrs[k]);
				svg.appendChild(shapeEl);
			}
			return svg;
		},
		initNetwork: function(presenceObj, hostFlag, activityObj) {
			presence = presenceObj;
			isHost = hostFlag;
			NumberMode.activity = activityObj;
			if (presence) {
				var viewBtn = document.getElementById('view-button');
				if (viewBtn) viewBtn.style.display = 'none';
				var createCatBtn = document.getElementById('create-category-button');
				if (createCatBtn) createCatBtn.style.display = 'none';
				if (!isHost) {
					var modeBtn = document.getElementById('mode-button');
					if (modeBtn) modeBtn.style.display = 'none';
					var libBtn = document.getElementById('library-button');
					if (libBtn) libBtn.style.display = 'none';
				}
				var timerBtn = document.getElementById('timer-button');
				if (timerBtn && isHost && isActiveMode) timerBtn.style.display = '';
				
				var playBackBtn = document.getElementById('play-figure-back-button');
				if (playBackBtn) playBackBtn.style.display = 'none';

				if (view === 'setting') {
					NumberMode.setView('play', true);
				}
			}
		},
		activate: function() {
			isActiveMode = true;
			if (!isCreatingFigure && view === 'setting') {
				NumberMode.setView('play', true);
			}
			var idsToShow = [];
			if (!presence || isHost) {
				idsToShow.push('library-button');
			}
			if (!presence) idsToShow.push('view-button');
			else if (isHost) idsToShow.push('timer-button');
			for (var i = 0; i < idsToShow.length; i++) {
				var el = document.getElementById(idsToShow[i]);
				if (el) el.style.display = '';
			}
			var createCatBtn = document.getElementById('create-category-button');
			if (createCatBtn) createCatBtn.style.display = (view === 'setting') ? '' : 'none';
			
			if (!timerPal) {
				var timerButton = document.getElementById("timer-button");
				if (timerButton) {
					timerPal = new timerPalette.TimerPalette(timerButton, undefined);
					timerPal.addEventListener('timer-selected', function(e) {
						var durations = [0, 60, 120, 300];
						var duration = durations[e.index];
						challengeDuration = duration;
						var endScreen = document.getElementById('end-screen');
						if (endScreen && endScreen.style.display !== 'none') {
							// update the duration (wait for Restart)
						} else {
							if (presence) {
								presence.sendMessage(presence.getSharedInfo().id, {
									user: presence.getUserInfo(),
									content: {
										action: 'timer-selected',
										duration: duration
									}
								});
							}
							NumberMode.startChallenge(duration, false);
						}
					});
				}
				var btnSeeLeaderboard = document.getElementById('btn-see-leaderboard');
				if (btnSeeLeaderboard) {
					btnSeeLeaderboard.addEventListener('click', function() {
						NumberMode.showLeaderboard(true);
					});
				}
				var btnRestart = document.getElementById('btn-restart-challenge');
				if (btnRestart) {
					btnRestart.addEventListener('click', function() {
						if (presence) {
							presence.sendMessage(presence.getSharedInfo().id, {
								user: presence.getUserInfo(),
								content: {
									action: 'restart-challenge',
									duration: challengeDuration,
									category: currentCategoryKey
								}
							});
						}
						NumberMode.startChallenge(challengeDuration, false);
					});
				}
			}
		},
		deactivate: function() {
			isActiveMode = false;
			var idsToHide = ['library-button', 'view-button', 'create-category-button', 'timer-button', 'stop-game-button'];
			for (var i = 0; i < idsToHide.length; i++) {
				var el = document.getElementById(idsToHide[i]);
				if (el) el.style.display = 'none';
			}
			if (timerPal) {
				timerPal.popDown();
			}
		},
		getSharedState: function() {
			return {
				challengeActive: challengeActive,
				challengeRemaining: challengeRemaining,
				challengeDuration: typeof challengeDuration !== 'undefined' ? challengeDuration : 120,
				challengeScores: challengeScores,
				currentChallengeScore: currentChallengeScore,
				completedFigures: completedFigures
			};
		},
		setChallengeScores: function(scores) {
			challengeScores = scores;
		},
		setCurrentChallengeScore: function(score) {
			currentChallengeScore = score;
		},
		setCompletedFigures: function(figures) {
			completedFigures = figures || [];
		},
		handleNetworkMessage: function(msg) {
			switch (msg.content.action) {
				case 'timer-selected':
					if (msg.content.duration === 0) {
						NumberMode.stopChallenge();
					} else {
						NumberMode.startChallenge(msg.content.duration, false);
					}
					break;
				case 'stop-shared-game':
					if (challengeActive) {
						NumberMode.endChallenge();
					}
					break;
					case 'finish-challenge':
					var found = false;
					for (var i = 0; i < challengeScores.length; i++) {
						if (challengeScores[i].user.networkId === msg.user.networkId) {
							challengeScores[i].score = Math.max(challengeScores[i].score, msg.content.score);
							found = true; break;
						}
					}
					if (!found) {
						challengeScores.push({ user: msg.user, score: msg.content.score });
					}
					if (!challengeActive) {
						NumberMode.showLeaderboard(false);
					}
					break;
				case 'figure-completed':
					if (!challengeActive) return;
					var found = false;
					for (var i = 0; i < challengeScores.length; i++) {
						if (challengeScores[i].user.networkId === msg.user.networkId) {
							challengeScores[i].score += msg.content.score;
							found = true; break;
						}
					}
					if (!found) {
						challengeScores.push({ user: msg.user, score: msg.content.score });
					}
					var endScreen = document.getElementById('end-screen');
					if (endScreen && endScreen.style.display !== 'none') {
						NumberMode.showLeaderboard(false);
					}
					var screen = document.getElementById('leaderboard-screen');
					if (screen && screen.style.display !== 'none') {
						NumberMode.showLeaderboard(true);
					}
					break;
				case 'restart-challenge':
					if (msg.content.category) {
						currentCategoryKey = msg.content.category;
					}
					var newDuration = msg.content.duration !== undefined ? msg.content.duration : challengeDuration;
					NumberMode.startChallenge(newDuration, false);
					break;
			}
		},
		formatTime: function(secs) {
			var m = Math.floor(secs / 60);
			var s = secs % 60;
			if (m < 10) m = "0" + m;
			if (s < 10) s = "0" + s;
			return m + ":" + s;
		},
		updateTimerDisplay: function() {
			var d = document.getElementById('timer-display');
			if (d) {
				if (challengeDuration === 0) {
					d.textContent = "Score: " + currentChallengeScore;
				} else {
					d.textContent = NumberMode.formatTime(challengeRemaining) + " | Score: " + currentChallengeScore;
				}
			}
		},
		startChallenge: function(duration, skipInit) {
			challengeDuration = duration;
			
			var btnSeeLeaderboard = document.getElementById('btn-see-leaderboard');
			if (btnSeeLeaderboard) btnSeeLeaderboard.style.display = 'none';
			var btnRestart = document.getElementById('btn-restart-challenge');
			if (btnRestart) btnRestart.style.display = 'none';
			
			var endScreen = document.getElementById('end-screen');
			if (endScreen) endScreen.style.display = 'none';
			var ldScreen = document.getElementById('leaderboard-screen');
			if (ldScreen) ldScreen.style.display = 'none';
			
			challengeRemaining = duration;
			challengeScores = [];
			currentChallengeScore = 0;
			completedFigures = [];

			var display = document.getElementById('timer-display');
			if (display) display.style.display = 'block';

			if (presence && isHost) {
				var stopGameBtn = document.getElementById('stop-game-button');
				if (stopGameBtn) {
					stopGameBtn.style.display = '';
					stopGameBtn.disabled = false;
					stopGameBtn.onclick = function() {
						if (presence && isHost && challengeActive) {
							presence.sendMessage(presence.getSharedInfo().id, {
								user: presence.getUserInfo(),
								content: {
									action: 'stop-shared-game'
								}
							});
							NumberMode.endChallenge();
						}
					};
				}
			}

			NumberMode.updateTimerDisplay();
			
			if (challengeInterval) clearInterval(challengeInterval);
			if (duration > 0) {
				challengeInterval = setInterval(function () {
					challengeRemaining--;
					if (challengeRemaining < 0) challengeRemaining = 0;
					NumberMode.updateTimerDisplay();
					if (challengeRemaining <= 0) {
						clearInterval(challengeInterval);
						challengeRemaining = 0;
						NumberMode.endChallenge();
					}
				}, 1000);
			}

			NumberMode.onChallengeStarted(duration, skipInit);
		},
		stopChallenge: function() {
			challengeRemaining = 0;
			if (challengeInterval) clearInterval(challengeInterval);
			var display = document.getElementById('timer-display');
			if (display) display.style.display = 'none';
			

			var stopGameBtn = document.getElementById('stop-game-button');
			if (stopGameBtn) stopGameBtn.disabled = true;
			NumberMode.onChallengeStopped();
		},
		endChallenge: function() {
			NumberMode.stopChallenge();
			NumberMode.reportChallengeFinish(true);
		},
		reportChallengeFinish: function(drawing, timeTaken) {
			if (!challengeActive && drawing !== true) return;
			
			if (drawing !== true) {
				var figScore = 10;
				currentChallengeScore += figScore;
				
				completedFigures.push({
					drawing: drawing,
					timeTaken: timeTaken,
					score: figScore
				});
				
				NumberMode.updateTimerDisplay();
				NumberMode.nextChallengeFigure();
				return;
			}
			
			var myScore = currentChallengeScore;
			if (challengeInterval) clearInterval(challengeInterval);
			
			var user = {networkId: 'local', name: 'Local'};
			if (presence) user = presence.getUserInfo();
			
			var found = false;
			for (var i = 0; i < challengeScores.length; i++) {
				if (challengeScores[i].user.networkId === user.networkId) {
					challengeScores[i].score = Math.max(challengeScores[i].score, myScore);
					found = true; break;
				}
			}
			if (!found) {
				challengeScores.push({ user: user, score: myScore });
			}
			
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'finish-challenge',
						score: myScore
					}
				});
			}
			NumberMode.showLeaderboard(false);
		},
		showLeaderboard: function(justLeaderboardPopup) {
			var localUser = {networkId: 'local', name: 'Local', colorvalue: {stroke: buddyStrokeColor, fill: buddyFillColor}};
			if (presence) localUser = presence.getUserInfo();
			
			var processUsers = function(users) {
				var userMap = {};
				if (users) {
					for (var i = 0; i < users.length; i++) {
						userMap[users[i].networkId] = users[i];
					}
				}
				userMap[localUser.networkId] = localUser;
				for (var i = 0; i < challengeScores.length; i++) {
					userMap[challengeScores[i].user.networkId] = challengeScores[i].user;
				}
				var allUsers = [];
				for (var key in userMap) {
					allUsers.push(userMap[key]);
				}
				NumberMode.renderLeaderboard(allUsers, justLeaderboardPopup);
			};

			if (presence && typeof presence.listSharedActivityUsers === 'function') {
				presence.listSharedActivityUsers(presence.getSharedInfo().id, function(users) {
					processUsers(users);
				});
			} else {
				processUsers([]);
			}
		},
		renderLeaderboard: function(allUsers, justLeaderboardPopup) {
			var board = [];
			for (var i = 0; i < allUsers.length; i++) {
				var u = allUsers[i];
				var sc = 0;
				var hasFinished = false;
				for (var j = 0; j < challengeScores.length; j++) {
					if (challengeScores[j].user.networkId === u.networkId) {
						sc = challengeScores[j].score;
						hasFinished = true;
						break;
					}
				}
				board.push({ user: u, score: sc, finished: hasFinished });
			}
			board.sort(function(a, b) { return b.score - a.score; });
			
			var body = document.getElementById('leaderboard-body');
			if (body) {
				body.innerHTML = '';
				for (var i = 0; i < board.length; i++) {
					var item = board[i];
					var row = document.createElement('div');
					row.className = 'leaderboard-panel-container';
					if (item.user.colorvalue) {
						row.style.borderColor = item.user.colorvalue.stroke;
					}
					var rank = document.createElement('div');
					rank.className = 'leaderboard-item';
					rank.style.width = '25%';
					rank.textContent = (i + 1);
					
					var userDiv = document.createElement('div');
					userDiv.className = 'leaderboard-item';
					userDiv.style.width = '50%';
					
					var iconEl = document.createElement('div');
					iconEl.className = 'leaderboard-item-icon';
					iconEl.style.width = '100px';
					iconEl.style.height = '100px';
					iconEl.style.flexShrink = '0';
					iconEl.style.marginRight = '20px';
					
					var colorval = item.user.colorvalue || item.user.color;
					if (colorval && icon && typeof icon.load === 'function') {
						iconEl.style.backgroundRepeat = 'no-repeat';
						iconEl.style.backgroundPosition = 'center';
						iconEl.style.backgroundSize = 'contain';
						(function(el) {
							icon.load({
								uri: 'icons/owner-icon.svg',
								fillColor: colorval.fill,
								strokeColor: colorval.stroke
							}, function(url) {
								el.style.backgroundImage = "url('" + url + "')";
							});
						})(iconEl);
					} else {
						iconEl.style.backgroundImage = 'url(icons/owner-icon.svg)';
						iconEl.style.backgroundRepeat = 'no-repeat';
						iconEl.style.backgroundPosition = 'center';
						iconEl.style.backgroundSize = 'contain';
					}
					
					var name = document.createElement('div');
					name.textContent = item.user.name || "Unknown";
					
					userDiv.appendChild(iconEl);
					userDiv.appendChild(name);
					
					var score = document.createElement('div');
					score.className = 'leaderboard-item';
					score.style.width = '25%';
					
					if (item.finished) {
						score.textContent = item.score;
					} else {
						var hourglass = document.createElement('img');
						hourglass.src = 'icons/hourglass.svg';
						hourglass.style.width = '80px';
						hourglass.style.height = '80px';
						score.appendChild(hourglass);
					}
					
					row.appendChild(rank);
					row.appendChild(userDiv);
					row.appendChild(score);
					body.appendChild(row);
				}
			}
			
			if (l10nRef && l10nRef.get) {
				var ldHeader = document.getElementById('leaderboard-header');
				if (ldHeader) {
					// Could use l10n to translate "Leaderboard"
				}
			}
			var currentenv = NumberMode.currentenv;
			if (currentenv && currentenv.user && currentenv.user.colorvalue) {
				var stroke = currentenv.user.colorvalue.stroke;
				var fill = currentenv.user.colorvalue.fill;
				var endScreen = document.getElementById('end-screen');
				if (endScreen) endScreen.style.backgroundColor = stroke;
				var ldScreen = document.getElementById('leaderboard-screen');
				if (ldScreen) ldScreen.style.backgroundColor = stroke;
				var ldHeader = document.getElementById('leaderboard-header');
				if (ldHeader) {
					ldHeader.style.backgroundColor = fill;
					ldHeader.style.border = "2px solid black";
					ldHeader.style.color = "black";
					ldHeader.style.borderRadius = "0px";
				}
				
				var btnSee = document.getElementById('btn-see-leaderboard');
				if (btnSee) btnSee.style.backgroundColor = fill;
				var btnRestart = document.getElementById('btn-restart-challenge');
				if (btnRestart) btnRestart.style.backgroundColor = fill;
				
				var timeBox = document.getElementById('end-total-time');
				if (timeBox) {
					timeBox.style.backgroundColor = fill;
					var timeStr = l10nRef && l10nRef.get("TotalTime") ? l10nRef.get("TotalTime") : "Total Time";
					timeBox.textContent = timeStr + ": " + (Math.floor(challengeDuration / 60) < 10 ? '0' : '') + Math.floor(challengeDuration / 60) + ":" + (challengeDuration % 60 < 10 ? '0' : '') + (challengeDuration % 60);
				}
				
				var scoreBox = document.getElementById('end-total-score');
				if (scoreBox) {
					scoreBox.style.backgroundColor = fill;
					var totalScore = 0;
					for (var j = 0; j < challengeScores.length; j++) {
						if (challengeScores[j].user.networkId === currentenv.user.networkId) {
							totalScore = challengeScores[j].score;
							break;
						}
					}
					var sumScore = 0;
					for (var f = 0; f < completedFigures.length; f++) {
						sumScore += completedFigures[f].score;
					}
					if (sumScore > totalScore) totalScore = sumScore;
					

					var scoreStr = l10nRef && l10nRef.get("TotalScore") ? l10nRef.get("TotalScore") : "Total Score";
					scoreBox.textContent = scoreStr + ": " + totalScore;
				}
			}
			
			var completedFiguresGrid = document.getElementById('completed-figures-grid');
			if (completedFiguresGrid) {
				completedFiguresGrid.innerHTML = '';
				if (completedFigures.length > 0) {
					completedFiguresGrid.style.display = 'flex';
					
					for (var f = 0; f < completedFigures.length; f++) {
						var fig = completedFigures[f];
						var card = document.createElement('div');
						card.className = 'completed-figure-card';
						if (currentenv && currentenv.user && currentenv.user.colorvalue) {
							card.style.borderColor = currentenv.user.colorvalue.fill;
						}
						
						var thumbCont = document.createElement('div');
						thumbCont.className = 'card-thumbnail';
						var fill = currentenv && currentenv.user && currentenv.user.colorvalue ? currentenv.user.colorvalue.fill : '#ffcccc';
						var stroke = currentenv && currentenv.user && currentenv.user.colorvalue ? currentenv.user.colorvalue.stroke : '#cc0000';
						var svg = NumberMode.createFigureThumbnail(fig.drawing, fill, stroke);
						if (svg) {
							thumbCont.appendChild(svg);
						}
						
						var header = document.createElement('div');
						header.className = 'card-header';
						
						var timeDiv = document.createElement('div');
						timeDiv.className = 'card-time';
						var clockIcon = document.createElement('div');
						clockIcon.className = 'card-clock-icon';
						var timeStr = Math.floor(fig.timeTaken / 60) + ":" + (fig.timeTaken % 60 < 10 ? '0' : '') + (fig.timeTaken % 60);
						var timeText = document.createElement('span');
						timeText.className = 'card-time-text';
						timeText.textContent = timeStr;
						timeDiv.appendChild(clockIcon);
						timeDiv.appendChild(timeText);
						
						var scoreDiv = document.createElement('div');
						scoreDiv.className = 'card-score';
						scoreDiv.textContent = "Score: " + fig.score;
						
						header.appendChild(timeDiv);
						header.appendChild(scoreDiv);
						
						card.appendChild(header);
						card.appendChild(thumbCont);
						completedFiguresGrid.appendChild(card);
					}
				} else {
					completedFiguresGrid.style.display = 'none';
				}
			}

			if (justLeaderboardPopup) {
				var ldScreen = document.getElementById('leaderboard-screen');
				if (ldScreen) {
					ldScreen.style.display = 'flex';
					var ldBack = document.getElementById('leaderboard-back-button');
					if (ldBack) {
						ldBack.onclick = function() {
							ldScreen.style.display = 'none';
						};
					}
				}
			} else {
				var endScreen = document.getElementById('end-screen');
				if (endScreen) endScreen.style.display = 'flex';
				var btnSeeLeaderboard = document.getElementById('btn-see-leaderboard');
				if (btnSeeLeaderboard) btnSeeLeaderboard.style.display = 'block';
				var btnRestart = document.getElementById('btn-restart-challenge');
				if (btnRestart) btnRestart.style.display = isHost ? 'block' : 'none';
			}
		}
	};

	return NumberMode;
});