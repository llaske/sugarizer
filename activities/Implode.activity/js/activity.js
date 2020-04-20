define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		var canvas_div = document.getElementById("canvas");
		var main_canvas = document.getElementById("mainCanvas");
		main_canvas.width = canvas_div.clientWidth;
		main_canvas.height = canvas_div.clientHeight;
		var stage = new createjs.Stage("mainCanvas");
		var backgorund_color = "#5959B3";
		var difficulty = [[8, 6], [12, 10], [20, 15]];
		var block_size = 25;
		var level = 0;
		var max_size = difficulty[level];
		var board = generate_board(5,max_size);
		var colors = ["#E6000A", "#00EA11", "#FFFA00","#5E008C", "#FF8F00" ];
		board[0].simplify();
		var pieces = board[0]._data;
		var undo_stack = [];
		var highlighted_blocks = [];
		stage.enableMouseOver(30);


		document.getElementById("undo").addEventListener("click", function(){
			Undo();
		})
		document.getElementById("new-game").addEventListener("click", function(){
			new_game(level);
		})
		document.getElementById("easy").addEventListener("click", function(){
			new_game(0);
		})
		document.getElementById("medium").addEventListener("click", function(){
			new_game(1);
		})
		document.getElementById("hard").addEventListener("click", function(){
			new_game(2);
		})


		function new_game(diff_level){
			//remove previous blocks and initializes new blocks
			stage.removeAllChildren();
			stage.removeAllEventListeners();
			level = diff_level;
			max_size = difficulty[level];
			board = generate_board(max_colors=5,max_size);
			board[0].simplify()
			pieces = board[0]._data;
			undo_stack = [];
			highlighted_blocks = []
			init();
		  }
		  
		function draw_square(square, i, k, color){
			//used to draw blocks of given size
			square.graphics.beginStroke(backgorund_color);
			square.graphics.setStrokeStyle(0);
			square.graphics.beginFill(color);
			if((level == 0) || (level == 1)){
				block_size = (level == 0)? 55:30;
				square.graphics.drawRect(
					Math.floor(window.innerWidth/3)+i*(block_size + 10), 
					40+k*(block_size + 10),
					block_size,block_size
					);
			}
			else{
				block_size = 25;
				square.graphics.drawRect(
					Math.floor(window.innerWidth/4)+i*(block_size + 10), 
					5+k*(block_size + 10),
					block_size,block_size
					);
			}
			square.graphics.endFill();
		}

		function init(){
			//This function initialises the game. It creates total no. of blocks according
			//to size and assigns color to them.
			for(var i=0;i<max_size[0];i++){
				var k = 0;
				for(var j=max_size[1]-1;j>=0;j--){
					var square = new createjs.Shape();
					draw_square(square, i, k, backgorund_color);
					square.name = `${i}`+ "_" +`${j}`;
					square.highlighted = false;
					square.prev_color = backgorund_color;
					square.addEventListener('mouseover', function(e){
						if(e.target.graphics._instructions[2].style != backgorund_color
						|| (e.target.highlighted == false))
						{
							var square_name = e.target.name.split('_');
							square_name[0] = parseInt(square_name[0]);
							square_name[1] = parseInt(square_name[1]);
							var square_color = stage.getChildByName(`${square_name[0]}_${square_name[1]}`)
											.graphics._instructions[2].style
							sameColorBlocks(square_name[0],square_name[1], square_color);
							highlight_same_color();
						}
					});
					square.addEventListener('mouseout', function(e){
						clear_prev_higlight();
					});
					square.addEventListener('click', function(e){
						if(highlighted_blocks.length > 2){
							drop();
							shiftLeft();
							IsGameOver();
						}
					});
					stage.addChild(square);
					k++;
				}
			}

			var keys = Object.keys(pieces);
			for(var i in keys){
				i = keys[parseInt(i)];
				for(var j=0;j<pieces[i].length;j++){
					var block = stage.getChildByName(`${i}_${j}`);
					block.graphics._instructions[2].style = colors[pieces[i][j]-1];
					block.prev_color = colors[pieces[i][j]-1];
				}
			}
			stage.update();
		}

		function clear_prev_higlight(){
			//This function is called on mouseout event.
			//It unhighlights the highlighted boxes.
			
			for(var i=0;i<highlighted_blocks.length;i++){
				var block_name = highlighted_blocks[i].split('_');
				block_name[0] = parseInt(block_name[0]);
				block_name[1] = parseInt(block_name[1]);
				var block = stage.getChildByName(`${block_name[0]}_${block_name[1]}`);
				block.highlighted = false;
				block.graphics["_stroke"]["style"] = backgorund_color;
				block.graphics["_strokeStyle"]["width"] = 0;
			}
			stage.update();
			highlighted_blocks = []
		}

		function highlight_same_color(){
			//It highlights same color boxes

			for(var i=0;i<highlighted_blocks.length;i++){
				var block_name = highlighted_blocks[i].split('_');
				block_name[0] = parseInt(block_name[0]);
				block_name[1] = parseInt(block_name[1]);
				var block = stage.getChildByName(`${block_name[0]}_${block_name[1]}`);
				block.graphics["_stroke"]["style"] = "pink";
				block.graphics["_strokeStyle"]["width"] = 5;
			}
			stage.update();
		}

		function sameColorBlocks(col, row, color) {
			//This function finds boxes of same color
			
			var block = stage.getChildByName(`${col}_${row}`);
			var block_color = block.graphics._instructions[2].style;
			if (block_color == backgorund_color || block.highlighted || block_color != color) {
				return;
			}

			block.highlighted = true;
			highlighted_blocks.push(`${col}_${row}`);
			if (row > 0) {
				sameColorBlocks(col, row - 1, color);
			}
			if (row < max_size[1]-1) {
				sameColorBlocks(col, row + 1, color);
			}
			if (col > 0) {
				sameColorBlocks(col - 1, row, color);
			}
			if (col < max_size[0]-1) {
				sameColorBlocks(col + 1, row, color);
			}
		}

		function drop(){
			//This function performs dropping action of blocks.

			for(var i=0;i<(max_size[0]*max_size[1]);i++){
				var block = stage.getChildAt(i);
				block.prev_color = block.graphics._instructions[2].style;
			}

			for (var col = 0; col < max_size[0]; col++) {
				for (var row = 0; row < max_size[1]; row++) {
		  
					if (stage.getChildByName(`${col}_${row}`).highlighted) {
						for (var index = row; index < max_size[1]; index++) {

							var target_block = stage.getChildByName(`${col}_${index}`);
							var upper_block = stage.getChildByName(`${col}_${index + 1}`);

							if (index < (max_size[1] - 1)) {
								target_block.graphics._instructions[2].style = 
								upper_block.graphics._instructions[2].style;
								target_block.highlighted = upper_block.highlighted;
							}
							else {
								target_block.graphics._instructions[2].style = backgorund_color;
								target_block.highlighted = false;
							}
						}
						row--;
					}
				}
			}
		}

		function shiftLeft(){
			//This function shifts right row towards left

			for (var col = 0; col < max_size[0]; col++) {
				if(stage.getChildByName(`${col}_0`).graphics._instructions[2].style == backgorund_color){
					for(var col_index=col;col_index<max_size[0];col_index++){
						var k =1;
						if((col_index+k) < max_size[0])
						{
							while(stage.getChildByName(`${col_index + k}_0`).graphics._instructions[2]
									.style == backgorund_color){
								k++;
								if((col_index + k) == max_size[0]){
									break;
								}
							}
						}

						for(var row=0;row < max_size[1];row++){

							if((col_index + k) != max_size[0]){
								//shift
								var current = stage.getChildByName(`${col_index}_${row}`);
								var block_on_right = stage.getChildByName(`${col_index+k}_${row}`);
								current.graphics._instructions[2].style = block_on_right.graphics
									._instructions[2].style;
								stage.getChildByName(`${col_index + k}_${row}`).
									graphics._instructions[2].style = backgorund_color;
							}
						}
					}
				}
			}

			var changes = {};
			for(var i=0;i<(max_size[0]*max_size[1]);i++){
				var block = stage.getChildAt(i);
				var block_color = block.graphics._instructions[2].style;
				if(block_color != block.prev_color){
					changes[block.name] = block.prev_color;
				}
			}

			for(var i=0;i<highlighted_blocks.length;i++){
				var name = highlighted_blocks[i].split("_");
				var block = stage.getChildByName(`${parseInt(name[0])}_${parseInt(name[1])}`);
				block.highlighted = false;
				block.graphics["_stroke"]["style"] = backgorund_color;
				block.graphics["_strokeStyle"]["width"] = 0;
				changes[block.name] = block.prev_color;
			}

			undo_stack.push(changes);
			highlighted_blocks = []
			stage.update();
		}

		function IsGameOver(){
			if(stage.getChildByName("0_0").graphics._instructions[2].style != backgorund_color){
				return false;
			}
			alert('You Won!!');
			return true;
		}

		function Undo(){
			//This function performs undo action
			if(undo_stack.length > 0){
				var last_changes = undo_stack[undo_stack.length-1];
				var keys = Object.keys(last_changes);
				for(var i=0;i<keys.length;i++){
					var name = keys[i].split('_');
					var block = stage.getChildByName(`${parseInt(name[0])}_${parseInt(name[1])}`);
					var color = last_changes[keys[i]];
					if(color == -1){
					block.graphics._instructions[2].style = backgorund_color;
					}
					else{
					block.graphics._instructions[2].style = color;
					}
				}
				undo_stack.splice(undo_stack.length-1,1);
				stage.update();
			}
		}

		function stage_resize(){
			//This function resizes stage on window resize.
			main_canvas.width = canvas_div.clientWidth;
			main_canvas.height = canvas_div.clientHeight;
			stage.scaleX = 0.5;
			stage.scaleY = 0.5;
			var window_width = window.innerWidth.toString();
			if(window_width.length == 3){
				if(parseInt(window_width[1]) > 5){
					stage.scaleX = 0.1*parseInt(window_width[0]);
					stage.scaleY = 0.1*parseInt(window_width[0]);
				}
				else{
					stage.scaleX = 0.1*(parseInt(window_width[0]) - 1);
					stage.scaleY = 0.1*(parseInt(window_width[0]) - 1);
				}
			}
			else{
				stage.scaleX = 1;
				stage.scaleY = 1;
			}
			stage.update();
		}

		init();
		stage_resize();
		window.addEventListener("resize", stage_resize);

	});

});
