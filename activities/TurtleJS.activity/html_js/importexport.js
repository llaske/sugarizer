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

function onFileSelect(evt, palette_tracker, block_tracker) {
    var file = evt.target.files[0];
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

        checkIDCount(block_tracker, index);

        if (json[i][1] instanceof Array){
            factory = palette_tracker.search_factory(json[i][1][0]);
        } else{
            factory = palette_tracker.search_factory(json[i][1]);
        }

        block = factory.make_block(factory.block_name, false);
        block.block_id = index;
        block.set_xy([json[i][2], json[i][3]]);

        if (json[i][1] instanceof Array){
            block.func(block.params, true, json[i][1][1]);
        }

        if (isVerticalFlow(block)){
            var upper_block = block_tracker.get_block(link_data[0]);
            var lower_block = block_tracker.get_block(link_data[link_data.length - 1])

            if (upper_block != null){
                makeUpperLink(block, upper_block);
            }

            if (lower_block != null){
                makeLowerLink(block, lower_block);
            }

            for (var i2=1; i2<link_data.length-1; i2++){
                var param_block = block_tracker.get_block(link_data[i2]);
                if (param_block != null){
                    makeReceiverGivingLink(block, param_block, i2-1);
                }
            }
        } else{
            var receiver_block = block_tracker.get_block(link_data[0]);

            if (receiver_block != null){
                var block_json = getBlockJSON(json, link_data[0]);
                makeGivingReceiverLink(block, receiver_block, block_json[4].indexOf(index)-1);
            }
        }
    }
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
