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
