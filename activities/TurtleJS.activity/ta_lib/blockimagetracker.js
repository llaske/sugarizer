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

function BlockImageTracker(){
    this.dic = {};
    this.add_resource('basic1arg', [NA_ARRANGE, 'block_res/basic1arg.svg']);
    this.add_resource('basic1arg_blue', [NA_ARRANGE, 'block_res/basic1arg_blue.svg']);
    this.add_resource('basic1arg_orange', [NA_ARRANGE, 'block_res/basic1arg_orange.svg']);
    this.add_resource('basic1arg_yellow', [NA_ARRANGE, 'block_res/basic1arg_yellow.svg']);
    this.add_resource('box2', [HORIZ_ARRANGE, 'block_res/box-left.svg', 'block_res/box-center.svg', 'block_res/box-right.svg']);
    this.add_resource('box2_blue', [HORIZ_ARRANGE, 'block_res/box-left_blue.svg', 'block_res/box-center_blue.svg', 'block_res/box-right_blue.svg']);
    this.add_resource('box2_red', [HORIZ_ARRANGE, 'block_res/box-left_red.svg', 'block_res/box-center_red.svg', 'block_res/box-right_red.svg']);
    this.add_resource('box2_purple', [HORIZ_ARRANGE, 'block_res/box-left_purple.svg', 'block_res/box-center_purple.svg', 'block_res/box-right_purple.svg']);
    this.add_resource('box2_orange', [HORIZ_ARRANGE, 'block_res/box-left_orange.svg', 'block_res/box-center_orange.svg', 'block_res/box-right_orange.svg']);
    this.add_resource('box2_cyan', [HORIZ_ARRANGE, 'block_res/box-left_cyan.svg', 'block_res/box-center_cyan.svg', 'block_res/box-right_cyan.svg']);
    this.add_resource('box2_white', [HORIZ_ARRANGE, 'block_res/box-left_white.svg', 'block_res/box-center_white.svg', 'block_res/box-right_white.svg']);
    this.add_resource('box2_yellow', [HORIZ_ARRANGE, 'block_res/box-left_yellow.svg', 'block_res/box-center_yellow.svg', 'block_res/box-right_yellow.svg']);
    this.add_resource('box2_blue_c', [HORIZ_ARRANGE, 'block_res/box-left_blue_c.svg', 'block_res/box-center_blue_c.svg', 'block_res/box-right_blue_c.svg']);
    this.add_resource('box2_black', [HORIZ_ARRANGE, 'block_res/box-left_black.svg', 'block_res/box-center_black.svg', 'block_res/box-right_black.svg']);
    this.add_resource('basic', [NA_ARRANGE, 'block_res/basic.svg']);
    this.add_resource('basic_blue', [NA_ARRANGE, 'block_res/basic_blue.svg']);
    this.add_resource('basic2arg', [NA_ARRANGE, 'block_res/basic2arg.svg']);
    this.add_resource('basic2arg2', [VERT_ARRANGE, 'block_res/basic2arg_upper.svg', 'block_res/basic2arg_center.svg', 'block_res/basic2arg_lower.svg']);
    this.add_resource('basic3arg_blue', [NA_ARRANGE, 'block_res/basic3arg_blue.svg']);
    this.add_resource('box', [NA_ARRANGE, 'block_res/box.svg']);
    this.add_resource('compare', [NA_ARRANGE, 'block_res/compare.svg']);
    this.add_resource('compare_purple', [NA_ARRANGE, 'block_res/compare_purple.svg']);
    this.add_resource('clampn', [VERT_ARRANGE, 'block_res/repeat-top.svg', 'block_res/clamp-filler.svg', 'block_res/clamp-bottom.svg']);
    this.add_resource('clampn_orange', [VERT_ARRANGE, 'block_res/repeat-top_orange.svg', 'block_res/clamp-filler_orange.svg', 'block_res/clamp-bottom_orange.svg']);
    this.add_resource('clamp', [VERT_ARRANGE, 'block_res/clamp-top.svg', 'block_res/clamp-filler.svg', 'block_res/clamp-bottom.svg']);
    this.add_resource('clamp_orange', [VERT_ARRANGE, 'block_res/clamp-top_orange.svg', 'block_res/clamp-filler_orange.svg', 'block_res/clamp-bottom_orange.svg']);
    this.add_resource('clampb_orange', [VERT_ARRANGE, 'block_res/clampboolean_orange.svg', 'block_res/clamp-filler_orange.svg', 'block_res/clamp-bottom_orange.svg']);
    this.add_resource('clampb', [VERT_ARRANGE, 'block_res/clampboolean.svg', 'block_res/clamp-filler.svg', 'block_res/clamp-bottom.svg']);
    this.add_resource('numbern', [NA_ARRANGE, 'block_res/numbern.svg']);
    this.add_resource('numbern_purple', [VERT_ARRANGE, 'block_res/numbern_up_purple.svg', 'block_res/numbern_center_purple.svg', 'block_res/numbern_down_purple.svg']);
    this.add_resource('number1arg', [NA_ARRANGE, 'block_res/number1arg.svg']);
    //this.add_resource('number1arg_purple', [NA_ARRANGE, 'block_res/number1arg_purple.svg']);
	this.add_resource('number1arg_purple_2', [HORIZ_ARRANGE, 'block_res/number1arg_left_purple.svg', 'block_res/number1arg_center_purple.svg', 'block_res/number1arg_right_purple.svg']);
    this.add_resource('head', [NA_ARRANGE, 'block_res/head_yellow.svg']);
    this.add_resource('head1arg', [NA_ARRANGE, 'block_res/head1arg_yellow.svg']);
    this.add_resource('add_size', [NA_ARRANGE, 'block_res/increment_size.svg']);
    this.add_resource('del_size', [NA_ARRANGE, 'block_res/decrement_size.svg']);
    this.add_resource('basic_resize', [VERT_ARRANGE, 'block_res/basic_resize_up.svg', 'block_res/basic_resize_center.svg', 'block_res/basic_resize_down.svg']);
}

BlockImageTracker.prototype = {
    constructor: BlockImageTracker,
    add_resource: function(name, properties){
        this.dic[name] = properties;
    },
    get_resource: function(name){
        return this.dic[name];
    }
}
