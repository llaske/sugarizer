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

function penup_block(params, values){
    params[1].pen_up();
    return true;
}

function pendown_block(params, values){
    params[1].pen_down_action();
    return true;
}

function set_pen_size(params, values){
    params[1].set_pen_size(values[0][1]);
    return true;
}

function is_color(str){
    var arr = ['red', 'green', 'purple', 'orange', 'cyan', 'white', 'yellow', 'blue', 'black'];
    if (arr.indexOf(str) != -1){
        return true;
    }
    return false;
}

function set_color(params, values){
    params[1].set_pen_color(values[0][1]);
    return true;
}

function set_shade(params, values){
    params[1].set_pen_shade(values[0][1]);
    return true;
}

function set_gray(params, values){
    params[1].set_pen_gray(values[0][1]);
    return true;
}

function start_fill(params, values){
    params[1].start_fill();
    return true;
}

function end_fill(params, values){
    params[1].end_fill();
    return true;
}

function get_pen_color(params){
    return [true, params[1].get_pen_color()];
}

function get_pen_shade(params){
    return [true, params[1].get_pen_shade()];
}

function get_pen_gray(params){
    return [true, params[1].get_pen_gray()];
}
