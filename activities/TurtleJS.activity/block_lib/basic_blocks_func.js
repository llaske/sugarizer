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

var forward_block = function(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            params[0].move(values[0][1]);
            x_pos = params[0].get_xy()[0];
            y_pos = params[0].get_xy()[1];
            params[1].add_point([x_pos, y_pos]);
            params[0].bring_front();
            return true;
        }
        return false;
    }else{
        alert('Missing value from forward block');
        return false;
    }
}

function backward_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            params[0].move(-values[0][1]);
            x_pos = params[0].get_xy()[0];
            y_pos = params[0].get_xy()[1];
            params[1].add_point([x_pos, y_pos]);
            params[0].bring_front();
            return true;
        }
        return false;
    }else{
       alert('Missing value from backward block');
       return false;
    }
}

function right_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            params[0].rotate(values[0][1]);
            return true;
        }
        return false;
    }else{
        alert('Missing value from right block');
        return false;
    }
}

function left_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            params[0].rotate(-values[0][1]);
            return true;
        }
        return false;
    }else{
        alert('Missing value from right block');
        return false;
    }
}

function get_number(params){
    return [true, params[2].block_value];
}

function text_block(params, import_action, value) {
    import_action = import_action || false;
    if (!import_action){
        var number = 0;
        do{
            number = parseInt(prompt('Set value:'));
        } while(isNaN(number));
        params[2].set_box_label('' + number);
        params[2].block_value = number;
    } else{
        params[2].sprite.labels[0].setText(value + '');
    }
}

function clean_block(params) {
    params[1].clear_canvas();
    return true;
}

function setxy_block(params){
    var zero_coord = params[0].start_pos;

    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var pos = [];
            pos[0] = zero_coord[0] + values[0][1];
            pos[1] = zero_coord[1] - values[1][1];
            params[0].set_xy(pos);

            x_pos = params[0].get_xy()[0];
            y_pos = params[0].get_xy()[1];
            params[1].add_point([x_pos, y_pos]);
            params[0].bring_front();
            return true;
        }
        return false;
    }else{
        alert('Missing value from set xy block');
        return false;
    }
}

function arc_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var arc = new ArcShape(params[0].get_xy(), values[1][1], 0, values[0][1], params[1].stroke_line, params[1].pen_size);

            params[0].layer.add(arc.group);
            arc.rotate(-180 + params[0].rotation);

            arc.set_start_offset();
            arc.set_xy(params[0].get_xy());

            var final_pos = [arc.end_point.getAbsolutePosition().x, arc.end_point.getAbsolutePosition().y];
            params[0].set_xy(final_pos);
            params[0].rotate(values[0][1]);
            params[1].add_shape(arc);
            return true;
        }
        return false;
    }else{
        alert('Missing value from arc block');
        return false;
    }
}

function set_heading_block(params) {
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            params[0].reset_rotation();
            params[0].rotate(values[0][1]);
            return true;
        }
        return false;
    }else{
        alert('Missing value from set heading block');
        return false;
    }
}

function get_turtle_heading(params){
    return [true, params[0].rotation];
}

function get_turtle_x(params){
    return [true, params[0].get_xy()[0] - params[0].start_pos[0]];
}

function get_turtle_y(params){
    return [true, params[0].get_xy()[1] - params[0].start_pos[1]];
}