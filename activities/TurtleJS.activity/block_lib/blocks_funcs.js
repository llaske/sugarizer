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

function string_block(params, import_action, value) {
    import_action = import_action || false;
    if (!import_action){
        var number = prompt('Set value:');
        params[2].set_box_label('' + number);
        params[2].block_value = number;
    } else{
        params[2].sprite.labels[0].setText(value + '');
    }
}

function show_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            params[1].add_label(values[0][1], params[0]);
        }
    }
}