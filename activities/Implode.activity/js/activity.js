define(["sugar-web/activity/activity", "sugar-web/env", "picoModal", "webL10n", "tutorial"], function (activity, env, picoModal, webL10n, tutorial) {

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        var canvas_div = document.getElementById("canvas");
        var main_canvas = document.getElementById("mainCanvas");
        var stage = new createjs.Stage("mainCanvas");
        createjs.Touch.enable(stage);
        var backgorund_color = "#5959B3";
        var difficulty = [[8, 6], [12, 10], [20, 15]];
        var block_size = 15;
        var level = 0;
        var max_size = difficulty[level];
        var colors = ["#E6000A", "#00EA11", "#FFFA00","#5E008C", "#FF8F00" ];
        var pieces = {};
        var undo_stack = [];
        var redo_stack = [];
        var highlighted_blocks = [];
        var marked_blocks = [];
        stage.enableMouseOver(30);
        var anim_over = true;
        button_highlight(level);
        var game_status = 'playing';
        var smiley_color = backgorund_color;
        var doubleTap = false;

        document.getElementById("undo").addEventListener("click", function(){
            if(anim_over == true){
                Undo();
            }
        });
        document.getElementById("redo").addEventListener("click", function(){
            if(anim_over == true){
                Redo();
            }
        });
        document.getElementById("new-game").addEventListener("click", function(){
            new_game(level);
        });
        document.getElementById("replay").addEventListener("click", function(){
            if(anim_over == true){
                replay_game();
            }
        });
        document.getElementById("easy").addEventListener("click", function(){
            new_game(0);
        });
        document.getElementById("medium").addEventListener("click", function(){
            new_game(1);
        });
        document.getElementById("hard").addEventListener("click", function(){
            new_game(2);
        });
        document.getElementById("help-button").addEventListener('click', function(e) {
            tutorial.start();
        });

        var fullScreenMode = false;
        //Handle fullscreen mode
        document.getElementById("fullscreen-button").addEventListener("click", function(){
            document.getElementById("main-toolbar").style.display = "none";
            document.getElementById("canvas").style.top = "0px";
            document.getElementById("unfullscreen-button").style.visibility = "visible";
            fullScreenMode = true;
            if(game_status == "won"){}
            else{
                stage_resize();
            }
        });
        //Handle unfullscreen mode
        document.getElementById("unfullscreen-button").addEventListener("click", function(){
            document.getElementById("main-toolbar").style.display = "block";
            document.getElementById("canvas").style.top = "55px";
            document.getElementById("unfullscreen-button").style.visibility = "hidden";
            fullScreenMode = false;
            if(game_status == "won"){}
            else{
                stage_resize();
            }
        });

        document.addEventListener("keydown",function(event){
            var x = event.which || event.keyCode;
            if(keys[x] != undefined && 
                document.getElementById("activity-palette").style.visibility != "visible"){
                event.preventDefault();
            }
        });

        document.addEventListener("keyup",function(event){
            //keyboard controls for activity
            event.preventDefault();

            var x = event.which || event.keyCode;
            var circle = stage.getChildByName("white_circle");
            if(anim_over == true && 
                document.getElementById("activity-palette").style.visibility != "visible"){
                switch(keys[x]){

                    case 'up':{
                        if(circle != null && game_status == "playing"){
                            var square_name = circle.parent_box.split('_');
                            var square_up = stage.getChildByName(`${parseInt(square_name[0])}_${parseInt(square_name[1])+1}`);
                            if(square_up != null && square_up.visible == true){
                                highlight_mouseover(square_up);
                                stage.update();
                            }
                        }
                        break;
                    }
                    case 'down':{
                        if(circle != null && game_status == "playing"){
                            var square_name = circle.parent_box.split('_');
                            var square_down = stage.getChildByName(`${parseInt(square_name[0])}_${parseInt(square_name[1])-1}`);
                            if(square_down != null && square_down.visible == true){
                                highlight_mouseover(square_down);
                                stage.update();
                            }
                        }
                        break;
                    }
                    case 'left':{
                        if(circle != null && game_status == "playing"){
                            var square_name = circle.parent_box.split('_');
                            var square_left = stage.getChildByName(`${parseInt(square_name[0])-1}_${parseInt(square_name[1])}`);
                            if(square_left != null && square_left.visible == true){
                                highlight_mouseover(square_left);
                                stage.update();
                            }
                        }
                        break;
                    }
                    case 'right':{
                        if(circle != null && game_status == "playing"){
                            var square_name = circle.parent_box.split('_');
                            var square_right = stage.getChildByName(`${parseInt(square_name[0])+1}_${parseInt(square_name[1])}`);
                            if(square_right != null && square_right.visible == true){
                                highlight_mouseover(square_right);
                                stage.update();
                            }
                        }
                        break;
                    }
                    case 'select':{
                        if(game_status == "playing"){
                            move();
                        }
                        break;
                    }
                    case 'new':{
                        new_game(level);
                        break;
                    }
                    case 'easy_level':{
                        new_game(0);
                        break;
                    }
                    case 'medium_level':{
                        new_game(1);
                        break;
                    }
                    case 'hard_level':{
                        new_game(2);
                        break;
                    }
                    case 'undo_move':{
                        Undo();
                        break;
                    }
                    case 'redo_move':{
                        Redo();
                        break;
                    }
                }
            }
        });

        function button_highlight(level){
            //This function changes background color of difficulty buttons

            if(level == 0){
                document.getElementById("easy").style.backgroundColor = "grey";
                document.getElementById("medium").style.backgroundColor = "#282828";
                document.getElementById("hard").style.backgroundColor = "#282828";
            }
            else if(level == 1){
                document.getElementById("easy").style.backgroundColor = "#282828";
                document.getElementById("medium").style.backgroundColor = "grey";
                document.getElementById("hard").style.backgroundColor = "#282828";
            }
            else{
                document.getElementById("easy").style.backgroundColor = "#282828";
                document.getElementById("medium").style.backgroundColor = "#282828";
                document.getElementById("hard").style.backgroundColor = "grey";
            }
        }

        function new_game(diff_level){
            //remove previous blocks and initializes new blocks
            button_highlight(diff_level);
            stage.removeAllChildren();
            // stage.removeAllEventListeners();
            level = diff_level;
            max_size = difficulty[level];
            var board = generate_board(max_colors=5,max_size);
            board[0].simplify()
            pieces = board[0]._data;
            undo_stack = [];
            redo_stack = [];
            highlighted_blocks = []
            stage_resize();
            init();
        }

        function replay_game(){
            //restarts game with initial set of blocks

            if(game_status == "playing"){
                var keys = Object.keys(pieces);
                for(var i in keys){
                    i = keys[parseInt(i)];
                    for(var j=0;j<pieces[i].length;j++){
                        var block = stage.getChildByName(`${i}_${j}`);
                        block.graphics._instructions[2].style = colors[pieces[i][j]-1];
                        block.prev_color = colors[pieces[i][j]-1];
                    }
                }

            }
            else{
                stage.removeAllChildren();
                init();
            }

            for(var i=0;i<highlighted_blocks.length;i++){
                var name = highlighted_blocks[i].split("_");
                var block = stage.getChildByName(`${parseInt(name[0])}_${parseInt(name[1])}`);
                block.highlighted = false;
                block.graphics["_stroke"]["style"] = backgorund_color;
                block.graphics["_strokeStyle"]["width"] = border_width(level);
            }

            undo_stack = [];
            redo_stack = [];
            highlighted_blocks = [];

            adjust_circle();
        }

        function draw_square(square, i, k, color){
            //used to draw blocks of given size
            square.graphics.beginStroke(backgorund_color);
            square.graphics.setStrokeStyle(border_width(level));
            square.graphics.beginFill(color);
            square.graphics.drawRect(
                i*(block_size), 
                k*(block_size),
                block_size-border_width(level),block_size-border_width(level)
            );
            square.graphics.endFill();
        }

        function border_width(level){
            // This function returns border width for box.

            return Math.floor(block_size/10);
        }

        function init(){
            //This function initialises the game. It creates total no. of blocks according
            //to size and assigns color to them.

            game_status = "playing";
            for(var i=0;i<max_size[0];i++){
                var k = 0;
                for(var j=max_size[1]-1;j>=0;j--){
                    var square = new createjs.Shape();
                    draw_square(square, i, k, backgorund_color);
                    square.name = `${i}_${j}`;
                    square.highlighted = false;
                    square.marked = false; //used for Game Over
                    square.prev_color = backgorund_color;
                    square.addEventListener('mouseover', function(e){
                        if(anim_over == true && ("ontouchstart" in document.documentElement) == false){
                            highlight_mouseover(stage.getChildByName(e.target.name));
                            stage.update();
                        }
                    });
                    square.addEventListener('click', function(e){
                        if(("ontouchstart" in document.documentElement) == true){
                            HandleTap(e);
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
            var circle = new createjs.Shape();
            var square = stage.getChildByName("0_0");
            circle.graphics.beginFill("white").drawCircle(
                square.graphics._instructions[1]["h"]/2 + square.graphics._instructions[1]["x"],
                square.graphics._instructions[1]["h"]/2 + square.graphics._instructions[1]["y"],
                square.graphics._instructions[1]["h"]/9
            );
            circle.graphics.endFill();
            circle.name = "white_circle";
            circle.parent_box = square.name;
            stage.addChild(circle);
            highlight_mouseover(square);
            stage.update();
        }

        var circle_move = false;

        function HandleTap(e) {
            if(!doubleTap) {
                doubleTap = true;
                setTimeout( function() { doubleTap = false; }, 300 );
                if(anim_over == true){
                    highlight_mouseover(stage.getChildByName(e.target.name));
                    stage.update();
                }
                return false;
            }
            e.preventDefault();
            move();
        }

        canvas_div.addEventListener('click', function(e){
            if(("ontouchstart" in document.documentElement) == false){
                move();
            }
        });

        function move(){
            if(highlighted_blocks.length > 2 && anim_over == true){
                
                anim_over = false;
                var listener = createjs.Ticker.on("tick", stage);
                for(var i=0;i<highlighted_blocks.length;i++){
                    createjs.Tween.get(stage.getChildByName(highlighted_blocks[i])).to({alpha: 0},150);
                }

                setTimeout(function(){    
                    createjs.Ticker.off("tick", listener);
                    for(var i=0;i<highlighted_blocks.length;i++){
                        stage.getChildByName(highlighted_blocks[i]).alpha = 1;
                    }

                    drop();

                    for(var i=0;i<highlighted_blocks.length;i++){
                        var name = highlighted_blocks[i].split("_");
                        var block = stage.getChildByName(`${parseInt(name[0])}_${parseInt(name[1])}`);
                        block.highlighted = false;
                        block.graphics["_stroke"]["style"] = backgorund_color;
                        block.graphics["_strokeStyle"]["width"] = border_width(level);
                    }
                    stage.update();
                    setTimeout(function(){
                        shiftLeft();
                        adjust_circle();
                        IsGameOver();
                        anim_over = true;
                    },150)
                }, 300)
            }
        }

        function adjust_circle(){
            var circle = stage.getChildByName("white_circle");
            var circle_parent = circle.parent_box;
            circle_move = true;
            highlight_mouseover(stage.getChildByName(circle_parent));
            circle_move = false;
            stage_resize();
        }


        function highlight_mouseover(square){
            //This function highlight similar color boxes.
        
            var circle = stage.getChildByName("white_circle");
            
            var square_name = square.name.split('_');
            square_name[0] = parseInt(square_name[0]);
            square_name[1] = parseInt(square_name[1]);
            
            if(stage.getChildByName(`${square_name[0]}_0`).graphics._instructions[2].style != backgorund_color){
                clear_prev_higlight();
                var centre_x = square.graphics._instructions[1]["h"]/2 + square.graphics._instructions[1]["x"];
                var centre_y = square.graphics._instructions[1]["h"]/2 + square.graphics._instructions[1]["y"];
                circle.graphics._instructions[1]["x"] = centre_x;
                circle.graphics._instructions[1]["y"] = centre_y;
                circle.graphics._instructions[1]["radius"] = square.graphics._instructions[1]["h"]/9;
                circle.parent_box = square.name;
            }
            else if(stage.getChildByName(`${square_name[0]}_0`).graphics._instructions[2].style == backgorund_color
                    && (circle_move == true)){
                clear_prev_higlight();
                var i=max_size[0]-1;
                for(;i>=0;i--){
                    if(stage.getChildByName(`${i}_0`).graphics._instructions[2].style != backgorund_color){
                        break;
                    }
                }
                if(i == -1){
                    return;
                }
                square = stage.getChildByName(`${i}_${square_name[1]}`);
                square_name = square.name.split('_');
                square_name[0] = parseInt(square_name[0]);
                square_name[1] = parseInt(square_name[1]);
                var centre_x = square.graphics._instructions[1]["h"]/2 + square.graphics._instructions[1]["x"];
                var centre_y = square.graphics._instructions[1]["h"]/2 + square.graphics._instructions[1]["y"];
                circle.graphics._instructions[1]["x"] = centre_x;
                circle.graphics._instructions[1]["y"] = centre_y;
                circle.graphics._instructions[1]["radius"] = square.graphics._instructions[1]["h"]/9;
                circle.parent_box = square.name;
            }

            if(square.graphics._instructions[2].style != backgorund_color
                || (square.highlighted == false))
            {
                var square_color = stage.getChildByName(`${square_name[0]}_${square_name[1]}`)
                                .graphics._instructions[2].style
                sameColorBlocks(square_name[0],square_name[1], square_color);
                highlight_same_color();
            }
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
                block.graphics["_strokeStyle"]["width"] = border_width(level);
            }

            highlighted_blocks = []
        }

        function highlight_same_color(){
            //It highlights same color boxes
            if(highlighted_blocks.length > 2){
                for(var i=0;i<highlighted_blocks.length;i++){
                    var block_name = highlighted_blocks[i].split('_');
                    block_name[0] = parseInt(block_name[0]);
                    block_name[1] = parseInt(block_name[1]);
                    var block = stage.getChildByName(`${block_name[0]}_${block_name[1]}`);
                    block.graphics["_stroke"]["style"] = "white";
                    block.graphics["_strokeStyle"]["width"] = border_width(level);
                }
            
            }
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

            redo_stack = [];

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
                changes[block.name] = block.prev_color;
            }

            undo_stack.push(changes);
            highlighted_blocks = []
        }

        function sameColorLeft(col, row, color) {

            var block = stage.getChildByName(`${col}_${row}`);
            var block_color = block.graphics._instructions[2].style;
            if (block_color == backgorund_color || block.marked || block_color != color) {
                return;
            }

            block.marked = true;
            marked_blocks.push(`${col}_${row}`);
            if (row > 0) {
                sameColorLeft(col, row - 1, color);
            }
            if (row < max_size[1]-1) {
                sameColorLeft(col, row + 1, color);
            }
            if (col > 0) {
                sameColorLeft(col - 1, row, color);
            }
            if (col < max_size[0]-1) {
                sameColorLeft(col + 1, row, color);
            }
        }

        function IsGameOver(){

            var i=0;
            for(;i<(max_size[0]*max_size[1]);i++){
                var block = stage.getChildAt(i);
                if(block.visible == true){
                    var block_name = block.name.split("_");
                    block_name[0] = parseInt(block_name[0]);
                    block_name[1] = parseInt(block_name[1]);
                    sameColorLeft(block_name[0], block_name[1], block.graphics._instructions[2].style)
                    var total_same = marked_blocks.length;
                    for(var j=0;j<marked_blocks.length;j++){
                        var square_name = marked_blocks[j].split('_');
                        square_name[0] = parseInt(square_name[0]);
                        square_name[1] = parseInt(square_name[1]);
                        var square = stage.getChildByName(`${square_name[0]}_${square_name[1]}`);
                        square.marked = false;
                    }
                    marked_blocks = []
                    if(total_same > 2){
                        return;
                    }
                }
            }
            if(stage.getChildByName("0_0").graphics._instructions[2].style == backgorund_color){
                setTimeout(function(){
                    game_status = "won";
                    smiley_color = stage.getChildByName("0_0").prev_color;
                    winning_smiley(smiley_color);
                },5)
            }
            else{
                setTimeout(function(){
                    lose();
                },500)
            }
        }

        function winning_smiley(color){
            stage.removeAllChildren();
            stage.removeAllEventListeners();
            undo_stack = [];
            redo_stack = [];
            highlighted_blocks = []
            var block_width = (window.innerWidth-200)/10;
            if(fullScreenMode){
                main_canvas.height = window.innerHeight-45;
            }
            else{
                main_canvas.height = window.innerHeight-95;
            }
            block_size = main_canvas.height/9;
            if(block_width < block_size){
                block_size = block_width;
            }
            main_canvas.width = block_size*10 + 15;
            main_canvas.height = block_size*9 + 8;
            for(var i=0;i<10;i++){
                for(var j=0;j<9;j++){
                    var square = new createjs.Shape();
                    square.graphics.beginStroke(backgorund_color);
                    square.graphics.setStrokeStyle(5);
                    square.graphics.beginFill(backgorund_color);
                    square.graphics.drawRect(
                        i*(block_size), 
                        j*(block_size),
                        block_size-5,block_size-5
                    );
                    square.graphics.endFill();
                    square.name = `${i}_${j}`;
                    stage.addChild(square);
                }
            }

            setTimeout(function(){
                
                for(var i=2;i<8;i++){
                    var square = stage.getChildByName(`${i}_0`);
                    square.graphics._instructions[2].style = color;
                    var block = stage.getChildByName(`${i}_8`);
                    block.graphics._instructions[2].style = color;
                }
                for(var i=2;i<7;i++){
                    var square = stage.getChildByName(`0_${i}`);
                    square.graphics._instructions[2].style = color;
                    var block = stage.getChildByName(`9_${i}`);
                    block.graphics._instructions[2].style = color;
                }
                stage.getChildByName("1_1").graphics._instructions[2].style = color;
                stage.getChildByName("8_1").graphics._instructions[2].style = color;
                stage.getChildByName("1_7").graphics._instructions[2].style = color;
                stage.getChildByName("8_7").graphics._instructions[2].style = color;
                stage.update();
                setTimeout(function(){
                    stage.getChildByName("3_3").graphics._instructions[2].style = color;
                    stage.getChildByName("6_3").graphics._instructions[2].style = color;
                    stage.getChildByName("2_5").graphics._instructions[2].style = color;
                    stage.getChildByName("7_5").graphics._instructions[2].style = color;
                    for(var i=3;i<7;i++){
                        var square = stage.getChildByName(`${i}_6`);
                        square.graphics._instructions[2].style = color;
                    }
                    stage.update();
                },100)
                
            },100);
        }

        function lose(){
            var continue_button_title = webL10n.get("Continue");
            var msg_content = webL10n.get("StuckMessage");
            picoModal({
                content:"<div style = 'width:400px;margin-bottom:60px'>" +
                    "<div style='width:40vw;float:left;margin-left:20px;'>" +
                    "<div style='color:white;margin-top:10px;font-size:18px;'>" + msg_content + "</div>" +
                    "</div>" +
                    "</div>" +
                    "<div>" +
                    "<button class='continue warningbox-refresh-button'>"+ continue_button_title + "</button>" +
                    "</div>",
                closeButton: false,
                modalStyles: {
                        backgroundColor: "#000000",
                        height: "120px",
                        width: "60%",
                        textColor: "white"
                    },
                }).afterCreate(function(modal) {
                    modal.modalElem().addEventListener("click", function(evt) {
                        if (evt.target && evt.target.matches(".continue")) {
                            modal.close();
                        } else if (evt.target && evt.target.matches(".cancel-changes")) {
                            modal.close();
                        }
                    });
                }).show();
        }

        function Undo(){
            //This function performs undo action
            if(undo_stack.length > 0){
                var changes = {};
                var last_changes = undo_stack[undo_stack.length-1];
                var keys = Object.keys(last_changes);
                for(var i=0;i<keys.length;i++){
                    var name = keys[i].split('_');
                    var block = stage.getChildByName(`${parseInt(name[0])}_${parseInt(name[1])}`);
                    var color = last_changes[keys[i]];
                    changes[keys[i]] = block.graphics._instructions[2].style;
                    block.graphics._instructions[2].style = color;
                }
                undo_stack.pop();
                redo_stack.push(changes);
                adjust_circle();
            }
        }

        function Redo(){
            //This function performs redo action
            if(redo_stack.length > 0){
                var changes = {}
                var last_changes = redo_stack[redo_stack.length-1];
                var keys = Object.keys(last_changes);
                for(var i=0;i<keys.length;i++){
                    var name = keys[i].split('_');
                    var block = stage.getChildByName(`${parseInt(name[0])}_${parseInt(name[1])}`);
                    var color = last_changes[keys[i]];
                    changes[keys[i]] = block.graphics._instructions[2].style;
                    block.graphics._instructions[2].style = color;
                }
                redo_stack.pop();
                undo_stack.push(changes);
                adjust_circle();
            }
        }
        
        function stage_resize(){
            //This function resizes stage

            document.getElementById("activity-palette").style.left = (window.innerWidth>770)?"55px":"8px";
            var flag = false;
            var row_empty = 0;
            var col_empty = 0;
            if(stage.children.length>0){

                for(var i=0;i<(max_size[0]*max_size[1]);i++){
                    var block = stage.getChildAt(i);
                    block.visible = true;
                }

                
                for(var i=max_size[1]-1;i>=0;i--){
                    for(var j=0;j<max_size[0];j++){
                        if(stage.getChildByName(`${j}_${i}`).graphics._instructions[2].style != backgorund_color){
                            flag = true;
                            break;
                        }
                    }
                    if(flag == true){
                        break;
                    }
                    row_empty++;
                }

                for(var i=max_size[1]-1;i>=(max_size[1]-row_empty);i--){
                    for(var j=0;j<max_size[0];j++){
                        stage.getChildByName(`${j}_${i}`).visible = false;
                    }
                }

                flag = false;
                for(var i=max_size[0]-1;i>=0;i--){
                    for(var j=0;j<max_size[1];j++){
                        if(stage.getChildByName(`${i}_${j}`).graphics._instructions[2].style != backgorund_color){
                            flag = true;
                            break;
                        }
                    }
                    if(flag == true){
                        break;
                    }
                    col_empty++;
                }

                for(var i=max_size[0]-1;i>=(max_size[0]-col_empty);i--){
                    for(var j=0;j<max_size[1];j++){
                        stage.getChildByName(`${i}_${j}`).visible = false;
                    }
                }

            }
            var prev_block_size = block_size;
            var block_width = (window.innerWidth-200)/(max_size[0]-col_empty);
            if(fullScreenMode){
                main_canvas.height = window.innerHeight-45;
            }
            else{
                main_canvas.height = window.innerHeight-95;
            }
            block_size = main_canvas.height/(max_size[1]-row_empty);
            if(block_width < block_size){
                block_size = block_width;
            }
            main_canvas.width = block_size*(max_size[0]-col_empty) + 15;
            // main_canvas.height = main_canvas.height + 8;
            main_canvas.height = block_size*(max_size[1]-row_empty) + 8;

            if((stage.children.length > 0) && (prev_block_size!=block_size)){
                
                var j = 0;
                var k = 0;
                for(var i=0;i<(max_size[0]*max_size[1]);i++){
                    var block = stage.getChildAt(i);
                    block.graphics._instructions[1]["h"] = block_size - border_width(level);
                    block.graphics._instructions[1]["w"] = block_size - border_width(level);
                    block.graphics._instructions[1]["x"] = k*block_size;
                    block.graphics._instructions[1]["y"] = j*block_size;
                    block.graphics._instructions[3]["width"] = border_width(level);
                    if(j == (max_size[1]-1)){
                        j = 0;
                        k++;
                    }
                    else{
                        j++;
                    }
                }
            }

            stage.x = 10;
            stage.y = 5;
            if((stage.children.length > 0)){
                var circle = stage.getChildByName("white_circle");
                var square = stage.getChildByName(circle.parent_box);
                if(square != null){
                    if(square.visible == false){
                        square = stage.getChildByName("0_0");
                        circle.parent_box = "0_0";
                    }
                    var centre_x = square.graphics._instructions[1]["h"]/2 + square.graphics._instructions[1]["x"];
                    var centre_y = square.graphics._instructions[1]["h"]/2 + square.graphics._instructions[1]["y"];
                    circle.graphics._instructions[1]["x"] = centre_x;
                    circle.graphics._instructions[1]["y"] = centre_y;
                    circle.graphics._instructions[1]["radius"] = square.graphics._instructions[1]["h"]/9;
                    highlight_mouseover(square);
                }
            }

            if((max_size[1]-row_empty-1)>=0 && stage.children.length>0){
                stage.setTransform(10, -1*(stage.getChildByName(`0_${max_size[1]-row_empty-1}`).graphics._instructions[1]["y"]-5));
            }

            stage.update();
        
        }

        env.getEnvironment(function(err, environment) {
            currentenv = environment;

            // Set current language to Sugarizer
            var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
            var language = environment.user ? environment.user.language : defaultLanguage;
            webL10n.language.code = language;

            // Load from datastore
            if (!environment.objectId) {
                // New instance
                var board = generate_board(5,max_size);
                board[0].simplify();
                pieces = board[0]._data;
                stage_resize();
                init();

            } else {
                // Existing instance

                activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
                    if (error==null && data!=null) {
                        var datastore_data = JSON.parse(data);
                        level = datastore_data["level"];
                        max_size = difficulty[level];
                        pieces = datastore_data["pieces"];
                        undo_stack = datastore_data["undo_stack"];
                        redo_stack = datastore_data["redo_stack"];
                        button_highlight(level);
                        if(datastore_data["game_status"] == "won"){
                            game_status = "won";
                            smiley_color = datastore_data["smiley_color"];
                            winning_smiley(datastore_data["smiley_color"])
                        }
                        else{
                            init();
                            for(var i=0;i<stage.children.length;i++){
                                var block = stage.getChildAt(i);
                                if(block.name != "white_circle"){
                                    block.graphics._instructions[2].style = datastore_data["blocks_data"][block.name][0];
                                    block.prev_color = datastore_data["blocks_data"][block.name][1];
                                    block.visible = datastore_data["blocks_data"][block.name][2];
                                }
                            }
                            var circle = stage.getChildByName("white_circle");
                            circle.parent_box = datastore_data["circle_parent"];
                            highlight_mouseover(stage.getChildByName(circle.parent_box));
                            stage_resize();
                        }
                    }
                });
            }
        });

        // Save in Journal on Stop
        document.getElementById("stop-button").addEventListener('click', function (event) {
            console.log("writing...");

            if(game_status == "won"){
                var data = {
                    "blocks_data": {},
                    "level": level,
                    "pieces": pieces ,
                    "undo_stack": undo_stack,
                    "redo_stack": redo_stack,
                    "circle_parent": "",
                    "game_status": game_status,
                    "smiley_color": smiley_color
                }
            }
            else{
                var blocks = {}
                for(var i=0;i<(max_size[0]*max_size[1]);i++){
                    var block_data = [];
                    var block = stage.getChildAt(i);
                    block_data.push(block.graphics._instructions[2].style);
                    block_data.push(block.prev_color);
                    block_data.push(block.visible);
                    blocks[block.name] = block_data;
                }
                var circle = stage.getChildByName("white_circle");

                var data = {
                    "blocks_data": blocks,
                    "level": level,
                    "pieces": pieces ,
                    "undo_stack": undo_stack,
                    "redo_stack": redo_stack,
                    "circle_parent": circle.parent_box,
                    "game_status": game_status,
                    "smiley_color": smiley_color
                }
            }

            var jsonData = JSON.stringify(data);
            activity.getDatastoreObject().setDataAsText(jsonData);
            activity.getDatastoreObject().save(function (error) {
                if (error === null) {
                    console.log("write done.");
                } else {
                    console.log("write failed.");
                }
            });
        });

        window.addEventListener("resize", function(){
            if(game_status == "won"){
                winning_smiley(smiley_color);
            }
            else{
                stage_resize();
            }
        });

        // Process localize event
        window.addEventListener("localized", function() {
            document.getElementById("new-game").title = webL10n.get("NewGame");
            document.getElementById("replay").title = webL10n.get("Replay");
            document.getElementById("undo").title = webL10n.get("Undo");
            document.getElementById("redo").title = webL10n.get("Redo");
            document.getElementById("easy").title = webL10n.get("Easy");
            document.getElementById("medium").title = webL10n.get("Medium");
            document.getElementById("hard").title = webL10n.get("Hard");
        });

    });

});
