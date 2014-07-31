/* Copyright (c) 2014 Jorge Alberto Gómez López <gomezlopez.jorge96@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.*/

var flow_blocks = ['repeat', 'forever'];
var flow_types = ['repeat_block', 'forever_block'];
var arithmetic_blocks = ['plus2', 'minus2', 'division2', 'random'];

var resize_blocks = ['storein', 'arc', 'vspace', 'setxy2', 'plus2', 'minus2', 'division2', 'product2'];
var resize_data = [];

var json_flow_data = {};
var box_data = {};

function onFileSelect(evt, palette_tracker, block_tracker) {
    var file = evt.target.files[0];
	//alert(file);
    var reader = new FileReader();

    reader.onload = (function(theFile) {
        return function(e) {
            var json_obj = JSON.parse(e.target.result);
            parseTAFile(json_obj, palette_tracker, block_tracker);
        };
    })(file);

    if (file.name.match(".ta$")){
        reader.readAsText(file);
    }else {
        alert("no es archivo ta");
    }
}

function parseTAFile(json, palette_tracker, block_tracker) {
    block_tracker.hide_blocks();
    block_tracker.blocks = [];
    block_tracker.id = 0;
    for (var i=0; i<json.length; i++) {
        var index = parseInt(json[i][0]);
        var factory = null;
        var block = null;
        var link_data = json[i][4];
        var block_name = null;

        checkIDCount(block_tracker, index);

        if (json[i][1] instanceof Array){
            block_name = json[i][1][0];
            //factory = palette_tracker.search_factory(json[i][1][0]);
        } else{
            block_name = json[i][1];
        }
        
        if (block_name != 'box'){
            factory = palette_tracker.search_factory(block_name);
            block = factory.make_block(factory.block_name, false);
            block.block_id = index;
            block.set_xy([json[i][2], json[i][3]]);

            if (json[i][1] instanceof Array){
                if (isFlowBlock(json[i][1][0])){
                    json_flow_data[index] = link_data;
                }
                
                if (json[i][1][0] == 'number' || json[i][1][0] == 'string'){
                    block.func(block.params, [], true, json[i][1][1]);
                } else if(!isFlowBlock(json[i][1][0]) && block_name != 'hat' && !isArithmeticBlock(block_name) && !isResizeBlock(block_name)){
                    block.func(block.params, []);
                }
            }
            
            if (isResizeBlock(block_name)){
                var limit = (json[i][1][1]);
                
                if (limit != 0){
                    if (limit == 20){
                        limit = 1;
                    } else{
                        limit = (limit / 10) - 2; 
                    }
                }
                
               resize_data.push([block, limit]);
            }

            if (isVerticalFlow(block)){
                var upper_block = block_tracker.get_block(link_data[0]);
                var lower_block = null;
                var stack_block = null;
                
                if (block_name != 'hat'){
                    lower_block = block_tracker.get_block(link_data[link_data.length - 1]);
                } else{
                    lower_block = block_tracker.get_block(link_data[2]);
                }
                
                if (isFlowBlock(block_name)){
                    stack_block = block_tracker.get_block(link_data[2]);
                }
                
                if (stack_block != null){
                    /*var final_pos = block.relative_stack_pos(0);
                    var initial_pos = stack_block.get_xy();
                    var movement = [final_pos[0] - initial_pos[0], final_pos[1] - initial_pos[1]];
                    alert(final_pos);
                    stack_block.group_movement(stack_block, movement, false, true);*/
                    makeStackUpperLink(block, stack_block);
                }

                if (upper_block != null){
                    if (json_flow_data[link_data[0]] != null){
                        if (json_flow_data[link_data[0]][2] == index || json_flow_data[link_data[0]][1] == index){
                            makeUpperStackLink(block, upper_block);
                            block.set_xy(upper_block.relative_stack_pos(0));
                        } else{
                            makeUpperLink(block, upper_block);
                            block.set_xy(upper_block.relative_lower_pos());
                        }
                    } else{
                        makeUpperLink(block, upper_block);
                        
                        var final_pos = upper_block.relative_lower_pos();
                        var initial_pos = block.get_xy();
                        var movement = [final_pos[0] - initial_pos[0], final_pos[1] - initial_pos[1]];
                        block.group_movement(block, movement, false, true);
                    }
                }

                if (lower_block != null){
                    makeLowerLink(block, lower_block);
                    var final_pos = block.relative_lower_pos();
                    var initial_pos = lower_block.get_xy();
                    var movement = [final_pos[0] - initial_pos[0], final_pos[1] - initial_pos[1]];
                    lower_block.group_movement(lower_block, movement, false, true);
                }

                if (!isFlowBlock(block_name) && block_name != 'hat'){
                    for (var i2=1; i2<link_data.length-1; i2++){
                        var param_block = block_tracker.get_block(link_data[i2]);
                        //alert(param_block + " de " + block_name);
                        if (param_block != null){
                            makeReceiverGivingLink(block, param_block, i2-1);
                            //param_block.set_xy(block.relative_param_pos(link_data.indexOf(param_block.block_id)-1));
                            
                            var final_pos = block.relative_param_pos(link_data.indexOf(param_block.block_id)-1);
                            var initial_pos = param_block.get_xy();
                            var movement = [final_pos[0] - initial_pos[0], final_pos[1] - initial_pos[1]];
                            param_block.group_movement(param_block, movement, false, true);
                        }
                    }
                } else{
                }
            } else{
                var receiver_block = block_tracker.get_block(link_data[0]);
                
                if (isConnectedToBox(link_data[0])){
                    //alert("detectamos conexion a box");
                    index = getBoxReceiver(link_data[0]);
                    receiver_block = block_tracker.get_block(index);
                    //alert(receiver_block);
                    index = link_data[0];
                }

                if (receiver_block != null){
                    var block_json = null;
                    if (!isConnectedToBox(link_data[0])){
                        block_json = getBlockJSON(json, link_data[0]);
                    } else{
                        block_json = getBlockJSON(json, receiver_block.block_id);
                    }
                    makeGivingReceiverLink(block, receiver_block, block_json[4].indexOf(index)-1);
                    //block.set_xy(receiver_block.relative_param_pos(block_json[4].indexOf(index)-1));
                    
                    var final_pos = receiver_block.relative_param_pos(block_json[4].indexOf(index)-1);
                    var initial_pos = block.get_xy();
                    var movement = [final_pos[0] - initial_pos[0], final_pos[1] - initial_pos[1]];
                    //alert(movement + " para " + block_name + " con id " + index + " final: " + final_pos + " initial: " + initial_pos);
                    block.group_movement(block, movement, false, true);
                }
                
                for (var i2=1; i2<link_data.length; i2++){
                    var param_block = block_tracker.get_block(link_data[i2]);
                    
                    if (isConnectedToBox(link_data[i2])){
                        index = getBoxGiving(link_data[i2]);
                        param_block = block_tracker.get_block(index);
                        index = link_data[i2];
                    }
                    
                    if (param_block != null){
                        makeReceiverGivingLink(block, param_block, i2-1);
                        if (isConnectedToBox(link_data[i2])){
                            //param_block.set_xy(block.relative_param_pos(link_data.indexOf(index)-1));
                            
                            var final_pos = block.relative_param_pos(link_data.indexOf(index)-1);
                            var initial_pos = param_block.get_xy();
                            var movement = [final_pos[0] - initial_pos[0], final_pos[1] - initial_pos[1]];
                            param_block.group_movement(param_block, movement, false, true);
                            
                        } else{
                            //param_block.set_xy(block.relative_param_pos(link_data.indexOf(param_block.block_id)-1));
                            
                            var final_pos = block.relative_param_pos(link_data.indexOf(param_block.block_id)-1);
                            var initial_pos = param_block.get_xy();
                            var movement = [final_pos[0] - initial_pos[0], final_pos[1] - initial_pos[1]];
                            param_block.group_movement(param_block, movement, false, true);
                        }
                    }
                }
            }
        } else{
            box_data[index] = link_data;
            //alert(box_data[index]);
        }
    }
    setTimeout(function(){make_vertical_resize()}, 200);
}

function make_vertical_resize(){
    for (var i=0; i<resize_data.length; i++){
        var limit = resize_data[i][1];
        var block = resize_data[i][0];
        
        for (var i2=0; i2<limit; i2++){
            block.add_sprite.group.fire('click');
        }
    }
    setTimeout(function(){make_flow_resize()}, 200);
}

function make_flow_resize(){
    for (var i=0; i<block_tracker.blocks.length; i++){
        if (isFlowType(block_tracker.blocks[i].block_type)){
            var block = block_tracker.blocks[i];
            
            if (block.stack_slots[0] != null){
                block.calc_clamp_height(true, block.stack_slots[0].chain_height(), block);
            }
        }
    }
}

function isConnectedToBox(index){
    if (box_data[index] != null){
        return true;
    }
    return false;
}

function getBoxReceiver(index){
    return box_data[index][0];
}

function getBoxGiving(index){
    return box_data[index][1];
}

function isResizeBlock(name){
    if (resize_blocks.indexOf(name) == -1){
        return false;
    }
    return true;
}

function isArithmeticBlock(name){
    if (arithmetic_blocks.indexOf(name) == -1){
        return false;
    }
    return true;
}

function isFlowType(name){
    if (flow_types.indexOf(name) == -1){
        return false;
    }
    return true;
}

function isFlowBlock(name){
    if (flow_blocks.indexOf(name) == -1){
        return false;
    }
    return true;
}

function checkIDCount(block_tracker, index){
    if (block_tracker.id < index){
        block_tracker.id = index;
    }
}

function isVerticalFlow(block){
    if (block.has_lower_dock()){
        return true;
    }
}

function makeStackUpperLink(caller, receiver){
    if (receiver.upper_block.indexOf(caller) == -1){
        receiver.upper_block.push(caller);
        caller.stack_slots[0] = receiver;
    }
}

function makeUpperStackLink(caller, receiver){
    if (caller.upper_block.indexOf(receiver) == -1){
        caller.upper_block.push(receiver);
        receiver.stack_slots[0] = caller;
    }
}

function makeUpperLink(caller, receiver){
    if (caller.upper_block.indexOf(receiver) == -1){
        caller.upper_block.push(receiver);
        receiver.lower_block.push(caller);
    }
}

function makeLowerLink(caller, receiver){
    if (caller.lower_block.indexOf(receiver) == -1){
        caller.lower_block.push(receiver);
        receiver.upper_block.push(caller);
    }
}

function makeReceiverGivingLink(caller, receiver, index){
    if (caller.receiver_slots.indexOf(receiver) == -1){
        caller.receiver_slots[index] = receiver;
        receiver.param_blocks[0] = caller;
    }
}

function makeGivingReceiverLink(caller, receiver, index){
    if (caller.param_blocks.indexOf(receiver) == -1){
        caller.param_blocks[0] = receiver;
        receiver.receiver_slots[index] = caller;
    }
}

function getBlockJSON(json, id){
    var data = null;

    for (var i=0; i<json.length; i++){
        if (json[i][0] == id){
            data = json[i];
        }
    }
    return data;
}
