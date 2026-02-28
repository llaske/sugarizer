define([
	"sugar-web/activity/activity",
	"sugar-web/env",
	"l10n",
	"tutorial"
], function (activity, env, l10n, tutorial) {

	"use strict";

	// BlockCraft - Digital Building Sandbox (Production)
	// Issue: https://github.com/llaske/sugarizer/issues/1994

	var VERSION = 2;
	var GRID_COLS = 12;
	var GRID_ROWS = 10;
	var CELL_SIZE = 40;
	var MAX_UNDO = 50;
	var SAVE_DEBOUNCE_MS = 500;
	var HISTORY_DEBOUNCE_MS = 100;

	var blocks = [];
	var levelBlocks = [];
	var selectedBlock = null;
	var selectedColor = "#E74C3C";
	var selectedType = "cube";
	var isEraseMode = false;
	var mode = "free";
	var currentLevel = null;

	var undoStack = [];
	var redoStack = [];
	var saveTimer = null;
	var historyTimer = null;

	var gridEl = null;
	var selectedInfoEl = null;
	var levelProgressEl = null;

	var LEVELS = [
		{
			id: "bridge",
			nameKey: "LevelBridge",
			descKey: "LevelBridgeDesc",
			maxBlocks: 5,
			check: function() {
				var arr = getActiveBlocks();
				if (arr.length !== 5) return false;
				var rows = {};
				for (var i = 0; i < arr.length; i++) {
					rows[arr[i].row] = (rows[arr[i].row] || 0) + 1;
				}
				for (var r in rows) { if (rows[r] >= 5) return true; }
				return false;
			}
		},
		{
			id: "tower",
			nameKey: "LevelTower",
			descKey: "LevelTowerDesc",
			maxBlocks: 6,
			check: function() {
				var arr = getActiveBlocks();
				if (arr.length !== 6) return false;
				var cols = {};
				for (var i = 0; i < arr.length; i++) {
					cols[arr[i].col] = (cols[arr[i].col] || 0) + 1;
				}
				for (var c in cols) { if (cols[c] >= 6) return true; }
				return false;
			}
		},
		{
			id: "car",
			nameKey: "LevelCar",
			descKey: "LevelCarDesc",
			maxBlocks: 4,
			check: function() {
				var b = getActiveBlocks();
				if (b.length !== 4) return false;
				var wheels = b.filter(function(x) { return x.type === "wheel"; });
				var others = b.filter(function(x) { return x.type !== "wheel"; });
				if (wheels.length !== 2 || others.length !== 2) return false;
				var minRow = Math.min.apply(null, b.map(function(x) { return x.row; }));
				return wheels.every(function(w) { return w.row === minRow; });
			}
		},
		{
			id: "house",
			nameKey: "LevelHouse",
			descKey: "LevelHouseDesc",
			maxBlocks: 4,
			check: function() {
				var b = getActiveBlocks();
				if (b.length !== 4) return false;
				var slopes = b.filter(function(x) { return x.type === "slope"; });
				var cubes = b.filter(function(x) { return x.type === "cube"; });
				return slopes.length === 1 && cubes.length === 3;
			}
		},
		{
			id: "pyramid",
			nameKey: "LevelPyramid",
			descKey: "LevelPyramidDesc",
			maxBlocks: 6,
			check: function() {
				var b = getActiveBlocks();
				if (b.length !== 6) return false;
				var byRow = {};
				for (var i = 0; i < b.length; i++) {
					byRow[b[i].row] = (byRow[b[i].row] || 0) + 1;
				}
				var rows = Object.keys(byRow).map(Number).sort(function(a, b) { return a - b; });
				return rows.length === 3 && byRow[rows[0]] === 3 && byRow[rows[1]] === 2 && byRow[rows[2]] === 1;
			}
		}
	];

	function getActiveBlocks() {
		return mode === "level" ? levelBlocks : blocks;
	}

	function setActiveBlocks(arr) {
		if (mode === "level") levelBlocks = arr; else blocks = arr;
	}

	function pushHistory() {
		var arr = getActiveBlocks();
		var snapshot = JSON.parse(JSON.stringify(arr));
		if (undoStack.length >= MAX_UNDO) undoStack.shift();
		undoStack.push(snapshot);
		redoStack = [];
		updateUndoRedoButtons();
	}

	function undo() {
		if (undoStack.length === 0) return;
		var arr = getActiveBlocks();
		redoStack.push(JSON.parse(JSON.stringify(arr)));
		var prev = undoStack.pop();
		setActiveBlocks(prev);
		deselectBlock();
		renderBlocks();
		updateLevelProgress();
		updateUndoRedoButtons();
		debouncedSave();
		showToast(l10n.get("Undo"));
	}

	function redo() {
		if (redoStack.length === 0) return;
		var arr = getActiveBlocks();
		undoStack.push(JSON.parse(JSON.stringify(arr)));
		var next = redoStack.pop();
		setActiveBlocks(next);
		renderBlocks();
		updateLevelProgress();
		updateUndoRedoButtons();
		debouncedSave();
		showToast(l10n.get("Redo"));
	}

	function updateUndoRedoButtons() {
		var u = document.getElementById("undo-button");
		var r = document.getElementById("redo-button");
		if (u) u.disabled = undoStack.length === 0;
		if (r) r.disabled = redoStack.length === 0;
	}

	function showToast(message, isSuccess) {
		var container = document.getElementById("toast-container");
		if (!container) return;
		var toast = document.createElement("div");
		toast.className = "toast" + (isSuccess ? " toast-success" : "");
		toast.textContent = message;
		container.appendChild(toast);
		setTimeout(function() {
			toast.classList.add("toast-exit");
			setTimeout(function() { toast.remove(); }, 300);
		}, 2500);
	}

	function debouncedSave() {
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(saveState, SAVE_DEBOUNCE_MS);
	}

	function debouncedHistory() {
		if (historyTimer) clearTimeout(historyTimer);
		historyTimer = setTimeout(pushHistory, HISTORY_DEBOUNCE_MS);
	}

	function createGrid() {
		gridEl = document.getElementById("grid");
		gridEl.innerHTML = "";
		gridEl.style.gridTemplateColumns = "repeat(" + GRID_COLS + ", " + CELL_SIZE + "px)";
		gridEl.style.gridTemplateRows = "repeat(" + GRID_ROWS + ", " + CELL_SIZE + "px)";

		for (var r = 0; r < GRID_ROWS; r++) {
			for (var c = 0; c < GRID_COLS; c++) {
				var cell = document.createElement("div");
				cell.className = "grid-cell";
				cell.dataset.row = r;
				cell.dataset.col = c;
				cell.setAttribute("role", "gridcell");
				cell.setAttribute("aria-rowindex", r + 1);
				cell.setAttribute("aria-colindex", c + 1);
				cell.addEventListener("click", handleCellClick);
				cell.addEventListener("dragover", handleCellDragOver);
				cell.addEventListener("dragleave", handleCellDragLeave);
				cell.addEventListener("drop", handleCellDrop);
				gridEl.appendChild(cell);
			}
		}
		renderBlocks();
	}

	function getBlockAt(row, col) {
		var arr = getActiveBlocks();
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].row === row && arr[i].col === col) return arr[i];
		}
		return null;
	}

	function handleCellClick(e) {
		var cell = e.target.closest(".grid-cell");
		if (!cell) return;
		var row = parseInt(cell.dataset.row, 10);
		var col = parseInt(cell.dataset.col, 10);
		var arr = getActiveBlocks();

		if (isEraseMode) {
			var block = getBlockAt(row, col);
			if (block) {
				pushHistory();
				arr.splice(arr.indexOf(block), 1);
				renderBlocks();
				updateLevelProgress();
				debouncedSave();
			}
		} else {
			var existing = getBlockAt(row, col);
			if (existing) {
				selectBlock(existing);
			} else if (selectedType !== "erase" && (mode !== "level" || arr.length < currentLevel.maxBlocks)) {
				debouncedHistory();
				arr.push({ row: row, col: col, color: selectedColor, rotation: 0, type: selectedType });
				renderBlocks();
				updateLevelProgress();
				debouncedSave();
			}
		}
	}

	function handleCellDragOver(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = "copy";
		var cell = e.target.closest(".grid-cell");
		if (cell) cell.classList.add("drag-over");
	}

	function handleCellDragLeave(e) {
		var cell = e.target.closest(".grid-cell");
		if (cell) cell.classList.remove("drag-over");
	}

	function handleCellDrop(e) {
		e.preventDefault();
		var cell = e.target.closest(".grid-cell");
		if (!cell) return;
		cell.classList.remove("drag-over");

		var dragData = e.dataTransfer.getData("application/json");
		if (!dragData) return;

		var row = parseInt(cell.dataset.row, 10);
		var col = parseInt(cell.dataset.col, 10);
		var arr = getActiveBlocks();

		try {
			var data = JSON.parse(dragData);
			if (data.from === "palette") {
				if (getBlockAt(row, col)) return;
				if (mode === "level" && arr.length >= currentLevel.maxBlocks) return;
				if (data.type === "erase") return;
				debouncedHistory();
				arr.push({ row: row, col: col, color: data.color || "#E74C3C", rotation: 0, type: data.type || "cube" });
			} else if (data.from === "grid" && data.block) {
				var block = data.block;
				if (block.row === row && block.col === col) return;
				if (getBlockAt(row, col)) return;
				debouncedHistory();
				block.row = row;
				block.col = col;
			}
			renderBlocks();
			updateLevelProgress();
			debouncedSave();
		} catch (err) {}
	}

	function setupPaletteDrag() {
		document.querySelectorAll(".block-type").forEach(function(el) {
			if (el.id === "eraser") return;
			el.setAttribute("draggable", "true");
			el.addEventListener("dragstart", function(e) {
				e.dataTransfer.setData("application/json", JSON.stringify({
					from: "palette",
					type: el.dataset.type || "cube",
					color: el.dataset.color || "#E74C3C"
				}));
				e.dataTransfer.effectAllowed = "copy";
			});
		});
	}

	function selectBlock(block) {
		selectedBlock = block;
		updateSelectedInfo();
		renderBlocks();
	}

	function deselectBlock() {
		selectedBlock = null;
		updateSelectedInfo();
		renderBlocks();
	}

	function updateSelectedInfo() {
		if (!selectedInfoEl) return;
		if (selectedBlock) {
			selectedInfoEl.textContent = l10n.get("SelectedInfo", {
				row: selectedBlock.row + 1,
				col: selectedBlock.col + 1
			});
		} else {
			selectedInfoEl.textContent = l10n.get("HintFreeBuild");
		}
	}

	function updateLevelProgress() {
		if (!levelProgressEl || mode !== "level" || !currentLevel) return;
		var arr = getActiveBlocks();
		levelProgressEl.textContent = l10n.get("BlocksUsed", { used: arr.length, max: currentLevel.maxBlocks });
		levelProgressEl.classList.toggle("success", currentLevel.check());
	}

	function renderBlocks() {
		document.querySelectorAll(".grid-cell .block").forEach(function(el) { el.remove(); });
		document.querySelectorAll(".grid-cell.has-block").forEach(function(c) { c.classList.remove("has-block"); });

		var arr = getActiveBlocks();
		for (var i = 0; i < arr.length; i++) {
			var b = arr[i];
			var cell = gridEl.children[b.row * GRID_COLS + b.col];
			if (!cell) continue;

			cell.classList.add("has-block");
			var blockEl = document.createElement("div");
			blockEl.className = "block";
			if (b.type === "slope") blockEl.classList.add("block-slope");
			else if (b.type === "wheel") blockEl.classList.add("block-wheel");
			blockEl.style.backgroundColor = b.color || "#E74C3C";
			blockEl.style.transform = "rotate(" + (b.rotation || 0) + "deg)";
			if (selectedBlock === b) blockEl.classList.add("selected");

			blockEl.setAttribute("draggable", "true");
			blockEl.setAttribute("role", "button");
			blockEl.addEventListener("click", function(ev) {
				ev.stopPropagation();
				selectBlock(b);
			});
			blockEl.addEventListener("dragstart", function(e) {
				blockEl.classList.add("dragging");
				e.dataTransfer.setData("application/json", JSON.stringify({ from: "grid", block: b }));
				e.dataTransfer.effectAllowed = "move";
			});
			blockEl.addEventListener("dragend", function() {
				blockEl.classList.remove("dragging");
			});

			cell.appendChild(blockEl);
		}
	}

	function rotateBlock(deg) {
		if (selectedBlock) {
			debouncedHistory();
			selectedBlock.rotation = ((selectedBlock.rotation || 0) + deg) % 360;
			renderBlocks();
			updateLevelProgress();
			debouncedSave();
		}
	}

	function clearAll() {
		if (!confirm(l10n.get("ClearConfirm"))) return;
		pushHistory();
		setActiveBlocks([]);
		deselectBlock();
		renderBlocks();
		updateLevelProgress();
		debouncedSave();
	}

	function saveState() {
		var data = {
			version: VERSION,
			mode: mode,
			blocks: blocks,
			levelBlocks: levelBlocks,
			currentLevelId: currentLevel ? currentLevel.id : null
		};
		activity.getDatastoreObject().setDataAsText(JSON.stringify(data));
		activity.getDatastoreObject().save(function(err) {
			if (err) console.error("BlockCraft save failed:", err);
		});
	}

	function validateBlock(b) {
		if (!b || typeof b.row !== "number" || typeof b.col !== "number") return false;
		if (b.row < 0 || b.row >= GRID_ROWS || b.col < 0 || b.col >= GRID_COLS) return false;
		b.type = b.type || "cube";
		b.color = b.color || "#E74C3C";
		b.rotation = b.rotation || 0;
		return true;
	}

	function loadState(callback) {
		activity.getDatastoreObject().loadAsText(function(err, metadata, data) {
			if (!err && data) {
				try {
					var d = JSON.parse(data);
					if (d.version === 1 && Array.isArray(d.blocks)) {
						blocks = d.blocks.filter(validateBlock);
						levelBlocks = [];
						mode = "free";
					} else if (d.version >= 2) {
						blocks = (d.blocks || []).filter(validateBlock);
						levelBlocks = (d.levelBlocks || []).filter(validateBlock);
						mode = d.mode || "free";
						if (d.currentLevelId) {
							for (var i = 0; i < LEVELS.length; i++) {
								if (LEVELS[i].id === d.currentLevelId) {
									currentLevel = LEVELS[i];
									break;
								}
							}
						}
					}
				} catch (e) {
					blocks = [];
					levelBlocks = [];
				}
			}
			if (callback) callback();
		});
	}

	function switchToFreeBuild() {
		mode = "free";
		currentLevel = null;
		undoStack = [];
		redoStack = [];
		document.getElementById("level-panel").classList.add("hidden");
		document.getElementById("level-panel").setAttribute("aria-hidden", "true");
		document.getElementById("blockcraft-container").classList.remove("hidden");
		document.getElementById("level-info").classList.add("hidden");
		document.getElementById("check-level").classList.add("hidden");
		updateUIText();
		updateLevelProgress();
		updateUndoRedoButtons();
		renderBlocks();
	}

	function showLevelSelect() {
		document.getElementById("level-panel").classList.remove("hidden");
		document.getElementById("level-panel").setAttribute("aria-hidden", "false");
		document.getElementById("blockcraft-container").classList.add("hidden");
		updateUIText();
	}

	function startLevel(level) {
		currentLevel = level;
		mode = "level";
		setActiveBlocks([]);
		undoStack = [];
		redoStack = [];
		deselectBlock();

		document.getElementById("level-panel").classList.add("hidden");
		document.getElementById("blockcraft-container").classList.remove("hidden");
		document.getElementById("level-info").classList.remove("hidden");
		document.getElementById("level-info").textContent = l10n.get(level.descKey);
		document.getElementById("check-level").classList.remove("hidden");

		updateUIText();
		renderBlocks();
		updateLevelProgress();
		updateUndoRedoButtons();
	}

	function checkLevel() {
		if (!currentLevel.check()) {
			showToast(l10n.get("LevelIncomplete", { hint: l10n.get(currentLevel.descKey) }));
		} else {
			showToast(l10n.get("LevelSuccess"), true);
		}
	}

	function updateUIText() {
		document.getElementById("mode-button").textContent = document.getElementById("level-panel").classList.contains("hidden")
			? l10n.get("LevelMode") : l10n.get("FreeBuild");
		document.getElementById("level-title").textContent = l10n.get("ChooseLevel");
		document.getElementById("back-to-build").textContent = l10n.get("BackToFreeBuild");
		document.getElementById("palette-title").textContent = l10n.get("Blocks");
		document.getElementById("clear-button").textContent = l10n.get("Clear");
		document.getElementById("check-level").textContent = l10n.get("Check");
		document.getElementById("undo-button").title = l10n.get("Undo");
		document.getElementById("redo-button").title = l10n.get("Redo");
		document.getElementById("help-button").title = l10n.get("Help");
		document.getElementById("stop-button").title = l10n.get("Stop");
		document.getElementById("rotate-left").title = l10n.get("RotateLeft");
		document.getElementById("rotate-right").title = l10n.get("RotateRight");
	}

	function renderLevelList() {
		var list = document.getElementById("level-list");
		list.innerHTML = "";
		LEVELS.forEach(function(level) {
			var card = document.createElement("div");
			card.className = "level-card";
			card.setAttribute("role", "listitem");
			card.innerHTML = "<h3>" + l10n.get(level.nameKey) + "</h3><p>" + l10n.get(level.descKey) + "</p>";
			card.addEventListener("click", function() { startLevel(level); });
			card.addEventListener("keydown", function(e) {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					startLevel(level);
				}
			});
			card.tabIndex = 0;
			list.appendChild(card);
		});
	}

	function handleKeydown(e) {
		if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
		switch (e.key) {
			case "Escape":
				deselectBlock();
				break;
			case "Delete":
			case "Backspace":
				if (selectedBlock) {
					var arr = getActiveBlocks();
					var idx = arr.indexOf(selectedBlock);
					if (idx >= 0) {
						pushHistory();
						arr.splice(idx, 1);
						deselectBlock();
						renderBlocks();
						updateLevelProgress();
						debouncedSave();
					}
				}
				e.preventDefault();
				break;
			case "z":
			case "Z":
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					if (e.shiftKey) redo(); else undo();
				}
				break;
			case "y":
			case "Y":
				if (e.ctrlKey || e.metaKey) {
					e.preventDefault();
					redo();
				}
				break;
		}
	}

	function handleResize() {
		if (gridEl && gridEl.parentElement) {
			renderBlocks();
		}
	}

	requirejs(["domReady!"], function() {
		activity.setup();
		selectedInfoEl = document.getElementById("selected-info");
		levelProgressEl = document.getElementById("level-progress");

		env.getEnvironment(function(err, environment) {
			var lang = (environment.user && environment.user.language) ||
				(typeof navigator !== "undefined" && navigator.language) || "en";
			l10n.init(lang);

			createGrid();
			renderLevelList();
			setupPaletteDrag();
			updateUIText();
			updateUndoRedoButtons();

			window.addEventListener("localized", function() {
				updateUIText();
				renderLevelList();
				if (currentLevel) {
					document.getElementById("level-info").textContent = l10n.get(currentLevel.descKey);
				}
				updateLevelProgress();
			});

			if (environment.objectId) {
				loadState(function() {
					if (currentLevel) {
						document.getElementById("level-info").classList.remove("hidden");
						document.getElementById("level-info").textContent = l10n.get(currentLevel.descKey);
						document.getElementById("check-level").classList.remove("hidden");
					}
					renderBlocks();
					updateLevelProgress();
				});
			}

			document.querySelectorAll(".block-type").forEach(function(el) {
				if (el.id === "eraser") return;
				el.addEventListener("click", function() {
					isEraseMode = false;
					document.querySelectorAll(".block-type").forEach(function(b) { b.classList.remove("selected"); });
					el.classList.add("selected");
					selectedType = el.dataset.type || "cube";
					selectedColor = el.dataset.color || "#E74C3C";
					deselectBlock();
				});
			});

			document.getElementById("eraser").addEventListener("click", function() {
				isEraseMode = true;
				document.querySelectorAll(".block-type").forEach(function(b) { b.classList.remove("selected"); });
				this.classList.add("selected");
				selectedType = "erase";
				deselectBlock();
			});

			document.querySelector(".block-type[data-color]").classList.add("selected");

			document.getElementById("rotate-left").addEventListener("click", function() { rotateBlock(-90); });
			document.getElementById("rotate-right").addEventListener("click", function() { rotateBlock(90); });
			document.getElementById("clear-button").addEventListener("click", clearAll);
			document.getElementById("check-level").addEventListener("click", checkLevel);
			document.getElementById("undo-button").addEventListener("click", undo);
			document.getElementById("redo-button").addEventListener("click", redo);
			document.getElementById("help-button").addEventListener("click", function() { tutorial.start(); });

			document.getElementById("mode-button").addEventListener("click", function() {
				var levelPanel = document.getElementById("level-panel");
				if (!levelPanel.classList.contains("hidden") || currentLevel) {
					switchToFreeBuild();
				} else {
					showLevelSelect();
				}
			});

			document.getElementById("back-to-build").addEventListener("click", switchToFreeBuild);

			document.getElementById("grid").addEventListener("click", function(e) {
				if (e.target.classList.contains("grid-cell") && !e.target.querySelector(".block")) {
					deselectBlock();
				}
			});

			document.addEventListener("keydown", handleKeydown);
			window.addEventListener("resize", handleResize);

			document.getElementById("stop-button").addEventListener("click", function() {
				if (saveTimer) clearTimeout(saveTimer);
				saveState();
			});
		});
	});

});
