define(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {

	// BlockCraft - Digital Building Sandbox (MVP)
	// Issue: https://github.com/llaske/sugarizer/issues/1994

	var GRID_COLS = 12;
	var GRID_ROWS = 10;
	var CELL_SIZE = 40;

	var blocks = [];  // {row, col, color, rotation}
	var selectedBlock = null;
	var selectedColor = "#E74C3C";
	var selectedType = "cube";
	var isEraseMode = false;

	var gridEl = null;
	var selectedInfoEl = null;

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
				cell.addEventListener("click", handleCellClick);
				gridEl.appendChild(cell);
			}
		}
		renderBlocks();
	}

	function getBlockAt(row, col) {
		for (var i = 0; i < blocks.length; i++) {
			if (blocks[i].row === row && blocks[i].col === col) {
				return blocks[i];
			}
		}
		return null;
	}

	function handleCellClick(e) {
		var cell = e.target.closest(".grid-cell");
		if (!cell) return;
		var row = parseInt(cell.dataset.row, 10);
		var col = parseInt(cell.dataset.col, 10);

		if (isEraseMode) {
			var block = getBlockAt(row, col);
			if (block) {
				blocks = blocks.filter(function(b) { return b !== block; });
				renderBlocks();
				saveToDatastore();
			}
		} else {
			var existing = getBlockAt(row, col);
			if (existing) {
				selectBlock(existing);
			} else if (selectedType === "cube") {
				blocks.push({ row: row, col: col, color: selectedColor, rotation: 0 });
				renderBlocks();
				saveToDatastore();
			}
		}
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
			selectedInfoEl.textContent = "Selected: row " + (selectedBlock.row + 1) + ", col " + (selectedBlock.col + 1) + " | Use ↶ ↷ to rotate";
		} else {
			selectedInfoEl.textContent = "Click a block to select, then rotate with buttons";
		}
	}

	function renderBlocks() {
		// Clear block visuals from all cells
		document.querySelectorAll(".grid-cell .block").forEach(function(el) { el.remove(); });
		document.querySelectorAll(".grid-cell.has-block").forEach(function(c) { c.classList.remove("has-block"); });

		for (var i = 0; i < blocks.length; i++) {
			var b = blocks[i];
			var cell = gridEl.children[b.row * GRID_COLS + b.col];
			if (!cell) continue;

			cell.classList.add("has-block");
			var blockEl = document.createElement("div");
			blockEl.className = "block";
			blockEl.style.backgroundColor = b.color;
			blockEl.style.transform = "rotate(" + b.rotation + "deg)";
			if (selectedBlock === b) {
				blockEl.classList.add("selected");
			}
			blockEl.addEventListener("click", function(ev) {
				ev.stopPropagation();
				selectBlock(b);
			});
			cell.appendChild(blockEl);
		}
	}

	function rotateBlock(deg) {
		if (selectedBlock) {
			selectedBlock.rotation = (selectedBlock.rotation + deg) % 360;
			renderBlocks();
			saveToDatastore();
		}
	}

	function clearAll() {
		if (confirm("Clear all blocks?")) {
			blocks = [];
			deselectBlock();
			renderBlocks();
			saveToDatastore();
		}
	}

	function saveToDatastore() {
		var jsonData = JSON.stringify(blocks);
		activity.getDatastoreObject().setDataAsText(jsonData);
		activity.getDatastoreObject().save(function(err) {
			if (err) console.error("BlockCraft save failed:", err);
		});
	}

	function loadFromDatastore(callback) {
		activity.getDatastoreObject().loadAsText(function(err, metadata, data) {
			if (!err && data) {
				try {
					blocks = JSON.parse(data);
				} catch (e) {
					blocks = [];
				}
			}
			if (callback) callback();
		});
	}

	requirejs(["domReady!"], function() {
		activity.setup();

		selectedInfoEl = document.getElementById("selected-info");

		env.getEnvironment(function(err, environment) {
			createGrid();

			if (environment.objectId) {
				loadFromDatastore(function() {
					renderBlocks();
				});
			}

			// Palette selection
			document.querySelectorAll(".block-type").forEach(function(el) {
				if (el.id === "eraser") return;
				el.addEventListener("click", function() {
					isEraseMode = false;
					document.querySelectorAll(".block-type").forEach(function(b) { b.classList.remove("selected"); });
					el.classList.add("selected");
					selectedType = "cube";
					selectedColor = el.dataset.color;
					deselectBlock();
				});
			});

			document.getElementById("eraser").addEventListener("click", function() {
				isEraseMode = true;
				document.querySelectorAll(".block-type").forEach(function(b) { b.classList.remove("selected"); });
				this.classList.add("selected");
				deselectBlock();
			});

			// Default select first color
			document.querySelector(".block-type[data-color]").classList.add("selected");

			// Rotation buttons
			document.getElementById("rotate-left").addEventListener("click", function() { rotateBlock(-90); });
			document.getElementById("rotate-right").addEventListener("click", function() { rotateBlock(90); });

			// Clear button
			document.getElementById("clear-button").addEventListener("click", clearAll);

			// Deselect when clicking empty area
			document.getElementById("grid").addEventListener("click", function(e) {
				if (e.target.classList.contains("grid-cell") && !e.target.querySelector(".block")) {
					deselectBlock();
				}
			});

			// Save on stop
			document.getElementById("stop-button").addEventListener("click", function() {
				saveToDatastore();
			});
		});
	});

});
