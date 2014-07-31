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

function string_block(params, values, import_action, value) {
    import_action = import_action || false;
    if (!import_action){
        var text_y = params[2].get_xy()[1] + (draw_stage.draw_layer.y()) + 7;
        var text_x = params[2].get_xy()[0] + (draw_stage.draw_layer.x()) + 18;
        var width = params[2].actual_center_width + 8;
            
        var textArea = "<div id='textAreaPopUp' style='position:absolute;top:" + text_y + "px;left:" + text_x + "px;z-index:30;'><input type='text' value='" + params[2].block_value + "' id='text_input' style='width:" + width + "px' />";
        $("#container2").append(textArea);
        $("#text_input").keyup(function(e){
            if (e.keyCode == 13){
                var text = $("#text_input").val();
                params[2].set_box_label(text);
                params[2].block_value = text;
                $("#text_input").remove();
            }
        });
        $("#text_input").focus();
    } else{
        params[2].sprite.labels[0].setText(value + '');
        params[2].block_value = value;
    }
}

function show(params, values){
    params[1].add_label(values[0][1], params[0]);
    return true;
}

function store_in_box(params, values){
    user_vars_tracker.add_var(values[0][1], values[1][1]);
    return true;
}

function action_block(params, values){
    user_funcs_tracker.add_func(values[0][1], params[2]);
    return true;
}

function action_exec_block(params, values){
    var block = user_funcs_tracker.get_func(values[0][1]);
    var val = true;
    if (block.lower_block[0] != null){
        val = block.lower_block[0].chain_exec();
    }
    val = true;
    return val;
}

function turtle_color_block(params, values){
        var color_blocks = {
            '#FF0000' : 'red',
            '#00FF00' : 'green',
            '#551A8B' : 'purple',
            '#FFA500' : 'orange',
            '#00FFFF' : 'cyan',
            '#FFFFFF' : 'white',
            '#FFFF00' : 'yellow',
            '#0000FF' : 'blue',
            '#000000' : 'black'
        };
    params[0].change_color(color_blocks[values[0][1]]);
    return true;
}

function start_block(params, values){
    return true;
}

function get_width_block(params, values){
    return [true, $(window).width()];
}

function get_height_block(params, values){
    return [true, $(window).height()];
}

function get_left_block(params, values){
    return [true, parseInt($(window).width()/2) * -1];
}

function get_right_block(params, values){
    return [true, parseInt($(window).width()/2)];
}

function get_bottom_block(params, values){
    return [true, parseInt($(window).height()/2) * -1];
}

function get_top_block(params, values){
    return [true, parseInt($(window).height()/2)];
}